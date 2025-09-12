import { PrismaAdapter } from "@auth/prisma-adapter";
import SgidClient from "@opengovsg/sgid-client";
import { User } from "@prisma/client";
import { jwtDecode } from "jwt-decode";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { env } from "~/env";

import { db } from "~/server/db";

type PublicOfficerDetails = {
	work_email: string;
	agency_name: string;
	department_name: string;
	employment_type: string;
	employment_title: string;
};

const REDIRECT_URI = `${env.APP_PROTOCOL}://${env.APP_URL ?? env.VERCEL_URL}/api/auth/callback/sgid`;

const SGID_CLIENT = () =>
	new SgidClient({
		clientId: env.SGID_CLIENT_ID,
		clientSecret: env.SGID_CLIENT_SECRET,
		privateKey: env.SGID_PRIVATE_KEY,
		redirectUri: REDIRECT_URI,
		hostname: env.SGID_HOSTNAME,
		// The rest of the options are not required since they are already declared in NextAuth.
		// This client is solely used for token exchange and decryption.
	});

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: DefaultSession["user"] & {
			id: string;
			managers: string[];
			reports: string[];
			// ...other properties
			role: string;
		} & User;
	}
}

interface UserProfile {
	id: string;
	name: string;
	email: string;
	agencyName?: string;
	departmentName?: string;
}

const prismaAdapter = PrismaAdapter(db);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
prismaAdapter.createUser = async (data: UserProfile) => {
	return db.user.upsert({
		create: {
			email: data.email,
			name: data.name.split(" (")[0] ?? "",
		},
		update: {},
		where: {
			id: data.id ?? "-",
		},
	});
};

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	trustHost: true,
	callbacks: {
		signIn: async ({ user: authUser }) => {
			try {
				if (authUser) {
					const user = await db.user.findFirst({
						where: {
							email: {
								equals: authUser.email ?? "-",
								mode: "insensitive",
							},
						},
					});

					if (user && !user?.activated) {
						return false;
					}
				}

				return true;
			} catch (error) {
				console.error("SignIn callback error:", error);
				// Allow sign in to proceed even if there's a database error
				return true;
			}
		},
		session: async ({ session, user: authUser }) => {
			try {
				const user = await db.user.findFirst({
					where: {
						email: authUser.email,
					},
					select: {
						id: true,
						email: true,
						name: true,
						role: true,
						activated: true,
					},
				});

				if (!user) {
					return session;
				}

				return {
					...session,
					user: {
						...session.user,
						id: user.id,
						email: user.email,
						name: user.name,
						role: user.role,
					},
				};
			} catch (error) {
				console.error("Session callback error:", error);
				// Return the original session if there's an error
				return session;
			}
		},
	},
	adapter: prismaAdapter,
	pages: {
		error: "/auth/error",
	},
	events: {
		async signIn({ user, account, profile, isNewUser }) {
			console.log("User signed in:", { user: user.email, isNewUser });
		},
		async signOut(message) {
			if ('session' in message) {
				console.log("User signed out with session");
			} else if ('token' in message) {
				console.log("User signed out with token");
			}
		},
	},
	providers: [
		MicrosoftEntraID({
			allowDangerousEmailAccountLinking: true,
			clientId: env.AUTH_TECHPASS_APPLICATION_ID,
			clientSecret: env.AUTH_TECHPASS_SECRET,
			issuer: `https://login.microsoftonline.com/${env.AUTH_TECHPASS_DIRECTORY_ID}/v2.0`,
		}),
		{
			id: "sgid",
			name: "SGID",
			client: {
				token_endpoint_auth_method: "client_secret_post",
			},
			issuer: env.SGID_OPENID_CONFIG,
			type: "oauth",
			clientId: env.SGID_CLIENT_ID,
			clientSecret: env.SGID_CLIENT_SECRET,
			checks: ["state"],
			authorization: {
				url: `${env.SGID_OPENID_CONFIG}/oauth/authorize`,
				params: {
					scope:
						"openid myinfo.name myinfo.email pocdex.public_officer_details",
					redirect_uri: REDIRECT_URI,
				},
			},
			allowDangerousEmailAccountLinking: true,
			token: `${env.SGID_OPENID_CONFIG}/oauth/token`,
			userinfo: {
				url: `${env.SGID_OPENID_CONFIG}/oauth/userinfo`,
				request: ({
					tokens,
				}: {
					tokens: { access_token: string; id_token: string };
				}) => {
					const result = SGID_CLIENT().userinfo({
						sub: jwtDecode(tokens.id_token).sub ?? "",
						accessToken: tokens.access_token,
					});
					return result;
				},
			},
			async profile(
				profile: Awaited<ReturnType<SgidClient["userinfo"]>>,
			): Promise<UserProfile> {
				if (profile.data["pocdex.public_officer_details"] === "NA") {
					const profileEmail = profile.data["myinfo.email"];
					return {
						id: profile.sub,
						name: profile.data["myinfo.name"] ?? "",
						email: profileEmail ?? `${profile.sub}@placeholder`,
						agencyName: "N/A",
						departmentName: "N/A",
					};
				}

				// this is where we can set the value that will be stored by PrismaAdapter to the database
				// Parse the "pocdex.public_officer_details" data
				// because the return is an Awaitable<User> we would need to override the shape of the User type
				// in next-auth.d.ts by using the module keyword
				const publicOfficerDetails = JSON.parse(
					profile.data["pocdex.public_officer_details"] ?? "",
				) as Array<PublicOfficerDetails>;

				// set details to be the first element of the array replacing the key into camelcase
				const details = publicOfficerDetails[0];

				const profileEmail = profile.data["myinfo.email"];

				const account = await db.account.findFirst({
					where: {
						providerAccountId: profile.sub,
						provider: "sgid",
					},
					include: {
						user: true,
					},
				});

				return {
					id: profile.sub,
					name: profile.data["myinfo.name"] ?? "",
					email:
						details?.work_email ?? profileEmail ?? `${profile.sub}@placeholder`,
					agencyName: details?.agency_name ?? "",
					departmentName: details?.department_name ?? "",
				};
			},
		},
	],
} satisfies NextAuthConfig;

function isGovernmentEmail(email: string | undefined) {
	return (email ?? "").endsWith(".gov.sg");
}

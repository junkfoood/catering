import { PrismaClient, User } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

export const checkAPIKey = async (
	authHeader: string | null,
): Promise<{ user?: User; error?: string }> => {
	if (!authHeader || !authHeader.startsWith("Basic ")) {
		return {
			error: "Missing or invalid Authorization header",
		};
	}

	const base64Credentials = authHeader.split(" ")[1];

	if (!base64Credentials) {
		return {
			error: "Invalid credentials format",
		};
	}

	const credentials = Buffer.from(base64Credentials, "base64").toString(
		"ascii",
	);
	const [username, apiKey] = credentials.split(":");

	if (!username || !apiKey) {
		return {
			error: "Invalid credentials format",
		};
	}

	const key = await prisma.aPIKey.findFirst({
		select: {
			hashedKey: true,
			expires: true,
			user: true,
		},
		where: { user: { email: username } },
	});

	if (!key) {
		return {
			error: "Invalid User or Key",
		};
	}

	const isValidKey = await argon2.verify(key.hashedKey, apiKey);

	if (!isValidKey) {
		return {
			error: "Invalid User or Key",
		};
	}

	if (key.expires < new Date()) {
		return {
			error: "API key has expired",
		};
	}

	return {
		user: key.user!,
	};
};

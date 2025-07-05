import { PrismaClient } from "@prisma/client";
import { checkAPIKey } from "~/utils/api";

const prisma = new PrismaClient();

export async function GET(request: Request) {
	const authHeader = request.headers.get("Authorization");

	const { error } = await checkAPIKey(authHeader);

	if (error) {
		return new Response(JSON.stringify({ error }), {
			status: 401,
		});
	}

	return new Response(
		JSON.stringify(
			{
				body: "Hello World",
			}
		),
		{
			status: 200,
			headers: { "Content-Type": "application/json" },
		},
	);
}

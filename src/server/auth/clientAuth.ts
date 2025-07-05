"use server";

import { signOut } from "./index";

export async function signOutAction() {
	await signOut({ redirectTo: "/" });
}

// export async function getUser() {
//   return await getSignedInUser();
// }

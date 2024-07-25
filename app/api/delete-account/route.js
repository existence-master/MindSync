// /pages/api/delete-account.js
import { auth } from "@auth";
import User from "@models/User"; // Import the User model
import connect from "@utils/db"; // Import the database connection utility
import { NextResponse } from "next/server"; // Import Next.js server response

export const POST = async (request) => {
	await connect(); // Connect to the database

	try {
		// Get the current user session
		const session = await auth();

		// If the user is not logged in, return unauthorized
		if (!session || !session.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 }); // 401 Unauthorized
		}

		// Get the user's email from the session
		const email = session.user.email;

		// Extract username from the request
		const { username } = await request.json();

		// Validate the username input
		if (
			!username ||
			typeof username !== "string" ||
			username.trim() === ""
		) {
			return new NextResponse("Username is required to delete account", {
				status: 400,
			}); // 400 Bad Request
		}

		// Find the user by their email
		const user = await User.findOne({ email });

		if (!user) {
			return new NextResponse(`User with email ${email} not found`, {
				status: 404,
			}); // 404 Not Found
		}

		// Verify the provided username matches the user's username
		if (user.username !== username.trim()) {
			return new NextResponse("Incorrect username provided", {
				status: 401,
			}); // 401 Unauthorized
		}

		// Delete the user from the database
		await User.deleteOne({ email });

		return new NextResponse(
			JSON.stringify({ message: "Account deleted successfully" }),
			{ status: 200 }
		); // 200 OK with a success message
	} catch (error) {
		console.error("Error deleting account:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // 500 Internal Server Error
	}
};
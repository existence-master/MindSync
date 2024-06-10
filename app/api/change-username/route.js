// /pages/api/change-username.js
import User from "@models/User"; // Import the User model
import connect from "@utils/db"; // Import the database connection utility
import { authOptions } from "../auth/[...nextauth]/route"; // Import NextAuth options
import { getServerSession } from "next-auth/next"; // Import NextAuth session handling
import { NextResponse } from "next/server"; // Import Next.js server response

export const POST = async (request) => {
	await connect(); // Connect to the database
	try {
		// Get the current user session
		const session = await getServerSession(authOptions);

		// If the user is not logged in, return unauthorized
		if (!session || !session.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 }); // 401 Unauthorized
		}

		// Get the user's email from the session
		const email = session.user.email;

		// Extract new username from the request
		const { newUsername } = await request.json();

		if (!newUsername || newUsername.trim() === "") {
			return new NextResponse("New username is required", {
				status: 400,
			}); // 400 Bad Request
		}

		// Find the user by their email
		const user = await User.findOne({ email: email });

		if (!user) {
			return new NextResponse(`User with email ${email} not found`, {
				status: 404,
			}); // 404 Not Found
		}

		// Update the user's username in the database
		user.username = newUsername.trim(); // Set the new username
		await user.save(); // Save the changes to the database

		return new NextResponse(
			JSON.stringify({ message: "Username updated successfully" }),
			{ status: 200 }
		); // 200 OK with a success message
	} catch (error) {
		console.error("Error changing username:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // 500 Internal Server Error
	}
};

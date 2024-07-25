// /pages/api/get-user-details.js
import User from "@models/User"; // Import the User model
import connect from "@utils/db"; // Import the database connection utility
import { NextResponse } from "next/server"; // Import Next.js server response
import { auth } from "@auth";

export const GET = async (request) => {
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

		// Find the user by their email
		const user = await User.findOne({ email: email }).populate("email username googleUser");

		if (!user) {
			return new NextResponse(`User with email ${email} not found`, {
				status: 404,
			}); // 404 Not Found
		}

		// Return the user details
		return new NextResponse(JSON.stringify(user), { status: 200 }); // 200 OK
	} catch (error) {
		console.error("Error fetching user details:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // 500 Internal Server Error
	}
};
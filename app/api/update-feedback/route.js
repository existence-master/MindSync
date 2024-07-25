import User from "@models/User"; // Import the User model
import connect from "@utils/db"; // Utility for database connection
import { NextResponse } from "next/server"; // Import Next.js server response
import fetch from "node-fetch"; // Import fetch for making API requests
import { auth } from "@auth";

export const POST = async (request) => {
	const session = await auth(); // Get the current user session
	await connect(); // Connect to the database

	try {
		// If there's no session or user email in the session, return unauthorized
		if (!session || !session.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 }); // 401 Unauthorized
		}

		// Extract feedback from the request body
		const { columnName, feedback } = await request.json();

		// Find the user based on the email in the session
		const user = await User.findOne({ email: session.user.email });

		// If user not found, return unauthorized
		if (!user) {
			return new NextResponse("Unauthorized", { status: 401 }); // 401 Unauthorized
		}

		// Update the SheetsDB API with the new feedback
		const response = await fetch(
			`${process.env.SHEETDB_FEEDBACK_API_ENDPOINT}/Email/${user.email}`,
			{
				method: "PATCH",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.SHEETDB_FEEDBACK_API_TOKEN}`,
				},
				body: JSON.stringify({
					data: {
						[columnName]: feedback,
					},
				}),
			}
		);

		if (response.ok) {
			return new NextResponse("Feedback updated", { status: 200 }); // 200 OK
		} else {
			return new NextResponse("Failed to update feedback", {
				status: 500,
			}); // 500 Internal Server Error
		}
	} catch (error) {
		console.error("Error updating feedback:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // 500 Internal Server Error
	}
};

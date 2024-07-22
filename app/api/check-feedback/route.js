import User from "@models/User"; // Import the User model
import connect from "@utils/db"; // Utility for database connection
import { authOptions } from "../auth/[...nextauth]/route"; // Import NextAuth options
import { getServerSession } from "next-auth/next"; // Import NextAuth session handling
import { NextResponse } from "next/server"; // Import Next.js server response
import fetch from "node-fetch"; // Import fetch for making API requests

export const POST = async (request) => {
	const session = await getServerSession(authOptions); // Get the current user session
	await connect(); // Connect to the database

	try {
		// If there's no session or user email in the session, return unauthorized
		if (!session || !session.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 }); // 401 Unauthorized
		}

		// Extract the column name from the request body
		const { columnName } = await request.json();

		// Find the user based on the email in the session
		const user = await User.findOne({ email: session.user.email });

		// If user not found, return unauthorized
		if (!user) {
			return new NextResponse("Unauthorized", { status: 401 }); // 401 Unauthorized
		}

		// Call the SheetsDB API using the username and email
		const response = await fetch(
			`${process.env.SHEETDB_FEEDBACK_API_ENDPOINT}/search?Email=${user.email}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.SHEETDB_FEEDBACK_API_TOKEN}`,
				},
			}
		);
		const rowData = await response.json();

		// Check the value of the specified column
		const columnValue = rowData[0][columnName];

		// Return false if the column value is null, otherwise return true
		if (columnValue === "") {
			return new NextResponse(JSON.stringify({ result: false }), {
				status: 200,
			}); // 200 OK
		} else {
			return new NextResponse(JSON.stringify({ result: true }), {
				status: 200,
			}); // 200 OK
		}
	} catch (error) {
		console.error("Error checking column value:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // 500 Internal Server Error
	}
};

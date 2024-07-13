import { Low } from "lowdb"; // Import Lowdb
import {JSONFile} from "lowdb/node"; // Import JSONFile handler
import path from "path"; // For handling file paths
import { NextResponse } from "next/server"; // Import Next.js server response handling

// Set up Lowdb database file
const file = path.join(process.cwd(), "app/api/mindmap-count/db.json"); // Path to JSON file
const adapter = new JSONFile(file);
const db = new Low(adapter, {});

// Function to initialize the database if necessary
async function initDB() {
	await db.read();
	if (!db.data) {
		db.data = { count: 0 };
		await db.write();
	}
}

// Handle GET request
export const GET = async () => {
	try {
    await initDB(); // Ensure the database is initialized

		return new NextResponse(JSON.stringify({ count: db.data.count }), {
			status: 200,
		}); // Return the current count with HTTP status 200
	} catch (error) {
		console.error("Error fetching count:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // HTTP status 500 Internal Server Error
	}
};

// Handle POST request
export const POST = async (request) => {
	try {
		await initDB(); // Ensure the database is initialized

		const { increment } = await request.json(); // Extract increment value from the request body

		if (typeof increment !== "boolean") {
			return new NextResponse("Invalid increment value", { status: 400 }); // HTTP status 400 Bad Request
		}

		// Update the count based on the increment value
		if (increment) {
			db.data.count += 1;
		} else {
			db.data.count -= 1;
		}

		// Write the updated count back to the database
		await db.write();

		return new NextResponse(JSON.stringify({ count: db.data.count }), {
			status: 200,
		}); // Return the updated count with HTTP status 200
	} catch (error) {
		console.error("Error updating count:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // HTTP status 500 Internal Server Error
	}
};
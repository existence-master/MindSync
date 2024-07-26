import { NextResponse } from "next/server"; // Import Next.js server response handling
import fetch from "node-fetch"; // Import fetch for making API requests

// Handle GET request
export const GET = async () => {
	try {
		// Sort results by id in descending order, take two
		// and return the age as an integer.
		const columnName = "Value"

		const response = await fetch(
			`${process.env.SHEETDB_METRICS_API_ENDPOINT}/`,
			{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.SHEETDB_METRICS_API_TOKEN}`,
				},
			}
		)

		const rowData = await response.json();
		// Check the value of the specified column
		const columnValue = rowData[0][columnName];

		// Return false if the column value is null, otherwise return true
		return new NextResponse(JSON.stringify({ count: columnValue }), {
			status: 200,
		}); // 200 OK
	} catch (error) {
		console.error("Error fetching count:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // HTTP status 500 Internal Server Error
	}
};

// Handle POST request
export const POST = async (request) => {
	try {
		let updatedMindmapCount
		const columnName = "Value";
		const { increment } = await request.json(); // Extract increment value from the request body

		if (typeof increment !== "boolean") {
			return new NextResponse("Invalid increment value", { status: 400 }); // HTTP status 400 Bad Request
		}

		let response = await fetch(
			`${process.env.SHEETDB_METRICS_API_ENDPOINT}/`,
			{
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.SHEETDB_METRICS_API_TOKEN}`,
				},
			}
		);

		const rowData = await response.json();
		// Check the value of the specified column
		const currentMindmapCount = rowData[0][columnName];
		updatedMindmapCount = currentMindmapCount

		// Update the count based on the increment value
		if (increment) {
			updatedMindmapCount = Number(currentMindmapCount) + 1;
		}

		response = await fetch(
			`${process.env.SHEETDB_METRICS_API_ENDPOINT}/Metric/Mindmap%20Count`,
			{
				method: "PATCH",
				headers: {
					Accept: "application/json",
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.SHEETDB_METRICS_API_TOKEN}`,
				},
				body: JSON.stringify({
					data: {
						[columnName]: updatedMindmapCount,
					},
				}),
			}
		);

		return new NextResponse(JSON.stringify({ count: updatedMindmapCount }), {
			status: 200,
		}); // Return the updated count with HTTP status 200
	} catch (error) {
		console.error("Error updating count:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // HTTP status 500 Internal Server Error
	}
};
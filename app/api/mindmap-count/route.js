import { NextResponse } from "next/server"; // Import Next.js server response handling
import { google } from "googleapis"; // Import googleapis package

// Initialize JWT client

const client = new google.auth.JWT(
  process.env.GOOGLE_METRICS_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_METRICS_SERVICE_ACCOUNT_KEY,
  ["https://www.googleapis.com/auth/spreadsheets"] // Adjust the scope if needed
);

const sheets = google.sheets({ version: "v4", auth: client });

const spreadsheetId = process.env.GOOGLE_METRICS_SHEET_ID;
const sheetName = "Sheet1";

// Handle GET request
export const GET = async () => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:B`, // Adjust range as necessary
    });

    const rows = response.data.values;

    // Find the row with the metric name "Mindmap Count"
    const row = rows.find((row) => row[0] === "Mindmap Count");

    // If row not found, return count as 0
    const columnValue = row ? row[1] : 0;

    return new NextResponse(JSON.stringify({ count: columnValue }), {
      status: 200,
    }); // 200 OK
  } catch (error) {
    //console.error("Error fetching count:", error); // Log the error for debugging
    return new NextResponse("Internal server error", { status: 500 }); // HTTP status 500 Internal Server Error
  }
};

// Handle POST request
export const POST = async (request) => {
  try {
    const { increment } = await request.json(); // Extract increment value from the request body

    if (typeof increment !== "boolean") {
      return new NextResponse("Invalid increment value", { status: 400 }); // HTTP status 400 Bad Request
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:B`, // Adjust range as necessary
    });

    const rows = response.data.values;

    // Find the row with the metric name "Mindmap Count"
    const rowIndex = rows.findIndex((row) => row[0] === "Mindmap Count");

    let currentMindmapCount = 0;

    // If row not found, initialize the count as 0
    if (rowIndex !== -1) {
      currentMindmapCount = Number(rows[rowIndex][1]);
    }

    let updatedMindmapCount = currentMindmapCount;

    // Update the count based on the increment value
    if (increment) {
      updatedMindmapCount = currentMindmapCount + 1;
    }

    const updateRange = `${sheetName}!B${rowIndex + 1}`;

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: updateRange,
      valueInputOption: "RAW",
      requestBody: {
        values: [[updatedMindmapCount]],
      },
    });

    return new NextResponse(JSON.stringify({ count: updatedMindmapCount }), {
      status: 200,
    }); // Return the updated count with HTTP status 200
  } catch (error) {
    //console.error("Error updating count:", error); // Log the error for debugging
    return new NextResponse("Internal server error", { status: 500 }); // HTTP status 500 Internal Server Error
  }
};

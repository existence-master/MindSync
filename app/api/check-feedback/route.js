import User from "@models/User"; // Import the User model
import connect from "@utils/db"; // Utility for database connection
import { authOptions } from "../auth/[...nextauth]/route"; // Import NextAuth options
import { getServerSession } from "next-auth/next"; // Import NextAuth session handling
import { NextResponse } from "next/server"; // Import Next.js server response
import { google } from "googleapis"; // Import googleapis package

// Initialize JWT client
const client = new google.auth.JWT(
  process.env.GOOGLE_FEEDBACK_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_FEEDBACK_SERVICE_ACCOUNT_KEY,
  ["https://www.googleapis.com/auth/spreadsheets"] // Adjust the scope if needed
);

const sheets = google.sheets({ version: "v4", auth: client });

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

    // Fetch data from Google Sheets
    const spreadsheetId = process.env.GOOGLE_FEEDBACK_SHEET_ID;
    const range = "Sheet1"; // Adjust range as necessary

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values;

    // Find the row with the user's email
    const row = rows.find((row) => row.includes(user.email));

    // If row not found, return false
    if (!row) {
      return new NextResponse(JSON.stringify({ result: false }), {
        status: 200,
      }); // 200 OK
    }

    // Find the column index
    const columnIndex = rows[0].indexOf(columnName);

    // If column not found, return false
    if (columnIndex === -1) {
      return new NextResponse(JSON.stringify({ result: false }), {
        status: 200,
      }); // 200 OK
    }

    // Check the value of the specified column
    const columnValue = row[columnIndex];

    // Return false if the column value is null, otherwise return true
    if (
      columnValue === undefined ||
      columnValue === null ||
      columnValue === ""
    ) {
      return new NextResponse(JSON.stringify({ result: false }), {
        status: 200,
      }); // 200 OK
    } else {
      return new NextResponse(JSON.stringify({ result: true }), {
        status: 200,
      }); // 200 OK
    }
  } catch (error) {
    //console.error("Error checking column value:", error); // Log the error for debugging
    return new NextResponse("Internal server error", { status: 500 }); // 500 Internal Server Error
  }
};

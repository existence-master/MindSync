import { NextResponse } from "next/server"; // Import Next.js server response handling
import nodemailer from "nodemailer"; // Library to send emails
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const POST = async (req) => {
    console.log(req)
	const { token } = await req.json(); // Extract details from the request body
    try {
        const decoded = jwt.verify(
                        token,
                        process.env.TOKEN_SECRET_KEY
                    );
        const { email } = decoded; 
        return new NextResponse({ status: 200 }); // Return the hash as the response with HTTP status 200
	} catch (error) {
		console.error("Invalid token:", error); // Log the error for debugging
		return new NextResponse(
			JSON.stringify({ error: "Failed to verify magic link" }), // Return error message
			{ status: 400 } // HTTP status 400 Bad Request
		);
	}
};
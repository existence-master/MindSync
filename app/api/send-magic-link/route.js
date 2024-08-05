import { NextResponse } from "next/server"; // Import Next.js server response handling
import nodemailer from "nodemailer"; // Library to send emails
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const POST = async (req) => {
  const { email, subject, message } = await req.json(); // Extract details from the request body

  // Configure Nodemailer with email SMTP transporter
  const transporter = nodemailer.createTransport({
    service: "gmail", // Gmail as the email service
    auth: {
      user: process.env.GMAIL_USER, // Gmail user from environment variables
      pass: process.env.GMAIL_PASSWORD, // Gmail password from environment variables
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  });

  const token = jwt.sign({ email: email }, process.env.TOKEN_SECRET_KEY, {
    expiresIn: "1h",
    jwtid: uuidv4(),
  });

  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/verify?email=${email}&token=${token}`;

  try {
    // Send the OTP to the user's email
    await transporter.sendMail({
      from: `"MindSync" <${process.env.GMAIL_USER}>`, // Email sender
      to: email, // Recipient email
      subject: subject, // Email subject
      text: `${message} Click this link to verify your email: ${magicLink}`, // Email content
    });

    return new NextResponse({ status: 200 }); // Return the hash as the response with HTTP status 200
  } catch (error) {
    //console.error("Error sending OTP:", error); // Log the error for debugging
    return new NextResponse(
      JSON.stringify({ error: "Failed to send magic link" }), // Return error message
      { status: 400 } // HTTP status 400 Bad Request
    );
  }
};

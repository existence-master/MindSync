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

  try {
    // Send the email to the user's email
    await transporter.sendMail({
      from: `"MindSync" <${process.env.GMAIL_USER}>`, // Email sender
      to: email, // Recipient email
      subject: "Welcome to the MindSync Beta Program!", // Email subject
      text: "Thank you for signing up to the MindSync Beta Program. Your feedback will be invaluable for us to improve our platform and fine-tune it to our user's needs. Click the following link to join our WhatsApp Community: https://chat.whatsapp.com/BBrZAM1d8JbA1dwE266xKO", // Email content
    });

    return new NextResponse({ status: 200 }); // Return the hash as the response with HTTP status 200
  } catch (error) {
    console.error("Error sending email:", error); // Log the error for debugging
    return new NextResponse(
      JSON.stringify({ error: "Failed to send email" }), // Return error message
      { status: 400 } // HTTP status 400 Bad Request
    );
  }
};

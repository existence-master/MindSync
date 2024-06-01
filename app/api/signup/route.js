import User from "@models/User"; // Import the User model
import connect from "@utils/db"; // Utility to connect to the database
import bcrypt from "bcryptjs"; // Library for hashing passwords
import { NextResponse } from "next/server"; // Import Next.js server response handling

export const POST = async (request) => {
	try {
		await connect(); // Connect to the database

		// Extract email and password from the request body
		const { email, password, username } = await request.json();

		if (!email || !password || !username) {
			return new NextResponse("All fields are required", {
				status: 400, // HTTP status 400 Bad Request
			});
		}

		// Check if the email is already in use
		const existingUser = await User.findOne({ email: email }); // Find user by email

		if (existingUser) {
			return new NextResponse("Email is already in use", { status: 400 }); // Return if email is in use
		}

		// Hash the password with a salt factor of 12
		const hashedPassword = await bcrypt.hash(password, 12);

		// Create a new user with the provided email and hashed password
		const newUser = new User({
			email: email, // Set the user's email
			password: hashedPassword, // Set the hashed password
			username: username, // Set the username
			googleUser: false, // Indicate the user signed up with email and password
		});

		// Save the new user to the database
		await newUser.save();

		// Return a success message with HTTP status 200
		return new NextResponse("User is registered", { status: 200 });
	} catch (error) {
		console.error("Error registering user:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // HTTP status 500 Internal Server Error
	}
};
import NextAuth from "next-auth"; // Import the NextAuth library for authentication
import Google from "next-auth/providers/google"; // Google authentication provider
import Credentials from "next-auth/providers/credentials"; // Credentials authentication provider
import bcrypt from "bcryptjs"; // Library for hashing and comparing passwords
import User from "@models/User"; // User model
import connect from "@utils/db"; // Utility to connect to the database
import fetch from "node-fetch";

export const authOptions = {
	// Configuration for authentication providers
	providers: [
		// Credentials provider for email-password authentication
		Credentials({
			id: "credentials", // Unique identifier for the credentials provider
			name: "Credentials", // Display name for the provider
			credentials: {
				email: { label: "Email", type: "text" }, // Credential for email
				password: { label: "Password", type: "password" }, // Credential for password
			},
			async authorize(credentials) {
				// Connect to the database
				await connect();
				try {
					// Find the user with the provided email
					const user = await User.findOne({
						email: credentials.email,
					});
					if (user) {
						// Compare the provided password with the hashed password in the database
						const isPasswordCorrect = await bcrypt.compare(
							credentials.password,
							user.password
						);
						if (isPasswordCorrect) {
							return user; // If the password matches, return the user
						}
					}
				} catch (err) {
					throw new Error(err); // Throw an error if something goes wrong
				}
			},
		}),

		// Google provider for authentication via Google accounts
		Google
		// Additional providers can be added here
	],

	// Callbacks for additional behavior
	callbacks: {
		async signIn({ user, account }) {
			// Check if the sign-in provider is Google
			if (account.provider === "google") {
				await connect(); // Connect to the database
				try {
					// Check if the user already exists in the database
					const existingUser = await User.findOne({
						email: user.email,
					});

					if (!existingUser) {
						// If the user doesn't exist, create a new user
						const newUser = new User({
							email: user.email, // Set the email for the new user
							googleUser: true, // Indicate that the user signed up with Google
							username: user.name, // Set the username for the new user
						});

						await newUser.save(); // Save the new user to the database
						await fetch(
							`${process.env.SHEETDB_FEEDBACK_API_ENDPOINT}`,
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${process.env.SHEETDB_FEEDBACK_API_TOKEN}`,
								},
								body: JSON.stringify({
									data: [
										{
											Email: user.email,
											Username: user.name,
											Create: "",
											Saved: "",
											Edit: "",
										},
									],
								}),
							}
						);
					}
					return true;
				} catch (err) {
					console.error("Error in signIn callback:", err); // Log errors that occur during sign-in
					return false; // Return false to indicate a failure
				}
			}
			return true;
		},
	},
};

// Define the handler for NextAuth using the specified options
export const handler = NextAuth(authOptions);

// Export the handler for GET and POST methods
export { handler as GET, handler as POST };

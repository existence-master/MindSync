import NextAuth from "next-auth"; // Import the NextAuth library for authentication
import GoogleProvider from "next-auth/providers/google"; // Google authentication provider
import CredentialsProvider from "next-auth/providers/credentials"; // Credentials authentication provider
import bcrypt from "bcryptjs"; // Library for hashing and comparing passwords
import User from "@models/User"; // User model
import connect from "@utils/db"; // Utility to connect to the database

export const authOptions = {
	// Configuration for authentication providers
	providers: [
		// Credentials provider for email-password authentication
		CredentialsProvider({
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
	],
	// Callbacks for additional behavior
  callbacks: {
    async signIn() {      
      return true
    },
  },
};

// Define the handler for NextAuth using the specified options
export const handler = NextAuth(authOptions);

// Export the handler for GET and POST methods
export { handler as GET, handler as POST };

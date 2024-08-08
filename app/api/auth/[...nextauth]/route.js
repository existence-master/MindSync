import NextAuth from "next-auth"; // Import the NextAuth library for authentication
import GoogleProvider from "next-auth/providers/google"; // Google authentication provider
import CredentialsProvider from "next-auth/providers/credentials"; // Credentials authentication provider
import bcrypt from "bcryptjs"; // Library for hashing and comparing passwords
import User from "@models/User"; // User model
import connect from "@utils/db"; // Utility to connect to the database
import { google } from "googleapis"; // Import googleapis package

// Initialize JWT client
const client = new google.auth.JWT(
  process.env.GOOGLE_FEEDBACK_SERVICE_ACCOUNT_EMAIL,
  null,
  process.env.GOOGLE_FEEDBACK_SERVICE_ACCOUNT_KEY,
  ["https://www.googleapis.com/auth/spreadsheets"] // Adjust the scope if needed
);

const sheets = google.sheets({ version: "v4", auth: client });
const spreadsheetId = process.env.GOOGLE_FEEDBACK_SHEET_ID; // Google Sheets ID

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

    // Google provider for authentication via Google accounts
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID, // Google client ID from environment variables
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google client secret from environment variables
    }),

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

            // Read existing data from Google Sheets
            const response = await sheets.spreadsheets.values.get({
              spreadsheetId,
              range: "Sheet1", // Adjust the sheet name and range if necessary
            });

            const rows = response.data.values;
            const emailExists = rows.some((row) => row[0] === email);

            if (!emailExists) {
              // Append new data to Google Sheets if email does not exist
              let requestBody = {
                values: [[userEmail, username, "", "", ""]],
              };

              await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: "Sheet1", // Adjust the sheet name and range if necessary
                valueInputOption: "RAW",
                insertDataOption: "INSERT_ROWS",
                requestBody,
              });
            }
          }
          return true;
        } catch (err) {
          //console.error("Error in signIn callback:", err); // Log errors that occur during sign-in
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

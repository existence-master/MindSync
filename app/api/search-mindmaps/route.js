import User from "@models/User"; // Import the User model
import connect from "@utils/db"; // Database connection utility
import { authOptions } from "../auth/[...nextauth]/route"; // NextAuth configuration
import { getServerSession } from "next-auth/next"; // Function to get the current session
import { NextResponse } from "next/server"; // Import Next.js server response handling

export const GET = async (request) => {
  await connect(); // Connect to the database
  const session = await getServerSession(authOptions); // Get the current session

  try {
    const userEmail = session.user?.email; // Get the user email from the session

    if (!userEmail) {
      throw new Error("User email not found in session"); // Error if user email is missing
    }

    // Find the user with the provided email
    const user = await User.findOne({ email: userEmail }).populate("mindmaps");

    if (!user) {
      throw new Error(`User with email ${userEmail} not found`); // Error if user not found
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");

    if (!query) {
      return new NextResponse("Query parameter is missing", {
        status: 400,
      });
    }

    // Filter mindmaps by name
    const mindmaps = user.mindmaps.filter((mindmap) =>
      mindmap.name.toLowerCase().includes(query.toLowerCase())
    );

    return new NextResponse(JSON.stringify(mindmaps), { status: 200 }); // Return mindmaps with HTTP status 200
  } catch (error) {
    //console.error("Error searching mindmaps:", error); // Log the error for debugging
    return new NextResponse("Internal server error", { status: 500 }); // Return 500 if an internal server error occurs
  }
};

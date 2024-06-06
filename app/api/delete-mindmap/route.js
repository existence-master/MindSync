import User from "@models/User"; // Import the User model
import Mindmap from "@models/Mindmap"; // Import the Mindmap model
import connect from "@utils/db"; // Database connection utility
import { authOptions } from "../auth/[...nextauth]/route"; // NextAuth configuration
import { getServerSession } from "next-auth/next"; // Function to get the current session
import { NextResponse } from "next/server"; // Import Next.js server response handling

export const POST = async (request) => {
	await connect(); // Connect to the database
	const session = await getServerSession(authOptions); // Get the current session
	const { id: mindmapId } = await request.json(); // Get the mindmap ID from the request body

	try {
		const userEmail = session.user?.email; // Get the user email from the session

		if (!userEmail) {
			throw new Error("User email not found in session"); // Error if user email is missing
		}

		// Find the user with the provided email
		const user = await User.findOne({ email: userEmail });

		if (!user) {
			throw new Error(`User with email ${userEmail} not found`); // Error if user not found
		}

		// Check if the mindmap ID is valid
		if (!mindmapId) {
			return new NextResponse("Mindmap ID is missing", { status: 400 });
		}

		// Find the mindmap by ID
		const mindmap = await Mindmap.findById(mindmapId);

		if (!mindmap) {
			return new NextResponse("Mindmap not found", { status: 404 });
		}

		// Check if the user owns the mindmap
		if (!user.mindmaps.includes(mindmapId)) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		// Delete the mindmap from the database
		await Mindmap.findByIdAndDelete(mindmapId);

		// Remove the mindmap ID from the user's mindmaps array
		user.mindmaps = user.mindmaps.filter((id) => id !== mindmapId);
		await user.save();

		return new NextResponse("Mindmap deleted successfully", {
			status: 200,
		});
	} catch (error) {
		console.error("Error deleting mindmap:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // Return 500 if an internal server error occurs
	}
};
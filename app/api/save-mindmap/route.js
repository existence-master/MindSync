import User from "@models/User"; // Import the User model
import Mindmap from "@models/Mindmap"; // Import the Mindmap model
import connect from "@utils/db"; // Utility for database connection
import { authOptions } from "../auth/[...nextauth]/route"; // Import NextAuth options
import { getServerSession } from "next-auth/next"; // Import NextAuth session handling
import { NextResponse } from "next/server"; // Import Next.js server response
import cloudinary from "@utils/cloudinary"; // Import Cloudinary configuration

export const POST = async (request) => {
	const session = await getServerSession(authOptions); // Get the current user session
	await connect(); // Connect to the database

	try {
		// If there's no session or user email in the session, return unauthorized
		if (!session || !session.user?.email) {
			return new NextResponse("Unauthorized", { status: 401 }); // 401 Unauthorized
		}

		// Extract mindmap data and name from the request body
		const formData = await request.formData();
		const mindmap = formData.get("mindmap");
		const processedCode = mindmap.replace(/\\n/g, "\n").replace(/\"/g, "");
		const mindmapName = formData.get("mindmapName");
		const previewImage = formData.get("previewImage");

		// Find the user based on the email in the session
		const user = await User.findOne({ email: session.user.email });

		// If user not found, return unauthorized
		if (!user) {
			return new NextResponse("Unauthorized", { status: 401 }); // 401 Unauthorized
		}

		const uploadResult = await cloudinary.uploader.upload(previewImage, {
			folder: "mindmap_previews",
		});

		// Create a new mindmap object
		const newMindmap = new Mindmap({
			name: mindmapName,
			code: processedCode,
			previewImageURL: uploadResult.secure_url, // Use the Cloudinary URL
		});

		// Save the mindmap to the database
		await newMindmap.save();

		// Add the mindmap to the user's mindmaps array
		user.mindmaps.push(newMindmap);

		// Save the user with the updated mindmaps array
		await user.save();

		// Return a success response
		return new NextResponse("Mindmap saved", { status: 200 }); // 200 OK
	} catch (error) {
		console.error("Error saving mindmap:", error); // Log the error for debugging
		return new NextResponse("Internal server error", { status: 500 }); // 500 Internal Server Error
	}
};
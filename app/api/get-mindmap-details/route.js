// api/get-mindmap-details.js

import { NextResponse } from "next/server";
import connect from "@utils/db"; // Import your database connection utility
import Mindmap from "@models/Mindmap"; // Import the Mindmap model
import User from "@models/User"; // Import the User model
import { authOptions } from "../auth/[...nextauth]/route"; // Import NextAuth options
import { getServerSession } from "next-auth/next"; // Import NextAuth session handling

export const GET = async (request) => {
	const { searchParams } = new URL(request.url);
	const mindmapId = searchParams.get("id");
	const sample = searchParams.get("sample");

	if (!mindmapId) {
		return new NextResponse("Missing mindmap ID", { status: 400 });
	}

	await connect();
	const session = await getServerSession(authOptions);

	if ((!session || !session.user?.email) & (sample !== "true")) {
		return new NextResponse("Unauthorized", { status: 401 });
	}

	try {
		// Find the mindmap
		const mindmap = await Mindmap.findById(mindmapId);

		if (!mindmap) {
			return new NextResponse("Mindmap not found", { status: 404 });
		}

		if (sample !== "true") {

			// Check if the mindmap belongs to the authenticated user
			const user = await User.findOne({ email: session.user.email }).populate(
				"mindmaps"
			);

			if (!user) {
				return new NextResponse("User not found", { status: 404 });
			}

			// Check if the mindmap is in the user's mindmaps array
			if (
				!user.mindmaps.some(
					(mindmapId) =>
						mindmapId._id.toString() === mindmap._id.toString()
				)
			) {
				return new NextResponse("Unauthorized", { status: 401 });
			}
		}

		return NextResponse.json({
			_id: mindmap._id,
			name: mindmap.name,
			code: mindmap.code,
			text: mindmap.text,
			previewImageURL: mindmap.previewImageURL,
		});
	} catch (error) {
		console.error("Error fetching mindmap:", error);
		return new NextResponse("Internal server error", { status: 500 });
	}
};
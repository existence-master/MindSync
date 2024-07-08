// api/get-mindmap-details.js

import { NextResponse } from "next/server";
import connect from "@utils/db"; // Import your database connection utility
import Mindmap from "@models/Mindmap"; // Import the Mindmap model

export const GET = async (request) => {
	await connect();

	try {
		// Find the mindmap
		const count = await Mindmap.countDocuments();

		if (!count) {
			return new NextResponse("No mindmaps found", { status: 404 });
		}

		return new NextResponse(count, { status: 200 });
	} catch (error) {
		console.error("Error fetching mindmap count:", error);
		return new NextResponse("Internal server error", { status: 500 });
	}
};
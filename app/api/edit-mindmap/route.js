import { NextResponse } from "next/server";
import connect from "@utils/db"; // Import your database connection utility
import Mindmap from "@models/Mindmap"; // Import the Mindmap model
import { v4 as uuidv4 } from "uuid";
import cloudinary from "@utils/cloudinary"; // Import Cloudinary configuration

export const POST = async (request) => {
	const formData = await request.formData();
	const mindmapId = formData.get("mindmapId");
	const mindmapCode = formData.get("mindmapCode");
	const mindmapName = formData.get("mindmapName");
	const previewImage = formData.get("previewImage");

	if (!mindmapId || !mindmapCode || !mindmapName) {
		return new NextResponse("Missing required data", { status: 400 });
	}

	await connect();

	try {
		// Read the file as a buffer
		const arrayBuffer = await previewImage.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Generate a unique filename
		const fileName = `${uuidv4()}-${previewImage.name}`;

		// Upload the preview image to Cloudinary directly from the buffer
		const uploadResult = await cloudinary.uploader
			.upload_stream(
				{ folder: "mindmap_previews", public_id: fileName },
				(error, result) => {
					if (error) {
						throw new Error("Cloudinary upload failed");
					}
					return result;
				}
			)
			.end(buffer);

		// Update the mindmap in the database
		const updatedMindmap = await Mindmap.findByIdAndUpdate(
			mindmapId,
			{
				code: mindmapCode,
				name: mindmapName,
				previewImageURL: uploadResult.secure_url,
			},
			{ new: true }
		);

		if (!updatedMindmap) {
			return new NextResponse("Mindmap not found", { status: 404 });
		}

		return new NextResponse("Mindmap updated", { status: 200 });
	} catch (error) {
		console.error("Error updating mindmap:", error);
		return new NextResponse("Internal server error", { status: 500 });
	}
};
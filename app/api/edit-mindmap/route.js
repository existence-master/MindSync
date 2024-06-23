import { NextResponse } from "next/server";
import connect from "@utils/db"; // Import your database connection utility
import Mindmap from "@models/Mindmap"; // Import the Mindmap model
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import cloudinary from "@utils/cloudinary"; // Import Cloudinary configuration

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

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
		// Define the directory where you want to store the uploaded file
		const uploadDir = "/public/uploads";

		// Generate a unique filename
		const fileName = `${uuidv4()}-${previewImage.name}`;
		const filePath = `${uploadDir}/${fileName}`;

		// Read the file as a buffer and save it
		const arrayBuffer = await previewImage.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		await writeFile(filePath, buffer);

		// Upload the preview image to Cloudinary
		const uploadResult = await cloudinary.uploader.upload(filePath, {
			folder: "mindmap_previews",
		});

		// Delete the local file after uploading
		await unlink(filePath);

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

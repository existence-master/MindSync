import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Tesseract from "tesseract.js";

export const POST = async (request) => {
	try {
		const formData = await request.formData();
		const imageFile = formData.get("image");

		// Define the directory where you want to store the image file
		const uploadDir = "./public/uploads";

		// Generate a unique filename
		const fileName = `${uuidv4()}.png`; // Using UUID for uniqueness
		const filePath = path.join(uploadDir, fileName);

		// Read the image file as a buffer
		const imageBuffer = await imageFile.arrayBuffer();
		const buffer = Buffer.from(imageBuffer);

		// Write the image file to the local directory
		await fs.promises.writeFile(filePath, buffer);

		// Perform OCR on the image file using Tesseract.js
		const {
			data: { text },
		} = await Tesseract.recognize(filePath, "eng");

		// Delete the file after transcription
		await fs.promises.unlink(filePath);

		// Return a successful response
		return new NextResponse(JSON.stringify({ text }), {
			status: 200,
		});
	} catch (error) {
		// Handle errors
		console.error("Error:", error);

		// Return an error response
		return new NextResponse({ status: 500 });
	}
};
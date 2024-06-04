import { NextResponse } from "next/server";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import Tesseract from "tesseract.js";

const writeFile = promisify(require("fs").writeFile);
const unlink = promisify(require("fs").unlink);

export const POST = async (request) => {
	try {
		const formData = await request.formData();
		const imageFile = formData.get("image");

		// Define the directory where you want to store the image file
		const uploadDir = "./public/uploads";

		// Generate a unique filename
		const fileName = `${uuidv4()}.png`; // Using UUID for uniqueness
		const filePath = `${uploadDir}/${fileName}`;

		// Read the image file as a buffer
		const imageBuffer = await imageFile.arrayBuffer();
		const buffer = Buffer.from(imageBuffer);

		// Write the image file to the local directory
		await writeFile(filePath, buffer);

		// Perform OCR on the image file using Tesseract.js
		const { createWorker } = Tesseract;
		const worker = await createWorker("eng", 1);

		const {
			data: { text },
		} = await worker.recognize(filePath);

		console.log(text);

		// Delete the file after transcription
		await unlink(filePath);

		// Return a successful response
		return new NextResponse(JSON.stringify({ text }), {
			status: 200,
		});
	} catch (error) {
		console.error("Error:", error);
		return new NextResponse({ status: 500 });
	}
};
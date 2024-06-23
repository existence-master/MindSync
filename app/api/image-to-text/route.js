import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export const POST = async (request) => {
	try {
		const formData = await request.formData();
		const imageFile = formData.get("image");

		if (!imageFile) {
			return new NextResponse("No image file uploaded", { status: 400 });
		}

		// Read the image file as a buffer
		const imageBuffer = await imageFile.arrayBuffer();
		const buffer = Buffer.from(imageBuffer);

		// Perform OCR on the image buffer using Tesseract.js
		const { createWorker } = Tesseract;
		const worker = createWorker({
			logger: (m) => console.log(m), // Add logger here if you want to see progress
		});

		await worker.load();
		await worker.loadLanguage("eng");
		await worker.initialize("eng");
		const {
			data: { text },
		} = await worker.recognize(buffer);
		await worker.terminate();

		// Return a successful response
		return new NextResponse(JSON.stringify({ text }), {
			status: 200,
		});
	} catch (error) {
		console.error("Error:", error);
		return new NextResponse("Internal server error", { status: 500 });
	}
};
import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const POST = async (request) => {
	try {
		// Initialize Speech-to-Text client
		const client = new AssemblyAI({
			apiKey: process.env.ASSEMBLYAI_API_KEY,
		});

		const formData = await request.formData();
		const audioFile = formData.get("audio");

		// Define the directory where you want to store the audio file
		const uploadDir = "../../public/uploads";

		// Generate a unique filename
		const fileName = `${uuidv4()}.mp3`; // Using UUID for uniqueness
		const filePath = path.join(uploadDir, fileName);

		// Read the audio file as a buffer
		const audioBuffer = await audioFile.arrayBuffer();
		const buffer = Buffer.from(audioBuffer);

		// Write the audio file to the local directory
		await fs.promises.writeFile(filePath, buffer);

		// Get URL of the local file
		const audioUrl = filePath;

		const params = {
			audio: audioUrl,
		};

		const transcript = await client.transcripts.transcribe(params);
		const text = transcript.text;

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

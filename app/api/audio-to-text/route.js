import { SpeechClient } from "@google-cloud/speech";
import { NextResponse } from "next/server";

export const POST = async (request) => {
	try {
		// Initialize Speech-to-Text client
		const speechClient = new SpeechClient();
		const formData = await request.formData();
		const audioFile = formData.get("audio");

		// Convert audio buffer to text
		const [response] = await speechClient.recognize({
			audio: {
				content: audioFile,
			},
			config: {
				encoding: "LINEAR16",
				sampleRateHertz: 16000,
				languageCode: "en-US",
			},
		});

		// Extract text from transcription
		const text = response.results
			.map((result) => result.alternatives[0].transcript)
			.join("\n");

		// Return a successful response
		return new NextResponse(JSON.stringify({ text }), { status: 200 });
	} catch (error) {
		// Handle errors
		console.error("Error:", error);

		// Return an error response
		return new NextResponse({ status: 500 });
	}
};

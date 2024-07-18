import { GoogleGenerativeAI } from "@google/generative-ai";
import {
	createMindmapSystemPrompt,
	textMindmapInputOutputPairs,
	cleanTextInputOutputPairs,
	cleanTextSystemPrompt,
} from "@utils/prompts";
import { NextResponse } from "next/server";

export const POST = async (request) => {
	try {
		// Access your API key
		const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

		// For text-only input, use the gemini-pro model
		const createMindmapModel = genAI.getGenerativeModel({
			model: "gemini-1.5-pro-latest",
			systemInstruction: createMindmapSystemPrompt,
		});

		const cleanTextModel = genAI.getGenerativeModel({
			model: "gemini-1.5-pro-latest",
			systemInstruction: cleanTextSystemPrompt,
		});

		const createMindmapChatHistory = textMindmapInputOutputPairs
			.map((pair) => {
				return [
					{
						role: "user",
						parts: [{ text: pair.input }],
					},
					{
						role: "model",
						parts: [{ text: pair.output }],
					},
				];
			})
			.flat();
		
		const cleanTextChatHistory = cleanTextInputOutputPairs
			.map((pair) => {
				return [
					{
						role: "user",
						parts: [{ text: pair.input }],
					},
					{
						role: "model",
						parts: [{ text: pair.output }],
					},
				];
			})
			.flat();

		const createMindmapChat = createMindmapModel.startChat({
			history: createMindmapChatHistory,
			generationConfig: {
				maxOutputTokens: 300,
				temperature: 0.9,
				topP: 0.1,
				topK: 16,
			},
		});

		const cleanTextChat = cleanTextModel.startChat({
			history: cleanTextChatHistory,
			generationConfig: {
				maxOutputTokens: 300,
				temperature: 0.9,
				topP: 0.1,
				topK: 16,
			},
		});

		const { text } = await request.json();


		let result = await createMindmapChat.sendMessage(text);
		let response = result.response;
		let mindmap
		const intermediateMindmap = response.text()

		result = await cleanTextChat.sendMessage(intermediateMindmap);
		console.log(result);
		response = result.response;
		mindmap = response.text();

		// mindmap = intermediateMindmap.match(/mindmap\s*([\s\S]*?)(?=\n\n|$)/)[0];

		// Return a successful response
		return new NextResponse(JSON.stringify({ mindmap }), { status: 200 });
	} catch (error) {
		// Handle errors
		console.error("Error:", error);

		// Return an error response
		return new NextResponse({ status: 500 });
	}
};

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  updateMindmapInputOutputPairs,
  updateMindmapPrompt,
  updateMindmapSystemPrompt,
} from "@utils/prompts";
import { NextResponse } from "next/server";

export const POST = async (request) => {
  try {
    // Access your API key
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro-latest",
      systemInstruction: updateMindmapSystemPrompt,
    });

    const chatHistory = updateMindmapInputOutputPairs
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

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 300,
        temperature: 0.9,
        topP: 0.1,
        topK: 16,
      },
    });

    const { mindmapCode, instruction } = await request.json();

    const prompt = updateMindmapPrompt
      .replace("[MERMAID_MINDMAP_CODE]", mindmapCode)
      .replace("[INSTRUCTION]", instruction);

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const updatedMindmap = response.text();

    // Return a successful response
    return new NextResponse(JSON.stringify({ mindmap: updatedMindmap }), {
      status: 200,
    });
  } catch (error) {
    // Handle errors
    //console.error("Error:", error);

    // Return an error response
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
};

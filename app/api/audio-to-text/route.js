import { AssemblyAI } from "assemblyai";
import { NextResponse } from "next/server";

export const POST = async (request) => {
    try {
        // Initialize Speech-to-Text client
        const client = new AssemblyAI({
            apiKey: process.env.ASSEMBLYAI_API_KEY,
        });

        const formData = await request.formData();
        const audioFile = formData.get("audio");

        if (!audioFile) {
            return new NextResponse(
                JSON.stringify({ error: "No audio file uploaded" }),
                {
                    status: 400, // Bad Request
                }
            );
        }

        // Read the audio file as a buffer
        const audioBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(audioBuffer);

        // Upload the audio buffer to AssemblyAI
        const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
            method: "POST",
            headers: {
                "authorization": process.env.ASSEMBLYAI_API_KEY,
                "content-type": "application/octet-stream"
            },
            body: buffer
        });

        if (!uploadResponse.ok) {
            throw new Error("Failed to upload audio file to AssemblyAI");
        }


        const uploadData = await uploadResponse.json();
        const audioUrl = uploadData.upload_url;

        // Request transcription
        const transcriptResponse = await client.transcripts.create({
            audio_url: audioUrl
        });

        if (!transcriptResponse || !transcriptResponse.id) {
            throw new Error("Failed to create transcription");
        }

        // Wait for transcription to complete
        let transcript = null;
        while (!transcript || transcript.status !== "completed") {
            await new Promise(resolve => setTimeout(resolve, 5000));
            transcript = await client.transcripts.get(transcriptResponse.id);
        }

        // Return a successful response with the transcription text
        return new NextResponse(JSON.stringify({ text: transcript.text }), {
            status: 200,
        });
    } catch (error) {
        console.error("Error:", error);

        // Return an error response
        return new NextResponse(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
};
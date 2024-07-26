import { getSubtitles } from "youtube-caption-extractor";
import { NextResponse } from "next/server";
import { extractVideoId } from "@utils/helpers";

export const POST = async (request) => {
	try {
        const { url } = await request.json()

        const videoId = extractVideoId(url)

        if (!videoId) {
            throw new Error("Invalid YouTube Url")
        }

        const subtitles = await getSubtitles({
            videoID: videoId,
            lang: "en"
        })

        // Combine all subtitles text into a single string
        const text = subtitles.reduce((accumulator, subtitle) => {
            return accumulator + subtitle.text + " " ;
        }, "");

		// Return a successful response
		return new NextResponse(JSON.stringify({ text }), { status: 200 });
	} catch (error) {
		// Handle errors
		console.error("Error:", error);

		// Return an error response
		return new NextResponse({ status: 500 });
	}
};

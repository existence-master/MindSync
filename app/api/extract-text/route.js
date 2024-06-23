import { NextResponse } from "next/server";
import mammoth from "mammoth";
import pdf from "pdf-parse";
import { promisify } from "util";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

export const POST = async (request) => {
	try {
		const formData = await request.formData();
		const textFile = formData.get("text");

		if (!textFile) {
			return new NextResponse(
				JSON.stringify({ error: "No file uploaded" }),
				{
					status: 400, // Bad Request
				}
			);
		}

		// Define the directory where you want to store the uploaded file
		const uploadDir = "../../public/uploads";

		// Generate a unique filename
		const fileName = `${uuidv4()}-${textFile.name}`;
		const filePath = `${uploadDir}/${fileName}`;

		// Read the file as a buffer and save it
		const fileBuffer = await textFile.arrayBuffer();
		const buffer = Buffer.from(fileBuffer);
		await writeFile(filePath, buffer);

		let fileText = "";
		const fileType = textFile.type;

		if (fileType.startsWith("text/")) {
			fileText = await fs.promises.readFile(filePath, "utf-8");
		} else if (fileType === "application/pdf") {
			const data = await pdf(buffer);
			fileText = data.text;
		} else if (
			fileType ===
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
			fileType === "application/msword"
		) {
			const result = await mammoth.extractRawText({ buffer });
			fileText = result.value;
		}

		// Delete the file after processing
		await unlink(filePath);

		// Return a successful response
		return new NextResponse(JSON.stringify({ text: fileText }), {
			status: 200,
		});
	} catch (error) {
		console.error("Error:", error);

		// Return an error response
		return new NextResponse({ status: 500 });
	}
};

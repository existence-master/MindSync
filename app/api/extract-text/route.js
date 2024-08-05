import { NextResponse } from "next/server";
import mammoth from "mammoth";
import pdf from "pdf-parse";

export const POST = async (request) => {
  try {
    const formData = await request.formData();
    const textFile = formData.get("text");

    if (!textFile) {
      return new NextResponse(JSON.stringify({ error: "No file uploaded" }), {
        status: 400, // Bad Request
      });
    }

    // Read the file as a buffer
    const fileBuffer = await textFile.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    let fileText = "";
    const fileType = textFile.type;

    if (fileType.startsWith("text/")) {
      fileText = buffer.toString("utf-8");
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

    // Return a successful response
    return new NextResponse(JSON.stringify({ text: fileText }), {
      status: 200,
    });
  } catch (error) {
    //console.error("Error:", error);

    // Return an error response
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
};

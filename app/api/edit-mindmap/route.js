import { NextResponse } from "next/server";
import connect from "@utils/db"; // Import your database connection utility
import Mindmap from "@models/Mindmap"; // Import the Mindmap model
import cloudinary from "@utils/cloudinary"; // Import Cloudinary configuration

export const POST = async (request) => {
  const formData = await request.formData();
  const mindmapId = formData.get("mindmapId");
  const mindmapCode = formData.get("mindmapCode");
  const mindmapName = formData.get("mindmapName");
  const previewImage = formData.get("previewImage");

  if (!mindmapId || !mindmapCode || !mindmapName) {
    return new NextResponse("Missing required data", { status: 400 });
  }

  await connect();

  try {
    // Upload the preview image to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(previewImage, {
      folder: "mindmap_previews",
    });

    // Update the mindmap in the database
    const updatedMindmap = await Mindmap.findByIdAndUpdate(
      mindmapId,
      {
        code: mindmapCode,
        name: mindmapName,
        previewImageURL: uploadResult.secure_url,
      },
      { new: true }
    );

    if (!updatedMindmap) {
      return new NextResponse("Mindmap not found", { status: 404 });
    }

    return new NextResponse("Mindmap updated", { status: 200 });
  } catch (error) {
    //console.error("Error updating mindmap:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
};

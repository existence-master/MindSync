import mongoose from "mongoose"; // Importing mongoose for MongoDB interactions

const { Schema, model, models } = mongoose; // Destructuring Schema, model, and models from mongoose

// Define the schema for the Mindmap collection
const mindmapSchema = new Schema(
	{
		name: {
			type: String, // Data type for the mindmap name field
			required: true, // Mindmap name is required
		},
		code: {
			type: String, // Data type for the mindmap code field
			required: true, // Mindmap code is required
		},
		previewImageURL: {
			type: String, // Data type for the preview image path
			required: true, // Preview image path is required
		},
	},
	{ timestamps: true } // Enable automatic timestamps for created and updated times
);

// Define the Mindmap model using the schema
// If the model exists in the models collection, use it; otherwise, create a new one
const Mindmap = models.Mindmap || model("Mindmap", mindmapSchema);

export default Mindmap; // Export the Mindmap model for use in other parts of the application

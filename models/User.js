import mongoose from "mongoose"; // Importing mongoose for MongoDB interactions

const { Schema, model, models } = mongoose; // Destructuring Schema, model, and models from mongoose

// Define the schema for the User collection
const userSchema = new Schema(
	{
		email: {
			type: String, // Data type for the email field
			unique: true, // Ensures each email is unique
			required: true, // Email is required
		},
		password: {
			type: String, // Data type for the password field
			required: true, // Password is optional
		},
		username: {
			type: String, // Data type for the username field
			unique: true, // Ensures each username is unique
			required: true, // Username is required
		},
		mindmaps: [
			{
				type: Schema.Types.ObjectId, // References to the Chat model
				ref: "MindMap", // Reference the Chat collection
				required: false, // This field can be optional
			},
		],
	},
	{ timestamps: true } // Enable automatic timestamps for created and updated times
);

// Define the User model using the schema
// If the model exists in the models collection, use it; otherwise, create a new one
const User = models.User || model("User", userSchema);

export default User; // Export the User model for use in other parts of the application
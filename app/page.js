"use client" // Render on client side

import ErrorDisplay from "@components/ErrorDisplay" // Custom error component
import Navbar from "@components/Navbar" // Navbar component
import { useState } from "react"

const Home = () => {
	// State to store the mode and input value
	const [formData, setFormData] = useState({
		mode: "Text",
		input: "",
	})

	// State to store error
	const [error, setError] = useState(null)

	// State to store mindmap
	const [mindmap, setMindmap] = useState(null)

	// State to store form submission status
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Function to handle mode change and input change
	const handleChange = (event) => {
		const { name, value, files } = event.target
		if (name === "input" && formData.mode === "Audio") {
			// If the input is for audio and mode is "Audio", store the selected file
			setFormData({ ...formData, input: files[0] })
		} else {
			// For other inputs, update the form data as usual
			setFormData({ ...formData, [name]: value })
		}
	}

	// Function to handle form submission
	const handleSubmit = async (event) => {
		event.preventDefault()
		setIsSubmitting(true) // Set submitting state to true
		// Send a POST request to /api/generate-mindmap with formData
		try {
			const response = await fetch("/api/generate-mindmap", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			})
			// Handle response
			if (response.ok) {
				const mindmap = await response.json()
				setMindmap(mindmap)
            }
            
            else {
                throw new Error("Internal server error")
            }
        } catch (error) {
			console.error("Error:", error.message)
			setError(error.message)
		} finally {
			setIsSubmitting(false) // Reset submitting state to false
		}
	}

	// Function to handle restarting
	const handleRestart = () => {
		setMindmap(null) // Reset mindmap
    }
    
    // Handle error function
    const handleError = () => {
        setError(null)
    }

	return (
		<main className="m-5">
			<Navbar />
			<section className="mt-[35px] lg:mt-[75px] lg:mx-[30px] flex flex-col items-center">
				<div className="max-w-max">
					<h1 className="xs:max-lg:text-3xl text-center primary-text">
						MindSync
					</h1>
					<h2 className="xs:max-lg:text-sm xs:max-lg:mt-[10px] mt-[20px] text-center secondary-text">
						Sync your thoughts to mindmaps in seconds
					</h2>
					{mindmap ? (
						<div className="max-w-max">
							<h1 className="xs:max-lg:text-3xl text-center primary-text">
								Here's your mindmap
							</h1>
							<img src={mindmap} alt="Mindmap" />
							<button
								onClick={handleRestart}
								className="mx-[50px] primary-btn"
							>
								Restart
							</button>
						</div>
					) : (
						<form
							onSubmit={handleSubmit}
							className="mt-[20px] lg:mt-[50px] w-full gap-5 lg:gap-7 flex flex-col"
						>
							{/* Select for choosing mind mapping mode */}
							<label
								htmlFor="mindMappingMode"
								className="text-tawnyPort ternary-text"
							>
								Select a mind mapping mode:
							</label>
							<select
								id="mindMappingMode"
								name="mode"
								className="input"
								value={formData.mode}
								onChange={handleChange}
							>
								<option value="Text">Text</option>
								<option value="Audio">Audio</option>
								<option value="Video">Video</option>
							</select>
							{/* Label and input based on selected mode */}
							{formData.mode === "Text" && (
								<>
									<label
										htmlFor="textInput"
										className="text-tawnyPort ternary-text"
									>
										Enter your text:
									</label>
									<textarea
										id="textInput"
										name="input"
										className="input"
										value={formData.input}
										onChange={handleChange}
										rows="4"
										cols="35"
										placeholder="Enter your text"
									></textarea>
								</>
							)}
							{formData.mode === "Audio" && (
								<>
									<label
										htmlFor="audioUpload"
										className="text-tawnyPort ternary-text"
									>
										Upload audio file:
									</label>
									<input
										id="audioUpload"
										name="input"
										className="input"
										type="file"
										accept="audio/*"
										onChange={handleChange}
									/>
								</>
							)}
							{formData.mode === "Video" && (
								<>
									<label
										htmlFor="videoLink"
										className="text-tawnyPort ternary-text"
									>
										Paste YouTube link:
									</label>
									<input
										id="videoLink"
										name="input"
										type="text"
										className="input"
										value={formData.input}
										onChange={handleChange}
										placeholder="Paste YouTube link"
									/>
								</>
							)}
							{/* Submit button */}
							<button
								type="submit"
								className="mx-[50px] primary-btn"
							>
								{isSubmitting ? "Processing" : "Convert"}
							</button>
						</form>
					)}
				</div>
			</section>
			{/* Display custom error if any*/}
			{error && (
				<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
					<ErrorDisplay errorMessage={error} handleError={handleError}/>
				</div>
			)}
		</main>
	)
}

export default Home
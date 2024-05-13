"use client" // Render on client side

import ErrorDisplay from "@components/ErrorDisplay" // Custom error component
import Navbar from "@components/Navbar" // Navbar component
import { useState, useEffect, useRef } from "react"
import mermaid from "mermaid" // Mermaid.js
import NextImage from "next/image"
import { fabric } from "fabric" // Import the fabric.js library for canvas manipulation


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

	// State to store SpeechRecognition instance
	const [recognition, setRecognition] = useState(null)

	// State to distinguish between audio file and live recording
	const [liveRecording, setLiveRecording] = useState(false)

	// State to trigger the button animation
	const [isRecording, setIsRecording] = useState(false)

	// Create a reference for the mindmap element
	const mindmapRef = useRef(null)
	
	// Custom function to handle mermaid syntax errors
	mermaid.parseError =  (err, hash) => {
		setError("Couldn't convert to mindmap. Please try a different context");
	};

	// load mermaid dynamically
	useEffect(() => {
		mermaid.initialize({ startOnLoad: true })
	}, [])

	useEffect(() => {
		mermaid.run()
	}, [mindmap])

	useEffect(() => {
		if (formData.mode === "Audio") {
			const speechRecognition =
				window?.SpeechRecognition || window?.webkitSpeechRecognition
			if (speechRecognition) {
				// Initialize SpeechRecognition when mode is "Audio"
				const recognitionInstance = new speechRecognition()
				recognitionInstance.continuous = true // Continuous recording
				recognitionInstance.interimResults = true

				// Set the state when recording is done
				recognitionInstance.onresult = (event) => {
					const transcript = Array.from(event.results)
						.map((result) => result[0].transcript)
						.join("")
					setFormData({ ...formData, input: transcript })
				}
				setRecognition(recognitionInstance)
			}
		}
	}, [formData.mode])

	// Function to handle mode change and input change
	const handleChange = (event) => {
		const { name, value, files } = event.target
		if (
			name === "input" &&
			formData.mode === "Audio" &&
			liveRecording === false
		) {
			// If the input is for audio and mode is "Audio", store the selected file
			setFormData({ ...formData, input: files[0] })
		} else {
			// For other inputs, update the form data as usual
			setFormData({ ...formData, [name]: value })
		}
	}

	// Function to handle start/stop recording
	const handleToggleRecording = () => {
		if (isRecording) {
			recognition.stop()
		} else {
			recognition.start()
			setLiveRecording(true) // Toggle liveRecording state
		}

		setIsRecording(!isRecording) // Toggle recording state
	}

	// Function to handle form submission
	const handleSubmit = async (event) => {
		event.preventDefault()
		setIsSubmitting(true) // Set submitting state to true
		let text = null
		let response = null

		// Check mode and convert the data accordingly
		try {
			if (
				formData.mode === "Text" ||
				(formData.mode === "Audio" && liveRecording === true)
			) {
				text = formData.input
			} else if (formData.mode === "Audio" && liveRecording === false) {
				const inputData = new FormData()
				inputData.append("audio", formData.input)

				response = await fetch("/api/audio-to-text", {
					method: "POST",
					body: inputData,
				})

				if (response.ok) {
					const output = await response.json()
					text = output.text
				} else {
					throw new Error("Failed to transcribe audio")
				}
			} else if (formData.mode === "Video") {
				response = await fetch("/api/video-to-text", {
					method: "POST",
					body: JSON.stringify({ url: formData.input }),
				})
				if (response.ok) {
					const output = await response.json()
					text = output.text
				} else {
					throw new Error("Failed to transcribe audio")
				}
			}

			// Send a POST request to /api/text-to-mindmap with formData
			response = await fetch("/api/text-to-mindmap", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text }),
			})

			// Handle response
			if (response.ok) {
				let { mindmap } = await response.json()
				mindmap = setMindmap(mindmap)
			} else {
				throw new Error("Failed to render mindmap")
			}
		} catch (error) {
			console.error("Error:", error.message)
			setError(error.message)
		} finally {
			setIsSubmitting(false) // Reset submitting state to false
		}
	}

	// Function to convert the mindmap from svg to png and download it
	const handleDownloadMindmap = () => {
		const mindmapSVG = mindmapRef.current.innerHTML // Get the mindmap SVG content

		// Load the SVG string into fabric.js
		fabric.loadSVGFromString(mindmapSVG, (objects) => {
			const svgElement = mindmapRef.current.childNodes[0];
			const svgWidth = svgElement.width.baseVal.value;
			const svgHeight = svgElement.height.baseVal.value;
			// Create a new fabric.js canvas
			const canvas = new fabric.Canvas("canvas", {
				width: svgWidth,
				height: svgHeight,
			});

			// Add the SVG objects to the canvas
			canvas.add(...objects);

			// Convert the canvas content to a PNG data URL
			const pngUrl = canvas.toDataURL({
				format: "png", // Specify the output format as PNG
				quality: 1, // Set the image quality (1 being the highest)
			})

			// Create a temporary link element for downloading
			const downloadLink = document.createElement("a");

			// Set the link's URL to the PNG data URL
			downloadLink.href = pngUrl;

			// Set the download filename as "mindmap.png"
			downloadLink.download = "mindmap.png";

			// Append the link to the document body
			document.body.appendChild(downloadLink);

			// Trigger the download by clicking the link
			downloadLink.click();

			// Remove the temporary link from the document
			document.body.removeChild(downloadLink);
		})
	}
	

	// Function to handle restarting
	const handleRestart = () => {
		setMindmap(null) // Reset mindmap
		setFormData({
			mode: "Text",
			input: "",
		})
		setLiveRecording(false)
	}

	// Handle error function
	const handleError = () => {
		setError(null)
	}

	return (
		<>
			<main className="mt-5 mb-10 mx-5">
				<Navbar />
				<section className="mt-[35px] lg:mt-[75px] lg:mx-[30px] flex flex-col items-center">
					<div className="max-w-max">
						<h1 className="text-center primary-text">MindSync</h1>
						<h2 className="xs:max-lg:mt-[10px] mt-[20px] text-center secondary-text">
							Sync your thoughts to mindmaps in seconds
						</h2>
						{mindmap ? (
							<div className="mt-[20px] lg:mt-[50px] w-full gap-5 lg:gap-7 flex flex-col items-center">
								<h1 className="xs:max-md:text-sm md:max-lg:text-md text-center secondary-text">
									Here's your mindmap
								</h1>
								<pre ref={mindmapRef} className="mermaid mindmap">{mindmap}</pre>
								<div className="flex gap-10 items-center w-[50%]">
									<button
										onClick={handleDownloadMindmap}
										className="mx-auto primary-btn" // Center align the button
									>
										Download
									</button>
									<button
										onClick={handleRestart}
										className="mx-auto primary-btn" // Center align the button
									>
										Restart
									</button>
								</div>
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
										<div className="flex justify-center">
											{" "}
											{/* Change to center justify */}
											<button
												type="button"
												onClick={handleToggleRecording}
												className={`primary-btn ${
													isRecording
														? "bg-red-500 text-white animate-pulse"
														: ""
												}`}
											>
												{isRecording
													? "Stop Recording"
													: "Start Recording"}{" "}
												{/* Toggle button text */}
											</button>
										</div>
										<textarea
											id="textInput"
											name="input"
											className="input"
											value={formData.input}
											rows="4"
											cols="35"
											placeholder="You said..."
											disabled
										></textarea>
										<span className="text-center ternary-text">
											or
										</span>{" "}
										{/* Added "or" option */}
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
									className="mx-auto primary-btn" // Center align the button
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
						<ErrorDisplay
							errorMessage={error}
							handleError={handleError}
						/>
					</div>
				)}
			</main>
			<div className="xs:max-md:hidden absolute top-[100px] xs:max-md:-right-[225px]  lg:max-lg:-right-[250px] -right-[275px]">
				<NextImage
					src="/blob-1.svg"
					width={0}
					height={0}
					alt="Blob 1"
					className="blob"
				/>
			</div>
			<div className="xs:max-md:hidden absolute -bottom-[275px] xs:max-md:-left-[175px] md:max-lg:-left-[200px] -left-[225px]">
				<NextImage
					src="/blob-2.svg"
					width={0}
					height={0}
					alt="Blob 2"
					className="blob"
				/>
			</div>
		</>
	)
}

export default Home
"use client" // Render on client side

import ErrorDisplay from "@components/ErrorDisplay" // Custom error component
import Navbar from "@components/Navbar" // Navbar component
import { useState, useEffect } from "react"
import mermaid from "mermaid" // MermaidJS

const Home = () => {
	// State to store the mode and input value
	const [formData, setFormData] = useState({
		mode: "Text",
		input: "",
	});

	// State to store error
	const [error, setError] = useState(null);

	// State to store mindmap
	const [mindmap, setMindmap] = useState(null);

	// State to store form submission status
	const [isSubmitting, setIsSubmitting] = useState(false);

	// State to store SpeechRecognition instance
	const [recognition, setRecognition] = useState(null);

	// State to distinguish between audio file and live recording

	const [liveRecording, setLiveRecording] = useState(false)

	// load mermaid dynamically
	useEffect(() => {
		mermaid.initialize({ startOnLoad: true });
	}, []);

	useEffect(() => {
		mermaid.run();
	}, [mindmap]);

	useEffect(() => {
		if (formData.mode === "Audio") {
			const speechRecognition = window?.SpeechRecognition || window?.webkitSpeechRecognition
			if (speechRecognition) {
				// Initialize SpeechRecognition when mode is "Audio"
				const recognitionInstance = new speechRecognition();
				recognitionInstance.continuous = true; // Continuous recording
				recognitionInstance.interimResults = true;

				// Set the state when recording is done
				recognitionInstance.onresult = (event) => {
					const transcript = Array.from(event.results)
						.map((result) => result[0].transcript)
						.join("");
					setFormData({ ...formData, input: transcript });
				};
				setRecognition(recognitionInstance);
			}
		}
	}, [formData.mode]);

	// Function to handle mode change and input change
	const handleChange = (event) => {
		const { name, value, files } = event.target;
		if (name === "input" && formData.mode === "Audio" && liveRecording === false) {
			// If the input is for audio and mode is "Audio", store the selected file
			setFormData({ ...formData, input: files[0] });
		} else {
			// For other inputs, update the form data as usual
			setFormData({ ...formData, [name]: value });
		}
	};
	
	const handleStartRecording = () => {
		recognition.start();
		setLiveRecording(true)
	};

	const handleStopRecording = () => {
		recognition.stop();
	};

	// Function to handle form submission
	const handleSubmit = async (event) => {
		event.preventDefault();
		setIsSubmitting(true); // Set submitting state to true
		let text = null;
		let response = null;

		// Check mode and convert the data accordingly
		try {
			if (formData.mode === "Text" || (formData.mode === "Audio" && liveRecording === true)) {
				text = formData.input;
			} else if (formData.mode === "Audio" && liveRecording === false) {
				const inputData = new FormData();
				inputData.append("audio", formData.input);

				response = await fetch("/api/audio-to-text", {
					method: "POST",
					body: inputData,
				});

				if (response.ok) {
					const output = await response.json();
					text = output.text;
				} else {
					throw new Error("Failed to transcribe audio");
				}
			} else if (formData.mode === "Video") {
				response = await fetch("/api/video-to-text", {
					method: "POST",
					body: JSON.stringify({url: formData.input}),
				});
				if (response.ok) {
					const output = await response.json();
					text = output.text;
				} else {
					throw new Error("Failed to transcribe audio");
				}
			}

			// Send a POST request to /api/text-to-mindmap with formData
			response = await fetch("/api/text-to-mindmap", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text }),
			});

			// Handle response
			if (response.ok) {
				let { mindmap } = await response.json();
				mindmap = setMindmap(mindmap);
			} else {
				throw new Error("Failed to render mindmap");
			}
		} catch (error) {
			console.error("Error:", error.message);
			setError(error.message);
		} finally {
			setIsSubmitting(false); // Reset submitting state to false
		}
	};

	// Function to handle restarting
	const handleRestart = () => {
		setMindmap(null); // Reset mindmap
		setFormData({
			mode: "Text",
			input: "",
		});
	};

	// Handle error function
	const handleError = () => {
		setError(null);
	};

	return (
		<main className="m-5">
			<Navbar />
			<section className="mt-[35px] lg:mt-[75px] lg:mx-[30px] flex flex-col items-center">
				<div className="max-w-max">
					<h1 className="text-center primary-text">
						MindSync
					</h1>
					<h2 className="xs:max-lg:mt-[10px] mt-[20px] text-center secondary-text">
						Sync your thoughts to mindmaps in seconds
					</h2>
					{mindmap ? (
						<div className="mt-[20px] lg:mt-[50px] w-full gap-5 lg:gap-7 flex flex-col">
							<h1 className="xs:max-md:text-sm md:max-lg:text-md text-center secondary-text">
								Here's your mindmap
							</h1>
							<pre className="mermaid">{mindmap}</pre>
							<button
								onClick={handleRestart}
								className="mx-auto primary-btn" // Center align the button
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
									<div className="flex justify-evenly">
										<button
											type="button"
											onClick={handleStartRecording}
											className="primary-btn"
										>
											Start Recording
										</button>
										<button
											type="button"
											onClick={handleStopRecording}
											className="primary-btn"
										>
											Stop Recording
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
									{/* Added 'or' option */}
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
	);
}

export default Home
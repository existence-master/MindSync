"use client";

import SignoutButton from "@components/SignoutButton";
import FileDisplay from "@components/FileDisplay";
import { useState, useRef, useEffect } from "react";
import mermaid from "mermaid";
import { fabric } from "fabric"; // Import the fabric.js library for canvas manipulation

const Dashboard = () => {
	const [input, setInput] = useState("");
	const [files, setFiles] = useState([]);
	const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
	const [error, setError] = useState(null);
	const [mindmap, setMindmap] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [mindmapName, setMindmapName] = useState("");
	const [showDialog, setShowDialog] = useState(false);
	const [showExportDropdown, setShowExportDropdown] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [recognition, setRecognition] = useState(null);
	const [videoLinkInput, setVideoInput] = useState({
		type: "link", // or "file"
		name: "",
		value: ""
	});
	const [showVideoDialog, setShowVideoDialog] = useState(false);

	const mindmapRef = useRef(null);

	mermaid.parseError = (err) => {
		setError("Couldn't convert to mindmap. Please try a different context");
	};

	useEffect(() => {
		mermaid.initialize({ startOnLoad: true });
	}, []);

	useEffect(() => {
		mermaid.run();
	}, [mindmap]);

	useEffect(() => {
		// Initialize SpeechRecognition
		const SpeechRecognition =
			window?.SpeechRecognition || window?.webkitSpeechRecognition;
		if (SpeechRecognition) {
			const newRecognition = new SpeechRecognition();
			newRecognition.continuous = true;
			newRecognition.interimResults = true;
			newRecognition.onresult = (event) => {
				const transcript = Array.from(event.results)
					.map((result) => result[0].transcript)
					.join("");
				setInput(transcript);
			};
			setRecognition(newRecognition);
		}
	}, []);

	const handleToggleRecording = () => {
		if (isRecording) {
			recognition.stop();
		} else {
			recognition.start();
		}
		setIsRecording(!isRecording);
	};

	const handleFileChange = (event) => {
		const selectedFiles = Array.from(event.target.files);
		setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
	};

	const removeFile = (index) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
	};

	const handleVideoLinkInput = (event) => {
		setVideoInput((prevState) => ({
			...prevState,
			name: event.target.value,
			value: event.target.value
		}));
	};

	const handleConvert = async () => {
		setIsSubmitting(true);
		let textResponse = input;

		for (let file of files) {
			const fileType = file.type;
			if (fileType.startsWith("text/")) {
				const fileText = await file.text();
				textResponse += `\n${fileText}`;
			} else if (fileType.startsWith("audio/")) {
				const formData = new FormData();
				formData.append("audio", file);
				const response = await fetch("/api/audio-to-text", {
					method: "POST",
					body: formData,
				});
				if (response.ok) {
					const output = await response.json();
					textResponse += `\n${output.text}`;
				}
			} else if (fileType.startsWith("image/")) {
				const formData = new FormData();
				formData.append("image", file);
				const response = await fetch("/api/image-to-text", {
					method: "POST",
					body: formData,
				});
				if (response.ok) {
					const output = await response.json();
					textResponse += `\n${output.text}`;
				}
			} else if (fileType.startsWith("video/")) {
				const formData = new FormData();
				formData.append("video", file);
				const response = await fetch("/api/video-to-text", {
					method: "POST",
					body: formData,
				});
				if (response.ok) {
					const output = await response.json();
					textResponse += `\n${output.text}`;
				}
			}
			else if (fileType.startsWith("link")) {
				const response = await fetch("/api/video-to-text", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ url: videoLinkInput.value }),
				});
				if (response.ok) {
					const output = await response.json();
					textResponse += `\n${output.text}`;
				}
			}
		}

		try {
			const response = await fetch("/api/text-to-mindmap", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text: textResponse }),
			});

			if (response.ok) {
				const { mindmap } = await response.json();
				setMindmap(mindmap);
			} else {
				throw new Error("Failed to render mindmap");
			}
		} catch (error) {
			setError(error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleExportMindmap = (format) => {
		const mindmapSVG = mindmapRef.current.innerHTML;

		fabric.loadSVGFromString(mindmapSVG, (objects, options) => {
			const svgElement = mindmapRef.current.childNodes[0];
			const svgWidth = svgElement.width.baseVal.value;
			const svgHeight = svgElement.height.baseVal.value;

			const canvas = new fabric.Canvas(document.createElement("canvas"), {
				width: svgWidth,
				height: svgHeight,
			});

			const svgGroup = fabric.util.groupSVGElements(objects, options);

			svgGroup.scaleToWidth(svgWidth);
			svgGroup.scaleToHeight(svgHeight);
			svgGroup.set({
				left: 0,
				top: 0,
			});

			canvas.add(svgGroup);
			canvas.renderAll();

			let dataURL = "";
			if (format === "svg") {
				dataURL = canvas.toSVG();
			} else if (format === "png") {
				dataURL = canvas.toDataURL({
					format: "png",
					quality: 1,
				});
			}

			const downloadLink = document.createElement("a");
			downloadLink.href = dataURL;
			downloadLink.download = `mindmap.${format}`;
			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		});
	};

	const handleSaveMindmap = async () => {
		try {
			const response = await fetch("/api/save-mindmap", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ mindmap, mindmapName }),
			});
			if (response.ok) {
				console.log("Mindmap saved");
				setShowDialog(false);
			} else {
				throw new Error("Failed to save mindmap");
			}
		} catch (error) {
			console.error("Error:", error);
			setError(error.message);
		}
	};

	const handleRestart = () => {
		setMindmap(null);
		setInput("");
		setFiles([]);
	};

	const handleError = () => {
		setError(null);
	};

	return (
		<div style={{ display: "flex", height: "100vh" }}>
			{/* Sidebar */}
			<div
				style={{
					width: "250px",
					backgroundColor: "#f4f4f4",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
				}}
			>
				<div>
					<div style={{ padding: "20px", textAlign: "center" }}>
						<h2>Logo</h2>
					</div>
					<div style={{ padding: "20px", textAlign: "center" }}>
						<button style={{ marginBottom: "10px" }}>Create</button>
						<button>Saved</button>
					</div>
				</div>
				<div style={{ padding: "20px", textAlign: "center" }}>
					<p>Username</p>
				</div>
			</div>

			{/* Main Content */}
			<div style={{ flex: 1, padding: "20px", position: "relative" }}>
				<div
					style={{ position: "absolute", top: "20px", right: "20px" }}
				>
					<SignoutButton />
				</div>
				<h1>Create Mindmap</h1>
				<h2>Sync your thoughts to mindmaps in seconds</h2>

				{mindmap ? (
					<div style={{ marginTop: "20px" }}>
						<h2>Here's your mindmap</h2>
						<pre ref={mindmapRef} className="mermaid mindmap">
							{mindmap}
						</pre>
						<div
							style={{
								display: "flex",
								justifyContent: "center",
								gap: "10px",
								marginTop: "10px",
							}}
						>
							<div className="dropdown">
								<button
									className="primary-btn dropdown-btn"
									onClick={() =>
										setShowExportDropdown(
											!showExportDropdown
										)
									}
								>
									Export
								</button>
								{showExportDropdown && (
									<div className="dropdown-content">
										<button
											onClick={() =>
												handleExportMindmap("svg")
											}
										>
											Export as SVG
										</button>
										<button
											onClick={() =>
												handleExportMindmap("png")
											}
										>
											Export as PNG
										</button>
									</div>
								)}
							</div>
							<button
								onClick={() => setShowDialog(true)}
								className="primary-btn"
							>
								Save
							</button>
							<button
								onClick={handleRestart}
								className="primary-btn"
							>
								Restart
							</button>
							{showDialog && (
								<div className="modal">
									<div className="modal-content">
										<h2>Enter Mindmap Name</h2>
										<input
											type="text"
											value={mindmapName}
											onChange={(e) =>
												setMindmapName(e.target.value)
											}
											placeholder="Enter mindmap name"
										/>
										<div
											style={{
												display: "flex",
												justifyContent: "center",
												marginTop: "10px",
											}}
										>
											<button
												onClick={handleSaveMindmap}
												className="primary-btn"
											>
												Save
											</button>
											<button
												onClick={() =>
													setShowDialog(false)
												}
												className="primary-btn"
											>
												Cancel
											</button>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				) : (
					<div style={{ marginTop: "20px" }}>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								marginBottom: "10px",
							}}
						>
							{showAttachmentOptions && (
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										marginRight: "10px",
									}}
								>
									<button
										onClick={() =>
											document
												.getElementById("fileInput")
												.click()
										}
									>
										Text
									</button>
									<button
										onClick={() =>
											document
												.getElementById("fileInput")
												.click()
										}
									>
										Audio
									</button>
									<button onClick={() => setShowVideoDialog(true)}>
										Video
									</button>
									<button
										onClick={() =>
											document
												.getElementById("fileInput")
												.click()
										}
									>
										Image
									</button>
								</div>
							)}
							<button
								onClick={() =>
									setShowAttachmentOptions(
										!showAttachmentOptions
									)
								}
							>
								Attach
							</button>
							<textarea
								value={input}
								onChange={(e) => setInput(e.target.value)}
								placeholder="Type or speak your thoughts here..."
								style={{
									width: "100%",
									height: "100px",
									marginLeft: "10px",
								}}
							/>
							<button
								onClick={() => handleToggleRecording()}
								className={`primary-btn ${
									isRecording
										? "bg-red-500 text-white animate-pulse"
										: ""
								}`}
							>
								{isRecording
									? "Stop Recording"
									: "Start Recording"}
							</button>
							<input
								id="fileInput"
								type="file"
								multiple
								onChange={handleFileChange}
								style={{ display: "none" }}
							/>
							</div>
						{files.map((file, index) => (
							<FileDisplay
								key={index}
								file={file}
								removeFile={() => removeFile(index)}
							/>
						))}
						<button
							onClick={handleConvert}
							style={{ marginTop: "10px" }}
						>
							{isSubmitting ? "Processing..." : "Convert"}
						</button>
						{/* Video Dialog */}
						{showVideoDialog && (
							<div className="modal">
								<div className="modal-content">
									<h2>Select Video Input</h2>
									<div>
										<input
											type="radio"
											name="videoLinkInputType"
											value="link"
											checked={videoLinkInput.type === "link"}
											onChange={() =>
												setVideoInput({
													type: "link",
													name: "",
												})
											}
										/>
										<label htmlFor="videoLink">
											YouTube Link
										</label>
									</div>
									<div>
										<input
											type="radio"
											name="videoLinkInputType"
											value="file"
											checked={videoLinkInput.type === "file"}
											onChange={() =>
												setVideoInput({
													type: "file",
													value: "",
												})
											}
										/>
										<label htmlFor="videoFile">
											Video File
										</label>
									</div>
									{videoLinkInput.type === "link" && (
										<input
											type="text"
											value={videoLinkInput.value}
											onChange={handleVideoLinkInput}
											placeholder="Enter YouTube Link"
										/>
									)}
									{videoLinkInput.type === "file" && (
										<input
											type="file"
											accept="video/*"
											onChange={handleFileChange}
										/>
									)}
									<div
										style={{
											display: "flex",
											justifyContent: "center",
											marginTop: "10px",
										}}
									>
										<button
											onClick={() =>
												setShowVideoDialog(false)
											}
											className="primary-btn"
										>
											Cancel
										</button>
										<button
												onClick={() => {
													setShowVideoDialog(false)
													if (videoLinkInput.value != "") {
														setFiles((prevFiles) => [...prevFiles, videoLinkInput])
													}
												}}
											className="primary-btn"
										>
											Select
										</button>
									</div>
								</div>
							</div>
						)}
					</div>
				)}	

				{error && (
					<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
						<div
							style={{
								backgroundColor: "white",
								padding: "20px",
								borderRadius: "5px",
							}}
						>
							<h2>Error</h2>
							<p>{error}</p>
							<button onClick={handleError}>Close</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Dashboard;
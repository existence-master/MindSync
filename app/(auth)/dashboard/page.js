"use client";

import SignoutButton from "@components/SignoutButton";
import FileDisplay from "@components/FileDisplay";
import { useState, useRef, useEffect, Fragment } from "react";
import { useSession } from "next-auth/react";
import mermaid from "mermaid";
import { fabric } from "fabric"; // Import the fabric.js library for canvas manipulation
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import useWindowSize from "@hooks/useWindowSize";
import ErrorDisplay from "@components/ErrorDisplay";
import FeedbackForm from "@components/FeedbackForm";
import { FlipWords } from "@components/FlipWords";

const Dashboard = () => {
	const windowSize = useWindowSize();
	const [input, setInput] = useState("");
	const [files, setFiles] = useState([]);
	const [user, setUser] = useState(null);
	const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
	const [error, setError] = useState(null);
	const [mindmap, setMindmap] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [mindmapName, setMindmapName] = useState("");
	const [showDialog, setShowDialog] = useState(false);
	const [showExportDropdown, setShowExportDropdown] = useState(false);
	const [isRecording, setIsRecording] = useState(false);
	const [recognition, setRecognition] = useState(null);
	const [showFeedbackForm, setShowFeedbackForm] = useState(false);
	const [feedback, setFeedback] = useState(false);
	const [navigate, setNavigate] = useState(null);
	const [videoLinkInput, setVideoInput] = useState({
		type: "link", // or "file"
		name: "",
		value: "",
	});
	const [showVideoDialog, setShowVideoDialog] = useState(false);
	const { setTheme, resolvedTheme } = useTheme();
	const { data: session, status } = useSession();
	const router = useRouter();

	const isMobile = windowSize.width <= 768;

	// Redirect unauthenticated users
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/unauthenticated");
		}
	}, [status, router]); // Ensure this effect runs when the status changes

	const mindmapRef = useRef(null);

	mermaid.parseError = (err) => {
		setError("Couldn't convert to mindmap. Please try a different context");
		updateMindmapCount(false);
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

	useEffect(() => {
		const fetchUserDetails = async () => {
			try {
				const response = await fetch("/api/get-user-details");
				if (response.ok) {
					const data = await response.json();
					setUser(data);
				} else {
					throw new Error("Failed to fetch user details");
				}
			} catch (error) {
				setError(error.message);
			}
		};

		fetchUserDetails();
	}, []);

	useEffect(() => {
		const checkFeedback = async () => {
			try {
				const response = await fetch("/api/check-feedback", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ columnName: "Create" }),
				});

				if (response.ok) {
					const data = await response.json();
					setFeedback(data.result ? true : false);
				} else {
					throw new Error("Error checking feedback");
				}
			} catch (error) {
				setError(error.message);
			}
		};

		checkFeedback();
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

		// Reset the value of the file input
		event.target.value = null;
	};

	const removeFile = (index) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
	};

	const triggerFileInput = (acceptType) => {
		const fileInput = document.getElementById("fileInput");
		fileInput.setAttribute("accept", acceptType);
		fileInput.click();
	};

	const handleVideoLinkInput = (event) => {
		setVideoInput((prevState) => ({
			...prevState,
			name: event.target.value,
			value: event.target.value,
		}));
	};

	const updateMindmapCount = async (increment) => {
		try {
			const response = await fetch("/api/mindmap-count", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ increment }),
			});

			if (!response.ok) {
				throw new Error("Failed to update mindmap count");
			}

			const { count } = await response.json();
			if (count) {
				return;
			}
		} catch (error) {
			setError(error.message);
		}
	};

	const handleCreate = async () => {
		setIsSubmitting(true);
		let textResponse = input;
		try {
			for (let file of files) {
				const fileType = file.type;
				if (
					fileType.startsWith("text/") ||
					fileType === "application/pdf" ||
					fileType ===
						"application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
					fileType === "application/msword"
				) {
					const formData = new FormData();
					formData.append("text", file);
					const response = await fetch("/api/extract-text", {
						method: "POST",
						body: formData,
					});
					if (response.ok) {
						const output = await response.json();
						textResponse += `\n${output.text}`;
					}
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
				} else if (fileType.startsWith("link")) {
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
				} else {
					throw new Error("Unsupported file type");
				}
			}

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
				updateMindmapCount(true);
			} else {
				throw new Error("Failed to render mindmap");
			}
		} catch (error) {
			setError(error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const createMindmapDataURL = (format) => {
		const mindmapSVG = mindmapRef.current.innerHTML;
		let dataURL = "";
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

			if (format === "svg") {
				dataURL = canvas.toSVG();
			} else if (format === "png") {
				dataURL = canvas.toDataURL({
					format: "png",
					quality: 1,
				});
			}
		});

		return dataURL;
	};

	const handleExportMindmap = (format) => {
		const dataURL = createMindmapDataURL(format);
		const downloadLink = document.createElement("a");
		downloadLink.href = dataURL;
		downloadLink.download = `mindmap.${format}`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	};

	const handleSaveMindmap = async () => {
		try {
			const previewImageDataURL = createMindmapDataURL("png");

			const formData = new FormData();
			formData.append("mindmap", mindmap);
			formData.append("mindmapName", mindmapName);
			formData.append("previewImage", previewImageDataURL);

			const response = await fetch("/api/save-mindmap", {
				method: "POST",
				body: formData,
			});
			if (response.ok) {
				setShowDialog(false);
			} else {
				throw new Error("Failed to save mindmap");
			}
		} catch (error) {
			setError(error.message);
		}
	};

	const handleRestart = () => {
		setMindmap(null);
		setInput("");
		setFiles([]);
		setShowAttachmentOptions(false);
	};

	const handleError = () => {
		setError(null);
	};

	const handleFeedbackSubmit = async (feedbackText) => {
		try {
			const response = await fetch("/api/update-feedback", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					columnName: "Create",
					feedback: feedbackText,
				}),
			});

			if (response.ok) {
				setShowFeedbackForm(false);
				setFeedback(true);
				router.push(navigate);
			} else {
				throw new Error("Failed to submit feedback");
			}
		} catch (error) {
			setError(error.message);
		}
	};

	const handleFeedbackCancel = () => {
		setShowFeedbackForm(false);
	};

	const handleNavigate = (e) => {
		if (feedback === false) {
			e.preventDefault();
			setShowFeedbackForm(true);
			setNavigate(e.target.href);
		}
	};

	const words = ["audio.", "video.", "pdfs.", "images."];

	// Return a loading state while the session status is loading
	if (status === "loading") {
		return (
			<div className="bg-paleRose dark:bg-lividBrown flex justify-center items-center h-screen">
				<div className="bg-paleRose flex justify-center items-center h-screen">
					<div className="text-center">
						<h1 className="text-8xl font-bold mb-4 text-green-600">
							Loading...
						</h1>
						<p className="text-lg">Please wait</p>
					</div>
				</div>
			</div>
		);
	}

	if (status === "authenticated") {
		return (
			<Fragment>
				{/* Desktop Content */}
				<div className="xs:hidden md:flex h-screen w-screen bg-paleRose dark:bg-lividBrown">
					{/* Sidebar */}
					<div className="w-1/6 h-screen flex flex-col justify-between border-double border-r-4 border-tickleMePink">
						<div className="w-full">
							<div className="p-4 text-center">
								<Image
									src={
										resolvedTheme === "light"
											? "/images/logofull.svg"
											: "/images/mindsynclogodarkmode.svg"
									}
									width={300}
									height={100}
									alt="Logo"
								/>
							</div>
							<div className="p-4 text-center flex flex-col justify-center items-center gap-y-10 mt-10 w-full">
								<button
									className="secondary-btn flex flex-row gap-4 w-5/6 justify-center bg-stilleto dark:bg-paleRose dark:text-stilleto hover:bg-tickleMePink"
									style={{
										boxShadow:
											"0 4px 4px -2px rgba(0,0,0,0.3)",
									}}
								>
									<Image
										src={
											resolvedTheme === "light"
												? "/images/createicon.svg"
												: "/images/createicondark.svg"
										}
										width={20}
										height={20}
										alt="Logo"
									/>
									<Link
										href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dashboard`}
									>
										Create
									</Link>
								</button>
								<button
									className="secondary-btn flex flex-row gap-4 w-5/6 justify-center bg-stilleto dark:bg-paleRose dark:text-stilleto hover:bg-tickleMePink"
									style={{
										boxShadow:
											"0 4px 4px -2px rgba(0,0,0,0.3)",
									}}
								>
									<Image
										src={
											resolvedTheme === "light"
												? "/images/savedicon.svg"
												: "/images/savedicondark.svg"
										}
										width={20}
										height={20}
										alt="Logo"
									/>
									<Link
										href={`${process.env.NEXT_PUBLIC_BASE_PATH}/saved`}
										onClick={handleNavigate}
									>
										Saved
									</Link>
								</button>
							</div>
						</div>
						<div className="p-4 flex flex-row justify-center items-center gap-5 text-center text-xl font-inter font-bold text-tawnyPort">
							<Image
								src={
									resolvedTheme === "light"
										? "/images/usericon.svg"
										: "/images/usericondark.svg"
								}
								width={30}
								height={30}
								alt="Logo"
							/>
							<Link
								href={`${process.env.NEXT_PUBLIC_BASE_PATH}/profile`}
								onClick={handleNavigate}
								className="text-tawnyPort dark:text-paleRose"
							>
								{user ? user.username : "User"}
							</Link>
						</div>
					</div>
					{/* Main Content */}
					<div className="flex w-5/6 flex-col justify-center items-center p-4 relative overflow-y-scroll">
						<div className="absolute top-5 right-20">
							<SignoutButton />
						</div>
						<div className="flex flex-col justify-center items-center">
							<h1 className="primary-text dark:text-paleRose font-lora font-normal">
								Create Mindmap
							</h1>
							<h2 className="secondary-text mt-5 mb-2 font-semibold">
								Start with
								<FlipWords words={words} />
							</h2>

							{mindmap ? (
								<div className="mt-6">
									<h2 className="secondary-text dark:text-paleRose mt-2 mb-2 font-semibold text-center">
										Here's your mindmap
									</h2>
									<pre
										ref={!isMobile ? mindmapRef : null}
										className="mermaid mindmap"
									>
										{mindmap}
									</pre>
									<div className="flex justify-center gap-2 mt-8">
										<div className="relative">
											<button
												className="inline-flex h-12 w-[120px] animate-shimmer items-center justify-center rounded-md border border-tickleMePink bg-[linear-gradient(110deg,#8A2846,45%,#B9375E,55%,#522E38)] bg-[length:200%_100%] px-6 font-medium text-paleRose transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
												onClick={() =>
													setShowExportDropdown(
														!showExportDropdown
													)
												}
											>
												Export
											</button>
											{showExportDropdown && (
												<div className="absolute -left-8 flex flex-col justify-center items-center gap-y-2 mt-2">
													<button
														onClick={() =>
															handleExportMindmap(
																"svg"
															)
														}
														className="text-white border-2 border-white flex justify-center items-center bg-gray-500 rounded-xl p-2 w-[140px]"
													>
														Export as SVG
													</button>
													<button
														onClick={() =>
															handleExportMindmap(
																"png"
															)
														}
														className="text-white border-2 border-white flex justify-center items-center bg-gray-500 rounded-xl p-2 w-[140px]"
													>
														Export as PNG
													</button>
												</div>
											)}
										</div>
										<button
											onClick={() => setShowDialog(true)}
											className="relative inline-flex overflow-hidden rounded-lg h-12 w-[120px] p-[2px] hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
										>
											<span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8A2846_0%,#FFE0E9_50%,#FF7AA2_100%)]" />
											<span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-stilleto px-3 py-1 text-xl font-medium text-paleRose backdrop-blur-3xl">
												Save
											</span>
										</button>
										<button
											onClick={handleRestart}
											className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-tickleMePink bg-[linear-gradient(110deg,#8A2846,45%,#B9375E,55%,#522E38)] bg-[length:200%_100%] px-6 font-medium text-paleRose transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
										>
											Restart
										</button>
										{showDialog && (
											<div className="z-50 fixed inset-0 flex justify-center items-center">
												<div className="absolute inset-0 bg-black opacity-50"></div>
												<div className="relative my-auto mx-auto flex justify-center items-center border-2 border-tickleMePink w-[480px] h-[280px] bg-lividBrown rounded-xl">
													<div className="w-full p-4">
														<h2 className="secondary-text mb-4">
															Enter Mindmap Name:
														</h2>
														<input
															type="text"
															value={mindmapName}
															onChange={(e) =>
																setMindmapName(
																	e.target
																		.value
																)
															}
															placeholder="My Mindmap"
															className="p-2 border-2 w-full border-tickleMePink bg-lividBrown rounded-xl"
														/>
														<div className="flex flex-row justify-center items-center mt-5 gap-4">
															<button
																onClick={
																	handleSaveMindmap
																}
																className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-tickleMePink bg-[linear-gradient(110deg,#8A2846,45%,#B9375E,55%,#522E38)] bg-[length:200%_100%] px-6 font-medium text-paleRose transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
															>
																Save
															</button>
															<button
																onClick={() =>
																	setShowDialog(
																		false
																	)
																}
																className="primary-btn h-12 bg-slate-400"
															>
																Cancel
															</button>
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								</div>
							) : (
								<div className="mt-5">
									<div className="flex flex-row justify-center items-center gap-5">
										<div className="w-full relative">
											{showAttachmentOptions && (
												<div className="absolute -left-36 -top-16 gap-y-2 flex flex-col justify-center items-center">
													<button
														onClick={() =>
															triggerFileInput(
																".txt,.doc,.docx,.pdf"
															)
														}
														className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
													>
														<Image
															src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/texticon.svg`}
															width={20}
															height={20}
															alt="Saved"
															className="py-1"
														/>
														Text
													</button>
													<button
														onClick={() =>
															triggerFileInput(
																"audio/*"
															)
														}
														className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
													>
														<Image
															src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/audioicon.svg`}
															width={20}
															height={20}
															alt="Saved"
															className="py-1"
														/>
														Audio
													</button>
													<button
														onClick={() =>
															setShowVideoDialog(
																true
															)
														}
														className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
													>
														<Image
															src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/videoicon.svg`}
															width={20}
															height={20}
															alt="Saved"
															className="py-1"
														/>
														Video
													</button>
													<button
														onClick={() =>
															triggerFileInput(
																"image/*"
															)
														}
														className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
													>
														<Image
															src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/imageicon.svg`}
															width={20}
															height={20}
															alt="Saved"
															className="py-1"
														/>
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
												<Image
													src={`/images/${
														resolvedTheme ===
														"light"
															? "attachicon"
															: "attachicondark"
													}.svg`}
													width={30}
													height={30}
													alt="Attachment"
													className="absolute left-4 top-[12px]"
												/>
											</button>
											<textarea
												value={input}
												onChange={(e) =>
													setInput(e.target.value)
												}
												placeholder="Type or speak your thoughts here..."
												className="input w-[600px] h-[60px] px-3 py-4 pl-14 text-tawnyPort dark:text-paleRose text-md min-h-[60px]"
											/>
											<button
												onClick={() =>
													handleToggleRecording()
												}
												className={`bg-transparent absolute right-5 top-[10px] ${
													isRecording
														? "animate-pulse"
														: ""
												}`}
											>
												{isRecording ? (
													<Image
														src={`/images/${
															resolvedTheme ===
															"light"
																? "micoff"
																: "micoffdark"
														}.svg`}
														width={27}
														height={27}
														alt="Recording"
													/>
												) : (
													<Image
														src={`/images/${
															resolvedTheme ===
															"light"
																? "micicon"
																: "micicondark"
														}.svg`}
														width={27}
														height={27}
														alt="Recording"
													/>
												)}
											</button>
										</div>
										<input
											id="fileInput"
											type="file"
											multiple
											onChange={handleFileChange}
											style={{ display: "none" }}
										/>
									</div>
									<div className="mt-2 w-full flex flex-row justify-start items-start gap-2 flex-wrap">
										{files.map((file, index) => (
											<FileDisplay
												key={index}
												file={file}
												removeFile={() =>
													removeFile(index)
												}
											/>
										))}
									</div>
									<div className="w-full flex justify-center items-center mt-6">
										<button
											onClick={handleCreate}
											className="relative inline-flex overflow-hidden rounded-lg h-12 p-[2px] hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
										>
											<span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8A2846_0%,#FFE0E9_50%,#FF7AA2_100%)]" />
											<span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-stilleto px-3 py-1 text-xl font-medium text-paleRose backdrop-blur-3xl">
												{isSubmitting
													? "Processing..."
													: "Create"}
											</span>
										</button>
									</div>
									{/* Video Dialog */}
									{showVideoDialog && (
										<div
											className="fixed w-screen h-screen inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
											style={{
												top: "50%",
												left: "50%",
												transform:
													"translate(-50%, -50%)",
											}}
										>
											<div
												className="mt-2 flex flex-col h-[280px] w-[480px] justify-center items-center bg-paleRose dark:bg-lividBrown rounded-xl border-2 border-tickleMePink p-2"
												style={{ zIndex: "9999999" }}
											>
												<div className="w-full p-4 flex flex-col">
													<h2 className="secondary-text text-center mb-4">
														Select Video Input
													</h2>
													<div>
														<input
															type="radio"
															name="videoLinkInputType"
															value="link"
															checked={
																videoLinkInput.type ===
																"link"
															}
															onChange={() =>
																setVideoInput({
																	type: "link",
																	name: "",
																})
															}
															className="ml-6 mb-4"
														/>
														<label
															htmlFor="videoLink"
															className="ml-2 font-inter text-lg"
														>
															YouTube Link
														</label>
													</div>
													<div>
														<input
															type="radio"
															name="videoLinkInputType"
															value="file"
															checked={
																videoLinkInput.type ===
																"file"
															}
															onChange={() =>
																setVideoInput({
																	type: "file",
																	value: "",
																})
															}
															className="ml-6 mb-4"
														/>
														<label
															htmlFor="videoFile"
															className="ml-2 font-inter text-lg"
														>
															Video File
														</label>
													</div>
													{videoLinkInput.type ===
														"link" && (
														<input
															type="text"
															value={
																videoLinkInput.value
															}
															onChange={
																handleVideoLinkInput
															}
															placeholder="Enter YouTube Link"
															className="border-2 border-tickleMePink dark:bg-lividBrown bg-paleRose rounded-xl p-2 mt-2"
														/>
													)}
													{videoLinkInput.type ===
														"file" && (
														<input
															type="file"
															accept="video/*"
															onChange={
																handleFileChange
															}
															className="border-2 border-black rounded-xl p-2 mt-2"
														/>
													)}
													<div className="flex flex-row items-center justify-center mt-3 gap-4">
														<button
															onClick={() =>
																setShowVideoDialog(
																	false
																)
															}
															className="primary-btn bg-slate-400 h-12"
														>
															Cancel
														</button>
														<button
															onClick={() => {
																setShowVideoDialog(
																	false
																);
																if (
																	videoLinkInput.value !=
																	""
																) {
																	setFiles(
																		(
																			prevFiles
																		) => [
																			...prevFiles,
																			videoLinkInput,
																		]
																	);
																}
															}}
															className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-tickleMePink bg-[linear-gradient(110deg,#8A2846,45%,#B9375E,55%,#522E38)] bg-[length:200%_100%] px-6 font-medium text-paleRose transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
														>
															Select
														</button>
													</div>
												</div>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
						{error && (
							<ErrorDisplay
								errorMessage={error}
								handleError={handleError}
							/>
						)}
						{showFeedbackForm && (
							<FeedbackForm
								handleFeedbackCancel={handleFeedbackCancel}
								handleFeedbackSubmit={handleFeedbackSubmit}
							/>
						)}
					</div>
				</div>
				{/* Mobile Content */}
				<div className="xs:flex md:hidden h-screen w-screen bg-paleRose dark:bg-lividBrown">
					<div id="container" className="w-screen h-screen px-2">
						<div className="flex w-full h-full flex-col justify-center items-center relative overflow-y-scroll">
							<div className="absolute top-5 right-20">
								<SignoutButton />
							</div>
							<div className="flex flex-col w-full justify-center items-center">
								<h1 className="primary-text dark:text-paleRose font-lora font-normal">
									Create Mindmap
								</h1>
								<h2 className="secondary-text mt-5 mb-2 font-semibold">
									Start with <FlipWords words={words} />
								</h2>

								{mindmap ? (
									<div className="mt-6">
										<h2 className="secondary-text dark:text-paleRose mt-2 mb-2 font-semibold text-center">
											Here's your mindmap
										</h2>
										<pre
											ref={isMobile ? mindmapRef : null}
											className="mermaid mindmap md:hidden"
										>
											{mindmap}
										</pre>
										<div className="flex justify-center gap-2 mt-8">
											<div className="relative">
												<button
													className="text-white border-2 border-white flex justify-center items-center bg-gray-400 rounded-xl p-2 w-[120px]"
													onClick={() =>
														setShowExportDropdown(
															!showExportDropdown
														)
													}
												>
													Export
												</button>
												{showExportDropdown && (
													<div className="absolute -left-2 flex flex-col justify-center items-center gap-y-2 mt-2">
														<button
															onClick={() =>
																handleExportMindmap(
																	"svg"
																)
															}
															className="text-white border-2 border-white flex justify-center items-center bg-gray-500 rounded-xl p-2 w-[140px]"
														>
															Export as SVG
														</button>
														<button
															onClick={() =>
																handleExportMindmap(
																	"png"
																)
															}
															className="text-white border-2 border-white flex justify-center items-center bg-gray-500 rounded-xl p-2 w-[140px]"
														>
															Export as PNG
														</button>
													</div>
												)}
											</div>
											<button
												onClick={() =>
													setShowDialog(true)
												}
												className="text-white border-2 border-white flex justify-center items-center bg-gray-400 rounded-xl p-2 w-[120px]"
											>
												Save
											</button>
											<button
												onClick={handleRestart}
												className="text-white border-2 border-white flex justify-center items-center bg-gray-400 rounded-xl p-2 w-[120px]"
											>
												Restart
											</button>
											{showDialog && (
												<div className="z-50 fixed inset-0 flex justify-center items-center">
													<div className="absolute inset-0 bg-gray-900 opacity-50"></div>
													<div className="relative my-auto mx-auto flex justify-center items-center border-2 border-black w-2/3 h-1/4 bg-white rounded-xl">
														<div className="w-full p-4">
															<h2 className="secondary-text mb-2">
																Enter Mindmap
																Name:
															</h2>
															<input
																type="text"
																value={
																	mindmapName
																}
																onChange={(e) =>
																	setMindmapName(
																		e.target
																			.value
																	)
																}
																placeholder="My Mindmap"
																className="input w-full px-2"
															/>
															<div className="flex flex-row justify-center items-center mt-5 gap-4">
																<button
																	onClick={
																		handleSaveMindmap
																	}
																	className="primary-btn"
																>
																	Save
																</button>
																<button
																	onClick={() =>
																		setShowDialog(
																			false
																		)
																	}
																	className="primary-btn"
																>
																	Cancel
																</button>
															</div>
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								) : (
									<div className="mt-5 w-full max-w-screen">
										<div className="flex flex-row justify-center items-center gap-5 w-full">
											<div className="w-full relative">
												{showAttachmentOptions && (
													<div className="absolute left-0 top-20 gap-y-2 flex flex-col justify-center items-center">
														<button
															onClick={() =>
																triggerFileInput(
																	".txt,.doc,.docx,.pdf"
																)
															}
															className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
														>
															<Image
																src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/texticon.svg`}
																width={20}
																height={20}
																alt="Saved"
																className="py-1"
															/>
															Text
														</button>
														<button
															onClick={() =>
																triggerFileInput(
																	"audio/*"
																)
															}
															className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
														>
															<Image
																src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/audioicon.svg`}
																width={20}
																height={20}
																alt="Saved"
																className="py-1"
															/>
															Audio
														</button>
														<button
															onClick={() =>
																setShowVideoDialog(
																	true
																)
															}
															className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
														>
															<Image
																src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/videoicon.svg`}
																width={20}
																height={20}
																alt="Saved"
																className="py-1"
															/>
															Video
														</button>
														<button
															onClick={() =>
																triggerFileInput(
																	"image/*"
																)
															}
															className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
														>
															<Image
																src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/imageicon.svg`}
																width={20}
																height={20}
																alt="Saved"
																className="py-1"
															/>
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
													<Image
														src={`/images/${
															resolvedTheme ===
															"light"
																? "attachicon"
																: "attachicondark"
														}.svg`}
														width={30}
														height={30}
														alt="Attachment"
														className="absolute left-4 top-[12px]"
													/>
												</button>
												<textarea
													value={input}
													onChange={(e) =>
														setInput(e.target.value)
													}
													placeholder="Type or speak your thoughts here..."
													className="input rounded-xl w-full h-[60px] px-3 py-4 pl-14 text-tawnyPort dark:text-paleRose text-md min-h-[60px]"
												/>
												<button
													onClick={() =>
														handleToggleRecording()
													}
													className={`bg-transparent absolute right-5 top-[10px] ${
														isRecording
															? "animate-pulse"
															: ""
													}`}
												>
													{isRecording ? (
														<Image
															src={`/images/${
																resolvedTheme ===
																"light"
																	? "micoff"
																	: "micoffdark"
															}.svg`}
															width={27}
															height={27}
															alt="Recording"
														/>
													) : (
														<Image
															src={`/images/${
																resolvedTheme ===
																"light"
																	? "micicon"
																	: "micicondark"
															}.svg`}
															width={27}
															height={27}
															alt="Recording"
														/>
													)}
												</button>
											</div>
											<input
												id="fileInput"
												type="file"
												multiple
												onChange={handleFileChange}
												style={{ display: "none" }}
											/>
										</div>
										<div className="mt-2 w-full flex flex-row justify-start items-start gap-2 flex-wrap">
											{files.map((file, index) => (
												<FileDisplay
													key={index}
													file={file}
													removeFile={() =>
														removeFile(index)
													}
												/>
											))}
										</div>
										<div className="w-full flex justify-center items-center mt-6">
											<button
												onClick={handleCreate}
												className="relative inline-flex overflow-hidden rounded-lg h-12 p-[2px] hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
											>
												<span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8A2846_0%,#FFE0E9_50%,#FF7AA2_100%)]" />
												<span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-stilleto px-3 py-1 text-xl font-medium text-paleRose backdrop-blur-3xl">
													Create
												</span>
											</button>
										</div>
										{/* Video Dialog */}
										{showVideoDialog && (
											<div className="fixed w-screen h-screen inset-0 flex items-center justify-center bg-black bg-opacity-50">
												<div className="absolute inset-0 bg-gray-900 opacity-50"></div>
												<div className="relative my-auto mx-auto flex justify-center items-center border-2 border-black w-5/6 h-1/4 bg-white rounded-xl">
													<div className="w-full p-4 flex flex-col">
														<h2 className="secondary-text text-center">
															Select Video Input
														</h2>
														<div>
															<input
																type="radio"
																name="videoLinkInputType"
																value="link"
																checked={
																	videoLinkInput.type ===
																	"link"
																}
																onChange={() =>
																	setVideoInput(
																		{
																			type: "link",
																			name: "",
																		}
																	)
																}
																className="ml-6"
															/>
															<label
																htmlFor="videoLink"
																className="ml-2 text-black font-inter"
															>
																YouTube Link
															</label>
														</div>
														<div>
															<input
																type="radio"
																name="videoLinkInputType"
																value="file"
																checked={
																	videoLinkInput.type ===
																	"file"
																}
																onChange={() =>
																	setVideoInput(
																		{
																			type: "file",
																			value: "",
																		}
																	)
																}
																className="ml-6"
															/>
															<label
																htmlFor="videoFile"
																className="ml-2 text-black font-inter"
															>
																Video File
															</label>
														</div>
														{videoLinkInput.type ===
															"link" && (
															<input
																type="text"
																value={
																	videoLinkInput.value
																}
																onChange={
																	handleVideoLinkInput
																}
																placeholder="Enter YouTube Link"
																className="input w-full px-2 h-[40px] text-md"
															/>
														)}
														{videoLinkInput.type ===
															"file" && (
															<input
																type="file"
																accept="video/*"
																onChange={
																	handleFileChange
																}
																className="border-2 border-tickleMePink rounded-xl p-2 mt-2"
															/>
														)}
														<div className="flex flex-row items-center justify-center mt-2 gap-4">
															<button
																onClick={() =>
																	setShowVideoDialog(
																		false
																	)
																}
																className="primary-btn"
															>
																Cancel
															</button>
															<button
																onClick={() => {
																	setShowVideoDialog(
																		false
																	);
																	if (
																		videoLinkInput.value !=
																		""
																	) {
																		setFiles(
																			(
																				prevFiles
																			) => [
																				...prevFiles,
																				videoLinkInput,
																			]
																		);
																	}
																}}
																className="primary-btn"
															>
																Select
															</button>
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								)}
							</div>
							{error && (
								<ErrorDisplay
									errorMessage={error}
									handleError={handleError}
								/>
							)}

							{showFeedbackForm && (
								<FeedbackForm
									handleFeedbackCancel={handleFeedbackCancel}
									handleFeedbackSubmit={handleFeedbackSubmit}
								/>
							)}
						</div>
						<div className="fixed bottom-0 w-full flex flex-row gap-10 justify-center dark:bg-lividBrown bg-paleRose p-4 shadow-lg">
							<button className="h-12 w-12 rounded-full flex flex-col justify-center items-center">
								<Image
									src={`/images/${
										resolvedTheme === "light"
											? "homeicon"
											: "homeicondark"
									}.svg`}
									width={27}
									height={27}
									alt="Home"
								/>
								<span className="text-left text-secondary-text mt-2 block">
									Home
								</span>
							</button>
							<Link
								href={`${process.env.NEXT_PUBLIC_BASE_PATH}/dashboard`}
							>
								<button className="h-12 w-12 rounded-full flex flex-col justify-center items-center">
									<Image
										src={`/images/${
											resolvedTheme === "light"
												? "createicondark"
												: "createicon"
										}.svg`}
										width={27}
										height={27}
										alt="Create"
									/>
									<span className="text-center text-secondary-text mt-2 block">
										Create
									</span>
								</button>
							</Link>
							<Link
								href={`${process.env.NEXT_PUBLIC_BASE_PATH}/saved`}
								onClick={handleNavigate}
							>
								<button className="h-12 w-12 rounded-full flex flex-col justify-center items-center">
									<Image
										src={`/images/${
											resolvedTheme === "light"
												? "savedicondark"
												: "savedicon"
										}.svg`}
										width={25}
										height={25}
										alt="Saved"
									/>
									<span className="text-center text-secondary-text mt-2 block">
										Saved
									</span>
								</button>
							</Link>
							<Link
								href={`${process.env.NEXT_PUBLIC_BASE_PATH}/profile`}
								onClick={handleNavigate}
							>
								<button className="h-12 w-12 rounded-full flex flex-col justify-center items-center">
									<Image
										src={`/images/${
											resolvedTheme === "light"
												? "usericon"
												: "usericondark"
										}.svg`}
										width={27}
										height={27}
										alt="Profile"
									/>
									<span className="text-center text-secondary-text mt-2 block">
										Profile
									</span>
								</button>
							</Link>
						</div>
					</div>
				</div>
			</Fragment>
		);
	}
	return null;
};

export default Dashboard;

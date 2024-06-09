"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import SignoutButton from "@components/SignoutButton";
import mermaid from "mermaid";
import { fabric } from "fabric";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MonacoEditor from "react-monaco-editor";

const Edit = () => {
	const { id } = useParams();
	const [mindmapDetails, setMindmapDetails] = useState(null);
	const [mindmapCode, setMindmapCode] = useState("");
	const [mindmapName, setMindmapName] = useState("");
	const [mindmapText, setMindmapText] = useState("");
	const [showExportDropdown, setShowExportDropdown] = useState(false);
	const [error, setError] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const mindmapRef = useRef(null);
	const monacoEditorRef = useRef(null); // Reference for Monaco Editor
	const router = useRouter();
	const { data: session, status } = useSession();

	// Redirect unauthenticated users
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/unauthenticated");
		}
	}, [status, router]);

	// Fetch mindmap details when component mounts
	useEffect(() => {
		const fetchMindmapDetails = async () => {
			try {
				const response = await fetch(
					`/api/get-mindmap-details?id=${id}`
				);
				if (response.ok) {
					const data = await response.json();
					setMindmapDetails(data);
					const processedCode = data.code
						.replace(/\\n/g, "\n")
						.replace(/\"/g, "");
					setMindmapCode(processedCode);
					setMindmapName(data.name);
					setMindmapText(data.text);
				} else {
					throw new Error("Failed to fetch mindmap details");
				}
			} catch (error) {
				setError(error.message);
			}
		};

		fetchMindmapDetails();
	}, [id]);

	// Initialize mermaid
	useEffect(() => {
		mermaid.initialize({ startOnLoad: true });
	}, []);

	// Render mermaid code
	useEffect(() => {
		mermaid.run();
	}, [mindmapCode]);

	// Handle mindmap name change
	const handleMindmapNameChange = (e) => {
		setMindmapName(e.target.value);
	};

	// Handle Monaco Editor change
	const handleMonacoEditorChange = async (value) => {
		setMindmapCode(value);
	};

	// Create data URL for mindmap
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

	// Handle export mindmap
	const handleExportMindmap = (format) => {
		const dataURL = createMindmapDataURL(format);
		const downloadLink = document.createElement("a");
		downloadLink.href = dataURL;
		downloadLink.download = `mindmap.${format}`;
		document.body.appendChild(downloadLink);
		downloadLink.click();
		document.body.removeChild(downloadLink);
	};

	// Handle save mindmap
	const handleSaveMindmap = async () => {
		try {
			setIsSubmitting(true);
			const previewImageDataURL = createMindmapDataURL("png");

			// Convert the data URL to a Blob
			const dataURLResponse = await fetch(previewImageDataURL);
			const previewImageBlob = await dataURLResponse.blob();

			const formData = new FormData();
			formData.append("mindmapId", id);
			formData.append("mindmapCode", mindmapCode);
			formData.append("mindmapName", mindmapName);
			formData.append(
				"previewImage",
				previewImageBlob,
				"mindmap-preview.png"
			);

			const response = await fetch("/api/edit-mindmap", {
				method: "POST",
				body: formData,
			});
			if (response.ok) {
				setIsSubmitting(false);
				router.push("/saved");
			} else {
				throw new Error("Failed to save mindmap");
			}
		} catch (error) {
			console.error("Error:", error);
			setError(error.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Render loading state if data is being fetched
	if (status === "loading") {
		return (
			<div className="bg-paleRose flex justify-center items-center h-screen">
				<div role="status">
					<svg
						aria-hidden="true"
						class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-stilleto"
						viewBox="0 0 100 101"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
							fill="currentColor"
						/>
						<path
							d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
							fill="currentFill"
						/>
					</svg>
					<span class="sr-only">Loading...</span>
				</div>
				<div className="text-center">
					<h1 className="text-8xl font-bold mb-4 text-green-600">
						Loading...
					</h1>
					<p className="text-lg">Please wait</p>
				</div>
			</div>
		);
	}

	// Render error if there is one
	if (error) {
		return (
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
					<button onClick={() => setError(null)}>Close</button>
				</div>
			</div>
		);
	}

	// Render edit page if mindmap details are loaded
	if (mindmapDetails) {
		return (
			<div className="flex h-screen w-screen">
				<div className="w-1/6 h-screen bg-paleRose flex flex-col justify-between border-double border-r-4 border-tickleMePink">
					<div className="w-full">
						<div className="p-4 text-center">
							<Image
								src="/images/logofull.svg"
								width={300}
								height={100}
								alt="Logo"
							/>
						</div>
						<div className="p-4 text-center flex flex-col justify-center items-center gap-y-10 mt-10 w-full">
							<button
								className="secondary-btn flex flex-row gap-4 w-5/6 justify-center bg-stilleto"
								style={{
									boxShadow: "0 4px 4px -2px rgba(0,0,0,0.3)",
								}}
							>
								<Image
									src="/images/createicon.svg"
									width={20}
									height={20}
									alt="Create"
								/>
								<Link href="/dashboard">Create</Link>
							</button>
							<button
								className="secondary-btn flex flex-row gap-4 w-5/6 justify-center bg-stilleto"
								style={{
									boxShadow: "0 4px 4px -2px rgba(0,0,0,0.3)",
								}}
							>
								<Image
									src="/images/savedicon.svg"
									width={20}
									height={20}
									alt="Saved"
								/>
								<Link href="/saved">Saved</Link>
							</button>
						</div>
					</div>
					<div className="p-4 flex flex-row justify-center items-center gap-5 text-center text-xl font-inter font-bold text-tawnyPort">
						<Image
							src="/images/usericon.svg"
							width={30}
							height={30}
							alt="User"
						/>
						<p>{session.user.name}</p>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex w-5/6 flex-col justify-center items-center p-4 relative overflow-y-scroll">
					<div className="absolute top-5 right-20">
						<SignoutButton />
					</div>
					<div className="flex flex-col justify-center items-center">
						<div className="flex flex-row gap-2 mt-6">
							<div className="ml-20 w-1/2 p-4 border-2 border-black rounded-xl mr-4">
								<div className="mb-4">
									<label
										htmlFor="mindmapName"
										className="block text-lg font-medium text-gray-700"
									>
										Mindmap Name
									</label>
									<input
										type="text"
										id="mindmapName"
										value={mindmapName}
										onChange={handleMindmapNameChange}
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									/>
								</div>
								<label
									htmlFor="mindmapCode"
									className="block text-lg font-medium text-gray-700"
									>
									Mindmap Code
								</label>
								<MonacoEditor
									id="mindmapCode"
									height="500px"
									language="mermaid"
									value={mindmapCode}
									onChange={handleMonacoEditorChange}
									options={{
										readOnly: false, 
										lineNumbers: "on",
										fontSize: "14px",
										theme: "vs-dark",
										scrollBeyondLastLine: false,
										renderLineHighlight: "none",
										renderIndentGuides: true,
										automaticLayout: true,
										minimap: {
											enabled: true,
										},
										wordWrap: "on",
									}}
									editorDidMount={(editor) => {
										monacoEditorRef.current = editor;
									}}
								/>
							</div>
							<div className="mr-20 w-1/2 p-4 flex flex-col justify-between">
								<div className="border-2 border-black rounded-xl h-[90%]">
									<h2 className="secondary-text p-2 mb-2 font-semibold">
										Mindmap Preview
									</h2>
									<pre
										ref={mindmapRef}
										key={mindmapCode}
										className="mermaid mindmap"
									>
										{mindmapCode}
									</pre>
								</div>
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
										onClick={handleSaveMindmap}
										className="text-white border-2 border-white flex justify-center items-center bg-gray-400 rounded-xl p-2 w-[120px]"
									>
										{isSubmitting ? "Saving..." : "Save"}
									</button>
								</div>
							</div>
						</div>
					</div>
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
								<button onClick={() => setError(null)}>
									Close
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		);
	}

	// Render default state if mindmap details are not loaded yet
	return (
		<div className="p-4">
			<p>Loading mindmap details...</p>
		</div>
	);
};

export default Edit;
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import FileDisplay from "@components/FileDisplay";
import SignoutButton from "@components/SignoutButton";
import mermaid from "mermaid";
import { fabric } from "fabric";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MonacoEditor from "react-monaco-editor";
import { useTheme } from "next-themes";
import {
  TransformWrapper,
  TransformComponent,
  useControls,
} from "react-zoom-pan-pinch";
import useWindowSize from "@hooks/useWindowSize";
import ErrorDisplay from "@components/ErrorDisplay";

const Edit = () => {
  const windowSize = useWindowSize()
  const { id } = useParams();
  const [input, setInput] = useState("");
  const [files, setFiles] = useState([]);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [mindmapDetails, setMindmapDetails] = useState(null);
  const [mindmapCode, setMindmapCode] = useState("");
  const [mindmapName, setMindmapName] = useState("");
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [videoLinkInput, setVideoInput] = useState({
    type: "link", // or "file"
    name: "",
    value: "",
  });
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const mindmapRef = useRef(null);
  const monacoEditorRef = useRef(null); // Reference for Monaco Editor
  const router = useRouter();
  const { data: session, status } = useSession();
  const { resolvedTheme, setTheme } = useTheme();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const isMobile = windowSize.width <= 768;

  const Controls = () => {
    const { zoomIn, zoomOut, resetTransform } = useControls();

    return (
      <div className="tools ml-2 gap-x-2 flex flex-row">
        <button onClick={() => zoomIn()}>
          <Image
            src={`/images/${
              resolvedTheme === "light" ? "zoomin" : "zoomindark"
            }.svg`}
            width={27}
            height={27}
            alt="Zoom In"
          />
        </button>
        <button onClick={() => zoomOut()}>
          <Image
            src={`/images/${
              resolvedTheme === "light" ? "zoomout" : "zoomoutdark"
            }.svg`}
            width={27}
            height={27}
            alt="Zoom Out"
          />
        </button>
        <button onClick={() => resetTransform()}>
          <Image
            src={`/images/${
              resolvedTheme === "light"
                ? "resetTransform"
                : "resetTransformdark"
            }.svg`}
            width={27}
            height={27}
            alt="Reset Transform"
          />
        </button>
      </div>
    );
  };

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
        const response = await fetch(`/api/get-mindmap-details?id=${id}&sample=false`);
        if (response.ok) {
          const data = await response.json();
          setMindmapDetails(data);
          const processedCode = data.code
            .replace(/\\n/g, "\n")
            .replace(/\"/g, "");
          setMindmapCode(processedCode);
          setMindmapName(data.name);
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

  const handleEdit = async () => {
    setIsSubmitting(true);
    let instruction = input;
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
            instruction += `\n${output.text}`;
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
            instruction += `\n${output.text}`;
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
            instruction += `\n${output.text}`;
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
            instruction += `\n${output.text}`;
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
            instruction += `\n${output.text}`;
          }
        } else {
          throw new Error("Unsupported file type");
        }
      }

      const response = await fetch("/api/update-with-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ instruction, mindmapCode }),
      });

      if (response.ok) {
        const { mindmap } = await response.json();
        const processedCode = mindmap.replace(/\\n/g, "\n").replace(/\"/g, "");
        setMindmapCode(processedCode);
        setInput("");
      } else {
        throw new Error("Failed to update mindmap");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      const formData = new FormData();
      formData.append("mindmapId", id);
      formData.append("mindmapCode", mindmapCode);
      formData.append("mindmapName", mindmapName);
      formData.append("previewImage", previewImageDataURL);

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
            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-stilleto"
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
          <span className="sr-only">Loading...</span>
        </div>
        <div className="text-center">
          <h1 className="text-8xl font-bold mb-4 text-green-600">Loading...</h1>
          <p className="text-lg">Please wait</p>
        </div>
      </div>
    );
  }

  // Render edit page if mindmap details are loaded
  if (status === "authenticated" && mindmapDetails) {
    return (
		<div className="flex h-screen w-screen bg-paleRose dark:bg-lividBrown">
			<div className="xs:hidden w-full md:flex relative">
				<button
					style={{ zIndex: 51 }}
					onClick={() => setIsSidebarVisible(!isSidebarVisible)}
					className="absolute top-0 left-0 m-2"
				>
					<Image
						src={`/images/${
							resolvedTheme === "light"
								? "hamburger-light"
								: "hamburger-dark"
						}.svg`}
						width={30}
						height={30}
						alt="Toggle Sidebar"
					/>
				</button>
				{/* Sidebar */}
				{isSidebarVisible && (
					<>
						<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50"></div>
						<div
							className="w-1/6 fixed dark:bg-lividBrown bg-paleRose h-screen flex flex-col justify-between border-double border-r-4 border-tickleMePink"
							style={{ zIndex: 50 }}
						>
							<div className="w-full">
								<div className="p-4 text-center mt-10">
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
										className="secondary-btn flex flex-row gap-4 w-5/6 justify-center bg-stilleto dark:bg-paleRose dark:text-stilleto"
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
										<Link href="/dashboard">Create</Link>
									</button>
									<button
										className="secondary-btn flex flex-row gap-4 w-5/6 justify-center bg-stilleto dark:bg-paleRose dark:text-stilleto"
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
										<Link href="/saved">Saved</Link>
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
									href="/profile"
									className="text-tawnyPort dark:text-paleRose"
								>
									{user ? user.username : "User"}
								</Link>
							</div>
						</div>
					</>
				)}

				{/* Main Content */}
				<div className="w-full flex flex-col justify-center items-center p-4 relative overflow-y-scroll overflow-x-hidden">
					<div className="absolute top-5 right-20">
						<SignoutButton />
					</div>
					<div className="flex flex-col justify-center items-center">
						<div className="flex flex-row gap-2 mt-6">
							<div className="ml-20 w-1/2 p-4 border-2 border-stilleto dark:border-paleRose rounded-xl mr-4">
								<div className="mb-4">
									<label
										htmlFor="mindmapName"
										className="block secondary-text text-lg w-full p-1 mb-1 font-semibold dark:text-paleRose"
									>
										Mindmap Name
									</label>
									<input
										type="text"
										id="mindmapName"
										value={mindmapName}
										onChange={handleMindmapNameChange}
										className="input h-[50px] w-full dark:text-paleRose"
									/>
								</div>
								<label
									htmlFor="mindmapCode"
									className="block secondary-text text-lg dark:text-paleRose w-full font-semibold"
								>
									Edit With Code
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
								<span className="block secondary-text dark:text-paleRose text-sm font-bold text-center mt-2">
									or
								</span>
								<label
									htmlFor="editMessage"
									className="block secondary-text text-lg dark:text-paleRose w-full font-semibold"
								>
									Edit with Message
								</label>
								<div className="relative">
									{showAttachmentOptions && (
										<div className="absolute -left-24 -bottom-20 gap-y-2 gap-x-2 grid grid-cols-2">
											<button
												onClick={() =>
													triggerFileInput(
														".txt,.doc,.docx,.pdf"
													)
												}
												className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
											>
												<Image
													src="/images/texticon.svg"
													width={20}
													height={20}
													alt="Saved"
													className="py-1"
												/>
												Text
											</button>
											<button
												onClick={() =>
													triggerFileInput("audio/*")
												}
												className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
											>
												<Image
													src="/images/audioicon.svg"
													width={20}
													height={20}
													alt="Saved"
													className="py-1"
												/>
												Audio
											</button>
											<button
												onClick={() =>
													setShowVideoDialog(true)
												}
												className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
											>
												<Image
													src="/images/videoicon.svg"
													width={20}
													height={20}
													alt="Saved"
													className="py-1"
												/>
												Video
											</button>
											<button
												onClick={() =>
													triggerFileInput("image/*")
												}
												className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
											>
												<Image
													src="/images/imageicon.svg"
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
												resolvedTheme === "light"
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
										placeholder="Change/remove/add a node..."
										className="input w-[600px] h-[60px] px-3 py-4 pl-14 text-tawnyPort text-md mind-h-[60px]"
									/>
									<button
										onClick={() => handleToggleRecording()}
										className={`bg-transparent absolute right-5 top-[10px] ${
											isRecording ? "animate-pulse" : ""
										}`}
									>
										{isRecording ? (
											<Image
												src={`/images/${
													resolvedTheme === "light"
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
													resolvedTheme === "light"
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
								<div className="mt-2 w-full flex flex-row justify-start items-start gap-2 flex-wrap">
									{files.map((file, index) => (
										<FileDisplay
											key={index}
											file={file}
											removeFile={() => removeFile(index)}
										/>
									))}
								</div>
								<div className="w-full flex justify-center items-center mt-6">
									<button
										onClick={handleEdit}
										className="primary-btn dark:bg-paleRose dark:text-lividBrown text-xl"
									>
										{isSubmitting
											? "Processing..."
											: "Edit"}
									</button>
								</div>
								{/* Video Dialog */}
								{showVideoDialog && (
									<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
										<div className="dark:bg-lividBrown bg-paleRose md:w-1/4 xs:w-5/6 p-6 rounded-lg border-2 border-paleRose dark:border-stilleto shadow-lg">
											<h2 className="secondary-text text-center dark:text-paleRose font-normal text-2xl mb-2">
												Select Video Input
											</h2>
											<div className="mb-2">
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
													className="ml-6"
												/>
												<label
													htmlFor="videoLink"
													className="ml-2 secondary-text text-md dark:text-paleRose text-tawnyPort"
												>
													YouTube Link
												</label>
											</div>
											<div className="mb-2">
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
													className="ml-6"
												/>
												<label
													htmlFor="videoFile"
													className="ml-2 secondary-text text-md dark:text-paleRose text-tawnyPort"
												>
													Video File
												</label>
											</div>
											{videoLinkInput.type === "link" && (
												<input
													type="text"
													value={videoLinkInput.value}
													onChange={
														handleVideoLinkInput
													}
													placeholder="Enter YouTube Link"
													className="rounded-xl dark:bg-tawnyPort border-2 dark:border-paleRose dark:text-paleRose p-2 mt-2 w-full"
												/>
											)}
											{videoLinkInput.type === "file" && (
												<input
													type="file"
													accept="video/*"
													onChange={handleFileChange}
													className="dark:bg-tawnyPort w-full dark:text-paleRose border-2 dark:border-paleRose rounded-xl p-2 mt-2"
												/>
											)}
											<div className="flex flex-row items-center justify-center mt-4 gap-4">
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
																(prevFiles) => [
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
								)}
							</div>
							<div className="mr-20 w-1/2 p-4 flex flex-col justify-center items-center">
								<div className="border-2 border-stilleto dark:border-paleRose rounded-xl min-h-max py-4">
									<h2 className="secondary-text dark:text-paleRose text-center w-full p-2 mb-2 font-semibold border-b-2 border-stilleto dark:border-paleRose">
										Mindmap Preview
									</h2>
									<TransformWrapper
										initialScale={1}
										initialPositionX={200}
										initialPositionY={100}
									>
										{({
											zoomIn,
											zoomOut,
											resetTransform,
											...rest
										}) => (
											<>
												<Controls />
												<TransformComponent>
													<pre
														ref={
															!isMobile
																? mindmapRef
																: null
														}
														key={mindmapCode}
														className="mermaid mindmap"
													>
														{mindmapCode}
													</pre>
												</TransformComponent>
											</>
										)}
									</TransformWrapper>
								</div>
								<div className="flex justify-center gap-2 mt-8">
									<div className="relative">
										<button
											className="text-white font-inter border-2 border-white flex justify-center items-center bg-gray-400 rounded-xl p-2 w-[120px]"
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
										className="text-white border-2 font-inter flex justify-center items-center bg-stilleto rounded-xl p-2 w-[120px]"
									>
										{isSubmitting ? "Saving..." : "Save"}
									</button>
								</div>
							</div>
						</div>
					</div>
					{error && (
						<ErrorDisplay
							errorMessage={error}
							handleError={handleError}
						/>
					)}
				</div>
			</div>
			{/* Mobile Content */}
			<div className="xs:flex md:hidden">
				<div id="container" className="w-screen h-screen px-2">
					<div className="flex w-full h-full min-h-max mb-8 flex-col justify-center items-center relative overflow-y-scroll">
						<div className="absolute top-5 right-20">
							<SignoutButton />
						</div>
						<div className="mb-4 w-full">
							<input
								type="text"
								id="mindmapName"
								value={mindmapName}
								onChange={handleMindmapNameChange}
								className="input h-[50px] w-full dark:text-paleRose"
							/>
						</div>
						<div className="w-full h-2/4 flex flex-col justify-center items-center">
							<div className="h-full min-h-max w-full py-4">
								<TransformWrapper
									initialScale={1}
									initialPositionX={200}
									initialPositionY={100}
									minScale={2}
									maxScale={8}
									limitToBounds={false}
									centerOnInit={true}
								>
									{({
										zoomIn,
										zoomOut,
										resetTransform,
										...rest
									}) => (
										<>
											<Controls />
											<TransformComponent
												wrapperStyle={{
													height: "100%",
													width: "100%",
												}}
												contentStyle={{
													height: "100%",
													width: "100%",
												}}
											>
												<div
													style={{
														width: "100%",
														height: "100%",
														transformOrigin:
															"center center",
													}}
												>
													<pre
														ref={
															isMobile
																? mindmapRef
																: null
														}
														key={mindmapCode}
														className="mermaid mindmap w-full h-full"
													>
														{mindmapCode}
													</pre>
												</div>
											</TransformComponent>
										</>
									)}
								</TransformWrapper>
							</div>
						</div>
						{/* Edit with Message */}
						<div className="w-full">
							<label
								htmlFor="editMessage"
								className="block secondary-text text-lg dark:text-paleRose w-full font-semibold"
							>
								Edit with Message
							</label>
							<div className="relative w-full">
								{showAttachmentOptions && (
									<div className="absolute -left-0 -bottom-20 gap-y-2 gap-x-2 grid grid-cols-2">
										<button
											onClick={() =>
												triggerFileInput(
													".txt,.doc,.docx,.pdf"
												)
											}
											className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
										>
											<Image
												src="/images/texticon.svg"
												width={20}
												height={20}
												alt="Saved"
												className="py-1"
											/>
											Text
										</button>
										<button
											onClick={() =>
												triggerFileInput("audio/*")
											}
											className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
										>
											<Image
												src="/images/audioicon.svg"
												width={20}
												height={20}
												alt="Saved"
												className="py-1"
											/>
											Audio
										</button>
										<button
											onClick={() =>
												setShowVideoDialog(true)
											}
											className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
										>
											<Image
												src="/images/videoicon.svg"
												width={20}
												height={20}
												alt="Saved"
												className="py-1"
											/>
											Video
										</button>
										<button
											onClick={() =>
												triggerFileInput("image/*")
											}
											className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
										>
											<Image
												src="/images/imageicon.svg"
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
											resolvedTheme === "light"
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
									onChange={(e) => setInput(e.target.value)}
									placeholder="Change/remove/add a node..."
									className="input w-full h-[60px] px-3 py-4 pl-14 dark:text-paleRose text-tawnyPort text-md mind-h-[60px]"
								/>
								<button
									onClick={() => handleToggleRecording()}
									className={`bg-transparent absolute right-5 top-[10px] ${
										isRecording ? "animate-pulse" : ""
									}`}
								>
									{isRecording ? (
										<Image
											src={`/images/${
												resolvedTheme === "light"
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
												resolvedTheme === "light"
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
							<div className="mt-2 w-full flex flex-row justify-start items-start gap-2 flex-wrap">
								{files.map((file, index) => (
									<FileDisplay
										key={index}
										file={file}
										removeFile={() => removeFile(index)}
									/>
								))}
							</div>
							<div className="w-full flex justify-center items-center mt-3">
								<button
									onClick={handleEdit}
									className="primary-btn dark:bg-paleRose dark:text-lividBrown text-xl"
								>
									{isSubmitting ? "Processing..." : "Edit"}
								</button>
							</div>
							{/* Video Dialog */}
							{showVideoDialog && (
								<div className="absolute inset-0 flex justify-center items-center gap-y-2 border-2 border-black w-1/4 h-1/4 bg-white rounded-xl left-[620px] top-[360px]">
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
													setVideoInput({
														type: "link",
														name: "",
													})
												}
												className="ml-6"
											/>
											<label
												htmlFor="videoLink"
												className="ml-2"
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
												className="ml-6"
											/>
											<label
												htmlFor="videoFile"
												className="ml-2"
											>
												Video File
											</label>
										</div>
										{videoLinkInput.type === "link" && (
											<input
												type="text"
												value={videoLinkInput.value}
												onChange={handleVideoLinkInput}
												placeholder="Enter YouTube Link"
												className="border-2 border-black rounded-xl p-2 mt-2"
											/>
										)}
										{videoLinkInput.type === "file" && (
											<input
												type="file"
												accept="video/*"
												onChange={handleFileChange}
												className="border-2 border-black rounded-xl p-2 mt-2"
											/>
										)}
										<div className="flex flex-row items-center justify-center mt-2 gap-4">
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
													setShowVideoDialog(false);
													if (
														videoLinkInput.value !=
														""
													) {
														setFiles(
															(prevFiles) => [
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
							)}
						</div>
						<div className="flex justify-center gap-2 mt-2">
							<div className="relative">
								<button
									className="text-white font-inter border-2 border-white flex justify-center items-center bg-gray-400 rounded-xl p-2 w-[120px]"
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
												handleExportMindmap("svg")
											}
											className="text-white border-2 border-white flex justify-center items-center bg-gray-500 rounded-xl p-2 w-[140px]"
										>
											Export as SVG
										</button>
										<button
											onClick={() =>
												handleExportMindmap("png")
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
								className="text-white border-2 font-inter flex justify-center items-center bg-stilleto rounded-xl p-2 w-[120px]"
							>
								{isSubmitting ? "Saving..." : "Save"}
							</button>
						</div>
						{error && (
							<ErrorDisplay
								errorMessage={error}
								handleError={handleError}
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
						<Link href="/dashboard">
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
						<Link href="/saved">
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
						<Link href="/profile">
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
		</div>
	);
  }

  // Render default state if mindmap details are not loaded yet
  return (
    <div className="bg-paleRose flex justify-center items-center h-screen">
      <div className="bg-paleRose flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-8xl font-bold mb-4 text-green-600">Loading...</h1>
          <p className="text-lg">Please wait</p>
        </div>
      </div>
    </div>
  );
};

export default Edit;

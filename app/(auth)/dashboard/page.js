"use client";

import SignoutButton from "@components/SignoutButton";
import FileDisplay from "@components/FileDisplay";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import mermaid from "mermaid";
import { fabric } from "fabric"; // Import the fabric.js library for canvas manipulation
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    value: "",
  });
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/unauthenticated");
    }
  }, [status, router]); // Ensure this effect runs when the status changes

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

  const handleConvert = async () => {
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
      // Convert the data URL to a Blob
      const dataURLResponse = await fetch(previewImageDataURL);
      const previewImageBlob = await dataURLResponse.blob();

      const formData = new FormData();
      formData.append("mindmap", JSON.stringify(mindmap));
      formData.append("mindmapName", mindmapName);
      formData.append("previewImage", previewImageBlob, "mindmap-preview.png");

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
      console.error("Error:", error);
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

  // Return a loading state while the session status is loading
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
          <h1 className="text-8xl font-bold mb-4 text-green-600">Loading...</h1>
          <p className="text-lg">Please wait</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return (
      <div className="flex h-screen w-screen">
        {/* Sidebar */}
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
            <h1 className="primary-text font-lora font-normal">
              Create Mindmap
            </h1>
            <h2 className="secondary-text mt-5 mb-2 font-semibold">
              Sync your thoughts to mindmaps in seconds
            </h2>

            {mindmap ? (
              <div className="mt-6">
                <h2 className="secondary-text mt-2 mb-2 font-semibold text-center">
                  Here's your mindmap
                </h2>
                <pre ref={mindmapRef} className="mermaid mindmap">
                  {mindmap}
                </pre>
                <div className="flex justify-center gap-2 mt-8">
                  <div className="relative">
                    <button
                      className="text-white border-2 border-white flex justify-center items-center bg-gray-400 rounded-xl p-2 w-[120px]"
                      onClick={() => setShowExportDropdown(!showExportDropdown)}
                    >
                      Export
                    </button>
                    {showExportDropdown && (
                      <div className="absolute -left-8 flex flex-col justify-center items-center gap-y-2 mt-2">
                        <button
                          onClick={() => handleExportMindmap("svg")}
                          className="text-white border-2 border-white flex justify-center items-center bg-gray-500 rounded-xl p-2 w-[140px]"
                        >
                          Export as SVG
                        </button>
                        <button
                          onClick={() => handleExportMindmap("png")}
                          className="text-white border-2 border-white flex justify-center items-center bg-gray-500 rounded-xl p-2 w-[140px]"
                        >
                          Export as PNG
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDialog(true)}
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
                    <div className="absolute inset-0 flex justify-center items-center gap-y-2 border-2 border-black w-1/4 h-1/4 bg-white rounded-xl left-[620px] top-[360px]">
                      <div className="w-full p-4">
                        <h2 className="secondary-text mb-2">
                          Enter Mindmap Name:
                        </h2>
                        <input
                          type="text"
                          value={mindmapName}
                          onChange={(e) => setMindmapName(e.target.value)}
                          placeholder="My Mindmap"
                          className="p-2 border-2 w-full border-black rounded-xl"
                        />
                        <div className="flex flex-row justify-center items-center mt-5 gap-4">
                          <button
                            onClick={handleSaveMindmap}
                            className="primary-btn"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setShowDialog(false)}
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
              <div className="mt-5">
                <div className="flex flex-row justify-center items-center gap-5">
                  <div className="w-full relative">
                    {showAttachmentOptions && (
                      <div className="absolute -left-36 -top-16 gap-y-2 flex flex-col justify-center items-center">
                        <button
                          onClick={() =>
                            triggerFileInput(".txt,.doc,.docx,.pdf")
                          }
                          className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
                        >
                          <Image
                            src="/images/savedicon.svg"
                            width={20}
                            height={20}
                            alt="Saved"
                            className="py-1"
                          />
                          Text
                        </button>
                        <button
                          onClick={() => triggerFileInput("audio/*")}
                          className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
                        >
                          <Image
                            src="/images/savedicon.svg"
                            width={20}
                            height={20}
                            alt="Saved"
                            className="py-1"
                          />
                          Audio
                        </button>
                        <button
                          onClick={() => setShowVideoDialog(true)}
                          className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
                        >
                          <Image
                            src="/images/savedicon.svg"
                            width={20}
                            height={20}
                            alt="Saved"
                            className="py-1"
                          />
                          Video
                        </button>
                        <button
                          onClick={() => triggerFileInput("image/*")}
                          className="bg-tickleMePink px-6 py-2 rounded-xl text-white font-inter text-xl flex flex-row gap-2 w-[134px]"
                        >
                          <Image
                            src="/images/savedicon.svg"
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
                        setShowAttachmentOptions(!showAttachmentOptions)
                      }
                    >
                      <Image
                        src="/images/attachicon.svg"
                        width={30}
                        height={30}
                        alt="Attachment"
                        className="absolute left-4 top-[12px]"
                      />
                    </button>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type or speak your thoughts here..."
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
                          src="/images/micoff.svg"
                          width={27}
                          height={27}
                          alt="Recording"
                        />
                      ) : (
                        <Image
                          src="/images/micicon.svg"
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
                      removeFile={() => removeFile(index)}
                    />
                  ))}
                </div>
                <div className="w-full flex justify-center items-center mt-6">
                  <button
                    onClick={handleConvert}
                    className="primary-btn text-xl"
                  >
                    {isSubmitting ? "Processing..." : "Convert"}
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
                          checked={videoLinkInput.type === "link"}
                          onChange={() =>
                            setVideoInput({
                              type: "link",
                              name: "",
                            })
                          }
                          className="ml-6"
                        />
                        <label htmlFor="videoLink" className="ml-2">
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
                          className="ml-6"
                        />
                        <label htmlFor="videoFile" className="ml-2">
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
                          onClick={() => setShowVideoDialog(false)}
                          className="primary-btn"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            setShowVideoDialog(false);
                            if (videoLinkInput.value != "") {
                              setFiles((prevFiles) => [
                                ...prevFiles,
                                videoLinkInput,
                              ]);
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
                <button onClick={handleError}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export default Dashboard;

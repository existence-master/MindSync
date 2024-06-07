"use client";

import { useState, useEffect } from "react";
import MindmapCard from "@components/MindmapCard";
import { fabric } from "fabric";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import SignoutButton from "@components/SignoutButton";

const Saved = () => {
  const [mindmaps, setMindmaps] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/unauthenticated");
    }
  }, [status, router]); // Ensure this effect runs when the status changes

  useEffect(() => {
    const fetchMindmaps = async () => {
      try {
        const response = await fetch("/api/fetch-mindmaps");
        if (!response.ok) throw new Error("Failed to fetch mindmaps");
        const mindmaps = await response.json();
        setMindmaps(mindmaps);
      } catch (err) {
        setError(err.message);
      }
    };

    if (searchQuery === "") {
      fetchMindmaps();
    }
  }, [searchQuery]);

  const handleEdit = (id) => {
    router.push(`/edit/${id}`);
  };

  const handleError = () => {
    setError(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/delete-mindmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete mindmap");
      setMindmaps((prev) => prev.filter((mindmap) => mindmap._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = (mindmap, format) => {
    const mindmapSVG = mindmap.svgContent;

    fabric.loadSVGFromString(mindmapSVG, (objects, options) => {
      const svgElement = document.createElement("svg");
      svgElement.innerHTML = mindmapSVG;
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

  const handleSearch = async (event) => {
    event.preventDefault();
    try {
      // Only fetch if searchQuery is not empty
      if (searchQuery !== "") {
        const response = await fetch(
          `/api/search-mindmaps?query=${searchQuery}`
        );
        if (!response.ok) throw new Error("Failed to search mindmaps");
        const results = await response.json();
        setMindmaps(results);
      } else {
        // If searchQuery is empty, fetch all mindmaps
        const response = await fetch("/api/fetch-mindmaps");
        if (!response.ok) throw new Error("Failed to fetch mindmaps");
        const mindmaps = await response.json();
        setMindmaps(mindmaps);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Return a loading state while the session status is loading
  if (status === "loading") {
    return (
      <div className="bg-paleRose flex justify-center items-center h-screen">
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

        {/* Main content */}
        <div className="flex w-5/6 flex-col justify-center items-center p-4 relative overflow-y-scroll">
          <div className="absolute top-5 right-20">
            <SignoutButton />
          </div>
          <h1 className="text-6xl font-normal mb-2 primary-text font-lora">
            Saved
          </h1>
          {error && <p className="text-red-500">{error}</p>}
          <form onSubmit={handleSearch} className="mb-6 w-full p-4 px-12">
            <div className="relative w-full flex flex-col justify-center items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mindmaps by name"
                className="border p-2 mr-2 w-2/3 input mb-4"
              />
              <button
                type="submit"
                className="absolute -top-1 right-64 cursor-pointer mt-2 text-white p-2"
              >
                <Image
                  src="/images/searchicon.svg"
                  width={20}
                  height={20}
                  alt="Search"
                />
              </button>
            </div>
          </form>
          <div
            className={
              mindmaps.length > 0
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "w-full flex justify-center items-center"
            }
          >
            {mindmaps.length > 0 ? (
              mindmaps.map((mindmap, index) => (
                <MindmapCard
                  key={index}
                  mindmap={mindmap}
                  onDelete={handleDelete}
                  onExport={handleExport}
                  onEdit={handleEdit}
                />
              ))
            ) : (
              <p className="text-center">No mindmaps found</p>
            )}
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
              <button onClick={handleError}>Close</button>
            </div>
          </div>
        )}
      </div>
    );
  }
};

export default Saved;

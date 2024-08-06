"use client";

import { useState, useEffect } from "react";
import MindmapCard from "@components/MindmapCard";
import { fabric } from "fabric";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import SignoutButton from "@components/SignoutButton";
import { useTheme } from "next-themes";
import mermaid from "mermaid";
import ErrorDisplay from "@components/ErrorDisplay";
import FeedbackForm from "@components/FeedbackForm";
import { IconInfoCircle } from "@tabler/icons-react";

const Saved = () => {
	const [mindmaps, setMindmaps] = useState([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [error, setError] = useState(null);
	const [user, setUser] = useState(null);
	const router = useRouter();
	const { data: session, status } = useSession();
	const [loadingMaps, setLoadingMaps] = useState(false);
	const { resolvedTheme, setTheme } = useTheme();
	const [showFeedbackForm, setShowFeedbackForm] = useState(false);
	const [feedback, setFeedback] = useState(false);
	const [navigate, setNavigate] = useState(null);
	const [feature, setFeature] = useState("Saved")

	// Redirect unauthenticated users
	useEffect(() => {
		if (status === "unauthenticated") {
			router.push("/unauthenticated");
		}
	}, [status, router]); // Ensure this effect runs when the status changes

	useEffect(() => {
		const fetchMindmaps = async () => {
			setLoadingMaps(true); // Set loading state to true before making the API call
			try {
				const response = await fetch("/api/fetch-mindmaps");
				if (!response.ok) throw new Error("Failed to fetch mindmaps");
				const mindmaps = await response.json();
				setMindmaps(mindmaps);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoadingMaps(false); // Reset loading state when the response is received
			}
		};

		if (searchQuery === "") {
			fetchMindmaps();
		}
	}, [searchQuery]);

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
					body: JSON.stringify({ columnName: "Saved" }),
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

	const handleEdit = (id) => {
		if (feedback === false) {
			setShowFeedbackForm(true);
			return;
		}
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

	const handleExport = async (mindmap, format) => {
		const { svg: mindmapSVG } = await mermaid.render("temp", mindmap.code);

		fabric.loadSVGFromString(mindmapSVG, (objects, options) => {
			const svgDocument = new DOMParser().parseFromString(
				mindmapSVG,
				"image/svg+xml"
			);
			const svgElement = svgDocument.childNodes[0];
			const svgWidth = svgElement.viewBox.baseVal.width;
			const svgHeight = svgElement.viewBox.baseVal.height;

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
		} catch (error) {
			setError(error.message);
		}
	};

	const handleReportFeedback = () => {
		setShowFeedbackForm(true);
		setFeature("General")
	};

	const handleFeedbackSubmit = async (feedbackText) => {
		try {
			const response = await fetch("/api/update-feedback", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					columnName: feature,
					feedback: feedbackText,
				}),
			});

			if (response.ok) {
				setShowFeedbackForm(false);
				setFeature("Saved")
				if (feature !== "General") {
					setFeedback(true);
					router.push(navigate);
				}
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

	// Return a loading state while the session status is loading
	if (status === "loading") {
		return (
			<div className="bg-paleRose dark:bg-lividBrown flex flex-col justify-center items-center h-screen">
				<div role="status">
					<svg
						aria-hidden="true"
						className="w-24 h-24 text-gray-200 animate-spin dark:text-gray-600 fill-stilleto"
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
					<h1 className="text-8xl font-bold mb-4 text-green-600">
						Loading...
					</h1>
					<p className="text-lg">Please wait</p>
				</div>
			</div>
		);
	}

	if (status === "authenticated") {
		return (
			<div className="flex h-screen w-screen bg-paleRose dark:bg-lividBrown">
				{/* Desktop Content */}
				<div className="xs:hidden w-full md:flex">
					{/* Sidebar */}
					<div className="w-1/6 h-screen flex flex-col justify-between border-double border-r-4 border-tickleMePink">
						<div className="w-full">
							<div className="p-4 text-center">
								<Link href="/">
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
								</Link>
							</div>
							<div className="p-4 text-center flex flex-col justify-center items-center gap-y-10 mt-10 w-full">
								<Link
									href="/dashboard"
									onClick={handleNavigate}
									className="w-5/6"
								>
									<button
										className="secondary-btn flex flex-row gap-4 w-full justify-center bg-stilleto hover:bg-hibiscus dark:hover:bg-hibiscus dark:hover:text-paleRose dark:bg-paleRose dark:text-stilleto"
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
										Create
									</button>
								</Link>
								<Link href="/saved" className="w-5/6">
									<button
										className="secondary-btn flex flex-row gap-4 w-full justify-center bg-stilleto hover:bg-hibiscus dark:hover:bg-hibiscus dark:hover:text-paleRose dark:bg-paleRose dark:text-stilleto"
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
										Saved
									</button>
								</Link>
								<button
									onClick={handleReportFeedback}
									className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#007991] group"
								>
									<IconInfoCircle />
									<span className="ms-3">
										Report Feedback
									</span>
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
								onClick={handleNavigate}
								className="text-tawnyPort dark:text-paleRose"
							>
								{user ? user.username : "User"}
							</Link>
						</div>
					</div>

					{/* Main content */}
					<div className="flex w-5/6 flex-col items-center p-4 pt-32 pb-10 relative overflow-y-scroll">
						<div className="absolute top-5 right-20">
							<SignoutButton />
						</div>
						<h1 className="text-6xl font-normal mb-2 primary-text font-lora dark:text-paleRose">
							Saved
						</h1>
						{error && <p className="text-red-500">{error}</p>}
						<form
							onSubmit={handleSearch}
							className="mb-6 w-full p-4 px-12"
						>
							<div className="relative w-full flex flex-col justify-center items-center">
								<input
									type="text"
									value={searchQuery}
									onChange={(e) =>
										setSearchQuery(e.target.value)
									}
									placeholder="Search mindmaps by name"
									className="border p-2 mr-2 w-2/3 input mb-4 dark:text-white"
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
						{loadingMaps ? (
							<div
								role="status"
								className="w-full mt-20 flex flex-col items-center justify-center"
							>
								<svg
									aria-hidden="true"
									className="w-12 h-12 text-gray-200 animate-spin fill-tawnyPort"
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
						) : (
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
									<p className="text-center">
										No mindmaps found
									</p>
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
				{/* Mobile Content */}
				<div className="xs:flex md:hidden">
					<div id="container" className="w-screen h-screen">
						<div className="flex w-full h-full flex-col justify-center items-center relative overflow-y-scroll">
							<div className="absolute top-5 right-20">
								<SignoutButton />
							</div>
							<div className="w-full h-full flex flex-col items-center mt-14">
								<h1 className="text-6xl font-normal mb-2 primary-text font-lora text-center dark:text-paleRose">
									Saved
								</h1>
								{error && (
									<p className="text-red-500">{error}</p>
								)}
								<form
									onSubmit={handleSearch}
									className="mb-6 w-full p-4 px-12"
								>
									<div className="relative w-full flex flex-col justify-center items-center">
										<input
											type="text"
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
											placeholder="Search mindmaps by name"
											className="border p-2 mr-2 w-full pl-8 input mb-4 dark:text-white"
										/>
										<button
											type="submit"
											className="absolute bottom-[14px] -left-1 cursor-pointer mt-2 text-white p-2"
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
								{loadingMaps ? (
									<div
										role="status"
										className="w-full mt-20 flex flex-col items-center justify-center"
									>
										<svg
											aria-hidden="true"
											className="w-12 h-12 text-gray-200 animate-spin fill-tawnyPort"
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
										<span className="sr-only">
											Loading...
										</span>
									</div>
								) : (
									<div
										className={
											mindmaps.length > 0
												? "grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xs:gap-1 md:gap-4"
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
											<p className="text-center">
												No mindmaps found
											</p>
										)}
									</div>
								)}
								{error && (
									<ErrorDisplay
										errorMessage={error}
										handleError={handleError}
									/>
								)}
								{showFeedbackForm && (
									<FeedbackForm
										handleFeedbackCancel={
											handleFeedbackCancel
										}
										handleFeedbackSubmit={
											handleFeedbackSubmit
										}
									/>
								)}
							</div>
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
							<Link href="/dashboard" onClick={handleNavigate}>
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
							<Link href="/profile" onClick={handleNavigate}>
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
							<button
								onClick={handleReportFeedback}
								className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-[#007991] group"
							>
								<IconInfoCircle />
								<span className="ms-3">Report Feedback</span>
							</button>
						</div>
					</div>
				</div>
				<div id="temp" className="hidden" />
			</div>
		);
	}
};

export default Saved;

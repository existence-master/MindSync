"use client"; // Render on client side

import ErrorDisplay from "@components/ErrorDisplay"; // Custom error component
import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import MindmapCard from "@components/MindmapCard";
import { SAMPLE_IDS } from "@utils/constants.js";
import { useRouter } from "next/navigation";
import { InfiniteMovingCards } from "@components/InfiniteMovingCards";
import { BentoGrid, BentoGridItem } from "@components/BentoGrid";
import {
	IconAbc,
	IconClipboardCopy,
	IconFileBroken,
	IconSun,
	IconMoon,
	IconTableColumn,
} from "@tabler/icons-react";
import { BackgroundGradient } from "@components/BackgroundGradient";
import { FlipWords } from "@components/FlipWords";

const Home = () => {
	const { setTheme, resolvedTheme } = useTheme("dark");
	const [isOpen, setIsOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [sampleMindmaps, setSampleMindmaps] = useState([]);
	const [error, setError] = useState(null);
	const [mindmapCount, setMindmapCount] = useState(0);
	const router = useRouter();
	const [betaSignedUp, setBetaSignedUp] = useState(false);

	const handleEdit = (id) => {
		router.push(`/sample/${id}`);
	};

	const handleError = () => {
		setError(null);
	};

	useEffect(() => {
		const fetchMindmapCount = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BASE_PATH}/api/mindmap-count`
				);
				if (!response.ok) {
					throw new Error("Failed to fetch mindmap count");
				}
				const { count } = await response.json();
				setMindmapCount(count);
			} catch (err) {
				setError(err.message);
			}
		};

		fetchMindmapCount();
	}, []);

	useEffect(() => {
		const handleScroll = () => {
			const isUserScrolled = window.scrollY > 0;
			setIsScrolled(isUserScrolled);
			setNavbarStyle(isUserScrolled ? "bg-white" : "bg-transparent");
		};

		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		const fetchSampleMindmaps = async (sampleIds) => {
			const sampleMindmapDetails = [];

			for (const id of sampleIds) {
				try {
					const response = await fetch(
						`${process.env.NEXT_PUBLIC_BASE_PATH}/api/get-mindmap-details?id=${id}&sample=true`
					);
					if (!response.ok) {
						throw new Error(
							`Error fetching mindmap with ID ${id}: ${response.statusText}`
						);
					}
					const data = await response.json();
					sampleMindmapDetails.push(data);
				} catch (error) {
					setError(error.message);
				}
			}

			setSampleMindmaps(sampleMindmapDetails);
		};

		fetchSampleMindmaps(SAMPLE_IDS);
	}, []);

	console.log(sampleMindmaps);

	const Skeleton = ({ imageUrl }) => {
		const containerRef = useRef(null);
		const [imageWidth, setImageWidth] = useState(0);
		const [imageHeight, setImageHeight] = useState(0);

		useEffect(() => {
			if (containerRef.current) {
				const { width, height } =
					containerRef.current.getBoundingClientRect();
				setImageWidth(width);
				setImageHeight(height);
			}
		}, []);

		return (
			<div
				ref={containerRef}
				className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl"
			>
				{imageUrl && (
					<NextImage
						src={imageUrl}
						alt="Mindmap Skeleton"
						width={imageWidth}
						height={imageHeight}
						className="bg-paleRose rounded-xl py-2"
					/>
				)}
			</div>
		);
	};

	const words = [
		"success.",
		"clarity.",
		"focus.",
		"creativity.",
		"productivity.",
		"growth.",
	];

	const features = [
		{
			title: "Multimodal Inputs",
			description:
				"Text, image, audio and video to mindmap. Attach everything and create your mindmap.",
			header: <Skeleton imageUrl="/images/feature1.svg" />,
			icon: <IconAbc className="h-4 w-4 text-neutral-100" />,
		},
		{
			title: "Save Your Mindmap",
			description: "Save Mindmaps to your MindSync account with ease.",
			header: <Skeleton imageUrl="/images/feature2.svg" />,
			icon: <IconClipboardCopy className="h-4 w-4 text-neutral-100" />,
		},
		{
			title: "Export Your Mindmap",
			description: "Export Mindmaps in different formats.",
			header: <Skeleton imageUrl="/images/feature3.svg" />,
			icon: <IconFileBroken className="h-4 w-4 text-neutral-100" />,
		},
		{
			title: "AI Mindmap Editor",
			description:
				"Edit Mindmaps with textual instructions or multimodal inputs.",
			header: <Skeleton imageUrl="/images/feature4.svg" />,
			icon: <IconTableColumn className="h-4 w-4 text-neutral-100" />,
		},
		{
			title: "Dark and Light Mode",
			description: "Switch between light and dark mode.",
			header: <Skeleton imageUrl="/images/feature5.svg" />,
			icon: <IconSun className="h-4 w-4 text-neutral-100" />,
		},
	];

	const testimonials = [
		{
			quote: "bro this app is awesome. mindmapping during class has never been easier.",
			name: "Sarthak Karandikar",
			title: "billionaire, playboy, philanthropist",
		},
		{
			quote: "saved me from failing all my classes. i owe my life to mindsync. :D",
			name: "kabeer ahmed merchant",
			title: "an average student",
		},
		{
			quote: "makes my daily work so much easier. now all i gotta do is record my lectures and i have a mindmap of the whole thing!",
			name: "Abhijeet Suryawanshi",
			title: "Your friendly neighbourhood data scientist",
		},
		{
			quote: "bro i designed the whole damn frontend, of course i will enjoy using it. mindsync is the best.",
			name: "Ojaswini Prabhune",
			title: "UI/UX Designer",
		},
		{
			quote: "i am so happy that i found mindsync. mindsync has saved my life in so many ways.",
			name: "Varad Deshpande",
			title: "casually became a trillionaire - thanks to mindsync",
		},
	];

	return (
		<>
			<nav
				className="dark:bg-lividBrown bg-paleRose border-b-2 rounded-b-lg border-tickleMePink fixed w-full z-20 top-0 start-0"
				style={{ zIndex: 200 }}
			>
				<div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
					<a
						href="#"
						className="flex items-center space-x-3 rtl:space-x-reverse"
					>
						<NextImage
							src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/logofull.svg`}
							width={160}
							height={40}
							alt="MindSync Logo"
						/>
					</a>
					<div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
						<button
							onClick={() =>
								setTheme(
									resolvedTheme === "light" ? "dark" : "light"
								)
							}
							className="px-4 mr-2 text-lividBrown dark:text-white transition-all duration-500"
						>
							{resolvedTheme === "light" ? (
								<>
									<IconMoon className="w-6 h-6" />
								</>
							) : (
								<>
									<IconSun className="w-6 h-6" />
								</>
							)}
						</button>
						<Link href={"/login"}>
							<button
								type="button"
								className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-tickleMePink bg-[linear-gradient(110deg,#8A2846,45%,#B9375E,55%,#522E38)] bg-[length:200%_100%] px-6 font-medium text-paleRose transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
							>
								Login
							</button>
						</Link>
						<button
							data-collapse-toggle="navbar-sticky"
							type="button"
							className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 ${
								isOpen ? "hidden" : ""
							}`}
							aria-controls="navbar-sticky"
							aria-expanded="false"
							onClick={() => setIsOpen(true)}
						>
							<span className="sr-only">Open main menu</span>
							<svg
								className="w-5 h-5"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 17 14"
							>
								<path
									stroke="currentColor"
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M1 1h15M1 7h15M1 13h15"
								/>
							</svg>
						</button>
					</div>
					<div
						className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
						id="navbar-sticky"
					>
						<ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-transparent md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
							<li>
								<a
									href="#"
									className="block py-2 px-3 text-tickleMePink rounded text-xl hover:drop-shadow-glow"
									aria-current="page"
								>
									Home
								</a>
							</li>
							<li>
								<a
									href="#"
									className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded text-xl hover:drop-shadow-glow"
								>
									About
								</a>
							</li>
							<li>
								<a
									href="#"
									className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded text-xl hover:drop-shadow-glow"
								>
									Contact Us
								</a>
							</li>
						</ul>
					</div>
					{isOpen && (
						<div className="fixed inset-0 flex z-50">
							<div className="fixed inset-0 bg-black opacity-50"></div>
							<div className="absolute inset-y-0 right-0 flex flex-col w-full max-w-lg">
								<button
									data-collapse-toggle="navbar-sticky"
									type="button"
									className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
									aria-controls="navbar-sticky"
									aria-expanded="false"
									onClick={() => setIsOpen(false)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
								<div className="w-full dark:bg-lividBrown bg-paleRose rounded-lg">
									<ul className="py-4 px-2 space-y-2">
										<li>
											<a
												href="#"
												className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded"
											>
												Home
											</a>
										</li>
										<li>
											<a
												href="#"
												className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded"
											>
												About
											</a>
										</li>
										<li>
											<a
												href="#"
												className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded"
											>
												Contact Us
											</a>
										</li>
									</ul>
								</div>
							</div>
						</div>
					)}
				</div>
			</nav>
			<main className="w-full h-full bg-paleRose dark:bg-lividBrown">
				<section
					id="hero"
					className="flex flex-col items-center xs:h-screen md:h-[800px] bg-paleRose dark:bg-lividBrown"
				>
					<a href="#betatest">
						<button className="xs:mt-32 md:mt-28 bg-stilleto no-underline group cursor-pointer relative shadow-2xl shadow-lividBrown rounded-full p-px text-xs font-semibold leading-6  text-paleRose inline-block">
							<span className="absolute inset-0 overflow-hidden rounded-full">
								<span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
							</span>
							<div className="relative flex space-x-2 items-center z-10 rounded-full bg-stilleto py-0.5 px-4 ring-1 ring-white/10 ">
								<span>{`Join our Beta Waitlist now!`}</span>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="1.5"
										d="M10.75 8.75L14.25 12L10.75 15.25"
									></path>
								</svg>
							</div>
							<span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
						</button>
					</a>
					<h1 className="mt-8 mb-4 text-5xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
						Mindmap your way to
						<span className="underline font-normal text-paleRose">
							<FlipWords words={words} />
						</span>
					</h1>
					<p className="text-2xl text-center dark:text-paleRose text-lividBrown font-inter">
						Organize your mind and{" "}
						<span className="font-bold">
							unleash your creativity
						</span>{" "}
						in one click.
					</p>
					<div className="flex flex-row gap-4 mt-8 mb-8">
						<Link
							href="https://youtu.be/kHwuCagHWWg"
							className="bg-paleRose text-lividBrown p-2 rounded-lg text-xl px-4 hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter"
						>
							Take a Tour
						</Link>
						<Link href={`/signup`}>
							<button className="relative inline-flex overflow-hidden rounded-lg h-12 p-[2px] hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
								<span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8A2846_0%,#FFE0E9_50%,#FF7AA2_100%)]" />
								<span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-stilleto px-3 py-1 text-xl font-medium text-paleRose backdrop-blur-3xl">
									Get Started
								</span>
							</button>
						</Link>
					</div>
					<div>
						{" "}
						<div className="hidden md:block">
							<iframe
								width="800"
								height="515"
								src="https://www.youtube.com/embed/kHwuCagHWWg?si=si_k-Nimlmpu5qth"
								title="MindSync Demo Video"
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerPolicy="strict-origin-when-cross-origin"
								allowFullScreen
							/>
						</div>
						<div className="md:hidden">
							<iframe
								width="300"
								height="300"
								src="https://www.youtube.com/embed/kHwuCagHWWg?si=si_k-Nimlmpu5qth"
								title="MindSync Demo Video"
								frameBorder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerPolicy="strict-origin-when-cross-origin"
								allowFullScreen
							/>
						</div>
					</div>
				</section>
				<section
					id="samples"
					className="flex flex-col items-center bg-paleRose dark:bg-lividBrown md:h-screen xs:min-h-fit"
				>
					<h1 className="xs:mt-8 md:mt-40 mb-4 xs:text-3xl md:text-5xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
						Check out some sample Mindmaps here!
					</h1>
					<div className="flex flex-wrap justify-center items-center md:gap-4 xs:gap-2 xs:gap-y-2 my-10">
						{sampleMindmaps.length > 0 ? (
							sampleMindmaps.map((mindmap, index) => (
								<MindmapCard
									key={index}
									mindmap={mindmap}
									sample={true}
									onEdit={handleEdit}
								/>
							))
						) : (
							<p className="text-center">
								Loading sample mindmaps...
							</p>
						)}
					</div>
				</section>
				<section
					id="generated"
					className="relative flex flex-col items-center justify-center bg-paleRose dark:bg-lividBrown xs:min-h-fit md:h-[300px]"
				>
					<NextImage
						src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/featuresection-shape1.svg`}
						alt="Feature Section Shapes"
						width={200}
						height={200}
						className="xs:hidden md:block absolute -top-20 left-0"
						style={{ zIndex: 100 }}
					/>
					<NextImage
						src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/featuresection-shape2.svg`}
						alt="Feature Section Shapes"
						width={200}
						height={200}
						className="xs:hidden md:block absolute -bottom-20 left-40"
						style={{ zIndex: 100 }}
					/>
					<NextImage
						src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/featuresection-shape3.svg`}
						alt="Feature Section Shapes"
						width={200}
						height={200}
						className="xs:hidden md:block absolute bottom-10 right-20"
						style={{ zIndex: 100 }}
					/>
					<NextImage
						src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/featuresection-shape4.svg`}
						alt="Feature Section Shapes"
						width={150}
						height={150}
						className="xs:hidden md:block absolute -bottom-20 right-60"
						style={{ zIndex: 100 }}
					/>
					<h1 className="xs:mt-4 mb-4 xs:text-6xl md:text-8xl font-lora font-normal text-center text-transparent bg-gradient-to-r from-hibiscus to-tawnyPort dark:from-[#B9375E] dark:to-[#FFD7E0] bg-clip-text">
						{mindmapCount}+
					</h1>
					<div className="flex flex-col justify-center items-center xs:text-3xl md:text-4xl font-inter gap-4 my-10 mb-20 text-transparent bg-gradient-to-r from-hibiscus to-tawnyPort dark:from-[#B9375E] dark:to-[#FFD7E0] bg-clip-text">
						Mindmaps Generated!
					</div>
				</section>
				<section
					id="features"
					className="flex md:flex-row xs:flex-col items-center justify-center bg-paleRose dark:bg-lividBrown md:h-screen xs:min-h-fit"
				>
					<h1 className="xs:block md:hidden mt-20 mb-4 xs:text-3xl md:text-8xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
						Features
					</h1>
					<BentoGrid className="max-w-4xl mx-auto px-2">
						{features.map((item, i) => (
							<BentoGridItem
								key={i}
								title={item.title}
								description={item.description}
								header={item.header}
								icon={item.icon}
								image={item.image}
								className={
									i === 3 || i === 6 ? "md:col-span-2" : ""
								}
							/>
						))}
					</BentoGrid>
				</section>
				<section
					id="Testimonials"
					className="flex flex-col items-center justify-center bg-paleRose dark:bg-lividBrown min-h-fit"
				>
					<h1 className="mt-20 mb-4 xs:text-2xl md:text-5xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
						Testimonials
					</h1>
					<div className="h-[40rem] rounded-md flex flex-col antialiased bg-transparent dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
						<InfiniteMovingCards
							items={testimonials}
							direction="right"
							speed="slow"
						/>
					</div>
				</section>
				<section
					id="betatest"
					className="flex flex-col items-center justify-center bg-paleRose dark:bg-lividBrown min-h-fit"
				>
					<h1 className="mt-20 mb-4 xs:text-2xl md:text-5xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
						Become a Beta Tester
					</h1>
					<form
						onSubmit={async (e) => {
							e.preventDefault();
							const email = e.target.email.value;
							const response = await fetch(
								`${process.env.NEXT_PUBLIC_BASE_PATH}/api/send-beta-signup-mail`,
								{
									method: "POST",
									headers: {
										"Content-Type": "application/json",
									},
									body: JSON.stringify({ email }),
								}
							);
							if (response.ok) {
								console.log("Thank you for signing up!");
								setBetaSignedUp(true);
							} else {
								console.log(
									"Something went wrong. Please try again later."
								);
							}
						}}
						className="md:w-1/2 xs:w-3/4 mx-auto mt-20 mb-20"
					>
						<label
							for="email"
							className="block mb-2 text-xl font-inter font-medium text-gray-900 dark:text-white"
						>
							Enter your email
						</label>
						<BackgroundGradient className="rounded-lg w-full p-[2px]">
							<input
								type="email"
								id="email"
								aria-describedby="helper-text-explanation"
								className="bg-paleRose border border-tickleMePink text-xl rounded-2xl focus:ring-tickleMePink focus:border-stilleto block w-full p-[2px] py-2.5 px-2 dark:bg-paleRose dark:border-tickleMePink dark:placeholder-gray-400 text-lividBrown dark:focus:ring-tickleMePink dark:focus:border-stilleto"
								placeholder="name@mindsync.com"
							/>
						</BackgroundGradient>
						<p
							id="helper-text-explanation"
							className="mt-2 text-sm text-gray-500 dark:text-gray-400"
						>
							We’ll never share your details. Read our{" "}
							<a
								href="#"
								className="font-medium text-tickleMePink hover:underline dark:text-tickleMePink"
							>
								Privacy Policy
							</a>
							.
						</p>
						<div className="w-full flex flex-col items-center justify-center mt-4">
							<button
								type="submit"
								className="relative inline-flex overflow-hidden rounded-lg h-12 p-[2px] hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
							>
								<span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8A2846_0%,#FFE0E9_50%,#FF7AA2_100%)]" />
								<span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-stilleto px-3 py-1 text-xl font-medium text-paleRose backdrop-blur-3xl">
									{betaSignedUp
										? "Thanks for Signing Up!"
										: "Join the Beta Program"}
								</span>
							</button>
						</div>
					</form>
				</section>

				{error && (
					<ErrorDisplay
						errorMessage={error}
						handleError={handleError}
					/>
				)}

				<footer className="bg-paleRose shadow dark:bg-lividBrown">
					<div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
						<div className="sm:flex sm:items-center sm:justify-between">
							<a
								href="#"
								className="flex items-center xs:justify-center md:justify-normal mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
							>
								<NextImage
									src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/logofull.svg`}
									width={200}
									height={50}
									alt="MindSync Logo"
								/>
							</a>
							<ul className="flex flex-wrap items-center xs:justify-center md:justify-normal mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
								<li>
									<a
										href="#"
										className="hover:underline me-4 md:me-6 dark:text-paleRose text-lividBrown"
									>
										About
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:underline me-4 md:me-6 dark:text-paleRose text-lividBrown"
									>
										Privacy Policy
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:underline me-4 md:me-6 dark:text-paleRose text-lividBrown"
									>
										Licensing
									</a>
								</li>
								<li>
									<a
										href="#"
										className="hover:underline dark:text-paleRose text-lividBrown"
									>
										Contact
									</a>
								</li>
							</ul>
						</div>
						<hr className="my-6 border-tickleMePink sm:mx-auto lg:my-8" />
						<span className="block text-sm text-gray-500 xs:text-center dark:text-gray-400">
							2024{" "}
							<a href="#" className="hover:underline">
								MindSync
							</a>
							. All Rights Reserved.
						</span>
						<span className="w-full flex flex-row md:items-center xs:justify-center gap-x-2 mt-4">
							Powered by{" "}
							<Link
								href={"https://existence-master.netlify.app/"}
							>
								<NextImage
									src={`/images/logo-transparent${
										resolvedTheme === "dark"
											? ".png"
											: "-light.png"
									}`}
									width={100}
									height={25}
									alt="Existence Logo"
									className="rounded-xl"
								/>
							</Link>
						</span>
					</div>
				</footer>
			</main>
		</>
	);
};

export default Home;

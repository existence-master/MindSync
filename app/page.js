"use client"; // Render on client side

import ErrorDisplay from "@components/ErrorDisplay"; // Custom error component
import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import MindmapCard from "@components/MindmapCard";
import { EvervaultCard, Icon } from "@components/EvervaultCard";
import {SAMPLE_IDS} from "@utils/constants.js"

const Home = () => {
	const { setTheme, resolvedTheme } = useTheme();
	const [isOpen, setIsOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [navbarStyle, setNavbarStyle] = useState("bg-transparent");
	const [sampleMindmaps, setSampleMindmaps] = useState([]);
	const [error, setError] = useState(null);

	const handleEdit = (id) => {
		router.push(`/sample/${id}`);
	};

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
						`/api/get-mindmap-details?id=${id}&sample=true`
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

		fetchSampleMindmaps(SAMPLE_IDS)
	}, []);

	return (
		<>
			<nav class={`${navbarStyle} fixed w-full z-20 top-0 start-0`}>
				<div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
					<a
						href="#"
						class="flex items-center space-x-3 rtl:space-x-reverse"
					>
						<NextImage
							src="/images/logofull.svg"
							width={200}
							height={50}
							alt="MindSync Logo"
						/>
					</a>
					<div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
						<Link href={"/login"}>
							<button
								type="button"
								class="dark:text-lividBrown text-paleRose bg-stilleto hover:bg-lividBrown focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-paleRose dark:hover:bg-tickleMePink dark:focus:ring-stilleto"
							>
								Login
							</button>
						</Link>
						<button
							data-collapse-toggle="navbar-sticky"
							type="button"
							class={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 ${
								isOpen ? "hidden" : ""
							}`}
							aria-controls="navbar-sticky"
							aria-expanded="false"
							onClick={() => setIsOpen(true)}
						>
							<span class="sr-only">Open main menu</span>
							<svg
								class="w-5 h-5"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 17 14"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M1 1h15M1 7h15M1 13h15"
								/>
							</svg>
						</button>
					</div>
					<div
						class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
						id="navbar-sticky"
					>
						<ul class="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-transparent md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
							<li>
								<a
									href="#"
									class="block py-2 px-3 text-tickleMePink rounded text-xl"
									aria-current="page"
								>
									Home
								</a>
							</li>
							<li>
								<a
									href="#"
									class="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded text-xl"
								>
									About
								</a>
							</li>
							<li>
								<a
									href="#"
									class="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded text-xl"
								>
									Contact Us
								</a>
							</li>
						</ul>
					</div>
					{isOpen && (
						<div class="fixed inset-0 flex z-50">
							<div class="fixed inset-0 bg-black opacity-50"></div>
							<div class="absolute inset-y-0 right-0 flex flex-col w-full max-w-sm">
								<button
									data-collapse-toggle="navbar-sticky"
									type="button"
									class="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
									aria-controls="navbar-sticky"
									aria-expanded="false"
									onClick={() => setIsOpen(false)}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
								<div class="w-full dark:bg-lividBrown bg-paleRose rounded-lg">
									<ul class="py-4 px-2 space-y-2">
										<li>
											<a
												href="#"
												class="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded"
											>
												Home
											</a>
										</li>
										<li>
											<a
												href="#"
												class="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded"
											>
												About
											</a>
										</li>
										<li>
											<a
												href="#"
												class="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded"
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
				<button
					onClick={() =>
						setTheme(resolvedTheme === "light" ? "dark" : "light")
					}
					className="fixed bottom-5 right-5 px-4 py-3 rounded-lg bg-stilleto dark:bg-paleRose text-white dark:text-lividBrown shadow-md transition-all duration-500"
					style={{ zIndex: 100 }}
				>
					{resolvedTheme === "light" ? (
						<>
							<span className="text-sm">Dark Mode</span>
						</>
					) : (
						<>
							<span className="text-sm">Light Mode</span>
						</>
					)}
				</button>
				<section
					id="hero"
					className="flex flex-col items-center h-screen"
				>
					<h1 className="mt-40 mb-4 text-5xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
						Mindmap your way to success
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
							href="#"
							className="bg-paleRose text-lividBrown p-2 rounded-lg text-xl px-4 hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter"
						>
							Take a Tour
						</Link>
						<Link
							href="/signup"
							className="bg-stilleto text-white dark:bg-paleRose dark:text-lividBrown p-2 rounded-lg text-xl px-4 hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter"
						>
							Get Started
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
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerpolicy="strict-origin-when-cross-origin"
								allowfullscreen
							/>
						</div>
						<div className="md:hidden">
							<iframe
								width="300"
								height="300"
								src="https://www.youtube.com/embed/kHwuCagHWWg?si=si_k-Nimlmpu5qth"
								title="MindSync Demo Video"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								referrerpolicy="strict-origin-when-cross-origin"
								allowfullscreen
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
					<div className="flex flex-wrap justify-center items-center gap-4 my-10">
						{sampleMindmaps.length > 0 ? (
							sampleMindmaps.map((mindmap, index) => (
								<MindmapCard
									key={index}
									mindmap={mindmap}
									sample={true}
									onEdit={handleEdit}
								/>
							))
						): (
								<p className="text-center">No sample mindmaps found</p>
								
						)}
					</div>
				</section>
				<section
					id="generated"
					className="flex flex-col items-center bg-paleRose dark:bg-lividBrown min-h-fit"
				>
					<h1 className="mt-20 mb-4 xs:text-3xl md:text-8xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
						120,000,000
					</h1>
					<div className="flex flex-col justify-center items-center xs:text-3xl md:text-4xl font-inter gap-4 my-10 mb-20">
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
					<div className="md:mt-40 xs:mt-8 border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start xs:w-[20rem] md:w-[24rem] mx-4 p-4 relative md:h-[30rem] xs:h-[20rem]">
						<Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
						<Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
						<Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
						<Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

						<EvervaultCard text="create" />

						<h2 className="dark:text-white text-black mt-4 text-sm font-light">
							Attach anything and create a mindmap in seconds.
						</h2>
						<p className="text-sm border font-light dark:border-white/[0.2] border-black/[0.2] rounded-full mt-4 text-black dark:text-white px-2 py-0.5">
							AI-Enabled Creation with Multimodal Support
						</p>
					</div>
					<div className="md:mt-40 xs:mt-8 border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start xs:w-[20rem] md:w-[24rem] mx-4 p-4 relative md:h-[30rem] xs:h-[20rem]">
						<Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
						<Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
						<Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
						<Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

						<EvervaultCard text="edit" />

						<h2 className="dark:text-white text-black mt-4 text-sm font-light">
							Edit your maps manually or simply send a message to
							edit it. You can also add additional information to
							existing maps.
						</h2>
						<p className="text-sm border font-light dark:border-white/[0.2] border-black/[0.2] rounded-full mt-4 text-black dark:text-white px-2 py-0.5">
							AI-Enabled Editing with Multimodal Support
						</p>
					</div>
					<div className="md:mt-40 xs:mt-8 xs:mb-4 md:mb-0 border border-black/[0.2] dark:border-white/[0.2] flex flex-col items-start xs:w-[20rem] md:w-[24rem] mx-4 p-4 relative md:h-[30rem] xs:h-[20rem]">
						<Icon className="absolute h-6 w-6 -top-3 -left-3 dark:text-white text-black" />
						<Icon className="absolute h-6 w-6 -bottom-3 -left-3 dark:text-white text-black" />
						<Icon className="absolute h-6 w-6 -top-3 -right-3 dark:text-white text-black" />
						<Icon className="absolute h-6 w-6 -bottom-3 -right-3 dark:text-white text-black" />

						<EvervaultCard text="save" />

						<h2 className="dark:text-white text-black mt-4 text-sm font-light">
							Save maps to your Mindsync account for future
							reference or export them in SVG/PNG formats.
						</h2>
						<p className="text-sm border font-light dark:border-white/[0.2] border-black/[0.2] rounded-full mt-4 text-black dark:text-white px-2 py-0.5">
							Easy Save/Export.
						</p>
					</div>
				</section>
				<section
					id="generated"
					className="flex flex-col items-center justify-center bg-paleRose dark:bg-lividBrown min-h-fit"
				>
					<h1 className="mt-20 mb-4 xs:text-2xl md:text-5xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
						Become a Beta Tester
					</h1>
					<form class="w-1/2 mx-auto mt-20 mb-20">
						<label
							for="email"
							class="block mb-2 text-xl font-inter font-medium text-gray-900 dark:text-white"
						>
							Your email
						</label>
						<input
							type="email"
							id="email"
							aria-describedby="helper-text-explanation"
							class="bg-paleRose border border-gray-300 text-paleRose text-xl rounded-lg focus:ring-tickleMePink focus:border-stilleto block w-full p-2.5  dark:bg-paleRose dark:border-tickleMePink dark:placeholder-gray-400 dark:text-lividBrown dark:focus:ring-tickleMePink dark:focus:border-stilleto"
							placeholder="name@mindsync.com"
						/>

						<p
							id="helper-text-explanation"
							class="mt-2 text-sm text-gray-500 dark:text-gray-400"
						>
							We’ll never share your details. Read our{" "}
							<a
								href="#"
								class="font-medium text-tickleMePink hover:underline dark:text-tickleMePink"
							>
								Privacy Policy
							</a>
							.
						</p>
						<div className="w-full flex flex-col items-center justify-center mt-4">
							<button
								type="submit"
								class="bg-tickleMePink text-white font-medium py-2 px-4 rounded-lg hover:bg-stilleto focus:outline-none focus:ring-4 focus:ring-tickleMePink dark:text-lividBrown dark:bg-paleRose dark:hover:bg-tickleMePink dark:focus:ring-lividBrown"
							>
								Join the Beta Program
							</button>
						</div>
					</form>
				</section>

				<footer class="bg-paleRose shadow dark:bg-lividBrown">
					<div class="w-full max-w-screen-xl mx-auto p-4 md:py-8">
						<div class="sm:flex sm:items-center sm:justify-between">
							<a
								href="https://flowbite.com/"
								class="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
							>
								<NextImage
									src="/images/logofull.svg"
									width={200}
									height={50}
									alt="MindSync Logo"
								/>
							</a>
							<ul class="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
								<li>
									<a
										href="#"
										class="hover:underline me-4 md:me-6 dark:text-paleRose text-lividBrown"
									>
										About
									</a>
								</li>
								<li>
									<a
										href="#"
										class="hover:underline me-4 md:me-6 dark:text-paleRose text-lividBrown"
									>
										Privacy Policy
									</a>
								</li>
								<li>
									<a
										href="#"
										class="hover:underline me-4 md:me-6 dark:text-paleRose text-lividBrown"
									>
										Licensing
									</a>
								</li>
								<li>
									<a
										href="#"
										class="hover:underline dark:text-paleRose text-lividBrown"
									>
										Contact
									</a>
								</li>
							</ul>
						</div>
						<hr class="my-6 border-tickleMePink sm:mx-auto lg:my-8" />
						<span class="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
							2024{" "}
							<a href="#" class="hover:underline">
								MindSync
							</a>
							. All Rights Reserved.
						</span>
					</div>
				</footer>
			</main>
		</>
	);
};

export default Home;

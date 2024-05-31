"use client";

import { useState, useEffect } from "react";
import Navbar from "@components/Navbar"; // Navbar component
import NextImage from "next/image";
import ErrorDisplay from "@components/ErrorDisplay"; // Custom error component
import { useRouter } from "next/navigation";
import Link from "next/link"; // Link component for client-side navigation

const Signup = () => {
	// States to store email, password, and username
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [error, setError] = useState(null); // State to store error
	const router = useRouter(); // Object to handle routing

	// Handle error function
	const handleError = () => {
		setError(null);
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			// Send a request to set the session with email, password, and username
			const response = await fetch("/api/set-session", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email, password, username }),
			});

			// Check if the session was set successfully
			if (!response.ok) {
				throw new Error(
					(await response.text()) || "Something went wrong"
				);
			}

			// Set the signup-flow cookie
			const cookieResponse = await fetch("/api/set-cookie", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: "signup-flow",
					value: "true",
					maxAge: 3600, // 1 hour
				}),
			});

			// Check if the cookie was set successfully
			if (cookieResponse.ok) {
				// Redirect to the verify page with email query parameter
				router.push(`/verify?email=${email}`);
			} else {
				throw new Error(
					"Failed to initiate signup process. Please try again."
				);
			}
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<>
			<main className="mt-5 mb-10 mx-5">
				<Navbar />
				<section className="mt-[35px] lg:mt-[75px] lg:mx-[30px] flex flex-col items-center">
					<div className="max-w-max">
						<h1 className="text-center primary-text">Signup</h1>
						<h2 className="xs:max-lg:mt-[10px] mt-[20px] text-center secondary-text">
							Create a new account to continue to MindSync!
						</h2>
						<form
							className="mt-[20px] flex flex-col items-center"
							onSubmit={handleSubmit}
						>
							<input
								type="text"
								placeholder="Username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="mb-4 p-2 border border-gray-300 rounded-md"
								required
							/>
							<input
								type="email"
								placeholder="Email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="mb-4 p-2 border border-gray-300 rounded-md"
								required
							/>
							<input
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="mb-4 p-2 border border-gray-300 rounded-md"
								required
							/>
							<button
								type="submit"
								className="p-2 bg-blue-500 text-white rounded-md"
							>
								Signup
							</button>
						</form>
						<div className="mt-4 flex flex-col items-center">
							<Link href="/login" className="text-blue-500">
								Already have an account? Login
							</Link>
						</div>
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
			<div className="xs:max-md:hidden absolute top-[100px] xs:max-md:-right-[225px] lg:max-lg:-right-[250px] -right-[275px]">
				<NextImage
					src="/images/blob-1.svg"
					width={0}
					height={0}
					alt="Blob 1"
					className="blob"
				/>
			</div>
			<div className="xs:max-md:hidden absolute -bottom-[275px] xs:max-md:-left-[175px] md:max-lg:-left-[200px] -left-[225px]">
				<NextImage
					src="/images/blob-2.svg"
					width={0}
					height={0}
					alt="Blob 2"
					className="blob"
				/>
			</div>
		</>
	);
};

export default Signup;

"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
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
	const session = useSession(); // Object to store user sessio
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const handleRedirect = async () => {
			setLoading(true); // Set loading state to true

			try {
				// Check if the user is already authenticated
				if (session.status === "authenticated") {
					router.push("/dashboard"); // Redirect to the dashboard
				}
			} catch (err) {
				// Handle error
			} finally {
				setLoading(false); // Reset loading state when the check is complete
			}
		};

		handleRedirect();
	}, [session, router]); // Dependency array to re-run when session status changes

	// Function to validate email
	const isValidEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Handle error function
	const handleError = () => {
		setError(null);
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!isValidEmail(email)) {
			setError("Invalid email format.");
			return;
		}

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
				{loading && (
					<div
						className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
						role="status"
					>
						<div className="w-16 h-16 text-white animate-spin dark:text-gray-600 fill-still">
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
						</div>
						<span className="sr-only">Loading...</span>
					</div>
				)}
				<Navbar />
				<section className="mt-[35px] lg:mt-[75px] lg:mx-[30px] flex flex-col items-center">
					<div className="xs:w-5/6 md:w-4/6">
						<h1 className="text-center primary-text mb-10 font-lora font-medium dark:text-paleRose">
							Sign Up
						</h1>
						<h2 className="xs:max-lg:mt-[10px] mt-[20px] text-center secondary-text md:mb-14 xs:mb-8 xs:text-xl">
							Sign up to Mindsync with a Magic Link!
						</h2>
						<form
							className="mt-[10px] flex flex-col items-center w-full"
							onSubmit={handleSubmit}
						>
							<label
								htmlFor="username"
								className="md:w-4/6 xs:5/6 text-left text-xl mb-2 font-inter text-tawnyPort dark:text-paleRose"
							>
								Username
							</label>
							<input
								name="username"
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								className="mb-8 input md:w-4/6 xs:w-5/6 md:h-12 dark:text-paleRose"
								required
							/>
							<label
								htmlFor="email"
								className="md:w-4/6 xs:5/6 text-left text-xl mb-2 font-inter text-tawnyPort dark:text-paleRose"
							>
								Email
							</label>
							<input
								name="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="mb-8 input md:w-4/6 xs:w-5/6 md:h-12 dark:text-paleRose"
								required
							/>
							<label
								htmlFor="password"
								className="md:w-4/6 xs:5/6 text-left text-xl mb-2 font-inter text-tawnyPort dark:text-paleRose"
							>
								Password
							</label>
							<input
								name="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="mb-8 input md:w-4/6 xs:w-5/6 md:h-12 dark:text-paleRose"
								required
							/>
							<button
								type="submit"
								className="primary-btn md:w-2/6 xs:w-3/4 xs:h-10 md:h-14"
							>
								Signup
							</button>
						</form>
						<div className="mt-4 flex flex-col items-center">
							<Link
								href={`${process.env.NEXT_PUBLIC_BASE_PATH}/login`}
								className="text-blue-500"
							>
								<span className="text-gray-500 dark:text-gray-300">
									Already have an account?{" "}
								</span>
								Login
							</Link>
						</div>
						<div className="text-center text-tawnyPort dark:text-paleRose mt-5 mb-5">
							Or
						</div>{" "}
						{/* Separator text */}
						<div className="flex flex-col items-center justify-center">
							<button
								className="primary-btn md:w-2/6 xs:w-3/4 flex flex-row justify-center items-center xs:h-10 md:h-14" // Styling for Google login button
								onClick={() => signIn("google")} // Sign in with Google on click
							>
								<NextImage
									src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/googlelogo.webp`} // Google logo source
									width={20} // Image width
									height={20} // Image height
									alt="Google Logo" // Description for Google logo
									className="mr-2" // Margin-right to space out the logo
								/>
								Sign Up with Google
							</button>
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
					src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/blob-1.svg`}
					width={0}
					height={0}
					alt="Blob 1"
					className="blob"
				/>
			</div>
			<div className="xs:max-md:hidden absolute -bottom-[275px] xs:max-md:-left-[175px] md:max-lg:-left-[200px] -left-[225px]">
				<NextImage
					src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/blob-2.svg`}
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

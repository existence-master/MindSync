"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { useSession } from "next-auth/react";
import jwt from "jsonwebtoken"; // Ensure you have this package installed
import NextImage from "next/image";

const Verify = () => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [error, setError] = useState(null);
	const [toEmail, setToEmail] = useState(null);
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");
	const [magicLink, setMagicLink] = useState(false);
	const [isAuthorized, setIsAuthorized] = useState(false); // State to track authorization status
	const [resendTimeout, setResendTimeout] = useState(60); // Initial timeout for resending the magic link

	const fromEmail = "existence.mindsync@gmail.com";
	const { status } = useSession(); // Hook to get the current session status
	const token = searchParams.get("token");

	// If the user is authenticated, redirect to the dashboard
	useEffect(() => {
		if (status === "authenticated") {
			router.push("/dashboard");
		}
	}, [status, router]);

	useEffect(() => {
		// Check the "signup-flow" and "forgot-password-flow" cookies to determine if the user is authorized
		const signupFlowCookie = getCookie("signup-flow"); // Retrieve the "signup-flow" cookie
		const forgotPasswordFlowCookie = getCookie("forgot-password-flow"); // Retrieve the "forgot-password-flow" cookie

		if (
			signupFlowCookie === "true" ||
			forgotPasswordFlowCookie === "true"
		) {
			setIsAuthorized(true); // Mark as authorized if any of the conditions are met
		} else {
			router.push("/login"); // Redirect to the login page if not authorized
		}
	}, [router]);

    useEffect(() => {
        if (!isAuthorized) {
            return;
        }

        const verifyToken = async () => {
            if (token) {
                try {
                    let response = await fetch("/api/verify-magic-link", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ token })
                    });
                    
                    if (response.ok) {
						// Check which flow the user is in
						const signupFlow = getCookie("signup-flow");
						const forgotPasswordFlow = getCookie(
							"forgot-password-flow"
						);

						// Redirect based on the flow
						if (signupFlow) {
							// Proceed with the signup flow
							// Get user session data from the server
							let response = await fetch("/api/get-session", {
								method: "GET",
								headers: {
									"Content-Type": "application/json",
								},
							});

							if (response.ok) {
								// If the session data retrieval is successful, proceed to signup
								const { email, password, username } =
									await response.json(); // Get user details from the server response
								response = await fetch("/api/signup", {
									method: "POST",
									headers: {
										"Content-Type": "application/json", // Content type for JSON data
									},
									body: JSON.stringify({
										email,
										password,
										username,
									}),
								});

								if (response.ok) {
									// Redirect to the login page
									router.push("/login");
								} else {
									const errorMessage = await response.text();
									setError(errorMessage);
								}
							}
						} else if (forgotPasswordFlow) {
							router.push(`/reset-password?email=${email}`);
						} else {
							router.push("/login");
						}
                    }
                    
                    else {
                        throw new Error("Failed to verify magic link")
                    }
					
				} catch (error) {
					console.error("Invalid token", error);
					setError(
						"Invalid or expired token. Please request a new magic link."
					);
				}
			}
		};

		verifyToken();
	}, [token, router, isAuthorized]);

	useEffect(() => {
		if (!isAuthorized) {
			return;
		}

		const email = searchParams.get("email");
		setToEmail(email);

		const signupFlowCookie = getCookie("signup-flow");
		const forgotPasswordFlowCookie = getCookie("forgot-password-flow");

		if (signupFlowCookie === "true") {
			setSubject("Signup For MindSync");
			setMessage("Signup For MindSync");
		} else if (forgotPasswordFlowCookie === "true") {
			setSubject("Reset Password For MindSync");
			setMessage("Reset Password For MindSync");
		} else {
			router.push("/login");
		}
	}, [router, searchParams, isAuthorized]);

	useEffect(() => {
		if (toEmail && subject && message) {
			const sendMagicLink = async () => {
				try {
					const response = await fetch("/api/send-magic-link", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							email: toEmail,
							subject,
							message,
						}),
					});

					if (response.ok) {
						setMagicLink(true);
					} else {
						const errorText = await response.text();
						throw new Error(errorText);
					}
				} catch (error) {
					console.error(error);
					setMessage("Failed to send magic link. Please try again.");
				}
			};
			sendMagicLink();
		}
	}, []);

	useEffect(() => {
		// Timer for enabling the resend button
		if (resendTimeout > 0) {
			const timer = setTimeout(() => {
				setResendTimeout(resendTimeout - 1);
			}, 1000);
			return () => clearTimeout(timer);
		}
	}, [resendTimeout]);

	const resendMagicLink = async () => {
		setResendTimeout(60); // Reset the timer to 60 seconds
		try {
			const response = await fetch("/api/send-magic-link", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: toEmail,
					subject,
					message,
				}),
			});

			if (response.ok) {
				setMagicLink(true);
			} else {
				const errorText = await response.text();
				throw new Error(errorText);
			}
		} catch (error) {
			console.error(error);
			setMessage("Failed to resend magic link. Please try again.");
		}
	};

	const mailClientButtons = [
		{
			name: "Gmail",
			url: `https://mail.google.com/mail/u/0/#search/${fromEmail}`,
		},
		{
			name: "Outlook",
			url: `https://outlook.live.com/mail/0/inbox/search?query=${fromEmail}`,
		},
		{
			name: "Yahoo",
			url: `https://mail.yahoo.com/search?p=${fromEmail}`,
		},
		{
			name: "ProtonMail",
			url: `https://mail.proton.me/u/0/inbox?keyword=${fromEmail}`,
		},
	];

	return (
		<main className="mt-5 mb-10 mx-5">
			<section className="mt-[35px] lg:mt-[75px] lg:mx-[30px] flex flex-col items-center">
				<div className="max-w-max">
					<h1 className="text-center primary-text">Verify</h1>
					<h2 className="xs:max-lg:mt-[10px] mt-[20px] text-center secondary-text">
						{magicLink
							? `A magic link has been sent to ${toEmail}.`
							: "Sending magic link..."}
					</h2>
					{magicLink && (
						<div className="mt-4 flex flex-col items-center">
							<p>
								Please check your email. You can use the buttons
								below to open your email client:
							</p>
							<div className="mt-2 flex space-x-2">
								{mailClientButtons.map((button) => (
									<a
										key={button.name}
										href={button.url}
										target="_blank"
										rel="noopener noreferrer"
										className="p-2 bg-blue-500 text-white rounded-md"
									>
										{button.name}
									</a>
								))}
							</div>
						</div>
					)}
					{resendTimeout > 0 ? (
						<p className="mt-4 text-center">
							You can resend the magic link in {resendTimeout}{" "}
							seconds.
						</p>
					) : (
						<button
							onClick={resendMagicLink}
							className="mt-4 p-2 bg-blue-500 text-white rounded-md"
						>
							Resend Magic Link
						</button>
					)}
				</div>
			</section>
			{/* Display custom error if any*/}
			{error && (
				<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
					<div className="bg-white p-4 rounded-md">
						<p className="text-red-500">{error}</p>
						<button
							onClick={() => setError(null)}
							className="mt-2 p-2 bg-blue-500 text-white rounded-md"
						>
							Close
						</button>
					</div>
				</div>
			)}
		</main>
	);
};

export default Verify;
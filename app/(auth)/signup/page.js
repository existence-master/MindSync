"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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
        throw new Error((await response.text()) || "Something went wrong");
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
        throw new Error("Failed to initiate signup process. Please try again.");
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
          <div className="w-4/6">
            <h1 className="text-center primary-text mb-10 font-lora font-medium">
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
                for="username"
                className="md:w-4/6 xs:5/6 text-left text-xl mb-2 font-inter text-tawnyPort"
              >
                Username
              </label>
              <input
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-8 input md:w-4/6 xs:5/6 h-12"
                required
              />
              <label
                for="email"
                className="md:w-4/6 xs:5/6 text-left text-xl mb-2 font-inter text-tawnyPort"
              >
                Email
              </label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mb-8 input md:w-4/6 xs:5/6 h-12"
                required
              />
              <label
                for="password"
                className="md:w-4/6 xs:5/6 text-left text-xl mb-2 font-inter text-tawnyPort"
              >
                Password
              </label>
              <input
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-8 input md:w-4/6 xs:5/6 h-12"
                required
              />
              <button type="submit" className="primary-btn md:w-2/6 xs:w-3/4">
                Signup
              </button>
            </form>
            <div className="mt-4 flex flex-col items-center">
              <Link href="/login" className="text-blue-500">
                <span className="text-gray-500">Already have an account? </span>
                Login
              </Link>
            </div>
            <div className="text-center text-black mt-5 mb-5">Or</div>{" "}
            {/* Separator text */}
            <div className="flex flex-col items-center justify-center">
              <button
                className="primary-btn md:w-2/6 xs:w-3/4 flex flex-row justify-center items-center" // Styling for Google login button
                onClick={() => signIn("google")} // Sign in with Google on click
              >
                <NextImage
                  src="/images/googlelogo.webp" // Google logo source
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
            <ErrorDisplay errorMessage={error} handleError={handleError} />
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

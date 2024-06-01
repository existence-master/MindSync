"use client";

import { useState, useEffect } from "react";
import Navbar from "@components/Navbar"; // Navbar component
import NextImage from "next/image";
import ErrorDisplay from "@components/ErrorDisplay"; // Custom error component
import { signIn, useSession } from "next-auth/react"; // Next.js authentication utilities
import { useRouter } from "next/navigation";
import Link from "next/link"; // Link component for client-side navigation

const Login = () => {
  // States to store email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null); // State to store error

  const router = useRouter(); // Object to handle routing
  const session = useSession(); // Object to store user session

  useEffect(() => {
    // If the user is authenticated, redirect to the dashboard
    if (session.status === "authenticated") {
      router.push("/dashboard"); // Redirect to the dashboard
    }
  }, [session, router]); // Dependency array to re-run when session status changes

  // Handle error function
  const handleError = () => {
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Sign in using credentials and handle redirect
      const res = await signIn("credentials", {
        redirect: false, // Redirect upon successful sign-in
        email,
        password,
      });

      // Check if the sign-in was successful
      if (res.url) {
        router.push("/dashboard"); // Redirect to the dashboard on success
      }

      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Handle successful login (e.g., redirect to dashboard)
      console.log("Login successful:", data);
    } catch (err) {
      setError(err.message);
    }
  };

  const isValidEmail = (email) => {
    // Regular expression pattern to validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email);
  };

  // Handle forgot password
  const handleForgotPassword = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Validate email
    if (!isValidEmail(email)) {
      setError("Email is invalid"); // Set error message for invalid email
      return;
    }

    // Make a POST request to set the changePasswordFlow cookie
    const response = await fetch("/api/set-cookie", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "forgot-password-flow",
        value: "true",
        maxAge: 3600, // 1 hour
      }),
    });

    // Check if the cookie was set successfully
    if (response.ok) {
      // Redirect to the verify page with email and forgotPassword query parameters
      router.push(`/verify?email=${email}`);
    } else {
      setError("Failed to initiate password reset. Please try again.");
    }
  };

  return (
    <>
      <main className="mt-5 mb-10 mx-5">
        <Navbar />
        <section className="mt-[35px] lg:mt-[75px] lg:mx-[30px] flex flex-col items-center">
          <div className="w-4/6">
            <h1 className="text-center primary-text">Login</h1>
            <h2 className="xs:max-lg:mt-[10px] mt-[20px] text-center secondary-text">
              Login to continue to MindSync!
            </h2>
            <form
              className="mt-[20px] flex flex-col items-center w-full"
              onSubmit={handleSubmit}
            >
              <label
                for="email"
                className="md:w-4/6 xs:5/6 text-left text-xl mb-2 font-inter text-tawnyPort"
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mb-10 md:w-4/6 xs:5/6"
                required
              />
              <label
                for="password"
                className="md:w-4/6 xs:5/6 text-left text-xl mb-2 font-inter text-tawnyPort"
              >
                Password
              </label>
              <input
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-10 input md:w-4/6 xs:5/6"
                required
              />
              <button
                type="submit"
                className="primary-btn md:w-2/6 xs:w-3/4 text-xl"
              >
                Login
              </button>
            </form>
            <div className="mt-4 flex flex-col items-center">
              <Link href="/signup" className="text-blue-500">
                <span className="text-gray-500">Don't have an account?</span>{" "}
                Signup
              </Link>
              <button
                onClick={handleForgotPassword}
                className="text-blue-500 mt-2"
              >
                Forgot password?
              </button>
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
                Login with Google
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

export default Login;

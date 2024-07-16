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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State to store error

  const router = useRouter(); // Object to handle routing
  const session = useSession(); // Object to store user session

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

  // Handle error function
  const handleError = () => {
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true); // Set loading state to true

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
        throw new Error("Something went wrong");
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Reset loading state when the response is received
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
            <h1 className="text-center primary-text">Login</h1>
            <h2 className="xs:max-lg:mt-[10px] mt-[20px] text-center secondary-text">
              Login to continue to MindSync!
            </h2>
            <form
              className="mt-[20px] flex flex-col items-center w-full"
              onSubmit={handleSubmit}
            >
              <label
                htmlFor="email"
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
                className="input mb-10 md:w-4/6 xs:w-5/6"
                required
              />
              <label
                htmlFor="password"
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
                className="mb-10 input md:w-4/6 xs:w-5/6"
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

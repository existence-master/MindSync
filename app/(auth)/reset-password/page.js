"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getCookie } from "cookies-next";
import Navbar from "@components/Navbar"; // Navbar component
import NextImage from "next/image";
import ErrorDisplay from "@components/ErrorDisplay"; // Custom error component
import { useRouter, useSearchParams } from "next/navigation";

const ResetPassword = () => {
  // States to store new password and confirmation
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false); // State to track authorization status
  const [error, setError] = useState(null); // State to store error

  const router = useRouter(); // Object to handle routing
  const { status } = useSession(); // Hook to get the current session status
  const searchParams = useSearchParams(); // To get email from search parameters

  const email = searchParams.get("email");

  // If the user is authenticated, redirect to the dashboard

  if (status === "authenticated") {
    router.push("/dashboard");
  }

  useEffect(() => {
    const forgotPasswordFlowCookie = getCookie("forgot-password-flow"); // Retrieve the "forgot-password-flow" cookie
    if (forgotPasswordFlowCookie === "true") {
      setIsAuthorized(true); // Mark as authorized if any of the conditions are met
    } else {
      router.push("/login"); // Redirect to the login page if not authorized
    }
  }, [router, searchParams]);

  if (!isAuthorized) {
    return null;
  }

  // Handle error function
  const handleError = () => {
    setError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Send new password to the change-password endpoint
      let response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      response = await fetch("/api/set-cookie", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "forgot-password-flow",
        value: "false",
        maxAge: 3600, // 1 hour
      }),
      });
      
      if (response.ok) {
        // Redirect to login on successful password reset
        router.push("/login");
      } else {
        throw new Error("Something went wrong");
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
            <h1 className="text-center primary-text mb-8">Reset Password</h1>
            <h2 className="xs:max-lg:mt-[10px] mt-[20px] text-center secondary-text">
              Enter your new password to reset your account password!
            </h2>
            <form
              className="mt-[20px] flex flex-col items-center w-full"
              onSubmit={handleSubmit}
            >
              <label
                htmlFor="newPassword"
                className="md:w-4/6 xs:5/6 text-left text-xl mb-2 font-inter text-tawnyPort dark:text-paleRose"
              >
                New Password
              </label>
              <input
                type="password"
                placeholder="New Password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input mb-10 md:w-4/6 xs:5/6 dark:text-paleRose"
                required
              />
              <label
                htmlFor="confirmPassword"
                className="md:w-4/6 xs:5/6 text-left text-xl mb-2 font-inter text-tawnyPort dark:text-paleRose"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm New Password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mb-10 input md:w-4/6 xs:5/6 dark:text-paleRose"
                required
              />
              <button
                type="submit"
                className="primary-btn md:w-2/6 xs:w-3/4 text-xl"
              >
                Reset Password
              </button>
            </form>
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

export default ResetPassword;

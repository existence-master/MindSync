"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import { useSession } from "next-auth/react";
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
  const [resendTimeout, setResendTimeout] = useState(0); // Initial timeout for resending the magic link

  const fromEmail = "existence.mindsync@gmail.com";
  const { status } = useSession(); // Hook to get the current session status
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  // If the user is authenticated, redirect to the dashboard

  if (status === "authenticated") {
    router.push("/dashboard");
  }

  useEffect(() => {
    // Check the "signup-flow" and "forgot-password-flow" cookies to determine if the user is authorized
    const signupFlowCookie = getCookie("signup-flow"); // Retrieve the "signup-flow" cookie
    const forgotPasswordFlowCookie = getCookie("forgot-password-flow"); // Retrieve the "forgot-password-flow" cookie

    if (signupFlowCookie === "true" || forgotPasswordFlowCookie === "true") {
      setIsAuthorized(true); // Mark as authorized if any of the conditions are met
      setToEmail(email);
      if (signupFlowCookie === "true") {
        setSubject("Signup For MindSync");
        setMessage("Signup For MindSync");
      } else if (forgotPasswordFlowCookie === "true") {
        setSubject("Reset Password For MindSync");
        setMessage("Reset Password For MindSync");
      }
    } else {
      router.push("/login"); // Redirect to the login page if not authorized
    }
  }, [router, searchParams]);

  useEffect(() => {
    if (token) {
      const verifyToken = async () => {
        try {
          let response = await fetch("/api/verify-magic-link", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            // Check which flow the user is in
            const signupFlow = getCookie("signup-flow");
            const forgotPasswordFlow = getCookie("forgot-password-flow");

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
                const { email, password, username } = await response.json(); // Get user details from the server response
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
          } else {
            throw new Error("Failed to verify magic link");
          }
        } catch (error) {
          console.error("Invalid token", error);
          setError(
            "Invalid or expired token. Please request a new magic link."
          );
        }
      };
      verifyToken();
    } else if (toEmail && subject && message) {
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
            setResendTimeout(60);
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
  }, [token, router, toEmail]);

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

  if (!isAuthorized) {
    return null;
  }

  const mailClientButtons = [
    {
      name: "Gmail",
      url: `https://mail.google.com/mail/u/0/#search/${fromEmail}`,
      image: "/images/gmaillogo.svg",
    },
    {
      name: "Outlook",
      url: `https://outlook.live.com/mail/0/inbox/search?query=${fromEmail}`,
      image: "/images/outlooklogo.svg",
    },
    {
      name: "Yahoo",
      url: `https://mail.yahoo.com/search?p=${fromEmail}`,
      image: "/images/yahoologo.svg",
    },
    {
      name: "ProtonMail",
      url: `https://mail.proton.me/u/0/inbox?keyword=${fromEmail}`,
      image: "/images/protonmaillogo.svg",
    },
  ];

  return (
    <>
      <main className="mt-5 mb-10 mx-5">
        <section className="mt-[35px] lg:mt-[75px] lg:mx-[30px] flex flex-col items-center">
          <div className="max-w-max flex flex-col items-center justify-center">
            <h1 className="text-center primary-text mb-[50px]">Verify</h1>
            <h2 className="xs:max-lg:mt-[10px] mt-[20px] text-center secondary-text">
              {magicLink ? (
                "Check your email for the magic link!"
              ) : token ? (
                "Verifying magic link..."
              ) : (
                <>
                  Sending magic link...
                  <div
                    role="status"
                    className="w-full mt-20 flex flex-col items-center justify-center"
                  >
                    <svg
                      aria-hidden="true"
                      class="w-12 h-12 text-gray-200 animate-spin fill-tawnyPort"
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
                    <span class="sr-only">Loading...</span>
                  </div>
                </>
              )}
            </h2>
            {magicLink && (
              <div className="mt-4 flex flex-col items-center border border-black mb-10 md:w-[500px] md:h-[250px] xs:w-[350px] xs:h-[220px]">
                <div className="mb-4 flex flex-row justify-center mt-8 w-[500px]">
                  <span className="text-tawnyPort secondary-text w-[75px] ml-3">
                    From
                  </span>
                  <span className="text-tawnyPort secondary-text ml-2 mr-2">
                    :
                  </span>
                  <span className="text-gray-500 primary-text font-lora font-medium md:text-xl xs:text-sm">
                    {fromEmail}
                  </span>
                </div>
                <div className="mb-4 flex flex-row justify-center w-[500px]">
                  <span className="text-tawnyPort secondary-text w-[75px]">
                    Subject
                  </span>
                  <span className="text-tawnyPort secondary-text ml-2 mr-2">
                    :
                  </span>
                  <span className="text-gray-500 primary-text font-lora font-medium md:text-xl xs:text-sm">
                    {subject}
                  </span>
                </div>
                <div className="mb-4 flex flex-row justify-center w-[500px]">
                  <span className="text-tawnyPort secondary-text w-[75px] ml-2">
                    To
                  </span>
                  <span className="text-tawnyPort secondary-text ml-2 mr-3">
                    :
                  </span>
                  <span className="text-gray-500 primary-text font-lora font-medium md:text-xl xs:text-sm">
                    {toEmail}
                  </span>
                </div>

                <div className="mt-2 flex space-x-4 mb-8">
                  {mailClientButtons.map((button) => (
                    <a
                      key={button.name}
                      href={button.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-0 primary-btn bg-transparent"
                    >
                      <NextImage
                        src={button.image}
                        width={32}
                        height={32}
                        alt={button.name}
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {resendTimeout > 0 ? (
              <p className="mt-4 text-center">
                You can resend the magic link in {resendTimeout} seconds.
              </p>
            ) : magicLink ? (
              <button
                onClick={resendMagicLink}
                className="mt-4 p-2 primary-btn"
              >
                Resend Magic Link
              </button>
            ) : (
              ""
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

export default Verify;

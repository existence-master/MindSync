"use client"; // This component uses client-side rendering

import { useState } from "react"; // React hook for managing state

const ErrorDisplay = ({ errorMessage, handleError }) => {
  const [visible, setVisible] = useState(true); // State to manage the visibility of the error message

  // Function to handle dismissing the error message
  const handleDismiss = () => {
    setVisible(false); // Set visibility to false, hiding the error message
    handleError(); // Call the external error handling function
  };

  return (
    <>
      {visible && ( // Display only if visible is true
        <div
          className="fixed w-screen h-screen inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div
            className="mt-2 flex flex-col h-[150px] w-[400px] justify-center items-center bg-paleRose dark:bg-lividBrown rounded-xl border-2 border-tickleMePink p-2"
            style={{ zIndex: "9999999" }}
          >
            <p className="text-xl text-stilleto dark:text-paleRose mb-4">
              {errorMessage}
            </p>
            <button
              onClick={handleDismiss}
              className="relative inline-flex overflow-hidden rounded-lg h-12 p-[2px] hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#8A2846_0%,#FFE0E9_50%,#FF7AA2_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-stilleto px-3 py-1 text-xl font-medium text-paleRose backdrop-blur-3xl">
                Dismiss
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ErrorDisplay; // Export the ErrorDisplay component

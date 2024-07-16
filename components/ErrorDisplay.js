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
					style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
				>
					<div
						className="mt-2 flex flex-col h-[150px] w-[400px] justify-center items-center bg-paleRose dark:bg-lividBrown rounded-xl border-2 border-tickleMePink p-2"
						style={{ zIndex: "9999999" }}
					>
						<p className="text-xl text-stilleto mb-4">
							{errorMessage}
						</p>
						<button
							onClick={handleDismiss}
							className="primary-btn"
						>
							Dismiss
						</button>
					</div>
				</div>
			)}
		</>
	);
};

export default ErrorDisplay; // Export the ErrorDisplay component
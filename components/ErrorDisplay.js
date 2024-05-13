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
				<div className="flex flex-col h-[150px] w-[400px] justify-center items-center bg-paleRose rounded-xl border-2 border-tickleMePink p-2">
					{" "}
					{/* Error container */}
					<p className="text-xl text-stilleto mb-4">
						{errorMessage}
					</p>{" "}
					{/* Display the error message */}
					<button
						onClick={handleDismiss} // Call handleDismiss on button click
						className="primary-btn" // Button styling
					>
						Dismiss {/* Button label */}
					</button>
				</div>
			)}
		</>
	);
};

export default ErrorDisplay; // Export the ErrorDisplay component
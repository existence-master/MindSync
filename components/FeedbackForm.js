import { useState } from "react";

const FeedbackForm = ({ handleFeedbackSubmit, handleFeedbackCancel }) => {

    const [feedbackText, setFeedbackText] = useState("");
    
    const handleTextChange = (e) => {
        setFeedbackText(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        handleFeedbackSubmit(feedbackText);
    }

    const handleCancel = () => {
        handleFeedbackCancel();
    }

    return (
		<form
			className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
			onSubmit={handleSubmit}
		>
			<div className="bg-paleRose dark:bg-stilleto border-2 border-tickleMePink p-6 rounded-lg shadow-lg w-1/3">
				<h2 className="text-lg font-bold mb-4 text-center">
					We'd love to hear your feedback!
				</h2>
				<textarea
					className="w-full p-2 border border-tickleMePink rounded mb-4 dark:bg-lividBrown dark:text-white"
					value={feedbackText}
					onChange={handleTextChange}
					placeholder="Your feedback"
				/>
				<div className="flex justify-end space-x-4">
					<button
						type="submit"
						className="px-4 py-2 bg-stilleto text-white rounded hover:bg-tickleMePink"
					>
						Submit
					</button>
					<button
						type="button"
						className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-700"
						onClick={handleCancel}
					>
						Cancel
					</button>
				</div>
			</div>
		</form>
	);
}

export default FeedbackForm
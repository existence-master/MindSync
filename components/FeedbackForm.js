import { useState } from "react";

const FeedbackForm = ({ handleFeedbackSubmit, handleFeedbackCancel }) => {
  const [feedbackText, setFeedbackText] = useState("");

  const handleTextChange = (e) => {
    setFeedbackText(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFeedbackSubmit(feedbackText);
  };

  const handleCancel = () => {
    handleFeedbackCancel();
  };

  return (
    <form
      className="fixed xs:w-screen inset-0 flex items-center justify-center bg-black bg-opacity-50"
      style={{ zIndex: "9999999" }}
      onSubmit={handleSubmit}
    >
      <div className="bg-paleRose dark:bg-stilleto border-2 border-tickleMePink md:p-6 xs:w-[300px] xs:p-3 rounded-lg shadow-lg w-1/3">
        <h2 className="text-lg font-bold mb-4 text-center">
          We'd love to hear your feedback about this feature! You can't proceed to the desired page without submitting the feedback
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
            className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-tickleMePink bg-[linear-gradient(110deg,#8A2846,45%,#B9375E,55%,#522E38)] bg-[length:200%_100%] px-6 font-medium text-paleRose transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
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
};

export default FeedbackForm;

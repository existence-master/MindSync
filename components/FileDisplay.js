import React from "react";

const FileDisplay = ({ file, removeFile }) => {
  return (
    <div className="flex justify-between items-center mb-2 border-tickleMePink bg-[linear-gradient(110deg,#8A2846,45%,#B9375E,55%,#522E38)] bg-[length:200%_100%] rounded-xl p-2 animate-shimmer transition-colors">
      <span>{file.name}</span>
      <button
        onClick={removeFile}
        style={{ marginLeft: "10px", cursor: "pointer" }}
      >
        ❌
      </button>
    </div>
  );
};

export default FileDisplay;

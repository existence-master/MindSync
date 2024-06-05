import React from "react";

const FileDisplay = ({ file, removeFile }) => {
  return (
    <div className="flex justify-between items-center mb-2 bg-gray-300 rounded-xl p-2">
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

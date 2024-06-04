import React from "react";

const FileDisplay = ({ file, removeFile }) => {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				marginBottom: "5px",
			}}
		>
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
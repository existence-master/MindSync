"use client";

import { useRouter, useParams } from "next/navigation";

const Edit = () => {
	const { id } = useParams();
	return (
		<div className="p-4">
			<h1 className="text-2xl font-bold mb-4">Edit Mindmap</h1>
			<p>Editing mindmap with ID: {id}</p>
			{/* Implement your edit form here */}
		</div>
	);
};

export default Edit;

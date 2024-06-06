import { useState } from "react";
import Image from "next/image";

const MindmapCard = ({ mindmap, onDelete, onExport, onEdit }) => {
	const [showDropdown, setShowDropdown] = useState(false);
	const [showExportDropdown, setShowExportDropdown] = useState(false);
	const [showDialog, setShowDialog] = useState(false);

	const handleEdit = () => {
		onEdit(mindmap._id);
	};

	const handleDelete = () => {
		setShowDialog(false);
		setShowDropdown(false);
		setShowExportDropdown(false)
		onDelete(mindmap._id);
	};

	const handleExportClick = () => {
		setShowExportDropdown(!showExportDropdown);
	};

	const handleExport = (format) => {
		setShowExportDropdown(false);
		onExport(mindmap, format);
	};

	return (
		<div className="relative border rounded-lg p-4 shadow-lg">
			{mindmap.previewImageURL ? (
				<Image
					src={mindmap.previewImageURL}
					alt={mindmap.name}
					width={300}
					height={200}
				/>
			) : (
				<Image
					src="/images/savedicon.svg" /* Default image if preview is not available */
					alt={mindmap.name}
					width={300}
					height={200}
				/>
			)}
			<h3 className="mt-2 text-lg font-semibold">{mindmap.name}</h3>
			<button
				className="absolute top-2 right-2"
				onClick={() => {
					setShowDropdown(!showDropdown);
					setShowExportDropdown(false);
				}}
			>
				<Image
					src="/images/threedots.svg"
					width={20}
					height={20}
					alt="Options"
				/>
			</button>
			{showDropdown && (
				<div className="absolute right-2 top-8 bg-white shadow-lg rounded-lg p-2">
					<button
						onClick={handleEdit}
						className="block w-full text-left p-2"
					>
						Edit
					</button>
					<button
						onClick={() => setShowDialog(true)}
						className="block w-full text-left p-2"
					>
						Delete
					</button>
					<button
						onClick={handleExportClick}
						className="block w-full text-left p-2"
					>
						Export
					</button>
					{showExportDropdown && (
						<div className="absolute right-2 top-16 bg-white shadow-lg rounded-lg p-2">
							<button
								onClick={() => handleExport("svg")}
								className="block w-full text-left p-2"
							>
								Export as SVG
							</button>
							<button
								onClick={() => handleExport("png")}
								className="block w-full text-left p-2"
							>
								Export as PNG
							</button>
						</div>
					)}
				</div>
			)}
			{showDialog && (
				<div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
					<div className="bg-white p-6 rounded-lg shadow-lg">
						<h2 className="text-xl mb-4">Confirm Deletion</h2>
						<p>Are you sure you want to delete this mindmap?</p>
						<div className="flex justify-end gap-4 mt-4">
							<button
								onClick={() => setShowDialog(false)}
								className="secondary-btn"
							>
								Cancel
							</button>
							<button
								onClick={handleDelete}
								className="primary-btn"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default MindmapCard;

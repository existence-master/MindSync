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
    setShowExportDropdown(false);
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
    <div className="relative w-[300px] h-[400px] border rounded-lg p-4 shadow-lg border-stilleto flex flex-col justify-center items-center">
      <div className="w-full h-5/6 flex justify-center items-center">
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
            width={200}
            height={200}
          />
        )}
      </div>
      <div className="w-[300px] h-fit py-2 pb-2 translate-y-5 rounded-b-lg bg-stilleto px-4">
        <h3 className="primary-text text-xl mt-3 font-inter font-medium text-white">
          {mindmap.name}
        </h3>
        <h3 className="primary-text text-xl mt-3 font-inter font-medium text-white flex flex-row gap-2">
          <Image
            src="/images/calendaricon.svg" /* Default image if preview is not available */
            alt={mindmap.name}
            width={20}
            height={20}
          />
          {new Date(mindmap.createdAt).toLocaleString("en-US", {
            day: "2-digit",
            weekday: "short",
            year: "numeric",
            month: "short",
          })}
        </h3>
      </div>
      <button
        className="absolute top-2 right-2 bg-stilleto rounded-lg p-2"
        onClick={() => {
          setShowDropdown(!showDropdown);
          setShowExportDropdown(false);
        }}
      >
        <Image
          src="/images/threedotsvertical.svg"
          width={20}
          height={20}
          alt="Options"
        />
      </button>
      {showDropdown && (
        <div className="absolute right-2 top-8 bg-paleRose border-2 border-stilleto shadow-lg rounded-lg p-2">
          <button
            onClick={handleEdit}
            className="flex w-full text-right p-2 flex-row gap-2 primary-text text-lg font-inter font-medium text-stilleto"
          >
            <Image
              src="/images/editicon.svg"
              width={20}
              height={20}
              alt="Options"
              className="translate-y-0.5"
            />
            Edit
          </button>
          <button
            onClick={() => setShowDialog(true)}
            className="flex w-full text-right p-2 flex-row gap-2 primary-text text-lg font-inter font-medium text-stilleto"
          >
            <Image
              src="/images/deleteicon.svg"
              width={20}
              height={20}
              alt="Options"
              className="translate-y-0.5"
            />
            Delete
          </button>
          <button
            onClick={handleExportClick}
            className="flex w-full text-right p-2 flex-row gap-2 primary-text text-lg font-inter font-medium text-stilleto"
          >
            <Image
              src="/images/exporticon.svg"
              width={20}
              height={20}
              alt="Options"
              className="translate-y-0.5"
            />
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
          <div className="bg-white p-6 rounded-lg border-2 border-stilleto shadow-lg">
            <h2 className="primary-text text-xl font-inter font-medium mb-4">
              Confirm Deletion
            </h2>
            <p className="primary-text text-lg font-inter font-medium mb-4">
              Are you sure you want to delete this mindmap?
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowDialog(false)}
                className="secondary-btn border border-stilleto shadow-lg"
              >
                Cancel
              </button>
              <button onClick={handleDelete} className="primary-btn shadow-lg">
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

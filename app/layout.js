import "@styles/globals.css";
import Image from "next/image";

export const metadata = {
	title: "MindSync",
	description: "AI Based Mindmapping Tool",
};

export default function RootLayout({ children }) {
	return (
		<html lang="en">
			<head>
				<link
					rel="stylesheet"
					href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
					integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A=="
					crossOrigin="anonymous"
					referrerPolicy="no-referrer"
				/>
			</head>
			<body className="bg-paleRose">
				<div className="h-screen overflow-x-hidden overflow-y-auto relative">
					{/* Add a container div */}
					{children}
				</div>
			</body>
		</html>
	);
}

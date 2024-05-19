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
				/>
				<link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
				<link rel="icon" type="image/png" href="/images/favicon.png" />
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

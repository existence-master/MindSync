import "@styles/globals.css";
import AuthProvider from "@components/AuthProvider"; // Import AuthProvider component
import DarkModeProvider from "@components/DarkModeProvider";
import { auth } from "@auth";

export const metadata = {
  title: "MindSync",
  description: "AI Based Mindmapping Tool",
};

export default async function RootLayout({ children }) {
  const session = await auth(); // Get the server-side session

  return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link
					rel="stylesheet"
					href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
				/>
				<link
					rel="icon"
					type="image/svg+xml"
					href={`/images/favicon.svg`}
				/>
				<link
					rel="icon"
					type="image/png"
					href={`/images/favicon.png`}
				/>
			</head>
			<body className="bg-paleRose dark:bg-lividBrown">
				<DarkModeProvider>
					<AuthProvider session={session} basePath={process.env.AUTH_BASEPATH}>
						{" "}
						{/* Provide authentication context */}
						<div className="h-screen overflow-x-hidden overflow-y-auto relative">
							{/* Add a container div */}
							{children}
						</div>
						{/* Render the child components within the layout */}
					</AuthProvider>
				</DarkModeProvider>
			</body>
		</html>
  );
}

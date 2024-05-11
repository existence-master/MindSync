import "./globals.css";

export const metadata = {
  title: "MindSync",
  description: "AI Based Mindmapping Tool",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-paleRose overflow-x-hidden overflow-y-auto">
        {children}
      </body>
    </html>
  );
}

// SignoutButton.js

import { signOut } from "next-auth/react"; // Importing signOut function from NextAuth
import Image from "next/image"; // Importing Image component from Next.js

// The SignoutButton component provides a clickable icon to sign out the user
const SignoutButton = () => {
  // Function to handle the sign-out process
  const handleSignout = async () => {
    try {
      await signOut({ callbackUrl: "http://localhost:3000/" }); // Sign out and redirect to the specified callback URL
    } catch (error) {
      console.error("Error signing out:", error); // Log any errors encountered during sign-out
      // You could add additional error handling here, like displaying a message to the user
    }
  };

  // Returning a div containing the sign-out icon
  return (
    <div
      onClick={handleSignout}
      className="cursor-pointer relative w-[30px] h-[30px] flex flex-row gap-2"
    >
      {" "}
      {/* Container for the sign-out icon */}
      <Image
        src="/images/signout.svg" // Path to the sign-out icon
        className="cursor-pointer" // Changes cursor style to indicate interactivity
        width={20} // Width of the icon
        height={20} // Height of the icon
        alt="Sign out" // Alternative text for accessibility
      />
      <p className="text-lg font-inter font-bold translate-y-[1px] text-lividBrown dark:text-paleRose">
        Logout
      </p>
    </div>
  );
};

export default SignoutButton; // Exporting the SignoutButton component

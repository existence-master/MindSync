import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="flex justify-between items-center relative">
      <Image
        src="/images/logo.svg"
        width={75}
        height={75}
        alt="MindSync Logo"
      />
      <div className="hidden lg:flex justify-evenly items-center w-[50%]">
        {[
          ["Home", "/"],
          ["About", "/about"],
          ["Contact", "/contact"],
        ].map(([title, url]) => (
          <Link
            href={url}
            key={title.toLowerCase()}
            className="ternary-text dark:text-paleRose"
          >
            {title}
          </Link>
        ))}
      </div>
      <div className="lg:hidden relative">
        <button className="primary-btn" onClick={toggleMenu}>
          Menu
        </button>
        {menuOpen && (
          <div className="absolute top-full right-0 bg-white w-40 py-2 px-4 border border-gray-300 shadow-md">
            <ul className="flex flex-col gap-2">
              <li>
                <Link href="/" className="ternary-text dark:text-paleRose">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/login" className="ternary-text dark:text-paleRose">
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="ternary-text dark:text-paleRose"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/about" className="ternary-text dark:text-paleRose">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="ternary-text dark:text-paleRose"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
      <button className="hidden lg:block primary-btn">
        <Link href="/login">Login</Link>
      </button>
    </nav>
  );
};

export default Navbar;

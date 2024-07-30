"use client"; // Render on client side

import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconMoon, IconSun } from "@tabler/icons-react";

const Home = () => {
  const { setTheme, resolvedTheme } = useTheme("dark");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav
        className="dark:bg-lividBrown bg-paleRose border-b-2 rounded-b-lg border-tickleMePink fixed w-full z-20 top-0 start-0"
        style={{ zIndex: 200 }}
      >
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href="#"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <NextImage
              src="/images/logofull.svg"
              width={160}
              height={40}
              alt="MindSync Logo"
            />
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              onClick={() =>
                setTheme(resolvedTheme === "light" ? "dark" : "light")
              }
              className="px-4 mr-2 text-lividBrown dark:text-white transition-all duration-500"
            >
              {resolvedTheme === "light" ? (
                <>
                  <IconMoon className="w-6 h-6" />
                </>
              ) : (
                <>
                  <IconSun className="w-6 h-6" />
                </>
              )}
            </button>
            <Link href={"/login"}>
              <button
                type="button"
                className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-tickleMePink bg-[linear-gradient(110deg,#8A2846,45%,#B9375E,55%,#522E38)] bg-[length:200%_100%] px-6 font-medium text-paleRose transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
              >
                Login
              </button>
            </Link>
            <button
              data-collapse-toggle="navbar-sticky"
              type="button"
              className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 ${
                isOpen ? "hidden" : ""
              }`}
              aria-controls="navbar-sticky"
              aria-expanded="false"
              onClick={() => setIsOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-5 h-5"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 17 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 1h15M1 7h15M1 13h15"
                />
              </svg>
            </button>
          </div>
          <div
            className="items-center justify-between hidden w-full md:flex md:w-auto md:order-1"
            id="navbar-sticky"
          >
            <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-transparent md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0">
              <li>
                <a
                  href="/"
                  className="block py-2 px-3 text-tickleMePink rounded text-xl hover:drop-shadow-glow"
                  aria-current="page"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded text-xl hover:drop-shadow-glow"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contactus"
                  className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded text-xl hover:drop-shadow-glow"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          {isOpen && (
            <div className="fixed inset-0 flex z-50">
              <div className="fixed inset-0 bg-black opacity-50"></div>
              <div className="absolute inset-y-0 right-0 flex flex-col w-full max-w-lg">
                <button
                  data-collapse-toggle="navbar-sticky"
                  type="button"
                  className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                  aria-controls="navbar-sticky"
                  aria-expanded="false"
                  onClick={() => setIsOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="w-full dark:bg-lividBrown bg-paleRose rounded-lg">
                  <ul className="py-4 px-2 space-y-2">
                    <li>
                      <a
                        href="/"
                        className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded"
                      >
                        Home
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded"
                      >
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href="/contactus"
                        className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded"
                      >
                        Contact Us
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
      <main className="w-full h-full bg-paleRose dark:bg-lividBrown">
        <section className="md:h-[700px] sm:h-[900px] xs:h-[1200px] flex flex-col justify-center items-center">
          <p className="font-lora text-5xl text-center text-lividBrown dark:text-paleRose">
            About MindSync
          </p>
          <p className="font-inter xs:text-xl md:text-3xl md:w-2/3 xs:w-full xs:px-6 xs:text-justify mt-6 text-center text-lividBrown dark:text-paleRose">
            We set out with a mission to make mindmapping simpler for students
            everywhere. We believe that mindmapping is a powerful tool for
            organizing and understanding complex ideas, and we want to make it
            accessible to everyone. With MindSync, you can create, save, and
            edit mindmaps with ease, no matter where you are or what device you
            have. Join us on our mission to make mindmapping as simple and
            enjoyable as possible.
          </p>
        </section>
        <footer className="bg-paleRose shadow dark:bg-lividBrown">
          <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <a
                href="#"
                className="flex items-center xs:justify-center md:justify-normal mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
              >
                <NextImage
                  src="/images/logofull.svg"
                  width={200}
                  height={50}
                  alt="MindSync Logo"
                />
              </a>
              <ul className="flex flex-wrap items-center xs:justify-center md:justify-normal mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
                <li>
                  <a
                    href="#"
                    className="hover:underline me-4 md:me-6 dark:text-paleRose text-lividBrown"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline me-4 md:me-6 dark:text-paleRose text-lividBrown"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline me-4 md:me-6 dark:text-paleRose text-lividBrown"
                  >
                    Licensing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:underline dark:text-paleRose text-lividBrown"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <hr className="my-6 border-tickleMePink sm:mx-auto lg:my-8" />
            <span className="block text-sm text-gray-500 xs:text-center dark:text-gray-400">
              2024{" "}
              <a href="#" className="hover:underline">
                MindSync
              </a>
              . All Rights Reserved.
            </span>
            <span className="w-full flex flex-row md:items-center xs:justify-center gap-x-2 mt-4">
              Powered by{" "}
              <Link href={"https://existence-master.netlify.app/"}>
                <NextImage
                  src={`/images/logo-transparent${
                    resolvedTheme === "dark" ? ".png" : "-light.png"
                  }`}
                  width={100}
                  height={25}
                  alt="Existence Logo"
                  className="rounded-xl"
                />
              </Link>
            </span>
          </div>
        </footer>
      </main>
    </>
  );
};

export default Home;

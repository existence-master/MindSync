"use client"; // Render on client side

import ErrorDisplay from "@components/ErrorDisplay"; // Custom error component
import { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import MindmapCard from "@components/MindmapCard";
import { SAMPLE_IDS } from "@utils/constants.js";
import { useRouter } from "next/navigation";
import { InfiniteMovingCards } from "@components/InfiniteMovingCards";
import { BentoGrid, BentoGridItem } from "@components/BentoGrid";
import {
  IconAbc,
  IconClipboardCopy,
  IconFileBroken,
  IconSun,
  IconMoon,
  IconTableColumn,
} from "@tabler/icons-react";

const Home = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navbarStyle, setNavbarStyle] = useState("bg-transparent");
  const [sampleMindmaps, setSampleMindmaps] = useState([]);
  const [error, setError] = useState(null);
  const [mindmapCount, setMindmapCount] = useState(0);
  const router = useRouter();
  const [betaSignedUp, setBetaSignedUp] = useState(false);

  const handleEdit = (id) => {
    router.push(`/sample/${id}`);
  };

  const handleError = () => {
    setError(null);
  };

  useEffect(() => {
    const fetchMindmapCount = async () => {
      try {
        const response = await fetch("/api/mindmap-count");
        if (!response.ok) {
          throw new Error("Failed to fetch mindmap count");
        }
        const { count } = await response.json();
        setMindmapCount(count);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchMindmapCount();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isUserScrolled = window.scrollY > 0;
      setIsScrolled(isUserScrolled);
      setNavbarStyle(isUserScrolled ? "bg-white" : "bg-transparent");
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchSampleMindmaps = async (sampleIds) => {
      const sampleMindmapDetails = [];

      for (const id of sampleIds) {
        try {
          const response = await fetch(
            `/api/get-mindmap-details?id=${id}&sample=true`
          );
          if (!response.ok) {
            throw new Error(
              `Error fetching mindmap with ID ${id}: ${response.statusText}`
            );
          }
          const data = await response.json();
          sampleMindmapDetails.push(data);
        } catch (error) {
          setError(error.message);
        }
      }

      setSampleMindmaps(sampleMindmapDetails);
    };

    fetchSampleMindmaps(SAMPLE_IDS);
  }, []);

  console.log(sampleMindmaps);

  const Skeleton = ({ imageUrl }) => {
    const containerRef = useRef(null);
    const [imageWidth, setImageWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState(0);

    useEffect(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setImageWidth(width);
        setImageHeight(height);
      }
    }, []);

    return (
      <div
        ref={containerRef}
        className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl"
      >
        {imageUrl && (
          <NextImage
            src={imageUrl}
            alt="Mindmap Skeleton"
            width={imageWidth}
            height={imageHeight}
            className="bg-white rounded-xl py-2"
          />
        )}
      </div>
    );
  };
  const features = [
    {
      title: "Multimodal Inputs",
      description:
        "Text, image, audio and video to mindmap. Attach everything and create your mindmap.",
      header: <Skeleton imageUrl="/images/feature1.svg" />,
      icon: <IconAbc className="h-4 w-4 text-neutral-100" />,
    },
    {
      title: "Save Your Mindmap",
      description: "Save Mindmaps to your MindSync account with ease.",
      header: <Skeleton imageUrl="/images/feature2.svg" />,
      icon: <IconClipboardCopy className="h-4 w-4 text-neutral-100" />,
    },
    {
      title: "Export Your Mindmap",
      description: "Export Mindmaps in different formats.",
      header: <Skeleton imageUrl="/images/feature3.svg" />,
      icon: <IconFileBroken className="h-4 w-4 text-neutral-100" />,
    },
    {
      title: "AI Mindmap Editor",
      description:
        "Edit Mindmaps with textual instructions or multimodal inputs.",
      header: <Skeleton imageUrl="/images/feature4.svg" />,
      icon: <IconTableColumn className="h-4 w-4 text-neutral-100" />,
    },
    {
      title: "Dark and Light Mode",
      description: "Switch between light and dark mode.",
      header: <Skeleton imageUrl="/images/feature5.svg" />,
      icon: <IconSun className="h-4 w-4 text-neutral-100" />,
    },
  ];

  const testimonials = [
    {
      quote:
        "bro this app is awesome. mindmapping during class has never been easier.",
      name: "Sarthak Karandikar",
      title: "billionaire, playboy, philanthropist",
    },
    {
      quote:
        "saved me from failing all my classes. i owe my life to mindsync. :D",
      name: "kabeer ahmed merchant",
      title: "an average student",
    },
    {
      quote:
        "makes my daily work so much easier. now all i gotta do is record my lectures and i have a mindmap of the whole thing!",
      name: "Abhijeet Suryawanshi",
      title: "Your friendly neighbourhood data scientist",
    },
    {
      quote:
        "bro i designed the whole damn frontend, of course i will enjoy using it. mindsync is the best.",
      name: "Ojaswini Prabhune",
      title: "UI/UX Designer",
    },
    {
      quote:
        "i am so happy that i found mindsync. mindsync has saved my life in so many ways.",
      name: "Varad Deshpande",
      title: "casually became a trillionaire - thanks to mindsync",
    },
  ];

  return (
    <>
      <nav className={`${navbarStyle} fixed w-full z-20 top-0 start-0`}>
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a
            href="#"
            className="flex items-center space-x-3 rtl:space-x-reverse"
          >
            <NextImage
              src="/images/logofull.svg"
              width={200}
              height={50}
              alt="MindSync Logo"
            />
          </a>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
            <button
              onClick={() =>
                setTheme(resolvedTheme === "light" ? "dark" : "light")
              }
              className="px-4 mr-2 text-lividBrown dark:text-white transition-all duration-500"
              style={{ zIndex: 100 }}
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
                className="dark:text-lividBrown text-paleRose bg-stilleto hover:bg-lividBrown focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-paleRose dark:hover:bg-tickleMePink dark:focus:ring-stilleto"
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
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
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
                  href="#"
                  className="block py-2 px-3 text-tickleMePink rounded text-xl"
                  aria-current="page"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded text-xl"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block py-2 px-3 dark:text-paleRose text-lividBrown hover:text-tickleMePink rounded text-xl"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          {isOpen && (
            <div className="fixed inset-0 flex z-50">
              <div className="fixed inset-0 bg-black opacity-50"></div>
              <div className="absolute inset-y-0 right-0 flex flex-col w-full max-w-sm">
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
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <div className="w-full dark:bg-lividBrown bg-paleRose rounded-lg">
                  <ul className="py-4 px-2 space-y-2">
                    <li>
                      <a
                        href="#"
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
                        href="#"
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
        <section id="hero" className="flex flex-col items-center h-screen">
          <h1 className="mt-40 mb-4 text-5xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
            Mindmap your way to success
          </h1>
          <p className="text-2xl text-center dark:text-paleRose text-lividBrown font-inter">
            Organize your mind and{" "}
            <span className="font-bold">unleash your creativity</span> in one
            click.
          </p>
          <div className="flex flex-row gap-4 mt-8 mb-8">
            <Link
              href="#"
              className="bg-paleRose text-lividBrown p-2 rounded-lg text-xl px-4 hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter"
            >
              Take a Tour
            </Link>
            <Link
              href="/signup"
              className="bg-stilleto text-white dark:bg-paleRose dark:text-lividBrown p-2 rounded-lg text-xl px-4 hover:bg-tickleMePink transition-colors border-2 border-gray-400 duration-300 font-inter"
            >
              Get Started
            </Link>
          </div>
          <div>
            {" "}
            <div className="hidden md:block">
              <iframe
                width="800"
                height="515"
                src="https://www.youtube.com/embed/kHwuCagHWWg?si=si_k-Nimlmpu5qth"
                title="MindSync Demo Video"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              />
            </div>
            <div className="md:hidden">
              <iframe
                width="300"
                height="300"
                src="https://www.youtube.com/embed/kHwuCagHWWg?si=si_k-Nimlmpu5qth"
                title="MindSync Demo Video"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen
              />
            </div>
          </div>
        </section>
        <section
          id="samples"
          className="flex flex-col items-center bg-paleRose dark:bg-lividBrown md:h-screen xs:min-h-fit"
        >
          <h1 className="xs:mt-8 md:mt-40 mb-4 xs:text-3xl md:text-5xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
            Check out some sample Mindmaps here!
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-4 my-10">
            {sampleMindmaps.length > 0 ? (
              sampleMindmaps.map((mindmap, index) => (
                <MindmapCard
                  key={index}
                  mindmap={mindmap}
                  sample={true}
                  onEdit={handleEdit}
                />
              ))
            ) : (
              <p className="text-center">Loading sample mindmaps...</p>
            )}
          </div>
        </section>
        <section
          id="generated"
          className="flex flex-col items-center bg-paleRose dark:bg-lividBrown min-h-fit"
        >
          <h1 className="mt-20 mb-4 xs:text-3xl md:text-8xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
            {mindmapCount}
          </h1>
          <div className="flex flex-col justify-center items-center xs:text-3xl md:text-4xl font-inter gap-4 my-10 mb-20">
            Mindmaps Generated!
          </div>
        </section>
        <section
          id="features"
          className="flex md:flex-row xs:flex-col items-center justify-center bg-paleRose dark:bg-lividBrown md:h-screen xs:min-h-fit"
        >
          <h1 className="xs:block md:hidden mt-20 mb-4 xs:text-3xl md:text-8xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
            Features
          </h1>
          <BentoGrid className="max-w-4xl mx-auto px-2">
            {features.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                image={item.image}
                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
              />
            ))}
          </BentoGrid>
        </section>
        <section
          id="Testimonials"
          className="flex flex-col items-center justify-center bg-paleRose dark:bg-lividBrown min-h-fit"
        >
          <h1 className="mt-20 mb-4 xs:text-2xl md:text-5xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
            Testimonials
          </h1>
          <div className="h-[40rem] rounded-md flex flex-col antialiased bg-transparent dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
          </div>
        </section>
        <section
          id="betatest"
          className="flex flex-col items-center justify-center bg-paleRose dark:bg-lividBrown min-h-fit"
        >
          <h1 className="mt-20 mb-4 xs:text-2xl md:text-5xl font-lora font-normal text-center dark:text-paleRose text-lividBrown">
            Become a Beta Tester
          </h1>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const email = e.target.email.value;
              const response = await fetch("/api/send-beta-signup-mail", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
              });
              if (response.ok) {
                console.log("Thank you for signing up!");
                setBetaSignedUp(true);
              } else {
                console.log("Something went wrong. Please try again later.");
              }
            }}
            className="md:w-1/2 xs:w-3/4 mx-auto mt-20 mb-20"
          >
            <label
              for="email"
              className="block mb-2 text-xl font-inter font-medium text-gray-900 dark:text-white"
            >
              Your email
            </label>
            <input
              type="email"
              id="email"
              aria-describedby="helper-text-explanation"
              className="bg-paleRose border border-gray-300 text-paleRose text-xl rounded-lg focus:ring-tickleMePink focus:border-stilleto block w-full p-2.5  dark:bg-paleRose dark:border-tickleMePink dark:placeholder-gray-400 dark:text-lividBrown dark:focus:ring-tickleMePink dark:focus:border-stilleto"
              placeholder="name@mindsync.com"
            />

            <p
              id="helper-text-explanation"
              className="mt-2 text-sm text-gray-500 dark:text-gray-400"
            >
              We’ll never share your details. Read our{" "}
              <a
                href="#"
                className="font-medium text-tickleMePink hover:underline dark:text-tickleMePink"
              >
                Privacy Policy
              </a>
              .
            </p>
            <div className="w-full flex flex-col items-center justify-center mt-4">
              <button
                type="submit"
                className="bg-stilleto text-white font-medium py-2 px-4 rounded-lg hover:bg-tickleMePink focus:outline-none focus:ring-4 focus:ring-tickleMePink dark:text-lividBrown dark:bg-paleRose dark:hover:bg-tickleMePink dark:focus:ring-lividBrown"
              >
                {betaSignedUp
                  ? "Thanks for Signing Up!"
                  : "Join the Beta Program"}
              </button>
            </div>
          </form>
        </section>

        {error && (
          <ErrorDisplay errorMessage={error} handleError={handleError} />
        )}

        <footer className="bg-paleRose shadow dark:bg-lividBrown">
          <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <a
                href="#"
                className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
              >
                <NextImage
                  src="/images/logofull.svg"
                  width={200}
                  height={50}
                  alt="MindSync Logo"
                />
              </a>
              <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
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
            <span className="block text-sm text-gray-500 sm:text-center dark:text-gray-400">
              2024{" "}
              <a href="#" className="hover:underline">
                MindSync
              </a>
              . All Rights Reserved.
            </span>
            <span className="w-full flex flex-row md:items-center md:justify-center gap-x-2 mt-4">
              Powered by{" "}
              <Link href={"https://existence-master.netlify.app/"}>
                <NextImage
                  src={`/images/logo-transparent${
                    resolvedTheme === "dark" ? ".png" : "-light.svg"
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

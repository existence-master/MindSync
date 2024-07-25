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
				src={`${process.env.NEXT_PUBLIC_BASE_PATH}/images/logo.svg`}
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
								<Link
									href={`/`}
									className="ternary-text dark:text-paleRose"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href={`/login`}
									className="ternary-text dark:text-paleRose"
								>
									Login
								</Link>
							</li>
							<li>
								<Link
									href={`/signup`}
									className="ternary-text dark:text-paleRose"
								>
									Sign Up
								</Link>
							</li>
							<li>
								<Link
									href={`/about`}
									className="ternary-text dark:text-paleRose"
								>
									About
								</Link>
							</li>
							<li>
								<Link
									href={`/contact`}
									className="ternary-text dark:text-paleRose"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>
				)}
			</div>
			<a href={`/login`}>
				<button
					type="button"
					className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-tickleMePink bg-[linear-gradient(110deg,#8A2846,45%,#B9375E,55%,#522E38)] bg-[length:200%_100%] px-6 font-medium text-paleRose transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
				>
					Login
				</button>
			</a>
		</nav>
	);
};

export default Navbar;

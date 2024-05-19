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
						className="ternary-text"
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
								<Link href="/" className="ternary-text">
									Home
								</Link>
							</li>
							<li>
								<Link href="/about" className="ternary-text">
									About
								</Link>
							</li>
							<li>
								<Link href="/contact" className="ternary-text">
									Contact
								</Link>
							</li>
						</ul>
					</div>
				)}
			</div>
			<button className="hidden lg:block primary-btn">Login</button>
		</nav>
	);
};

export default Navbar;

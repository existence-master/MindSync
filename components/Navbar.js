import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
	return (
		<nav className="flex justify-between items-center">
			<Image src="/logo.svg" width={75} height={75} alt="MindSync Logo" />
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
			<div className="lg:hidden">
                <button className="primary-btn">
                    Menu
                </button>
			</div>
			<button className="hidden lg:block primary-btn">
				Login
			</button>
		</nav>
	);
};

export default Navbar;
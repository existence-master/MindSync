/** @type {import('next').NextConfig} */

const withPlugins = require("next-compose-plugins");
const withImages = require("next-images");

const nextConfig = {
	experimental: {
		serverComponentsExternalPackages: [
			"tesseract.js",
			"pdf-parse",
			"mammoth",
		],
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "res.cloudinary.com",
				port: "",
			},
		],
	},
};

module.exports = withPlugins([[withImages]], nextConfig);

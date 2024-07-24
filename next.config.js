/** @type {import('next').NextConfig} */

const withPlugins = require("next-compose-plugins");
const withImages = require("next-images");

const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
	assetPrefix: isProd ? "/mindsync/" : "",
	env: {
		NEXT_PUBLIC_BASE_PATH: isProd ? "/mindsync" : "",
	},
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

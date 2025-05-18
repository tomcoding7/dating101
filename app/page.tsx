import React from "react";
import Link from "next/link";

const avatars = [
  "/avatars/avatar1.jpg",
  "/avatars/avatar2.jpg",
  "/avatars/avatar3.jpg",
  "/avatars/avatar4.jpg",
  "/avatars/avatar5.jpg",
  "/avatars/avatar6.jpg",
  "/avatars/avatar7.jpg",
  "/avatars/avatar8.jpg",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Top Avatars Grid */}
      <div className="flex justify-center pt-12">
        <div className="grid grid-cols-4 gap-3 md:gap-6 w-64 md:w-96">
          {avatars.map((src, i) => (
            <img
              key={i}
              src={src}
              alt="User avatar"
              className="rounded-xl object-cover w-14 h-14 md:w-20 md:h-20 border-2 border-gray-800 shadow-lg"
            />
          ))}
        </div>
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center text-center px-6">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto mb-6"
        >
          <path
            d="M32 56C32 56 8 40 8 24C8 13.9543 16.9543 5 27 5C32.5228 5 38 8.47715 38 14C38 8.47715 43.4772 5 49 5C59.0457 5 68 13.9543 68 24C68 40 44 56 44 56H32Z"
            fill="url(#paint0_linear)"
          />
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="8"
              y1="5"
              x2="68"
              y2="56"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FFB6C1" />
              <stop offset="1" stopColor="#FF69B4" />
            </linearGradient>
          </defs>
        </svg>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Inclusive, reliable, safe.
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-md">
          Go beyond your social circle &amp; connect with people near and far.
        </p>
        <Link href="/signup">
          <button className="w-full md:w-72 py-3 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 text-white font-semibold text-lg shadow-lg transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400">
            Next
          </button>
        </Link>
      </div>

      {/* Bottom Login Link */}
      <div className="flex flex-col items-center pb-8">
        <span className="text-gray-400 mb-2">Already have an account?</span>
        <Link
          href="/login"
          className="text-pink-400 hover:underline font-medium"
        >
          Login
        </Link>
      </div>
    </div>
  );
}

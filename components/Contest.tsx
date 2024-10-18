/* eslint-disable react/no-unescaped-entities */ 
"use client";

import Image from "next/image";
import { useState } from "react";
import { signIn } from 'next-auth/react';
import config from "@/config";

const Contest = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState('');
  
  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    try {
      await signIn('google', { callbackUrl: config.auth.callbackUrl });
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('An error occurred with Google sign-in. Please try again.');
      setLoadingGoogle(false);
    }
  };

  return (
    <section
      className="py-12 md:py-24 space-y-12 md:space-y-24 max-w-7xl mx-auto bg-base-100"
      id="contest"
    >
      <div className="px-4 md:px-8">
        <h2 className="font-extrabold text-3xl md:text-4xl lg:text-6xl tracking-tight mb-8 md:mb-16 text-center md:text-left">
          Unlock the power of AI-driven creativity
          <span className="block md:inline bg-neutral text-neutral-content px-2 md:px-4 mt-2 md:mt-0 leading-relaxed whitespace-nowrap">
            for video projects
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Left Side - Text */}
          <div>
            <h3 className="text-xl md:text-2xl font-bold mb-4 text-center md:text-left">
              AI Film Trailer Contest – Create your masterpiece!
            </h3>
            <p className="text-base md:text-lg mb-4 md:mb-6 text-center md:text-left">
              We're hosting an exciting contest where you can showcase your creativity by making a film trailer using AI tools.
              <br /><br />
              Let your imagination run wild and produce something truly unique, blending the art of storytelling with the power of AI. Create captivating narratives that will leave your audience in awe!
              <br /><br />
              <strong>Due Date:</strong> November 15th, 11:59 PM EST
              <br /><br />
              <strong>1st Place:</strong> $1,000 <br />
              <strong>2nd Place:</strong> $600 <br />
              <strong>3rd Place:</strong> $300 <br /><br />
              Enter now for a chance to win and share your creation with the world!
              Judges will choose the 1st, 2nd, and 3rd place winners.
              <br /><br />
              Winners will be revealed on <strong>November 20th</strong>.
            </p>

            {error && (
              <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
            )}

            {!showConfirmation ? (
              <div className="mt-12">
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-full transition duration-300"
                >
                  Enter the Contest
                </button>
              </div>
            ) : (
              <div className="mt-12">
                <p className="text-lg font-semibold mb-4">Did you read the Guidelines below?</p>
                <button
                  onClick={handleGoogleLogin}
                  className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full mr-4 transition duration-300"
                  disabled={loadingGoogle}
                >
                  Yes, Proceed
                </button>
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition duration-300"
                >
                  No, Go Back
                </button>
              </div>
            )}
          </div>

          {/* Right Side - Image */}
          <div className="flex justify-center md:justify-end">
            <Image
              src="/ai-2.webp"
              alt="AI Film Trailer Contest"
              width={600}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contest;

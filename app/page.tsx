"use client";

import { Suspense, useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import { AiOutlineClose } from 'react-icons/ai';
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Problem from "@/components/Problem";
import FeaturesAccordion from "@/components/FeaturesAccordion";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

type Props = {
  searchParams: {
    error?: string;
  };
};

type ErrorKeys = 'OAuthCallback' | 'callback' | 'AccessDenied' | 'AggregateError' | 'Callback';

export default function Home({ searchParams }: Props) {
  const [showError, setShowError] = useState(true);

  const errorMap: Record<ErrorKeys, string> = {
    'OAuthCallback': 'Sorry, we could not log you in. Please try again or contact support if the issue persists.',
    'callback': 'Sorry, something went wrong during login. Please try again or use a different method.',
    'AccessDenied': 'Access was denied. Please check your permissions or contact support.',
    'AggregateError': 'Multiple errors occurred during login. Please try again later or contact support.',
    'Callback': 'Sorry, something went wrong during login. Please try again or contact support.'
  };

  const errorMessage = searchParams.error && errorMap[searchParams.error as ErrorKeys];

  // Handle dismissing the error message
  const handleDismissError = () => {
    setShowError(false);
  };

  return (
    <>
      {/* Display the error message if it exists and hasn't been dismissed */}
      {errorMessage && showError && (
        <div className="max-w-lg mx-auto bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mt-6 mb-6 sm:mt-4 sm:mb-8 relative animate-fadeIn shadow-md">
          <div className="flex items-start">
            <FiAlertCircle className="text-red-700 w-5 h-5 mr-2 mt-1" />
            <div className="flex-grow">
              <p className="text-sm font-medium">{errorMessage}</p>
              <p className="text-xs mt-1">
                Need help?{' '}
                <a href="mailto:support@obvious.app" className="text-blue-500 hover:underline">
                  Contact support
                </a>{' '}
                or try logging in again.
              </p>
            </div>
            <button onClick={handleDismissError} className="ml-4 text-red-500 hover:text-red-700">
              <AiOutlineClose className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <Suspense>
        <Header />
      </Suspense>

      <main>
        <Hero />
        <Problem />
        <FeaturesAccordion />
        <Pricing />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </>
  );
}
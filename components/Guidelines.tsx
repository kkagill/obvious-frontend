/* eslint-disable react/no-unescaped-entities */ 
import { useState } from "react";
import { signIn } from 'next-auth/react';
import config from "@/config";

const Guidelines = () => {
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
    <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-gray-200" id="guidelines">
      <div className="max-w-7xl mx-auto px-6 py-12 sm:px-8 sm:py-16 md:py-32 text-center">
        <h2 className="max-w-3xl mx-auto font-extrabold text-3xl sm:text-4xl md:text-6xl tracking-tight mb-6 md:mb-8">
          Guidelines
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        <div className="max-w-3xl mx-auto text-left">
          <h3 className="font-bold text-2xl mb-4">1. Visuals</h3>
          <ul className="list-disc ml-6 mb-8">
            <li className="mb-2">
              <span className="font-semibold">AI Visual Creation:</span> Every frame of your film must use AI-generated visuals as its foundation. Whether you’re creating environments, characters, or entire scenes, AI must play a core role in your film's visual composition.
            </li>
            <li className="mb-2">
              <span className="font-semibold">AI Character Movements:</span> The majority of the frame must be created or altered using AI.
            </li>
          </ul>

          <h3 className="font-bold text-2xl mb-4">2. Sound</h3>
          <ul className="list-disc ml-6 mb-8">
            <li>
              <span className="font-semibold">Effects:</span> You are free to use human or AI-generated voice-overs, as well as royalty-free music and sound effects.
            </li>
          </ul>

          <h3 className="font-bold text-2xl mb-4">3. Submissions</h3>
          <ul className="list-disc ml-6 mb-8">
            <li className="mb-2">
              <span className="font-semibold">Film Length:</span> Your film should be between 1 minute and 3 minutes in length. Please submit only one video.
            </li>
          </ul>

          <h3 className="font-bold text-2xl mb-4">4. Theme</h3>
          <ul className="list-disc ml-6 mb-8">
            <li className="mb-2">
              <span className="font-semibold">Thematic Focus:</span> The central theme of your film must be **LOVE**—whether it’s romance, family, friendship, or self-love.
            </li>
          </ul>

          <h3 className="font-bold text-2xl mb-4">5. Judging Criteria</h3>
          <ul className="list-disc ml-6 mb-8">
            <li className="mb-2">
              <span className="font-semibold">Judging:</span> Our panel of judges will evaluate each film based on both storytelling and technical execution in AI filmmaking. The top 3 winners will be chosen by the judges at their discretion.
            </li>
          </ul>

          <h3 className="font-bold text-2xl mb-4">6. Sharing Your Film</h3>
          <ul className="list-disc ml-6 mb-8">
            <li className="mb-2">
              <span className="font-semibold">Social Sharing:</span> You are required to share your film on at least one social media platform (e.g., YouTube, Instagram, TikTok, etc.). Make sure to tag us and use the hashtag <span className="font-semibold">#Obvious.app</span>.
            </li>
          </ul>

          <h3 className="font-bold text-2xl mb-4">7. Etc</h3>
          <ul className="list-disc ml-6">
            <li className="mb-2">
              <span className="font-semibold">Collaborations:</span> While you’re welcome to collaborate, it’s not required. Solo entries are just as welcome as team submissions.
            </li>
            <li className="mb-2">
              <span className="font-semibold">Proof of AI Generation:</span> If your film looks too perfect, we may ask for proof of AI involvement. Failure to provide such proof may result in disqualification.
            </li>
          </ul>
        </div>

        <div className="mt-12">
          <button
            onClick={handleGoogleLogin}
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-3 px-8 rounded-full transition duration-300"
            disabled={loadingGoogle}
          >
            Enter the Contest
          </button>
        </div>
      </div>
    </section>
  );
};

export default Guidelines;

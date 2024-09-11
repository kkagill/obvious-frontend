import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { FaGoogle, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import config from '@/config';
import useRecaptcha from '@/hooks/useRecaptcha';

interface SigninModalProps {
  onClose: () => void;
}

const SigninModal: React.FC<SigninModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingSignIn, setLoadingSignIn] = useState(false);  // Separate loading state for "Sign In"
  const [loadingGoogle, setLoadingGoogle] = useState(false);  // Separate loading state for "Sign in with Google"
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const recaptchaToken = useRecaptcha();
  const router = useRouter();

  // Handle form submission for email/password login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSignIn(true);
    setError('');

    // Ensure recaptchaToken is available before proceeding
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA');
      setLoadingSignIn(false);
      return;
    }

    try {
      const response = await fetch('/api/recaptcha', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recaptchaToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      if (!data.success) {
        console.error(`Signin failure with score: ${data.score}`);
        setError('Signin Failed. Please try again.');
        setLoadingSignIn(false);
        return;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An error occurred. Please try again.');
      setLoadingSignIn(false);
      return;
    }

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (res?.status !== 200) {
      setError('Incorrect email or password');
    } else {
      router.push(config.auth.callbackUrl);
    }

    setLoadingSignIn(false);
  };

  const handleGoogleLogin = async () => {
    setLoadingGoogle(true); // Show spinner for Google sign-in
    try {
      await signIn('google', { callbackUrl: config.auth.callbackUrl });
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('An error occurred with Google sign-in. Please try again.');
      setLoadingGoogle(false); // Stop spinner on failure
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close modal when clicking on the background
    >
      <div
        className="relative bg-white rounded-xl shadow-lg w-full max-w-sm p-6 transform transition-all duration-500 ease-in-out scale-95"
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal Heading */}
        <h2 className="text-lg font-bold text-center text-gray-800 mb-4">
          Welcome Back
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-1 relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="Enter your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 pt-5"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loadingSignIn || loadingGoogle} // Disable if either loading state is true
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors duration-300 ease-in-out focus:outline-none flex justify-center items-center"
          >
            {loadingSignIn ? (
              <>
                <FaSpinner className="animate-spin text-gray-200 text-xl mr-2" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="border-t border-gray-300 flex-grow"></div>
          <span className="mx-3 text-sm text-gray-500">or</span>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>

        {/* Google Login Button */}
        <div>
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center py-2 bg-red-500 text-white rounded-lg font-semibold shadow-md hover:bg-red-600 transition-colors duration-300 ease-in-out focus:outline-none"
            disabled={loadingGoogle || loadingSignIn} // Disable if either loading state is true
          >
            {loadingGoogle ? (
              <>
                <FaSpinner className="animate-spin text-white text-xl mr-2" />
                Signing in...
              </>
            ) : (
              <>
                <FaGoogle className="mr-2" />
                Sign in with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SigninModal;

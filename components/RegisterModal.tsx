import React, { useState } from 'react';
import { FaGoogle, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import config from '@/config';
import { signIn } from 'next-auth/react';
import useRecaptcha from '@/hooks/useRecaptcha';

interface RegisterModalProps {
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingSignUp, setLoadingSignUp] = useState(false);  // Separate loading state for "Sign Up"
  const [loadingGoogle, setLoadingGoogle] = useState(false);  // Separate loading state for "Sign up with Google"
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const recaptchaToken = useRecaptcha();
  const router = useRouter();

  // Client-side password validation
  const validatePassword = (value: string): string | null => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!value.match(/\d/)) {
      return 'Password must contain at least 1 number';
    }
    if (!value.match(/[a-zA-Z]/)) {
      return 'Password must contain at least 1 letter';
    }
    if (!value.match(/[!@#$%^&*(),.?":{}|<>]/)) {
      return 'Password must contain at least 1 special character';
    }
    return null;
  };

  // Handle form submission for registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSignUp(true);
    setError('');

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoadingSignUp(false);
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoadingSignUp(false);
      return;
    }

    // Ensure recaptchaToken is available before proceeding
    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA');
      setLoadingSignUp(false);
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
        console.error(`Registration failure with score: ${data.score}`);
        setError('Registration Failed. Please try again.');
        setLoadingSignUp(false);
        return;
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('An error occurred. Please try again.');
      setLoadingSignUp(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        const parsed = JSON.parse(text);
        setError(parsed.message);
      } else {
        const data = await res.json();
        if (!data.id) return;

        const signInRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (signInRes?.status !== 200) {
          setError('Login failed. Please try again.');
        } else {
          router.push(config.auth.callbackUrl);
        }
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }

    setLoadingSignUp(false);
  };

  const handleGoogleRegister = async () => {
    setLoadingGoogle(true); // Show spinner for Google register
    try {
      await signIn('google', { callbackUrl: config.auth.callbackUrl });
    } catch (error) {
      console.error('Google sign-up error:', error);
      setError('An error occurred with Google sign-up. Please try again.');
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
          Create an Account
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
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

          <div className="space-y-1 relative">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
              placeholder="Confirm your password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 pt-5"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loadingSignUp || loadingGoogle} // Disable if either loading state is true
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition-colors duration-300 ease-in-out focus:outline-none flex justify-center items-center"
          >
            {loadingSignUp ? (
              <>
                <FaSpinner className="animate-spin text-gray-200 text-xl mr-2" />
                Registering...
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="border-t border-gray-300 flex-grow"></div>
          <span className="mx-3 text-sm text-gray-500">or</span>
          <div className="border-t border-gray-300 flex-grow"></div>
        </div>

        {/* Google Register Button */}
        <div>
          <button
            onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center py-2 bg-red-500 text-white rounded-lg font-semibold shadow-md hover:bg-red-600 transition-colors duration-300 ease-in-out focus:outline-none"
            disabled={loadingGoogle || loadingSignUp} // Disable if either loading state is true
          >
            {loadingGoogle ? (
              <>
                <FaSpinner className="animate-spin text-white text-xl mr-2" />
                Signing up...
              </>
            ) : (
              <>
                <FaGoogle className="mr-2" />
                Sign up with Google
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;

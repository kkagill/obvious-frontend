import React, { useState, useEffect } from 'react';

interface EmailConfirmationProps {
  setOtherEmail: (email: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  otherEmail: string;
  role: string;
}

const EmailConfirmation: React.FC<EmailConfirmationProps> = ({
  otherEmail,
  role,
  setOtherEmail,
  nextStep,
  previousStep
}) => {
  const [isOtherEmailValid, setIsOtherEmailValid] = useState(false);

  // Determine label based on the role
  const emailLabel = role === 'Tenant' ? "Enter landlord's email:" : "Enter tenant's email:";

  const isValidEmail = (email: string) => {
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
  };

  useEffect(() => {
    setIsOtherEmailValid(isValidEmail(otherEmail));
  }, [otherEmail]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value;
    setOtherEmail(newEmail);
  };

  return (
    <div className="mx-auto w-full max-w-md p-4 bg-white shadow-md rounded-lg">
      <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2">
        {emailLabel}
      </label>
      <p className="text-xs md:text-sm sm:text-base mb-2">Proof of upload to the blockchain will be shared for transparency.</p>

      <input
        type="email"
        value={otherEmail}
        onChange={handleEmailChange}
        placeholder="Enter email"
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        required
      />
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={previousStep}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300">
          Back
        </button>
        <button
          onClick={() => { nextStep(); }}
          disabled={!otherEmail || !isOtherEmailValid}
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ${!otherEmail || !isOtherEmailValid ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default EmailConfirmation;

import LoadingSpinner from '@/components/LoadingSpinner';
import React, { useState, useEffect, useCallback } from 'react';

interface ClipAmountProps {
  setClipAmount: (ClipAmount: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  clipAmount: string;
}

const ClipAmount: React.FC<ClipAmountProps> = ({
  clipAmount,
  setClipAmount,
  nextStep,
  previousStep
}) => {
  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Allow empty string (for backspace/delete) or numbers between 1 and 3
    if (value === '' || (/^\d*$/.test(value) && parseInt(value, 10) >= 1 && parseInt(value, 10) <= 3)) {
      setClipAmount(value);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md p-4 bg-white shadow-md rounded-lg">
      <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2">
        How many clips need to be generated?
      </label>
      <p className='text-sm pt-2 mb-2'>Enter a number between 1 and 3</p>
      <div className="flex items-center">
        <input
          type="text"
          value={clipAmount}
          onChange={handleAmountChange}
          className="w-2/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          required
        />
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={previousStep}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300">
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!clipAmount}
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ${!clipAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ClipAmount;

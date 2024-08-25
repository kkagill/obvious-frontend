import LoadingSpinner from '@/components/LoadingSpinner';
import React, { useState, useEffect, useCallback } from 'react';

interface DurationProps {
  setDuration: (duration: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  duration: string;
}

const Duration: React.FC<DurationProps> = ({
  duration,
  setDuration,
  nextStep,
  previousStep
}) => {
  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;

    // Allow empty string (for backspace/delete) or numbers between 1 and 60
    if (value === '' || (/^\d*$/.test(value) && parseInt(value, 10) >= 1 && parseInt(value, 10) <= 60)) {
      setDuration(value);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md p-4 bg-white shadow-md rounded-lg">
      <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2">
        Choose clip length (optional):
      </label>
      <p className='text-sm pt-2 mb-2'>Enter a number between 1 and 60 (seconds)</p>
      <div className="flex items-center">
        <input
          type="text"
          value={duration}
          onChange={handleDurationChange}
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
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300`}
        >
          {duration ? 'Next' : 'Skip'}
        </button>
      </div>
    </div>
  );
};

export default Duration;

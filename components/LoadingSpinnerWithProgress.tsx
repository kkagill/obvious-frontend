import React from 'react';
import { ClipLoader } from 'react-spinners';

interface LoadingSpinnerWithProgressProps {
  text?: string;
  progress?: number;
}

const LoadingSpinnerWithProgress: React.FC<LoadingSpinnerWithProgressProps> = ({ text, progress }) => {
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <ClipLoader size={50} color={"#ffffff"} />
        <p className="text-white mt-4">{text}</p>
        {progress !== undefined && (
          <p className="text-white mt-2">{`Progress: ${progress.toFixed(2)}%`}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinnerWithProgress;

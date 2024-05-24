import React, { useState, useEffect, useCallback } from 'react';
import ButtonAccount from '../ButtonAccount';
import Credit from './Credit';
import apiClient from '@/libs/api';
import { FaSpinner } from 'react-icons/fa'; // Import a spinner icon (using react-icons as an example)

interface HeaderProps {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  setContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
}

const Header: React.FC<HeaderProps> = ({ setIsModalOpen, setTitle, setContent }) => {
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAvailableCredits = useCallback(async () => {
    try {
      setLoading(true);
      const { user }: { user: any } = await apiClient.get("/user");
      setAvailableCredits(user.availableCredits);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching available credits:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableCredits();
  }, [fetchAvailableCredits]);

  const handleCreditsClick = () => {
    setTitle("Prevent disputes before they arise");
    setContent(<Credit />);
    setIsModalOpen(true);
  };

  return (
    <header className="w-full flex justify-around items-center bg-white px-4 py-2 shadow-md">
      <ButtonAccount />
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <button
            className="bg-pink-500 text-white px-2 py-1 text-xs md:text-sm rounded-md font-semibold"
            onClick={handleCreditsClick}
          >
            Buy Credits
          </button>
        </div>
        <div className="flex items-center space-x-2">
          {loading ? (
            <FaSpinner className="animate-spin text-gray-700" />
          ) : (
            <span className="text-sm md:text-base font-semibold text-gray-700">
              {availableCredits} Credits
            </span>
          )}
        </div>
        <button className="bg-white p-1 rounded-full shadow-md">
          <span className="sr-only">Messages</span>
          <svg className="h-4 w-4 text-gray-500 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1zm2 5h8v1H6V9zm0 2h8v1H6v-1z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;

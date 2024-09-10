import React, { useState, useEffect } from 'react';
import { AiOutlineLogin } from 'react-icons/ai';
import { useSession, getSession } from 'next-auth/react';
import config from '@/config';
import Link from 'next/link';
import SigninModal from './SigninModal';

const ButtonSignin = ({
  text = "Sign in",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(session);
  const [randomColor, setRandomColor] = useState<string>('');

  useEffect(() => {
    const checkSession = async () => {
      const updatedSession = await getSession(); // Fetch the latest session data
      setCurrentSession(updatedSession);
    };
    checkSession();
  }, [status]);

  useEffect(() => {
    // Generate random color only on the client side
    const getRandomColor = () => {
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    setRandomColor(getRandomColor());
  }, []); // Empty dependency array ensures this runs only on the client side

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (status === "authenticated" && currentSession) {
    return (
      <Link
        href={config.auth.callbackUrl}
        className={`btn ${extraStyle ? extraStyle : ""}`}
      >
        <span
          className="w-6 h-6 flex justify-center items-center rounded-full shrink-0"
          style={{ backgroundColor: randomColor }} // Use client-generated random color
        >
          {currentSession?.user?.email?.charAt(0)}
        </span>

        {currentSession?.user?.email?.split('@')[0]}
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={openModal}
        className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${extraStyle}`}
      >
        <AiOutlineLogin className="h-5 w-5 mr-1" />
        {text}
      </button>

      {isModalOpen && <SigninModal onClose={closeModal} />}
    </div>
  );
};

export default ButtonSignin;

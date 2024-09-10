import React, { useState, useEffect } from 'react';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { useSession, getSession } from 'next-auth/react';
import RegisterModal from './RegisterModal';

const ButtonRegister = ({
  text = "Register",
  extraStyle,
}: {
  text?: string;
  extraStyle?: string;
}) => {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(session);

  useEffect(() => {
    const checkSession = async () => {
      const updatedSession = await getSession(); // Fetch the latest session data
      setCurrentSession(updatedSession);
    };
    checkSession();
  }, [status]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (status === 'authenticated' && currentSession) {
    return null;
  }

  return (
    <div>
      <button
        onClick={openModal}
        className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${extraStyle}`}
      >
        <AiOutlineUserAdd className="h-5 w-5 mr-1" />
        {text}
      </button>

      {isModalOpen && <RegisterModal onClose={closeModal} />}
    </div>
  );
};

export default ButtonRegister;

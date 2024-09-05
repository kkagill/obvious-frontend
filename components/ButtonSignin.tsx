import React, { useState } from 'react';
import { AiOutlineLogin } from 'react-icons/ai';
import { useSession } from 'next-auth/react';
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    if (status === "authenticated") {
      router.push(config.auth.callbackUrl);
    } else {
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (status === "authenticated") {
    return (
      <Link
        href={config.auth.callbackUrl}
        className={`btn ${extraStyle ? extraStyle : ""}`}
      >
        {session.user?.image ? (
          <img
            src={session.user?.image}
            alt={session.user?.name || "Account"}
            className="w-6 h-6 rounded-full shrink-0"
            referrerPolicy="no-referrer"
            width={24}
            height={24}
          />
        ) : (
          <span className="w-6 h-6 bg-base-300 flex justify-center items-center rounded-full shrink-0">
            {session.user?.name?.charAt(0) || session.user?.email?.charAt(0)}
          </span>
        )}
        {session.user?.name || session.user?.email || "Account"}
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
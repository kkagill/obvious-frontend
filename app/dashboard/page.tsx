"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import Modal from "@/components/Modal";
import Create from "@/components/dashboard/Create";
import { AiOutlineUpload } from "react-icons/ai";
//import apiClient from "@/libs/api";
import { FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import Clip from "@/components/dashboard/Clip";
import { useSession } from "next-auth/react";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [hasUploaded, setHasUploaded] = useState<boolean>(false);
  const [clipLoading, setClipLoading] = useState<boolean>(false);
  const [userClips, setUserClips] = useState<any[]>([]);

  const handleUploadClick = () => {
    setShowUpload(true);
  };

  const handleGoBack = () => {
    setShowUpload(false);
  };

  const fetchClips = useCallback(async () => {
    try {
      setClipLoading(true);

      const res = await fetch('/api/dashboard', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Network response was not ok');
      }
      const { data } = await res.json();

      setUserClips(data);
      setClipLoading(false);
      
      return true;
    } catch (error) {
      console.error('Error fetching available clips:', error);
      if (error.message === 'Unauthorized') {
        toast.error('An error occurred. Please logout and try again.', { duration: 5000 });
      } else {
        toast.error('An error occurred. Please try again.', { duration: 5000 });
      }
      setClipLoading(false);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchClips();
  }, []);

  useEffect(() => {
    const handleUploadSuccess = async () => {
      const isFetchSuccessful = await fetchClips();
      if (isFetchSuccessful) {
        toast.success("Upload successful! We'll notify you once the clips are generated.", { duration: 5000 });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setHasUploaded(false);
    };

    if (hasUploaded) {
      handleUploadSuccess();
    }
  }, [hasUploaded]);

  return (
    <div>
      <Header
        setIsModalOpen={setIsModalOpen}
        setTitle={setModalTitle}
        setContent={setModalContent}
        hasUploaded={hasUploaded}
      />

      <main>
        <div className="min-h-screen p-8 pb-24 pt-20">
          {showUpload ? (
            <Create handleGoBack={handleGoBack} setHasUploaded={setHasUploaded} />
          ) : (
            <div className="flex justify-center min-h-screen p-8 pb-24 pt-15">
              <div className="w-full max-w-4xl">
                <section className="flex justify-between items-center mb-8">
                  <h1 className="text-base md:text-2xl font-bold">Clips</h1>
                  <div className="flex space-x-2">
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 flex items-center text-xs py-1 sm:text-sm sm:py-2"
                      onClick={handleUploadClick}
                    >
                      <AiOutlineUpload className="h-4 w-4 mr-2 sm:h-5 sm:w-5" />
                      Upload
                    </button>
                  </div>
                </section>
                {clipLoading ? (
                  <div className="flex justify-center items-center min-h-[200px]">
                    <FaSpinner className="animate-spin text-gray-700 text-2xl" />
                  </div>
                ) : (
                  <Clip clips={userClips} />
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        title={modalTitle}
        content={modalContent}
      />
    </div>
  );
}

export default Dashboard;

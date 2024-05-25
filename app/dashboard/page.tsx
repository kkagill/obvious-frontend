"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/dashboard/Header";
import Modal from "@/components/Modal";
import Create from "@/components/dashboard/Create";
import Read from "@/components/dashboard/Read";
import Record from "@/components/dashboard/Record";
import { AiOutlineUpload } from "react-icons/ai";
import apiClient from "@/libs/api";
import { FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";

const Dashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [showUpload, setShowUpload] = useState<boolean>(false);
  const [hasUploaded, setHasUploaded] = useState<boolean>(false);
  const [recordLoading, setRecordLoading] = useState<boolean>(false);
  const [userRecords, setUserRecords] = useState<any[]>([]);

  const handleUploadClick = () => {
    setShowUpload(true);
  };

  const handleGoBack = () => {
    setShowUpload(false);
  };

  const handleReadClick = () => {
    setModalTitle("");
    setModalContent(<Read />);
    setIsModalOpen(true);
  };

  const fetchRecords = useCallback(async () => {
    try {
      setRecordLoading(true);
      const response: any[] = await apiClient.get("/record");
      setUserRecords(response);
      setRecordLoading(false);
    } catch (error) {
      console.error('Error fetching available record:', error);
      setRecordLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    if (hasUploaded) {
      fetchRecords();
      toast.success("Upload successful! We'll notify you once your files are fully uploaded to the blockchain.", { duration: 7000 });
      setHasUploaded(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                  <h1 className="text-base md:text-2xl font-bold">Records</h1>
                  <div className="flex space-x-2">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 flex items-center text-xs py-1 sm:text-sm sm:py-2"
                      onClick={handleReadClick}
                    >
                      Read
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 flex items-center text-xs py-1 sm:text-sm sm:py-2"
                      onClick={handleUploadClick}
                    >
                      <AiOutlineUpload className="h-4 w-4 mr-2 sm:h-5 sm:w-5" />
                      Create
                    </button>
                  </div>
                </section>
                {recordLoading ? (
                  <div className="flex justify-center items-center min-h-[200px]">
                    <FaSpinner className="animate-spin text-gray-700 text-2xl" />
                  </div>
                ) : (
                  <Record records={userRecords} />
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

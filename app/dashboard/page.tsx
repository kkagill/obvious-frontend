"use client";

import { useState } from "react";
import Header from "@/components/dashboard/Header";
import Modal from "@/components/Modal"; // Import Modal component
import Create from "@/components/dashboard/Create"; // Import the Upload component
import Read from "@/components/dashboard/Read"; // Import the Read component
import { AiOutlineUpload } from "react-icons/ai";

const Dashboard = () => {
  // Sample data for the table, replace this with your actual data
  const rentalUnits = [
    {
      id: 1,
      address: "123 Main St",
      images: 5,
      date: "2024-05-17",
    },
    {
      id: 2,
      address: "456 Oak St",
      images: 3,
      date: "2024-05-16",
    },
    // Add more records as needed
  ];

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  // State to manage showing the Create component
  const [showUpload, setShowUpload] = useState<boolean>(false);

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

  return (
    <div>
      <Header
        setIsModalOpen={setIsModalOpen}
        setTitle={setModalTitle}
        setContent={setModalContent}
      />

      <main>
        <div className="min-h-screen p-8 pb-24 pt-20">
          {showUpload ? (
            <Create handleGoBack={handleGoBack} />
          ) : (
            <div className="flex justify-center min-h-screen p-8 pb-24 pt-15">
              <div className="w-full max-w-4xl">
                <section className="flex justify-between items-center mb-8">
                  <h1 className="text-base md:text-2xl font-bold">Rental Units</h1>
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
                <section>
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Address</th>
                        <th>Images</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentalUnits.map((unit) => (
                        <tr key={unit.id}>
                          <td>{unit.id}</td>
                          <td>{unit.address}</td>
                          <td>{unit.images}</td>
                          <td>{unit.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
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

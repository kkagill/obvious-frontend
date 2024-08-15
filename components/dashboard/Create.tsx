"use client";

import { useState } from "react";
import { AiOutlineArrowLeft } from 'react-icons/ai';
import ProgressBar from "@/components/dashboard/steps/ProgressBar";
import Modal from "@/components/Modal";
import VideoUpload from "./steps/VideoUpload";
import Review from "./steps/Review";
import ClipAmount from "./steps/ClipAmount";
import Duration from "./steps/Duration";

interface CreateProps {
  handleGoBack: () => void;
  setHasUploaded: (flag: boolean) => void;
}

const TOTAL_STEPS = 4;

const Create: React.FC<CreateProps> = ({ handleGoBack, setHasUploaded }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [clipAmount, setClipAmount] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const previousStep = () => setCurrentStep(prev => prev - 1);

  return (
    <div>
      <main>
        <div className="min-h-screen p-8 pb-24 pt-15">
          <section className="flex justify-around items-center">
            <button
              onClick={handleGoBack}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-3 text-sm rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 flex items-center">
              <AiOutlineArrowLeft className="h-4 w-4 mr-1" />
              Dashboard
            </button>
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          </section>
          <section className={currentStep === 4 ? 'pt-5' : currentStep !== 1 ? 'pt-20' : 'pt-10'}>
            {currentStep === 1 && (
              <VideoUpload
                selectedVideos={selectedVideos}
                setVideos={setSelectedVideos}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}
            {currentStep === 2 && (
              <ClipAmount
                clipAmount={clipAmount}
                setClipAmount={setClipAmount}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}
            {currentStep === 3 && (
              <Duration
                duration={duration}
                setDuration={setDuration}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}
            {currentStep === 4 && (
              <Review
                clipAmount={clipAmount}
                duration={duration}
                selectedVideos={selectedVideos}
                previousStep={previousStep}
                handleGoBack={handleGoBack}
                setHasUploaded={setHasUploaded}
              />
            )}
          </section>
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

export default Create;

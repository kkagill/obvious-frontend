"use client";

import { useState } from "react";
import { AiOutlineArrowLeft } from 'react-icons/ai';
import RoleSelection from "@/components/dashboard/steps/RoleSelection";
import ImageUpload from "@/components/dashboard/steps/ImageUpload";
import EmailConfirmation from "@/components/dashboard/steps/EmailConfirmation";
import Address from "@/components/dashboard/steps/Address";
import SecurityDeposit from "@/components/dashboard/steps/SecurityDeposit";
import ProgressBar from "@/components/dashboard/steps/ProgressBar";
import Modal from "@/components/Modal";
import VideoUpload from "./steps/VideoUpload";
import Review from "./steps/Review";

interface CreateProps {
  handleGoBack: () => void;
}

const TOTAL_STEPS = 7;

const Create: React.FC<CreateProps> = ({ handleGoBack }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [role, setRole] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [securityDepositAmount, setSecurityDepositAmount] = useState<string>('');
  const [securityDepositCurrency, setSecurityDepositCurrency] = useState('USD');
  const [otherEmail, setOtherEmail] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
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
          <section className={currentStep === 7 ? 'pt-5' : currentStep !== 2 && currentStep !== 3 ? 'pt-20' : 'pt-10'}>
            {currentStep === 1 && (
              <RoleSelection
                role={role}
                setRole={setRole}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}
            {currentStep === 2 && (
              <ImageUpload
                selectedImages={selectedImages}
                setImages={setSelectedImages}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}
            {currentStep === 3 && (
              <VideoUpload
                selectedImages={selectedImages}
                selectedVideos={selectedVideos}
                setVideos={setSelectedVideos}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}
            {currentStep === 4 && (
              <Address
                address={address}
                setAddress={setAddress}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}
            {currentStep === 5 && (
              <SecurityDeposit
                securityDepositAmount={securityDepositAmount}
                securityDepositCurrency={securityDepositCurrency}
                setSecurityDepositAmount={setSecurityDepositAmount}
                setSecurityDepositCurrency={setSecurityDepositCurrency}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}
            {currentStep === 6 && (
              <EmailConfirmation
                otherEmail={otherEmail}
                role={role}
                setOtherEmail={setOtherEmail}
                nextStep={nextStep}
                previousStep={previousStep}
              />
            )}
            {currentStep === 7 && (
              <Review
                address={address}
                securityDepositAmount={securityDepositAmount}
                securityDepositCurrency={securityDepositCurrency}
                otherEmail={otherEmail}
                selectedImages={selectedImages}
                selectedVideos={selectedVideos}
                role={role}
                previousStep={previousStep}
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

import LoadingSpinner from '@/components/LoadingSpinner';
import apiClient from '@/libs/api';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface ReviewProps {
  address: string;
  securityDepositAmount: string;
  securityDepositCurrency: string;
  otherEmail: string;
  selectedImages: File[];
  selectedVideos: File[];
  role: string;
  previousStep: () => void; 
}

const Review: React.FC<ReviewProps> = ({
  address,
  securityDepositAmount,
  securityDepositCurrency,
  otherEmail,
  selectedImages,
  selectedVideos,
  role,
  previousStep,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState(false);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalVideoSeconds, setTotalVideoSeconds] = useState(0);

  const emailLabel = role === 'Tenant' ? "Landlord Email:" : "Tenant Email:";

  const truncateFileName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    const extIndex = name.lastIndexOf('.');
    const ext = extIndex !== -1 ? name.slice(extIndex) : '';
    return name.slice(0, maxLength - ext.length - 3) + '...' + ext;
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    const calculateCredits = async () => {
      setLoading(true);
      let totalCredits = selectedImages.length;
      let totalSeconds = 0;

      for (const file of selectedVideos) {
        const duration = await getVideoDuration(file);
        totalSeconds += duration;
        totalCredits += duration;
      }

      setTotalVideoSeconds(Math.floor(totalSeconds));
      setTotalCredits(Math.floor(totalCredits));
      setLoading(false);
    };

    calculateCredits();
  }, [selectedImages, selectedVideos]);

  const onUpload = async () => {
    // video is optional
    if (selectedImages.length === 0) {
      return;
    }

    setIsUploading(true);
    const formData = new FormData();

    formData.append('role', role);
    formData.append('rentalAddress', address);
    formData.append('securityDeposit', securityDepositAmount);
    formData.append('currency', securityDepositCurrency);
    formData.append('otherPartyEmail', otherEmail);
    formData.append('totalCredits', String(totalCredits));

    selectedImages.forEach((image) => {
      formData.append('image', image);
    });

    if (selectedVideos.length > 0) {
      formData.append('totalVideoSeconds', String(totalVideoSeconds));

      selectedVideos.forEach((video) => {
        formData.append('video', video);
      });
    }

    try {
      await apiClient.post('/s3', formData);
      setIsUploading(false);
      toast.success('Upload successful!');
    } catch (error) {
      setIsUploading(false);
      toast.error('Upload failed, please try again.');
      console.log('imageUpload' + error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative container mx-auto max-w-5xl py-10 px-4 sm:px-6 lg:px-8">
        {isUploading && (
          <LoadingSpinner text="Uploading. Please do not close your browser until the upload has completed." />
        )}
        <div className={`bg-transparent sm:bg-white sm:shadow-lg sm:rounded-lg sm:p-8 ${isUploading ? 'blur-md' : ''}`}>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
            Review Your Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6 pt-10">
            <div>
              <h3 className="text-md sm:text-lg font-semibold text-gray-700">My Role</h3>
              <p className="text-sm sm:text-base text-gray-600">{role}</p>
            </div>
            <div>
              <h3 className="text-md sm:text-lg font-semibold text-gray-700">Rental Address</h3>
              <p className="text-sm sm:text-base text-gray-600">{address}</p>
            </div>
            <div>
              <h3 className="text-md sm:text-lg font-semibold text-gray-700">Security Deposit</h3>
              <p className="text-sm sm:text-base text-gray-600">{securityDepositAmount} {securityDepositCurrency}</p>
            </div>
            <div>
              <h3 className="text-md sm:text-lg font-semibold text-gray-700">{emailLabel}</h3>
              <p className="text-sm sm:text-base text-gray-600">{otherEmail}</p>
            </div>
            <div>
              <h3 className="text-md sm:text-lg font-semibold text-gray-700">Total Video Seconds</h3>
              <p className="text-sm sm:text-base text-gray-600">{totalVideoSeconds}</p>
            </div>
            <div>
              <h3 className="text-md sm:text-lg font-semibold text-gray-700">Total Credits Charged</h3>
              <p className="text-sm sm:text-base text-gray-600">{totalCredits}</p>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-md sm:text-lg font-semibold text-gray-700 mb-4">{selectedImages.length} Image File(s)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {selectedImages.map((image, index) => (
                <div key={index} className="relative border rounded-lg overflow-hidden shadow-sm">
                  <img src={URL.createObjectURL(image)} alt="" className="h-32 w-full object-cover sm:h-40" />
                  <p className="text-center text-xs sm:text-sm mt-2 p-2 text-gray-600 truncate">{truncateFileName(image.name, 15)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-md sm:text-lg font-semibold text-gray-700 mb-4">{selectedVideos.length} Video File(s)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {selectedVideos.map((video, index) => (
                <div key={index} className="relative border rounded-lg overflow-hidden shadow-sm">
                  <video src={URL.createObjectURL(video)} className="h-32 w-full object-cover sm:h-40" controls />
                  <p className="text-center text-xs sm:text-sm mt-2 p-2 text-gray-600 truncate">{truncateFileName(video.name, 15)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 pt-5">
            <button
              onClick={previousStep}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300">
              Back
            </button>
            <button
              onClick={() => { onUpload(); }}
              className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300}`}
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;

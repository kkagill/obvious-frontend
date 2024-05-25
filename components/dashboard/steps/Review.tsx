import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/libs/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import LoadingSpinnerWithProgress from '@/components/LoadingSpinnerWithProgress';

interface ReviewProps {
  address: string;
  securityDepositAmount: string;
  securityDepositCurrency: string;
  otherEmail: string;
  selectedImages: File[];
  selectedVideos: File[];
  role: string;
  previousStep: () => void;
  handleGoBack: () => void;
  setHasUploaded: (flag: boolean) => void;
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
  handleGoBack,
  setHasUploaded,
}) => {
  const maxAttempts = 2;

  const [loading, setLoading] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState(false);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalVideoSeconds, setTotalVideoSeconds] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [uploadFailed, setUploadFailed] = useState(false);
  const uploadedFileKeysRef = useRef<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [filesToUpload, setFilesToUpload] = useState<{ file: File, key: string, url: string }[]>([]);

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

  const uploadFileToS3 = async (file: File, url: string, key: string, index: number) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(prevProgress => {
            const newProgress = [...prevProgress];
            newProgress[index] = progress;
            return newProgress;
          });
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          uploadedFileKeysRef.current.push(key);
          resolve();
        } else {
          reject(new Error('Failed to upload file to S3'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Failed to upload file to S3'));
      };

      xhr.send(file);
    });
  };

  const deleteUploadedFiles = async (keys: string[]) => {
    try {
      await apiClient.post('/s3/delete', { keys });
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  };

  const onUpload = async () => {
    if (selectedImages.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadFailed(false);
    uploadedFileKeysRef.current = [];
    setUploadProgress(new Array(selectedImages.length + selectedVideos.length).fill(0));

    const imageTypes = selectedImages.map(image => image.type);
    const videoTypes = selectedVideos.map(video => video.type);

    try {
      const response = await apiClient.post('/s3/signed-url', {
        imageTypes,
        videoTypes,
      });

      const presignedUrls = response.data;
      const files = [
        ...selectedImages.map((file, i) => ({ file, url: presignedUrls[i].url, key: presignedUrls[i].key })),
        ...selectedVideos.map((file, i) => ({ file, url: presignedUrls[selectedImages.length + i].url, key: presignedUrls[selectedImages.length + i].key }))
      ];

      setFilesToUpload(files);

      for (let i = 0; i < files.length; i++) {
        await uploadFileToS3(files[i].file, files[i].url, files[i].key, i);
      }

      const uploadedFiles = files.map((fileData, index) => ({
        fileName: fileData.file.name,
        fileExtension: fileData.file.type.split('/')[1],
        s3Key: fileData.key,
        s3Location: fileData.url,
        type: index < selectedImages.length ? 'IMAGE' : 'VIDEO',
      }));

      await apiClient.post('/s3/upload', {
        role,
        address,
        securityDepositAmount,
        securityDepositCurrency,
        otherEmail,
        totalCredits,
        totalVideoSeconds,
        uploadedFiles,
      });

      setIsUploading(false);
      setHasUploaded(true);
      handleGoBack();
    } catch (error) {
      console.log({ error })
      // this is to display error message only once if error messge is from server /s3/upload 
      if (error?.message !== 'Upload failed. Please try again.') {
        if (attempts !== maxAttempts) {
          toast.error("Upload failed. Please try again.");
        }
      }

      // Delete uploaded files if an error occurs
      await deleteUploadedFiles(uploadedFileKeysRef.current);

      setAttempts((prevAttempts) => prevAttempts + 1);
      setIsUploading(false);
      setUploadFailed(true);

      if (attempts === maxAttempts) {
        toast.error('Could not upload. Please contact our support.', { duration: 5000 });
        setTimeout(() => {
          setAttempts(0);
          handleGoBack();
        }, 4000);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const overallProgress = uploadProgress.reduce((acc, progress) => acc + progress, 0) / uploadProgress.length;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative container mx-auto max-w-5xl py-10 px-4 sm:px-6 lg:px-8">
        {isUploading && (
          <LoadingSpinnerWithProgress
            text="Uploading. Do not close your browser until the upload is complete."
            progress={overallProgress}
          />
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
                  {isUploading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-200">
                      <div
                        className="bg-blue-500 h-1"
                        style={{ width: `${uploadProgress[index] || 0}%` }}
                      />
                    </div>
                  )}
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
                  {isUploading && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-200">
                      <div
                        className="bg-blue-500 h-1"
                        style={{ width: `${uploadProgress[selectedImages.length + index] || 0}%` }}
                      />
                    </div>
                  )}
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
            {!uploadFailed ? (
              <button
                onClick={() => { onUpload(); }}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 sm:px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300">
                Confirm Payment
              </button>
            ) : (
              <button
                onClick={() => { onUpload(); }}
                className={`${attempts >= 3 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'
                  } text-white font-bold py-2 px-2 sm:px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300`}
                disabled={attempts >= 3}
              >
                Upload Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;

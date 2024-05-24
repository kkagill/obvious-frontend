import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import apiClient from '@/libs/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ImageUploadProps {
  selectedImages: File[];
  setImages: React.Dispatch<React.SetStateAction<File[]>>;
  nextStep: () => void;
  previousStep: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ selectedImages, setImages, nextStep, previousStep }) => {
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [loadingCredits, setLoadingCredits] = useState<boolean>(true);
  const [rejectionMessages, setRejectionMessages] = useState<string[]>([]);
  const [totalCreditsNeededMessage, setTotalCreditsNeededMessage] = useState<string>('');
  const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB limit
  const effectRan = useRef(false);

  const fetchAvailableCredits = useCallback(async () => {
    try {
      const { user }: { user: any } = await apiClient.get("/user");
      setAvailableCredits(user.availableCredits);
    } catch (error) {
      console.error('Error fetching available credits:', error);
    } finally {
      setLoadingCredits(false);
    }
  }, []);

  useEffect(() => {
    if (effectRan.current) return;
    effectRan.current = true;

    const initialize = async () => {
      await fetchAvailableCredits();
    };

    initialize();
  }, [fetchAvailableCredits]);

  useEffect(() => {
    if (!loadingCredits) {
      if (selectedImages.length > availableCredits) {
        const creditsNeeded = selectedImages.length - availableCredits;
        const msg = `${creditsNeeded} more credit(s) needed to continue. Please purchase more credits.`;
        setTotalCreditsNeededMessage(msg);
        toast.error(msg, { duration: 4000 });
      } else {
        setTotalCreditsNeededMessage('');
      }
    }
  }, [availableCredits, loadingCredits]);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      setRejectionMessages([]);
      setTotalCreditsNeededMessage('');

      const newFiles = acceptedFiles.filter(file =>
        !selectedImages.some(existingFile => existingFile.name === file.name)
      );

      setImages(prev => [...prev, ...newFiles]);

      if (selectedImages.length + newFiles.length > availableCredits) {
        const creditsNeeded = (selectedImages.length + newFiles.length) - availableCredits;
        const msg = `${creditsNeeded} more credit(s) needed to continue. Please purchase more credits.`;
        setTotalCreditsNeededMessage(msg);
        toast.error(msg, { duration: 4000 });
      }

      const messages = fileRejections.flatMap(({ file, errors }) =>
        errors.map(e => `${file.name}: ${e.message}`)
      );
      setRejectionMessages(messages);
    },
    maxSize: FILE_SIZE_LIMIT,
    accept: {
      'image/*': []
    },
  });

  const style = useMemo(
    () => ({
      ...(isDragAccept ? { borderColor: "#00e676" } : {}),
      ...(isDragReject ? { borderColor: "#ff1744" } : {}),
    }),
    [isDragAccept, isDragReject]
  );

  const truncateFileName = (name: string, maxLength: number) => {
    if (name.length <= maxLength) return name;
    const extIndex = name.lastIndexOf('.');
    const ext = extIndex !== -1 ? name.slice(extIndex) : '';
    return name.slice(0, maxLength - ext.length - 3) + '...' + ext;
  };

  if (loadingCredits) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto w-[1200px] max-w-[90%] my-0">
      <p className="text-red-500 text-center text-xs md:text-sm lg:text-base">{totalCreditsNeededMessage}</p>

      <div {...getRootProps({
        className: `dropzone w-full h-[10rem] my-[2rem] mx-0 bg-[#eee] border-[2px] border-dashed border-[#aaa] cursor-pointer flex ${isDragActive ? "justify-center items-center" : "flex-col items-center justify-start"
          } text-[#333] font-medium`, style
      })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop file(s) here ...</p>
        ) : (
          <>
            <p className="text-center text-sm md:text-base lg:text-lg p-6">
              Drag and drop <span className="text-red-500 font-bold">image</span> files here, or click to select files
            </p>
            <p className="text-center text-xs md:text-sm lg:text-base">Each file should be under 5 MB</p>
            <p className="text-center text-xs md:text-sm lg:text-base">1 credit charged per image file</p>
          </>
        )}
      </div>

      {rejectionMessages.length > 0 && (
        <div className="text-red-500">
          <ul>
            {rejectionMessages.map((msg, index) => (
              <li key={index}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 mb-4 w-full">
        <button onClick={previousStep} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300">
          Back
        </button>
        <div className="flex gap-2">
          {selectedImages.length > 0 && (
            <button onClick={() => { setImages([]); setRejectionMessages([]); setTotalCreditsNeededMessage(''); }} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300">
              Reset
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={selectedImages.length === 0 || selectedImages.length > availableCredits}
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ${selectedImages.length === 0 || selectedImages.length > availableCredits ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>

      {selectedImages.length > 0 &&
        <p className="text-left text-gray-800 mt-5 mb-5">
          <strong>{selectedImages.length}</strong> {selectedImages.length === 1 ? 'image' : 'images'}, <strong>{selectedImages.length}</strong> {selectedImages.length === 1 ? 'credit' : 'credits'} required.
        </p>
      }

      <div className="images grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] w-full gap-[1rem]">
        {selectedImages.length > 0 &&
          selectedImages.map((image, index) => (
            <div key={index} className="relative">
              <img src={URL.createObjectURL(image)} alt="" className="h-[15rem] w-full object-cover" />
              <p className="text-center text-sm mt-1">{truncateFileName(image.name, 15)}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ImageUpload;

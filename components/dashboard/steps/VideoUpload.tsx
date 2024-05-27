import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import apiClient from '@/libs/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface VideoUploadProps {
  selectedImages: File[];
  selectedVideos: File[];
  setVideos: React.Dispatch<React.SetStateAction<File[]>>;
  nextStep: () => void;
  previousStep: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ selectedImages, selectedVideos, setVideos, nextStep, previousStep }) => {
  const [rejectionMessages, setRejectionMessages] = useState<string[]>([]);
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [totalVideoSeconds, setTotalVideoSecondsState] = useState<number>(0);
  const [totalCreditsNeededMessage, setTotalCreditsNeededMessage] = useState<string>('');
  const [stepSkipped, setStepSkipped] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState<boolean>(true);
  const FILE_SIZE_LIMIT = 100 * 1024 * 1024; // 100 MB limit
  const IMAGE_CREDIT_COST = 1; // 1 credit per image
  const MAX_FILE_COUNT = 5; // Maximum number of files allowed
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
    const calculateCredits = async () => {
      if (availableCredits) {
        let totalCredits = selectedImages.length * IMAGE_CREDIT_COST;
        let totalSeconds = 0;

        for (const file of selectedVideos) {
          const duration = await getVideoDuration(file);
          totalSeconds += duration;
          totalCredits += duration;
        }

        setTotalVideoSecondsState(Math.floor(totalSeconds));
        totalCredits = Math.floor(totalCredits);

        if (totalCredits > availableCredits) {
          const creditsNeeded = totalCredits - availableCredits;
          const msg = `${creditsNeeded} more credit(s) needed to continue. Please purchase more credits.`;
          setTotalCreditsNeededMessage(msg);
          toast.error(msg, { duration: 4000 });
        } else {
          setTotalCreditsNeededMessage('');
        }
      }
    };

    calculateCredits();
  }, [availableCredits]);

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

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop: async (acceptedFiles, fileRejections) => {
      setRejectionMessages([]);
      setTotalCreditsNeededMessage('');

      if (selectedVideos.length + acceptedFiles.length > MAX_FILE_COUNT) {
        const msg = `You can upload up to ${MAX_FILE_COUNT} video files only.`;
        setTotalCreditsNeededMessage(msg);
        toast.error(msg, { duration: 4000 });
        return;
      }

      const newFiles = acceptedFiles.filter(file =>
        !selectedVideos.some(existingFile => existingFile.name === file.name)
      );

      const newDurations: { [key: string]: number } = {};

      for (const file of newFiles) {
        const duration = await getVideoDuration(file);
        newDurations[file.name] = duration;
      }

      const updatedSelectedVideos = [...selectedVideos, ...newFiles];
      setVideos(updatedSelectedVideos);

      let totalCreditsNeeded = selectedImages.length * IMAGE_CREDIT_COST;
      let totalSeconds = 0;

      for (const file of updatedSelectedVideos) {
        const duration = newDurations[file.name] || await getVideoDuration(file);
        totalSeconds += duration;
        totalCreditsNeeded += duration;
      }

      setTotalVideoSecondsState(Math.floor(totalSeconds));
      totalCreditsNeeded = Math.floor(totalCreditsNeeded);
      setStepSkipped(false);

      if (totalCreditsNeeded > availableCredits) {
        const creditsNeeded = totalCreditsNeeded - availableCredits;
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
      'video/*': []
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
              (*optional) Drag and drop <span className="text-red-500 font-bold">video</span> files here, or click to select files
            </p>
            <p className="text-center text-xs md:text-sm lg:text-base">Max 5 files, each under 100 MB</p>
            <p className="text-center text-xs md:text-sm lg:text-base">Each second of video costs 1 credit</p>
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
          {selectedVideos.length > 0 && (
            <button onClick={() => {
              setVideos([]);
              setRejectionMessages([]);
              setTotalCreditsNeededMessage('');
              setTotalVideoSecondsState(0); // Reset total seconds
            }} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300">
              Reset
            </button>
          )}
          <button
            onClick={() => {
              if (selectedVideos.length === 0) {
                setStepSkipped(true);
              }
              nextStep();
            }}
            disabled={totalVideoSeconds + selectedImages.length > availableCredits && !stepSkipped}
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ${totalVideoSeconds + selectedImages.length > availableCredits && !stepSkipped ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {selectedVideos.length === 0 && !stepSkipped ? 'Skip' : 'Next'}
          </button>
        </div>
      </div>

      {selectedVideos.length > 0 &&
        <p className="text-left text-gray-800 mt-5 mb-5">
          <strong>{selectedVideos.length}</strong> {selectedVideos.length === 1 ? 'video' : 'videos'} ({Math.floor(totalVideoSeconds)} seconds), <strong>{Math.floor(totalVideoSeconds)}</strong> {Math.floor(totalVideoSeconds) === 1 ? 'credit' : 'credits'} required.
        </p>
      }

      <div className="images grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] w-full gap-[1rem]">
        {selectedVideos.length > 0 &&
          selectedVideos.map((video, index) => (
            <div key={index} className="relative bg-white shadow-md rounded-md p-2">
              <video src={URL.createObjectURL(video)} className="h-[15rem] w-full object-cover rounded-md" controls />
              <p className="text-center text-sm mt-2">{truncateFileName(video.name, 15)}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default VideoUpload;

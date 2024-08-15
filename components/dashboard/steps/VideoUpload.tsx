import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import apiClient from '@/libs/api';
import LoadingSpinner from '@/components/LoadingSpinner';

interface VideoUploadProps {
  selectedVideos: File[];
  setVideos: React.Dispatch<React.SetStateAction<File[]>>;
  nextStep: () => void;
  previousStep: () => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ selectedVideos, setVideos, nextStep, previousStep }) => {
  const [rejectionMessages, setRejectionMessages] = useState<string[]>([]);
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [totalVideoSeconds, setTotalVideoSeconds] = useState<number>(0);
  const [totalCreditsNeededMessage, setTotalCreditsNeededMessage] = useState<string>('');
  const [loadingCredits, setLoadingCredits] = useState<boolean>(true);
  const FILE_SIZE_LIMIT = 500 * 1024 * 1024; // 500 MB limit
  const MAX_FILE_COUNT = 1; // Maximum number of files allowed
  const effectRan = useRef(false);

  const fetchAvailableCredits = useCallback(async () => {
    try {
      //const { user }: { user: any } = await apiClient.get("/user");
      //setAvailableCredits(user.availableCredits);
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
      let totalSeconds = 0;

      for (const file of selectedVideos) {
        const duration = await getVideoDuration(file);
        totalSeconds += duration;
        //totalCredits += duration;
      }

      setTotalVideoSeconds(Math.floor(totalSeconds));
    };

    calculateCredits();
  }, []);

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
        const msg = `You can upload up to ${MAX_FILE_COUNT} video file(s) only.`;
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

      let totalSeconds = 0;

      for (const file of updatedSelectedVideos) {
        const duration = newDurations[file.name] || await getVideoDuration(file);
        totalSeconds += duration;
      }

      setTotalVideoSeconds(Math.floor(totalSeconds));

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
          <p>Drop file here ...</p>
        ) : (
          <>
            <p className="text-center text-sm md:text-base lg:text-lg p-10">
              Drag and drop a <span className="text-red-500 font-bold">video</span> file here, or click to select a file
            </p>
            <p className="text-center text-xs md:text-sm lg:text-base">Max. 500 MB</p>
            {/* <p className="text-center text-xs md:text-sm lg:text-base">Maximum {MAX_FILE_COUNT} files</p> */}
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

      <div className="flex justify-end items-center mt-4 mb-4 w-full">
        <div className="flex gap-2">
          {selectedVideos.length > 0 && (
            <button onClick={() => {
              setVideos([]);
              setRejectionMessages([]);
              setTotalCreditsNeededMessage('');
              setTotalVideoSeconds(0); // Reset total seconds
            }} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300">
              Reset
            </button>
          )}
          <button
            onClick={nextStep}
            disabled={selectedVideos.length === 0}
            className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ${selectedVideos.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
      </div>

      {selectedVideos.length > 0 &&
        <p className="w-full flex justify-center">
          {Math.floor(totalVideoSeconds)} seconds
        </p>
      }

      <div className="w-full flex justify-center">
        {selectedVideos.length > 0 && (
          <div className="relative bg-white shadow-md rounded-md p-2 max-w-[90%]">
            <video
              src={URL.createObjectURL(selectedVideos[0])}
              className="h-[20rem] w-full object-cover rounded-md"
              controls
            />
            <p className="text-center text-sm mt-2">
              {truncateFileName(selectedVideos[0].name, 20)}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default VideoUpload;

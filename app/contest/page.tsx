"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import Header from "@/components/Header";
import LoadingSpinnerWithProgress from "@/components/LoadingSpinnerWithProgress";
import { useRouter } from 'next/navigation';

const Contest = () => {
  const maxAttempts = 2;
  const theme = 'love';
  const router = useRouter();

  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [rejectionMessages, setRejectionMessages] = useState<string[]>([]);
  const [totalVideoSeconds, setTotalVideoSeconds] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [socialShareUrl, setSocialShareUrl] = useState<string>('');

  const [isUploading, setIsUploading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const uploadedFileKeysRef = useRef<string[]>([]);

  const FILE_SIZE_LIMIT = 200 * 1024 * 1024; // 200 MB limit
  const MAX_FILE_COUNT = 1; // Maximum number of files allowed

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

      if (selectedVideos.length + acceptedFiles.length > MAX_FILE_COUNT) {
        const msg = `You can upload up to ${MAX_FILE_COUNT} video file(s) only.`;
        toast.error(msg, { duration: 4000 });
        return;
      }

      const newFiles = acceptedFiles.filter(file =>
        !selectedVideos.some(existingFile => existingFile.name === file.name)
      );

      const updatedSelectedVideos = [...selectedVideos, ...newFiles];
      setSelectedVideos(updatedSelectedVideos);

      let totalSeconds = 0;

      for (const file of updatedSelectedVideos) {
        const duration = await getVideoDuration(file);
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

  const calculateTotalSize = (files: File[]) => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const bytesToMB = (bytes: number) => {
    return bytes / (1024 * 1024);
  };

  const uploadFileToS3 = async (file: File, url: string, key: string, index: number) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress((prevProgress) => {
            const newProgress = [...prevProgress];
            newProgress[index] = progress;
            return newProgress;
          });
        }
      };

      xhr.onload = () => {
        console.log(`Upload completed with status: ${xhr.status}`);
        console.log(`Response: ${xhr.responseText}`);

        if (xhr.status === 200) {
          uploadedFileKeysRef.current.push(key);
          resolve();
        } else {
          console.error(`Error during upload. Status: ${xhr.status}, Response: ${xhr.responseText}`);
          reject(new Error('Failed to upload file to S3'));
        }
      };

      xhr.onerror = () => {
        console.error('Network error during upload.');
        reject(new Error('Failed to upload file to S3'));
      };

      try {
        console.log('Sending file to S3...');
        xhr.send(file);
      } catch (error) {
        console.error('Error while sending the file:', error);
        reject(new Error('Failed to upload file to S3'));
      }
    });
  };

  const deleteUploadedFiles = async (keys: string[]) => {
    try {
      await fetch('/api/s3/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keys }),
      });
    } catch (error) {
      console.error('Error deleting files:', error);
    }
  };

  const onUpload = async () => {
    if (selectedVideos.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadSuccess(false);
    setUploadFailed(false);
    uploadedFileKeysRef.current = [];
    setUploadProgress(new Array(selectedVideos.length).fill(0));

    const videos = selectedVideos.map(video => ({ type: video.type, name: video.name }));

    try {
      const response = await fetch('/api/s3/signed-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videos }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get signed URLs');
      }

      const responseData = await response.json();
      const { signedUrls, s3FolderName } = responseData;

      if (!signedUrls || !s3FolderName) {
        toast.error("Sorry, could not upload. Please try again.");
        setIsUploading(false);
        setUploadFailed(true);
        return;
      }

      const files = [
        ...selectedVideos.map((file, i) => ({ file, url: signedUrls[i].url, key: signedUrls[i].key })),
      ];
      console.log({ files })
      for (let i = 0; i < files.length; i++) {
        await uploadFileToS3(files[i].file, files[i].url, files[i].key, i);
      }

      const uploadedFiles = files.map((fileData, index) => ({
        fileName: fileData.file.name,
        fileExtension: fileData.file.type.split('/')[1],
        fileSize: bytesToMB(fileData.file.size).toFixed(2),
        s3Key: fileData.key,
        s3Location: fileData.url,
        type: 'VIDEO'
      }));

      const totalVideoSizeBytes = calculateTotalSize(selectedVideos);
      // Convert to MB and fix to 2 decimal places
      const totalVideoSizeMB = bytesToMB(totalVideoSizeBytes).toFixed(2);

      const responseUpload = await fetch('/api/s3/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          description,
          socialShareUrl,
          totalVideoSeconds,
          s3FolderName,
          uploadedFiles,
          totalVideoSizeMB
        }),
      });

      if (!responseUpload.ok) {
        const errorData = await responseUpload.json();
        throw new Error(errorData.error);
      }

      setUploadSuccess(true);
      setIsUploading(false);
    } catch (error) {
      console.log({ error })
      // this is to display error message only once if error messge is from server /s3/upload 
      if (error?.message !== 'Upload failed. Please try again.') {
        if (attempts !== maxAttempts) {
          toast.error("Upload failed. Please try again.");
        }
      } else {
        toast.error("Upload failed. Please try again.");
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
        }, 4000);
      }
    }
  };

  const overallProgress = uploadProgress.reduce((acc, progress) => acc + progress, 0) / uploadProgress.length;

  return (
    <>
      <Suspense>
        <Header />
      </Suspense>

      <div className="container mx-auto w-[800px] max-w-[90%] my-0 mt-20">
        {isUploading && (
          <LoadingSpinnerWithProgress
            text="Uploading... Do not close your browser until the upload is complete."
            progress={overallProgress}
          />
        )}

        {uploadSuccess ? (
          <div className="text-center mt-10">
            <h2 className="text-2xl font-bold text-green-600">Upload Successful!</h2>
            <p className="mt-4">Your video has been successfully uploaded.</p>
            <button
              className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => router.push('/gallery')} // Redirect to the gallery page
            >
              Go to Gallery
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-4">Upload your AI Film Trailer</h2>

            <p className="text-lg font-semibold text-center text-pink-600 mb-6">
              Theme: <span className="italic">Love</span>
            </p>

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
                  <p className="text-center text-xs md:text-sm lg:text-base">Max. 200 MB</p>
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

            <div className="flex flex-col gap-4 mt-4">
              <textarea
                placeholder="Enter description for the video"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <input
                type="url"
                placeholder="Enter social media sharing URL (YouTube, Instagram, TikTok, etc) with hashtag #Obvious.app"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={socialShareUrl}
                onChange={(e) => setSocialShareUrl(e.target.value)}
              />
            </div>

            <div className="flex justify-end items-center mt-4 mb-4 w-full">
              <div className="flex gap-2">
                {!uploadFailed ? (
                  <button
                    onClick={() => { onUpload(); }}
                    disabled={selectedVideos.length === 0 || !description || !socialShareUrl}
                    className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${selectedVideos.length === 0 || !description || !socialShareUrl ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={() => { onUpload(); }}
                    className={`${attempts >= 3 ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-700'
                      } text-white font-bold py-2 px-2 sm:px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300`}
                    disabled={attempts >= 3}
                  >
                    Submit Again
                  </button>
                )}
              </div>
            </div>

            <div className="mb-6 pt-10 flex justify-center">
              {selectedVideos.length > 0 && (
                <div className="w-full max-w-lg">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 text-center">
                    {truncateFileName(selectedVideos[0].name, 30)}
                  </h3>
                  <div className="relative border rounded-lg overflow-hidden shadow-sm">
                    <video
                      src={URL.createObjectURL(selectedVideos[0])}
                      className="h-48 sm:h-64 w-full object-cover"
                      controls
                    />
                    {isUploading && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-200">
                        <div
                          className="bg-blue-500 h-1"
                          style={{ width: `${uploadProgress[0] || 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Contest;

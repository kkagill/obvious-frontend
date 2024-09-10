"use client";

import Header from "@/components/dashboard/Header";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useRouter } from 'next/navigation';
import ReactPlayer from 'react-player';
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Clip({
  params,
}: {
  params: { videoId: string };
}) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [hasUploaded, setHasUploaded] = useState<boolean>(false);
  const [clipsLoading, setClipsLoading] = useState<boolean>(false);
  const [userClips, setUserClips] = useState<any[]>([]);

  const router = useRouter();
  const videoId = params?.videoId;

  const fetchClips = useCallback(async (videoId: string) => {
    try {
      setClipsLoading(true);

      const response = await fetch(`/api/clips?videoId=${videoId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { data } = await response.json();

      setUserClips(data);
      setClipsLoading(false);
    } catch (error) {
      console.error('Error fetching available clips:', error);
      setClipsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (videoId) {
      fetchClips(videoId);
    }
  }, [videoId, fetchClips]);

  const handleGoBack = () => {
    router.push(`/dashboard`);
  };

  if (clipsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header
        setIsModalOpen={setIsModalOpen}
        setTitle={setModalTitle}
        setContent={setModalContent}
        hasUploaded={hasUploaded}
      />

      <main className="p-8 pb-24 pt-15">
        <section className="flex justify-around items-center">
          <button
            onClick={handleGoBack}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 text-sm rounded-full focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 flex items-center shadow-lg">
            <AiOutlineArrowLeft className="h-5 w-5 mr-2" />
            Dashboard
          </button>
        </section>

        <section className="pt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {userClips && userClips.length > 0 ? (
            userClips.map((clip) => (
              <div key={clip.id} className="rounded-lg shadow-lg overflow-hidden bg-white">
                <ReactPlayer
                  url={`https://d197z862944tpf.cloudfront.net/${clip.s3Key}`}
                  controls={true}
                  width="100%"
                  height="100%"
                />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No clips available</p>
          )}
        </section>
      </main>
    </div>
  );
}

import React from "react";
import { FaCheckCircle, FaClock, FaQuestionCircle } from "react-icons/fa";
import { useRouter } from 'next/navigation'; // Adjusted import for App Router

interface ClipProps {
  clips: Array<{
    id: number;
    fileName: string;
    numOfClips: number;
    requestedDuration: number;
    createdAt: string;
    status: string;
  }>;
}

enum ClipStatus {
  CREATED = "CREATED",
  CLIPS_UPLOADED = "CLIPS_UPLOADED",
}


const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getStatusIconAndMessage = (status: string) => {
  switch (status) {
    case ClipStatus.CREATED:
      return { icon: <FaClock className="text-orange-500" />, message: "Processing", tooltip: "Please wait, your video is being processed." };
    case ClipStatus.CLIPS_UPLOADED:
      return { icon: <FaClock className="text-green-500" />, message: "Processed", tooltip: "Successfully processed." };
    default:
      return { icon: <FaQuestionCircle className="text-gray-500" />, message: "Unknown status", tooltip: "Status is unknown." };
  }
};

const Clip: React.FC<ClipProps> = ({ clips }) => {
  const router = useRouter();

  const handleViewClick = (id: number) => {
    router.push(`/dashboard/clip/${id}`);
  };

  return (
    <section className="overflow-x-auto md:overflow-x-visible">
      {clips.length > 0 ? (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base">Created</th>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base">File</th>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base">Clips</th>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base">Duration (sec)</th>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base">Status</th>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base"></th>
            </tr>
          </thead>
          <tbody>
            {clips.map((clip) => {
              const { icon, message, tooltip } = getStatusIconAndMessage(clip.status);
              return (
                <tr key={clip.id} className="border-t">
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">{formatDate(clip.createdAt)}</td>
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">{clip.fileName}</td>
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">{clip.numOfClips}</td>
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">{clip.requestedDuration}</td>
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">
                    <div className="tooltip tooltip-bottom" data-tip={tooltip}>
                      {icon}
                    </div>
                    <span className="ml-2 block md:inline">{message}</span>
                  </td>
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">
                    <button
                      className={`text-blue-500 ${clip.status === ClipStatus.CREATED ? 'cursor-not-allowed' : 'hover:underline'
                        }`}
                      disabled={clip.status === ClipStatus.CREATED}
                      onClick={() => handleViewClick(clip.id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-8">
          <p className="text-sm md:text-base lg:text-lg text-gray-600">
            No data available. Please upload a new video.
          </p>
        </div>
      )}
    </section>
  );
};

export default Clip;

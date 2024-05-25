import React from "react";
import { FaCheckCircle, FaClock, FaQuestionCircle } from "react-icons/fa";
import { useRouter } from 'next/navigation'; // Adjusted import for App Router

interface RecordProps {
  records: Array<{
    id: number;
    rentalAddress: string;
    numImages: number;
    numVideos: number;
    createdAt: string;
    status: string;
  }>;
}

enum RecordStatus {
  UPLOADED_TO_S3 = "UPLOADED_TO_S3",
  UPLOADED_TO_IPFS = "UPLOADED_TO_IPFS",
  UPLOADED_TO_EVM = "UPLOADED_TO_EVM"
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getStatusIconAndMessage = (status: string) => {
  switch (status) {
    case RecordStatus.UPLOADED_TO_S3:
      return { icon: <FaClock className="text-orange-500" />, message: "Queued for processing 1/3", tooltip: "Uploaded to AWS S3 and is queued for further processing to IPFS and EVM." };
    case RecordStatus.UPLOADED_TO_IPFS:
      return { icon: <FaClock className="text-yellow-500" />, message: "Queued for processing 2/3", tooltip: "Uploaded to IPFS and is queued for further processing to EVM." };
    case RecordStatus.UPLOADED_TO_EVM:
      return { icon: <FaCheckCircle className="text-green-500" />, message: "Uploaded to blockchain", tooltip: "Successfully uploaded to the Base blockchain." };
    default:
      return { icon: <FaQuestionCircle className="text-gray-500" />, message: "Unknown status", tooltip: "The status of this record is unknown." };
  }
};

const Record: React.FC<RecordProps> = ({ records }) => {
  const router = useRouter();

  const handleViewClick = (id: number) => {
    router.push(`/dashboard/record/${id}`);
  };

  return (
    <section className="overflow-x-auto md:overflow-x-visible">
      {records.length > 0 ? (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base">Address</th>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base">Images</th>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base">Videos</th>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base">Created</th>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base">Status</th>
              <th className="px-4 py-2 text-xs md:text-sm lg:text-base"></th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const { icon, message, tooltip } = getStatusIconAndMessage(record.status);
              return (
                <tr key={record.id} className="border-t">
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">{record.rentalAddress}</td>
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">{record.numImages}</td>
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">{record.numVideos}</td>
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">{formatDate(record.createdAt)}</td>
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">
                    <div className="tooltip tooltip-bottom" data-tip={tooltip}>
                      {icon}
                    </div>
                    <span className="ml-2 block md:inline">{message}</span>
                  </td>
                  <td className="px-4 py-2 text-xs md:text-sm lg:text-base text-center">
                    <button
                      className="text-blue-500 hover:underline"
                      onClick={() => handleViewClick(record.id)}
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
            No records available. Please create a new record.
          </p>
        </div>
      )}
    </section>
  );
};

export default Record;

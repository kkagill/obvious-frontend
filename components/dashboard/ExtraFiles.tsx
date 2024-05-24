import React from 'react';
import { FaFileAlt, FaFileImage, FaFilePdf, FaFileWord } from 'react-icons/fa';

const ExtraFiles = () => (
  <div className="text-sm text-gray-600 p-4">
    <p>If you have any other files to upload such as:</p>
    <br />
    <ul className="list-none">
      <li><FaFilePdf className="inline mr-2 text-red-500" /> <strong>Rental Agreements</strong> (PDF file)</li>
      <li><FaFileAlt className="inline mr-2 text-blue-500" /> <strong>Special Notes</strong> (Text file)</li>
      <li><FaFileImage className="inline mr-2 text-green-500" /> <strong>Additional Image Files</strong> (JPEG, PNG, etc.)</li>
      <li><FaFileWord className="inline mr-2 text-purple-500" /> <strong>Documents</strong> (Word file)</li>
    </ul>
  </div>
);

export default ExtraFiles;

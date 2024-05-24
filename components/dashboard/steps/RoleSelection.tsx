import React from 'react';
import { FaUserTie, FaHome } from 'react-icons/fa';

interface RoleSelectionProps {
  setRole: (role: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  role: string;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ role, setRole, nextStep, previousStep }) => {
  return (
    <div className="text-center p-5">
      <h2 className="text-lg md:text-2xl font-semibold mb-4">Please select your role:</h2>
      <div className="flex justify-center gap-10 pt-5">
        <button
          className="flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          onClick={() => { setRole('Tenant'); nextStep(); }}>
          <FaHome className="mr-2" />
          Tenant
        </button>
        <button
          className="flex items-center justify-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
          onClick={() => { setRole('Landlord'); nextStep(); }}>
          <FaUserTie className="mr-2" />
          Landlord
        </button>
      </div>     
    </div>
  );
};

export default RoleSelection;

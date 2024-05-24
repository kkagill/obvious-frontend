import React, { useState } from 'react';
import { FaUserTie, FaHome } from 'react-icons/fa';

const Read: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);

  const handleRoleSelection = (selectedRole: string) => {
    setRole(selectedRole);
  };

  return (
    <div className="p-4 text-sm">
      {!role ? (
        <div className="text-center p-5 mb-10">
          <h2 className="text-xl font-bold mb-4">Who is uploading the photos?</h2>
          <div className="flex justify-center gap-10 pt-5">
            <button
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
              onClick={() => handleRoleSelection('Tenant')}
            >
              <FaHome className="mr-2" />
              Tenant
            </button>
            <button
              className="flex items-center justify-center bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
              onClick={() => handleRoleSelection('Landlord')}
            >
              <FaUserTie className="mr-2" />
              Landlord
            </button>
          </div>
        </div>
      ) : role === 'Tenant' ? (
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-4">Ensuring Your Security Deposit</h2>
          <p className="mb-4">
            Moving into a rental property is an exciting time, but it’s crucial to take the right steps to ensure you get your security deposit back when you move out. One of the best ways to protect yourself is to thoroughly document the condition of the property upon moving in. Here are some tips on what to photograph and how to handle the documentation process effectively.
          </p>
          <h3 className="text-base font-semibold mb-2">What to Photograph</h3>
          <p className="mb-2">
            When you move into your new rental, take clear, detailed photographs of the entire property. Focus on capturing the following areas:
          </p>
          <ul className="list-disc list-inside mb-4 pl-4">
            <li><strong>General Areas:</strong> Photograph each room from multiple angles. Include walls, floors, and ceilings.</li>
            <li><strong>Carpets and Flooring:</strong> Capture any stains, seams, or wear and tear.</li>
            <li><strong>Walls:</strong> Look for and document any scratches, dings, nail holes, or marks.</li>
            <li><strong>Windows and Window Coverings:</strong> Ensure you get photos of any damage to windows, tracks, blinds, or curtains.</li>
            <li><strong>Doors:</strong> Photograph both sides of all doors, including any damage to the frames.</li>
            <li><strong>Appliances:</strong> Take photos of all provided appliances, including close-ups of any existing damage or signs of wear.</li>
            <li><strong>Bathrooms:</strong> Document the condition of sinks, tubs, toilets, and showers. Pay special attention to any mold or mildew.</li>
            <li><strong>Kitchen:</strong> Capture countertops, cabinets (inside and out), sinks, and any kitchen appliances.</li>
            <li><strong>Outdoor Areas:</strong> Don’t forget the yard, garage, patio, or balcony if applicable.</li>
          </ul>
          <h3 className="text-base font-semibold mb-2">How to Handle the Documentation</h3>
          <p className="mb-4">
            Here are some steps to ensure your documentation is effective:
          </p>
          <ul className="list-disc list-inside mb-4 pl-4">
            <li><strong>Send Copies to Your Landlord:</strong> We will request your landlord's email address and send them the uploaded images along with proof of upload to the blockchain. This provides a record of the property's condition at move-in.</li>
            <li><strong>Document Pre-Existing Damage:</strong> Create a written list of any pre-existing damage and have your landlord acknowledge it. You can upload this to blockchain as well.</li>
          </ul>
        </div>
      ) : (
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-4">Ensuring a Smooth Tenancy</h2>
          <p className="mb-4">
            As a landlord, it’s crucial to take the right steps to document the condition of your rental property both when a tenant moves in and when they move out. Proper documentation helps protect you from disputes and ensures that the property is maintained in good condition. Here are some tips on what to photograph and how to handle the documentation process effectively.
          </p>
          <h3 className="text-base font-semibold mb-2">What to Photograph</h3>
          <p className="mb-2">
            When a new tenant moves into your rental, take clear, detailed photographs of the entire property. Focus on capturing the following areas:
          </p>
          <ul className="list-disc list-inside mb-4 pl-4">
            <li><strong>General Areas:</strong> Photograph each room from multiple angles. Include walls, floors, and ceilings.</li>
            <li><strong>Carpets and Flooring:</strong> Capture any stains, seams, or wear and tear.</li>
            <li><strong>Walls:</strong> Look for and document any scratches, dings, nail holes, or marks.</li>
            <li><strong>Windows and Window Coverings:</strong> Ensure you get photos of any damage to windows, tracks, blinds, or curtains.</li>
            <li><strong>Doors:</strong> Photograph both sides of all doors, including any damage to the frames.</li>
            <li><strong>Appliances:</strong> Take photos of all provided appliances, including close-ups of any existing damage or signs of wear.</li>
            <li><strong>Bathrooms:</strong> Document the condition of sinks, tubs, toilets, and showers. Pay special attention to any mold or mildew.</li>
            <li><strong>Kitchen:</strong> Capture countertops, cabinets (inside and out), sinks, and any kitchen appliances.</li>
            <li><strong>Outdoor Areas:</strong> Don’t forget the yard, garage, patio, or balcony if applicable.</li>
          </ul>
          <h3 className="text-base font-semibold mb-2">How to Handle the Documentation</h3>
          <p className="mb-4">
            Here are some steps to ensure your documentation is effective:
          </p>
          <ul className="list-disc list-inside mb-4 pl-4">
            <li><strong>Send Copies to the Tenant:</strong> We will request your tenant's email address and send them the uploaded images along with proof of upload to the blockchain. This provides a record of the property's condition at move-in.</li>
            <li><strong>Create a Move-In Checklist:</strong> Use a checklist to document the condition of the property during the move-in inspection with the tenant. Have the tenant sign the checklist to acknowledge the property’s condition. You can upload this to blockchain as well.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Read;

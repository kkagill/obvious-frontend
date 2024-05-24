import React from 'react';

interface AddressProps {
  setAddress: (email: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  address: string;
}

const Address: React.FC<AddressProps> = ({
  address,
  setAddress,
  nextStep,
  previousStep
}) => {
  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const address = event.target.value;
    setAddress(address);
  };

  return (
    <div className="mx-auto w-full max-w-md p-4 bg-white shadow-md rounded-lg">
      <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2">
        Enter the full address of the rental unit:
      </label>
      <input
        type="text"
        value={address}
        onChange={handleAddressChange}
        placeholder="i.e. 777 Rysal St, Roseville, CA 12345, USA"
        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
        required
      />

      <div className="flex justify-between items-center mt-4">
        <button
          onClick={previousStep}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300">
          Back
        </button>
        <button
          onClick={() => { nextStep(); }}
          disabled={!address}
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ${!address ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Address;

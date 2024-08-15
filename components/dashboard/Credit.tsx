import React from 'react';
import config from "@/config";
import ButtonCheckout from '@/components/ButtonCheckout';

const Credit: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      {/* <ul className="list-none mb-8 space-y-4">
        <li className="flex items-center text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium text-sm md:text-base">Up to 90% fewer disputes</span>
        </li>
        <li className="flex items-center text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium text-sm md:text-base">Blockchain tamper-proof against AI manipulation</span>
        </li>
      </ul> */}
      {/* <div className="p-4 bg-gray-100 rounded-md mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-sm md:text-base font-semibold text-gray-800">1 credit =</span>
          <span className="text-sm md:text-base font-semibold text-blue-500">1 image file</span>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-sm md:text-base font-semibold text-gray-800">1 credit =</span>
          <span className="text-sm md:text-base font-semibold text-blue-500">1 second of video</span>
        </div>
      </div> */}
      <div className="overflow-x-auto">
        <table className="w-full text-center table-auto border-collapse mb-8 shadow-sm">
          <thead>
            <tr className="text-gray-700 bg-gray-200">
              <th className="px-2 py-1 text-xs md:text-base font-semibold">Credits</th>
              <th className="px-2 py-1 text-xs md:text-base font-semibold">Price</th>
              <th className="px-2 py-1 text-xs md:text-base font-semibold">Per Credit</th>
              <th className="px-2 py-1"></th>
            </tr>
          </thead>
          <tbody className="text-gray-600">
            {config.stripe.plans.map((plan, index) => (
              <tr key={index} className="border-b border-gray-200 hover:bg-gray-100">
                <td className="px-4 py-4 text-sm md:text-base align-middle">{plan.credits}</td>
                <td className="px-4 py-4 text-blue-600 font-semibold text-sm md:text-base align-middle">${plan.price}</td>
                <td className="px-4 py-4 text-sm md:text-base align-middle">${(plan.price / plan.credits).toFixed(3)}</td>
                <td className="px-4 py-4 align-middle">
                  <ButtonCheckout mode="payment" priceId={plan.priceId} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Credit;

import LoadingSpinner from '@/components/LoadingSpinner';
import React, { useState, useEffect, useCallback } from 'react';

interface SecurityDepositProps {
  setSecurityDepositAmount: (securityDepositAmount: string) => void;
  setSecurityDepositCurrency: (securityDepositCurrency: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  securityDepositAmount: string;
  securityDepositCurrency: string;
}

const SecurityDeposit: React.FC<SecurityDepositProps> = ({
  securityDepositAmount,
  securityDepositCurrency,
  setSecurityDepositAmount,
  setSecurityDepositCurrency,
  nextStep,
  previousStep
}) => {
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrencies = useCallback(async () => {
    setLoading(true);
    try {
      // not using apiClient since this route doesn't need to be authenticated
      const response = await fetch('/api/currencies');
      if (!response.ok) {
        throw new Error('Failed to fetch currencies');
      }
      const data = await response.json();
      setCurrencies(data.map((item: { currency: string }) => item.currency));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrencies();
  }, [fetchCurrencies]);

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setSecurityDepositAmount(value);
    }
  };

  const handleCurrencyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = event.target.value;
    setSecurityDepositCurrency(newCurrency);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto w-full max-w-md p-4 bg-white shadow-md rounded-lg">
      <label className="block text-base md:text-lg font-semibold text-gray-700 mb-2">
        Enter the amount of security deposit:
      </label>
      <div className="flex items-center">
        <input
          type="text"
          value={securityDepositAmount}
          onChange={handleAmountChange}
          placeholder="i.e. 2500"
          className="w-2/3 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          required
        />
        <select
          value={securityDepositCurrency}
          onChange={handleCurrencyChange}
          className="w-1/3 p-2 ml-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          disabled={loading}
        >
          {loading ? (
            <option>Loading...</option>
          ) : error ? (
            <option>Error loading currencies</option>
          ) : (
            currencies.map((curr) => (
              <option key={curr} value={curr}>{curr}</option>
            ))
          )}
        </select>
      </div>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={previousStep}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300">
          Back
        </button>
        <button
          onClick={nextStep}
          disabled={!securityDepositAmount || !securityDepositCurrency}
          className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transform transition hover:scale-105 duration-300 ${!securityDepositAmount ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SecurityDeposit;

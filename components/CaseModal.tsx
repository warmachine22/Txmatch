import React, { useState } from 'react';

interface CaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCase: (name: string, address: string) => void;
}

export const CaseModal: React.FC<CaseModalProps> = ({ isOpen, onClose, onAddCase }) => {
  const [caseName, setCaseName] = useState('');
  const [caseAddress, setCaseAddress] = useState('');

  const handleSubmit = () => {
    if (caseName.trim() && caseAddress.trim()) {
      onAddCase(caseName, caseAddress);
      setCaseName('');
      setCaseAddress('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Case</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="caseName" className="block text-sm font-medium text-gray-700">Case Name</label>
            <input
              id="caseName"
              type="text"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              placeholder="e.g., John D."
            />
          </div>
          <div>
            <label htmlFor="caseAddress" className="block text-sm font-medium text-gray-700">Case Address</label>
            <input
              id="caseAddress"
              type="text"
              value={caseAddress}
              onChange={(e) => setCaseAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
              placeholder="e.g., 123 Main St, New York, NY"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Case
          </button>
        </div>
      </div>
    </div>
  );
};
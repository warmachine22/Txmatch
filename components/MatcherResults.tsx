
import React from 'react';
import { type MatchResult } from '../types';

interface MatcherResultsProps {
  results: MatchResult[];
}

export const MatcherResults: React.FC<MatcherResultsProps> = ({ results }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Matching Results</h2>
      {results.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Therapist Name</th>
                <th className="p-3">Current Hours</th>
                <th className="p-3">Potential Hours Fit</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={result.therapist.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-semibold">{index + 1}</td>
                  <td className="p-3">{result.therapist.name}</td>
                  <td className="p-3">{result.totalHours}</td>
                  <td className="p-3 text-green-600 font-medium">{result.availableHours.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10">
          <h3 className="text-xl text-gray-600">No Suitable Therapists Found</h3>
          <p className="text-gray-400 mt-2">Try adjusting the criteria, such as distance radius or case availability.</p>
        </div>
      )}
    </div>
  );
};

import React from 'react';

const DataTable = ({ columns, data, loading, emptyMessage = 'No records found' }) => {
  if (loading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="animate-pulse flex flex-col">
          <div className="h-12 bg-gray-200 border-b border-gray-100"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 border-b border-gray-100"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col, index) => (
              <th 
                key={index}
                className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;

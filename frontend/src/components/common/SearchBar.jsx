import React from 'react';
import { HiSearch, HiX } from 'react-icons/hi';

const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="relative flex items-center w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <HiSearch className="text-gray-400 text-lg" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-shadow"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          <HiX className="text-lg" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

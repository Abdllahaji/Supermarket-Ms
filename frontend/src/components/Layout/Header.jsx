import React from 'react';
import { HiMenu, HiBell, HiUserCircle } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuToggle, title = 'SuperMarket MS' }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sticky top-0 z-20">
      <div className="flex items-center">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-gray-500 hover:text-gray-700 p-2 mr-2"
        >
          <HiMenu className="text-2xl" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-gray-600 relative p-1">
          <HiBell className="text-2xl" />
          <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="flex items-center space-x-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
              {user?.role || 'Role'}
            </span>
          </div>
          <HiUserCircle className="text-3xl text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { HiX } from 'react-icons/hi';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 bg-black bg-opacity-50 transition-opacity">
      <div 
        className={`relative w-full ${sizeClasses[size]} bg-white rounded-xl shadow-lg transform transition-all`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg p-1.5 transition-colors"
          >
            <HiX className="text-xl" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

import React from 'react';

const StatCard = ({ title, value, icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-10 mr-4`}>
          <div className={`text-2xl ${color.replace('bg-', 'text-')}`}>
            {icon}
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            {trend && (
              <span className={`ml-2 text-sm font-medium ${trend.startsWith('+') || trend.includes('up') ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

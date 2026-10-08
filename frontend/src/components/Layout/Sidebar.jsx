import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HiHome, HiShoppingCart, HiUsers, HiCash, 
  HiTag, HiLocationMarker, HiDocumentReport, HiCog, HiLogout, HiX
} from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HiHome, roles: ['admin', 'manager', 'cashier'] },
    { name: 'POS', path: '/pos', icon: HiShoppingCart, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Products', path: '/products', icon: HiTag, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Customers', path: '/customers', icon: HiUsers, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Sales', path: '/sales', icon: HiCash, roles: ['admin', 'manager', 'cashier'] },
    { name: 'Cashiers', path: '/cashiers', icon: HiUsers, roles: ['admin', 'manager'] },
    { name: 'Discounts', path: '/discounts', icon: HiTag, roles: ['admin', 'manager'] },
    { name: 'Locations', path: '/locations', icon: HiLocationMarker, roles: ['admin', 'manager'] },
    { name: 'Users', path: '/users', icon: HiCog, roles: ['admin'] },
    { name: 'Reports', path: '/reports', icon: HiDocumentReport, roles: ['admin', 'manager'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    !user || item.roles.includes(user.role)
  );

  return (
    <div className={`fixed inset-y-0 left-0 bg-slate-800 text-gray-300 w-64 transform transition-transform duration-200 ease-in-out z-30 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div className="flex items-center justify-between h-16 px-4 bg-slate-900">
        <div className="flex items-center space-x-2 font-bold text-xl text-white">
          <HiShoppingCart className="text-indigo-500 text-2xl" />
          <span>SuperMarket MS</span>
        </div>
        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
          <HiX className="text-2xl" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <Icon className="text-xl mr-3" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 truncate capitalize">{user?.role || 'Role'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <HiLogout className="mr-2 text-lg" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

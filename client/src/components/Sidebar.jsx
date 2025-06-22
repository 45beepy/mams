// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '/src/context/AuthContext.jsx';

const navigation = [
  { name: 'Dashboard', href: '/', roles: ['Admin', 'Base Commander', 'Logistics Officer'] },
  { name: 'Transfers', href: '/transfers', roles: ['Admin', 'Logistics Officer'] },
  { name: 'Purchases', href: '/purchases', roles: ['Admin', 'Logistics Officer'] },
  { name: 'Assignments', href: '/assignments', roles: ['Admin', 'Base Commander'] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <aside className="w-60 min-h-screen bg-slate-800 text-white flex flex-col justify-between">
      <nav className="px-4 py-6 space-y-1">
        {navigation.map((item) =>
          item.roles.includes(user.role) && (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-md text-sm font-medium ${
                  isActive ? 'bg-slate-900 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              {item.name}
            </NavLink>
          )
        )}
      </nav>
      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-xs text-slate-400 mb-1">{user.username} ({user.role})</p>
        <button
          onClick={logout}
          className="w-full text-left text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 px-3 py-2 rounded-md"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

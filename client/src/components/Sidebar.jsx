import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '/src/context/AuthContext.jsx';
// Corrected the import statement below by removing the "..."
import { ChartBarIcon, ArrowRightLeftIcon, ShoppingCartIcon, UserGroupIcon, ArrowLeftOnRectangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: ChartBarIcon, roles: ['Admin', 'Base Commander', 'Logistics Officer'] },
  { name: 'Transfers', href: '/transfers', icon: ArrowRightLeftIcon, roles: ['Admin', 'Logistics Officer'] },
  { name: 'Purchases', href: '/purchases', icon: ShoppingCartIcon, roles: ['Admin', 'Logistics Officer'] },
  { name: 'Assignments', href: '/assignments', icon: UserGroupIcon, roles: ['Admin', 'Base Commander'] },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="flex flex-col w-64 bg-gray-800 text-white">
            <div className="flex items-center justify-center h-20 border-b border-gray-700">
                 <ShieldCheckIcon className="h-8 w-8 mr-2 text-indigo-400"/>
                <h1 className="text-xl font-bold">MAMS</h1>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
                <nav className="flex-1 px-2 py-4 space-y-1">
                    {navigation.map((item) =>
                        item.roles.includes(user.role) && (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    classNames(
                                        isActive
                                            ? 'bg-gray-900 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                                    )
                                }
                            >
                                <item.icon
                                    className='mr-3 flex-shrink-0 h-6 w-6'
                                    aria-hidden="true"
                                />
                                {item.name}
                            </NavLink>
                        )
                    )}
                </nav>
            </div>
            <div className="px-2 py-4 border-t border-gray-700">
                 <div className="p-2 text-center text-sm">
                    <p className="font-semibold">{user.username}</p>
                    <p className="text-gray-400">{user.role}</p>
                 </div>
                 <button
                    onClick={handleLogout}
                    className="w-full group flex items-center justify-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    <ArrowLeftOnRectangleIcon className="mr-3 h-6 w-6"/>
                    Logout
                </button>
            </div>
        </div>
    );
}
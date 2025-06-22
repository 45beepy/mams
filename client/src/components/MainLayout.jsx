import { Outlet } from 'react-router-dom';
import Sidebar from '/src/components/Sidebar.jsx';

function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-slate-50 lg:flex">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
         <div className="max-w-7xl mx-auto">
            <Outlet />
         </div>
      </main>
    </div>
  );
}

export default MainLayout;
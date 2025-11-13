import React from 'react';
import { Outlet } from 'react-router-dom';

interface MobileLayoutProps {
  menuBar?: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ menuBar }) => (
  <div className="h-screen bg-gray-100 flex justify-center">
    <div className="h-full w-full max-w-[360px] bg-gray-100 flex flex-col shadow-lg " style={{ maxWidth: '360px' }}>
      <main className="flex-1 overflow-y-auto scrollbar-hide px-4">
        <Outlet />
      </main>
      <div className="">{menuBar}</div>
    </div>
  </div>
);
export default MobileLayout;

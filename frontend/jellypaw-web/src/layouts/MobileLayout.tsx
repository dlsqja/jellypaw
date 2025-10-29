import React from 'react';
import { Outlet } from 'react-router-dom';

interface MobileLayoutProps {
  menuBar?: React.ReactNode;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ menuBar }) => (
  <div className="max-h-screen bg-gray-100 flex justify-center items-start">
    <div id="app-shell" className="max-h-screen w-full mx-auto max-w-md bg-gray-50 flex flex-col pt-7 shadow-lg">
      <main className="h-screen overflow-y-auto pb-2 hide-scrollbar">
        <Outlet />
      </main>
      {menuBar}
    </div>
  </div>
);
export default MobileLayout;

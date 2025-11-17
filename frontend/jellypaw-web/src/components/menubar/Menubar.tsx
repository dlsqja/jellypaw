import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPaw } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import { AiFillHome } from 'react-icons/ai';
import { RiUserLine } from 'react-icons/ri';
import { LuPlus } from 'react-icons/lu';

const menuList = [
  { name: '피드', icon: AiFillHome, path: '/feed' },
  { name: '검색', icon: IoSearch, path: '/search' },
  { name: '동물관리', icon: FaPaw, path: '/pet' },
  { name: '내 공간', icon: RiUserLine, path: '/mypage' },
];

const Menubar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 메뉴 클릭 핸들러
  const handleClick = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <div className="flex flex-row items-center justify-between h-16 bg-gray-100 border-t border-1 border-gray-200">
      {menuList.map((menu, index) => {
        const Icon = menu.icon;
        // 현재 경로와 메뉴 path가 일치하면 isActive
        const isActive = location.pathname === menu.path;

        // PlusButton은 검색과 동물관리 사이(2번째 위치)에 삽입
        if (index === 1) {
          return (
            <React.Fragment key={`fragment-${index}`}>
              <div
                className={`flex-1 flex flex-col items-center justify-center cursor-pointer gap-2
                ${isActive ? 'text-aqua-300' : 'text-gray-300'}`}
                onClick={() => handleClick(menu.path)}
              >
                <Icon size={20} color={isActive ? '#6abfb8' : '#A3A3A3'} />
                <span className={`p3-b text-xs text-center whitespace-nowrap ${isActive ? 'text-aqua-300' : 'text-gray-300'}`}>{menu.name}</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center gap-2 cursor-pointer" onClick={() => navigate('/write')}>
                <LuPlus size={48} color="#FFFFFF" className="bg-aqua-300 rounded-full p-3.5" />
              </div>
            </React.Fragment>
          );
        }

        // 동물관리는 "동물관리"라는 긴 텍스트를 위해 더 넓은 너비 필요
        if (index === 2) {
          return (
            <div
              key={index}
              className={`flex-1 flex flex-col items-center justify-center cursor-pointer gap-2
              ${isActive ? 'text-aqua-300' : 'text-gray-300'}`}
              onClick={() => handleClick(menu.path)}
            >
              <Icon size={20} color={isActive ? '#6abfb8' : '#A3A3A3'} />
              <span className={`p3-b text-xs text-center whitespace-nowrap ${isActive ? 'text-aqua-300' : 'text-gray-300'}`}>{menu.name}</span>
            </div>
          );
        }

        // 피드와 내 공간 메뉴
        return (
          <div
            key={index}
            className={`flex-1 flex flex-col items-center justify-center cursor-pointer gap-2
            ${isActive ? 'text-aqua-300' : 'text-gray-300'}`}
            onClick={() => handleClick(menu.path)}
          >
            <Icon size={20} color={isActive ? '#6abfb8' : '#A3A3A3'} />
            <span className={`p3-b text-xs text-center whitespace-nowrap ${isActive ? 'text-aqua-300' : 'text-gray-300'}`}>{menu.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Menubar;

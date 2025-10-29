import { createBrowserRouter } from 'react-router-dom';

import Signup from '@/pages/Auth/Signup';
import Feed from '@/pages/Feed/Feed';
import Mypage from '@/pages/Mypage/Mypage';
import Pet from '@/pages/Pet/Pet';
import Search from '@/pages/Search/Search';
import MobileLayout from '@/layouts/MobileLayout';
import Menubar from '@/components/menubar/Menubar';
import Write from '@/pages/Write/Write';
const router = createBrowserRouter([
  {
    path: '/',
    element: <MobileLayout menuBar={<Menubar />} />,
    children: [
      {
        path: '/feed',
        element: <Feed />,
      },
      {
        path: '/signup',
        element: <Signup />,
      },
      {
        path: '/mypage',
        element: <Mypage />,
      },
      {
        path: '/pet',
        element: <Pet />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/write',
        element: <Write />,
      },
    ],
  },
]);

export default router;

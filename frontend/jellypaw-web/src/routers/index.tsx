import { createBrowserRouter } from 'react-router-dom';
import Feed from '@/pages/Feed/Feed';
import Mypage from '@/pages/Mypage/Mypage';
import Pet from '@/pages/Pet/Pet';
import Search from '@/pages/Search/Search';
import MobileLayout from '@/layouts/MobileLayout';
import Menubar from '@/components/menubar/Menubar';
import Write from '@/pages/Write/Write';
import FeedDetail from '@/pages/Feed/FeedDetail';
import authRoutes from './authRoutes';

const mainRoutes = 
  {
    path: '/',
    element: <MobileLayout menuBar={<Menubar />} />,
    children: [
      {
        path: '/feed',
        element: <Feed />,
      },
      {
        path: '/feed/:feedId',
        element: <FeedDetail />,
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
  }

const router = createBrowserRouter([
  mainRoutes,
  authRoutes,
])

export default router;

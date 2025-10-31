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
import SearchDetail from '@/pages/Search/SearchDetail';
import MyReservationDetail from '@/pages/Mypage/MyReservation/MyReservationDetail';
import EditProfile from '@/pages/Mypage/EditProfile';

const mainRoutes = {
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
      path: '/pet',
      element: <Pet />,
    },
    {
      path: '/search',
      element: <Search />,
    },
    {
      path: '/search/:searchId',
      element: <SearchDetail />,
    },
    {
      path: '/write',
      element: <Write />,
    },
    {
      path: '/mypage',
      element: <Mypage />,
    },
    {
      path: '/mypage/reservation/:reservationId',
      element: <MyReservationDetail />,
    },
    {
      path: '/mypage/edit-profile',
      element: <EditProfile />,
    },
  ],
};

const router = createBrowserRouter([mainRoutes, authRoutes]);

export default router;

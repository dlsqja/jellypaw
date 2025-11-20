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
import PersonSearchDetail from '@/pages/Search/PersonSearch/PersonSearchDetail';
import MyReservationDetail from '@/pages/Mypage/MyReservation/MyReservationDetail';
import EditProfile from '@/pages/Mypage/MyProfile/EditProfile';
import FollowerList from '@/pages/Mypage/MyProfile/FollowerList';
import LocationSearchDetail from '@/pages/Search/LocationSearch/LocationSearchDetail';
import FunctionReservation from '@/pages/Search/LocationSearch/Reservation/Function_reservation';

const mainRoutes = {
  path: '/',
  element: <MobileLayout menuBar={<Menubar />} />,
  children: [
    {
      path: '/feed',
      element: <Feed />,
    },
    {
      path: '/feed/:boardId',
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
      path: '/search/person/:personId',
      element: <PersonSearchDetail />,
    },
    {
      path: '/search/location/:locationId',
      element: <LocationSearchDetail />,
    },
    {
      path: '/search/location/:locationId/reservation',
      element: <FunctionReservation />,
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
    {
      path: '/mypage/followers',
      element: <FollowerList />,
    },
  ],
};

const router = createBrowserRouter([mainRoutes, authRoutes]);

export default router;

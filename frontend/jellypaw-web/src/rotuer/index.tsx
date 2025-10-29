import { createBrowserRouter } from 'react-router-dom';

import Signup from '@/pages/Auth/Signup';
import Feed from '@/pages/Feed/Feed';
import Mypage from '@/pages/Mypage/Mypage';
import Pet from '@/pages/Pet/Pet';
import Search from '@/pages/Search/Search';

const router = createBrowserRouter([
  {
    path: '/',
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
    ],
  },
]);

export default router;

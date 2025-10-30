import Signup from '@/pages/Auth/Signup';
import AuthMobileLayout from '@/layouts/AuthMobileLayout';
import { Navigate } from 'react-router-dom';

const authRoutes = 
  {
    path: '/auth',
    element: <AuthMobileLayout />,
    children: [
    { index: true, element: <Navigate to="signup" replace /> }, // /auth → /auth/signup
    { path: 'signup', element: <Signup /> }, 
  ]
  }

export default authRoutes;

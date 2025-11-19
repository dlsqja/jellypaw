import { useEffect } from 'react';
import router from '@/routers';
import { RouterProvider } from 'react-router-dom';

export default function App() {
  useEffect(() => {
    // 🔹 React Router의 navigate를 전역으로 노출 (WebView에서 직접 호출 가능하도록)
    (window as any).__REACT_ROUTER_NAVIGATE = (path: string) => {
      try {
        router.navigate(path);
      } catch (e) {
        console.error('[App] Navigation error', e);
      }
    };

    // 🔹 전역 이벤트 리스너: 피드 탭 클릭 시 /feed로 네비게이션
    const navigateToFeedHandler = (event: CustomEvent<{ restoreScroll: boolean }>) => {
      const currentPath = window.location.pathname;
      if (currentPath !== '/feed' && currentPath !== '/feed/') {
        router.navigate('/feed');
      }
    };

    // 🔹 popstate 이벤트 리스너: window.history.pushState로 변경된 경우 React Router에 반영
    const popstateHandler = (event: PopStateEvent) => {
      const currentPath = window.location.pathname;
      // React Router가 자동으로 감지하지만, 확실하게 하기 위해 navigate 호출
      if (currentPath === '/feed' || currentPath === '/feed/') {
        router.navigate('/feed', { replace: true });
      }
    };

    window.addEventListener('NAVIGATE_TO_FEED', navigateToFeedHandler as EventListener);
    window.addEventListener('popstate', popstateHandler);
    
    return () => {
      window.removeEventListener('NAVIGATE_TO_FEED', navigateToFeedHandler as EventListener);
      window.removeEventListener('popstate', popstateHandler);
      delete (window as any).__REACT_ROUTER_NAVIGATE;
    };
  }, []);

  return <RouterProvider router={router} />;
}

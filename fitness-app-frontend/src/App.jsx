import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NavigationBar from './components/NavigationBar';
import StatusBar from './components/StatusBar';
import LoadingSpinner from './components/LoadingSpinner';

// 使用 React.lazy 实现页面组件的懒加载
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const DataPage = lazy(() => import('./pages/DataPage'));
const TrainPage = lazy(() => import('./pages/TrainPage'));
const DevicePage = lazy(() => import('./pages/DevicePage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// 私有路由守卫，用于保护需要登录才能访问的页面
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return user ? children : <Navigate to="/login" />;
}

// 主应用布局，包含状态栏、导航栏和页面内容
function AppLayout() {
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans flex flex-col">
      <StatusBar />
      <main className="flex-grow pb-16">
        {/* Suspense 用于在懒加载组件加载完成前显示 fallback 内容 */}
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
            <Route path="/data" element={<PrivateRoute><DataPage /></PrivateRoute>} />
            <Route path="/train" element={<PrivateRoute><TrainPage /></PrivateRoute>} />
            <Route path="/device" element={<PrivateRoute><DevicePage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          </Routes>
        </Suspense>
      </main>
      <NavigationBar />
    </div>
  );
}

// 应用根组件
function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
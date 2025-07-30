import { RouteObject } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OfflineGamePage } from './pages/OfflineGamePage';
import { GamesPage } from './pages/GamesPage';
import { GamePage } from './pages/GamePage';
import { ProtectedRoute } from './components/ProtectedRoute';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/games',
    element: (
      <ProtectedRoute>
        <GamesPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/game/:id',
    element: (
      <ProtectedRoute>
        <GamePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/offline-game',
    element: <OfflineGamePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
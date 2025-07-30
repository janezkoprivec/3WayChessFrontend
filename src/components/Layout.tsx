import { AppShell, Text, Group, Button, Stack } from '@mantine/core';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <AppShell padding="md">
        <AppShell.Main>
          {children || <Outlet />}
        </AppShell.Main>
      </AppShell>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Text size="lg" fw={700}>3Way Chess</Text>
          <Group>
            {user ? (
              <>
                <Button component={Link} to="/games" variant="subtle">Games</Button>
                <Button component={Link} to="/" variant="subtle">Home</Button>
                <Text size="sm" c="dimmed">Welcome, {user.username}</Text>
                <Button variant="subtle" onClick={logout}>Logout</Button>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" variant="subtle">Login</Button>
                <Button component={Link} to="/register" variant="subtle">Register</Button>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        {children || <Outlet />}
      </AppShell.Main>
    </AppShell>
  );
} 
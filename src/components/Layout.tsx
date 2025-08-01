import { AppShell, Text, Group, Button, Container } from '@mantine/core';
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
          <Container size="sm" mx="auto">
            {children || <Outlet />}
          </Container>
        </AppShell.Main>
      </AppShell>
    );
  }

  return (
    <AppShell
      header={{ height: 60 }}
      padding="md"
    >
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between">
            <Text size="lg" fw={700}>3Way Chess</Text>
            <Group gap="xs">
              {user ? (
                <>
                  <Button component={Link} to="/games" variant="subtle" size="sm">Games</Button>
                  <Button component={Link} to="/" variant="subtle" size="sm">Home</Button>
                  <Text size="sm" c="dimmed">Welcome, {user.username}</Text>
                  <Button variant="subtle" onClick={logout} size="sm">Logout</Button>
                </>
              ) : (
                <>
                  <Button component={Link} to="/login" variant="subtle" size="sm">Login</Button>
                  <Button component={Link} to="/register" variant="subtle" size="sm">Register</Button>
                </>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" mx="auto">
          {children || <Outlet />}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
} 
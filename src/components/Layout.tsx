import { AppShell, Text, Group, Button, Container, Avatar, Menu } from '@mantine/core';
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
        <Group h="100%" justify="space-between" px="md">
          <Text size="lg" fw={700}>3Way Chess</Text>
          <Group gap="xs">
            {user ? (
              <>
                <Button component={Link} to="/" variant="subtle" size="sm">Home</Button>
                <Text size="sm" c="dimmed">Welcome, {user.username}</Text>
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    {user.profilePictureUrl ? (
                      <div 
                        style={{ 
                          width: '32px', 
                          height: '32px', 
                          borderRadius: '50%', 
                          overflow: 'hidden',
                          border: '1px solid var(--mantine-color-gray-3)',
                          backgroundColor: 'var(--mantine-color-gray-1)',
                          cursor: 'pointer'
                        }}
                      >
                        <img 
                          src={user.profilePictureUrl} 
                          alt={user.username}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          crossOrigin="anonymous"
                        />
                      </div>
                    ) : (
                      <Avatar 
                        size="md" 
                        radius="xl"
                        color="blue"
                        style={{ cursor: 'pointer' }}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item component={Link} to="/profile">
                      Profile
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item onClick={logout} color="red">
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" variant="subtle" size="sm">Login</Button>
                <Button component={Link} to="/register" variant="subtle" size="sm">Register</Button>
              </>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" mx="auto">
          {children || <Outlet />}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
} 
import { Container, Title, Text, Stack, Paper, TextInput, PasswordInput, Button, Group, Divider, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value: string) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
      password: (value: string) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    try {
      await login(values.username, values.password);
      navigate('/');
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <Container size="xs">
      <Stack gap="xl" py="xl">
        <Title order={1} ta="center">
          Welcome Back
        </Title>
        
        <Paper p="xl" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {error && (
                <Alert color="red" title="Login Error">
                  {error}
                </Alert>
              )}
              
              <TextInput
                label="Username"
                placeholder="Enter your username"
                required
                {...form.getInputProps('username')}
              />
              
              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                {...form.getInputProps('password')}
              />
              
              <Button type="submit" fullWidth size="md" loading={isLoading} variant="filled">
                Sign In
              </Button>
            </Stack>
          </form>
          
          <Divider my="md" />
          
          <Group justify="center">
            <Text size="sm" c="dimmed">
              Don't have an account?{' '}
            </Text>
            <Button component={Link} to="/register" variant="subtle" size="sm">
              Sign Up
            </Button>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
} 
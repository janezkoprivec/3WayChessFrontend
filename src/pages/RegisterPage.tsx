import { Container, Title, Text, Stack, Paper, TextInput, PasswordInput, Button, Group, Divider, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value: string) => {
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return null;
      },
      email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      password: (value: string) => (value.length < 6 ? 'Password must be at least 6 characters' : null),
      confirmPassword: (value: string, values) => 
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    try {
      await register(values.username, values.email, values.password);
      navigate('/');
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Container size="xs">
      <Stack gap="xl" py="xl">
        <Title order={1} ta="center">
          Create Account
        </Title>
        
        <Paper p="xl" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              {error && (
                <Alert color="red" title="Registration Error">
                  {error}
                </Alert>
              )}
              
              <TextInput
                label="Username"
                placeholder="your_username"
                required
                {...form.getInputProps('username')}
              />
              
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                {...form.getInputProps('email')}
              />
              
              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                {...form.getInputProps('password')}
              />
              
              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                {...form.getInputProps('confirmPassword')}
              />
              
              <Button type="submit" fullWidth size="md" loading={isLoading}>
                Create Account
              </Button>
            </Stack>
          </form>
          
          <Divider my="md" />
          
          <Group justify="center">
            <Text size="sm" c="dimmed">
              Already have an account?{' '}
            </Text>
            <Button component={Link} to="/login" variant="subtle" size="sm">
              Sign In
            </Button>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
} 
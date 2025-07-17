import { Container, Title, Text, Stack, Button, Group } from '@mantine/core';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Container size="lg">
      <Stack gap="xl" align="center" py="xl">
        <Title order={1} ta="center" c="red">
          404 - Page Not Found
        </Title>
        <Text size="lg" ta="center" c="dimmed">
          The page you're looking for doesn't exist.
        </Text>
        <Group>
          <Button component={Link} to="/" variant="filled">
            Go Home
          </Button>
          <Button component={Link} to="/login" variant="light">
            Login
          </Button>
        </Group>
      </Stack>
    </Container>
  );
} 
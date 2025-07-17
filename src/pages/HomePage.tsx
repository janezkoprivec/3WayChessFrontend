import { Container, Title, Stack } from '@mantine/core';

export function HomePage() {
  return (
    <Container size="lg">
      <Stack gap="xl" py="xl">
        <Title order={1} ta="center">
          Welcome to 3Way Chess
        </Title>
      </Stack>
    </Container>
  );
} 
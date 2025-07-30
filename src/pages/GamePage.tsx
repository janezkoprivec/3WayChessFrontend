import { Container, Title, Text, Stack, Button } from '@mantine/core';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';

export function GamePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedColor = searchParams.get('color') || 'random';

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={2}>Game {id}</Title>
        <Text>Selected color: {selectedColor}</Text>
        <Text>This is a placeholder for the actual game implementation.</Text>
        
        <Button onClick={() => navigate('/games')} variant="outline">
          Back to Games
        </Button>
      </Stack>
    </Container>
  );
} 
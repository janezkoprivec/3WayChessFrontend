import { Container, Stack } from '@mantine/core';
import { ChessGame } from '../components/ChessGame';

export function OfflineGamePage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '600px'
        }}>
          <ChessGame 
            height={1000}
            showCoordinates={false}
          />
        </div>
      </Stack>
    </Container>
  );
} 
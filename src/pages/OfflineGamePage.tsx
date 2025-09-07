import { Container, Stack } from '@mantine/core';
import { ChessGame } from '../components/ChessGame';
import { useEffect, useState } from 'react';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export function OfflineGamePage() {

  const { height: windowHeight, width: windowWidth } = useWindowSize();

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
            height={windowHeight - 60}
            width={windowWidth}
            showCoordinates={false}
          />
        </div>
      </Stack>
    </Container>
  );
} 
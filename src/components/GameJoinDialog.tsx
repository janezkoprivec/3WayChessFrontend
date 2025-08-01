import { Modal, Text, Group, Button, Stack, SimpleGrid } from '@mantine/core';
import { Game } from '../types/game';
import { useState } from 'react';

interface GameJoinDialogProps {
  game: Game | null;
  opened: boolean;
  onClose: () => void;
  onJoin: (game: Game, selectedColor: string) => void;
}

export function GameJoinDialog({ game, opened, onClose, onJoin }: GameJoinDialogProps) {
  const [selectedColor, setSelectedColor] = useState('random');

  const handleJoin = () => {
    if (game) {
      onJoin(game, selectedColor);
    }
  };

  if (!game) return null;

  return (
    <Modal opened={opened} onClose={onClose} title="Join Game" size="md">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Join "{game.name}" created by {game.createdBy.username}
        </Text>

        <Text size="sm" fw={500}>
          Select your color:
        </Text>

        <SimpleGrid cols={4} spacing="xs">
          {[
            { value: 'random', label: 'Random', color: 'gray' },
            { value: 'white', label: 'White', color: 'white' },
            { value: 'grey', label: 'Grey', color: 'gray' },
            { value: 'black', label: 'Black', color: 'black' },
          ].map((option) => (
            <Button
              key={option.value}
              variant={selectedColor === option.value ? 'filled' : 'outline'}
              size="lg"
              onClick={() => setSelectedColor(option.value)}
              style={{
                backgroundColor: option.color === 'white' ? 'white' : 
                               option.color === 'black' ? 'black' : 
                               option.color === 'gray' ? '#808080' : 'transparent',
                color: option.color === 'white' ? 'black' : 
                       option.color === 'black' ? 'white' : 'inherit',
                border: selectedColor === option.value ? '3px solid #228be6' : 
                       option.color === 'white' ? '1px solid #ccc' : '1px solid #ddd',
                minHeight: '60px',
                fontSize: option.label === 'Random' ? '24px' : '16px',
                fontWeight: option.label === 'Random' ? 'bold' : 'normal',
              }}
            >
              {option.label === 'Random' ? '?' : ''}
            </Button>
          ))}
        </SimpleGrid>

        <Group justify="flex-end" gap="sm">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleJoin}>
            Join Game
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
} 
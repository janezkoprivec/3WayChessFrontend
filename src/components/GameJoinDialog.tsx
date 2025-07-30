import { Modal, Title, Text, Group, Button, Stack, Radio } from '@mantine/core';
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
          Join "{game.name}" created by {game.createdBy}
        </Text>

        <Text size="sm" fw={500}>
          Select your color:
        </Text>

        <Radio.Group
          value={selectedColor}
          onChange={setSelectedColor}
          name="color-selection"
        >
          <Stack gap="xs">
            <Radio value="random" label="Random" />
            <Radio value="white" label="White" />
            <Radio value="black" label="Black" />
          </Stack>
        </Radio.Group>

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
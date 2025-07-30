import { Card, Text, Group, Badge, Stack } from '@mantine/core';
import { Game } from '../types/game';

interface GameListItemProps {
  game: Game;
}

export function GameListItem({ game }: GameListItemProps) {
  const formatTimeControl = (timeControl: Game['timeControl']) => {
    const minutes = Math.floor(timeControl.time / 60);
    const seconds = timeControl.time % 60;
    const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    return `${timeString} + ${timeControl.increment}s`;
  };

  const getStatusColor = (status: Game['status']) => {
    switch (status) {
      case 'waiting':
        return 'blue';
      case 'active':
        return 'green';
      case 'finished':
        return 'gray';
      default:
        return 'gray';
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start">
          <Text fw={500} size="lg" lineClamp={1}>
            {game.name}
          </Text>
          <Badge color={getStatusColor(game.status)} variant="light">
            {game.status}
          </Badge>
        </Group>

        <Group gap="xs">
          <Text size="sm" c="dimmed">
            Created by: {game.createdBy}
          </Text>
        </Group>

        <Group gap="md">
          <Text size="sm">
            Time: {formatTimeControl(game.timeControl)}
          </Text>
          <Text size="sm">
            Players: {game.players.length}/2
          </Text>
        </Group>

        {game.players.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>Players:</Text>
            {game.players.map((player, index) => (
              <Text key={index} size="sm" c="dimmed">
                {player.color}: {player.user.username}
              </Text>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
} 
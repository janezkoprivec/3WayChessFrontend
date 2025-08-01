import { Card, Text, Group, Badge, Stack, Avatar, Image } from '@mantine/core';
import { Game } from '../types/game';

interface GameListItemProps {
  game: Game;
}

export function GameListItem({ game }: GameListItemProps) {
  const formatTimeControl = (timeControl: Game['timeControl']) => {
    const minutes = Math.floor(timeControl.time / 60);
    return `${minutes}+${timeControl.increment}`;
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

  const getChessPieceIcon = (color: string) => {
    const colorMap: Record<string, string> = {
      'white': '/pieces/white/white-king.svg',
      'black': '/pieces/black/black-king.svg',
      'grey': '/pieces/grey/grey-king.svg',
      'gray': '/pieces/grey/grey-king.svg'
    };
    return colorMap[color.toLowerCase()] || colorMap['white'];
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Text fw={500} size="lg" lineClamp={1}>
            {game.name}
          </Text>
          <Badge color={getStatusColor(game.status)} variant="light">
            {game.status.toUpperCase()}
          </Badge>
        </Group>

        <Group gap="xs" align="center">
          <Avatar 
            src={game.createdBy.profilePictureUrl} 
            alt={game.createdBy.username}
            size="sm"
            radius="xl"
          />
          <Text size="sm" c="dimmed">
            Created by: {game.createdBy.username}
          </Text>
        </Group>

        <Group gap="md">
          <Text size="sm">
            Time: {formatTimeControl(game.timeControl)}
          </Text>
          <Text size="sm">
            Players: {game.players.length}/3
          </Text>
        </Group>

        {game.players.length > 0 && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>Players:</Text>
            {game.players.map((player, index) => (
              <Group key={index} gap="xs" align="center">
                <Image 
                  src={getChessPieceIcon(player.color)} 
                  alt={player.color}
                  w={16}
                  h={16}
                  fit="contain"
                />
                <Avatar 
                  src={player.user.profilePictureUrl} 
                  alt={player.user.username}
                  size="xs"
                  radius="xl"
                />
                <Text size="sm" c="dimmed">
                  {player.user.username}
                </Text>
              </Group>
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
} 
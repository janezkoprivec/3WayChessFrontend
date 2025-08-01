import { Modal, Group, Button, Stack, TextInput, Title, Paper, SimpleGrid, ActionIcon, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { TimeControl } from '../types/game';
import { IconCircleDot, IconBolt, IconClock } from '@tabler/icons-react';

interface CreateGameDialogProps {
  opened: boolean;
  onClose: () => void;
  onCreate: (gameName: string, selectedColor: string, timeControl: TimeControl) => void;
}

export function CreateGameDialog({ opened, onClose, onCreate }: CreateGameDialogProps) {
  const form = useForm({
    initialValues: {
      gameName: '',
      selectedColor: 'random',
      timeControlType: 'rapid',
      initialTime: 600,
      increment: 0,
    },
    validate: {
      gameName: (value) => (value.length < 3 ? 'Game name must be at least 3 characters' : null),
      initialTime: (value) => (value < 30 ? 'Initial time must be at least 30 seconds' : null),
      increment: (value) => (value < 0 ? 'Increment cannot be negative' : null),
    },
  });

  const handleSubmit = (values: typeof form.values) => {
    const timeControl: TimeControl = {
      type: values.timeControlType as 'blitz' | 'rapid' | 'bullet',
      time: values.initialTime,
      increment: values.increment,
    };
    
    onCreate(values.gameName, values.selectedColor, timeControl);
    form.reset();
  };

  const timeControlOptions = {
    bullet: [
      { label: '1+0', time: 60, increment: 0 },
      { label: '1+1', time: 60, increment: 1 },
      { label: '2+1', time: 120, increment: 1 },
    ],
    blitz: [
      { label: '3+0', time: 180, increment: 0 },
      { label: '3+2', time: 180, increment: 2 },
      { label: '5+0', time: 300, increment: 0 },
    ],
    rapid: [
      { label: '10+0', time: 600, increment: 0 },
      { label: '15+10', time: 900, increment: 10 },
      { label: '30+0', time: 1800, increment: 0 },
    ],
  };

  const colorOptions = [
    { value: 'random', label: 'Random', color: 'gray' },
    { value: 'white', label: 'White', color: 'white' },
    { value: 'grey', label: 'Grey', color: 'gray' },
    { value: 'black', label: 'Black', color: 'black' },
  ];

  const handleTimeControlSelect = (type: string, time: number, increment: number) => {
    form.setValues({
      timeControlType: type,
      initialTime: time,
      increment: increment,
    });
  };

  const handleColorSelect = (color: string) => {
    form.setValues({ selectedColor: color });
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Create New Game" size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <TextInput
            label="Game Name"
            placeholder="Enter game name (optional)"
            {...form.getInputProps('gameName')}
          />

          <Box>
            <Title order={6} mb="sm">Time Control</Title>
            <Stack gap="md">
              <Paper p="sm" withBorder>
                <Group gap="xs" mb="xs">
                  <ActionIcon size="sm" variant="subtle">
                    <IconCircleDot size={16} />
                  </ActionIcon>
                  <Title order={6}>Bullet</Title>
                </Group>
                <SimpleGrid cols={3} spacing="xs">
                  {timeControlOptions.bullet.map((option) => (
                    <Button
                      key={option.label}
                      variant={form.values.timeControlType === 'bullet' && 
                              form.values.initialTime === option.time && 
                              form.values.increment === option.increment ? 'filled' : 'outline'}
                      size="xs"
                      onClick={() => handleTimeControlSelect('bullet', option.time, option.increment)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </SimpleGrid>
              </Paper>

              <Paper p="sm" withBorder>
                <Group gap="xs" mb="xs">
                  <ActionIcon size="sm" variant="subtle">
                    <IconBolt size={16} />
                  </ActionIcon>
                  <Title order={6}>Blitz</Title>
                </Group>
                <SimpleGrid cols={3} spacing="xs">
                  {timeControlOptions.blitz.map((option) => (
                    <Button
                      key={option.label}
                      variant={form.values.timeControlType === 'blitz' && 
                              form.values.initialTime === option.time && 
                              form.values.increment === option.increment ? 'filled' : 'outline'}
                      size="xs"
                      onClick={() => handleTimeControlSelect('blitz', option.time, option.increment)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </SimpleGrid>
              </Paper>

              <Paper p="sm" withBorder>
                <Group gap="xs" mb="xs">
                  <ActionIcon size="sm" variant="subtle">
                    <IconClock size={16} />
                  </ActionIcon>
                  <Title order={6}>Rapid</Title>
                </Group>
                <SimpleGrid cols={3} spacing="xs">
                  {timeControlOptions.rapid.map((option) => (
                    <Button
                      key={option.label}
                      variant={form.values.timeControlType === 'rapid' && 
                              form.values.initialTime === option.time && 
                              form.values.increment === option.increment ? 'filled' : 'outline'}
                      size="xs"
                      onClick={() => handleTimeControlSelect('rapid', option.time, option.increment)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </SimpleGrid>
              </Paper>
            </Stack>
          </Box>

          <Box>
            <Title order={6} mb="sm">Select Your Color</Title>
            <SimpleGrid cols={4} spacing="xs">
              {colorOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={form.values.selectedColor === option.value ? 'filled' : 'outline'}
                  size="lg"
                  onClick={() => handleColorSelect(option.value)}
                  style={{
                    backgroundColor: option.color === 'white' ? 'white' : 
                                   option.color === 'black' ? 'black' : 
                                   option.color === 'gray' ? '#808080' : 'transparent',
                    color: option.color === 'white' ? 'black' : 
                           option.color === 'black' ? 'white' : 'inherit',
                    border: form.values.selectedColor === option.value ? '3px solid #228be6' : 
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
          </Box>

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
} 
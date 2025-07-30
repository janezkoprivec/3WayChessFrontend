import { Modal, Group, Button, Stack, TextInput, Select, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { TimeControl } from '../types/game';

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

  const timeControlOptions = [
    { value: 'blitz', label: 'Blitz' },
    { value: 'rapid', label: 'Rapid' },
    { value: 'classical', label: 'Classical' },
  ];

  const colorOptions = [
    { value: 'random', label: 'Random' },
    { value: 'white', label: 'White' },
    { value: 'black', label: 'Black' },
  ];

  return (
    <Modal opened={opened} onClose={onClose} title="Create New Game" size="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Game Name"
            placeholder="Enter game name"
            required
            {...form.getInputProps('gameName')}
          />

          <Select
            label="Your Color"
            data={colorOptions}
            {...form.getInputProps('selectedColor')}
          />

          <Select
            label="Time Control Type"
            data={timeControlOptions}
            {...form.getInputProps('timeControlType')}
          />

          <NumberInput
            label="Initial Time (seconds)"
            placeholder="600"
            min={30}
            {...form.getInputProps('initialTime')}
          />

          <NumberInput
            label="Increment (seconds)"
            placeholder="0"
            min={0}
            {...form.getInputProps('increment')}
          />

          <Group justify="flex-end" gap="sm">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Game
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
} 
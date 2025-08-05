import { useState, useEffect } from 'react';
import { Container, Paper, Stack, Text, Avatar, Group, Title, Button, Modal, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useAuth } from '../contexts/AuthContext';
import { AuthService, User } from '../services/authService';
import { ApiService } from '../services/api';

export function ProfilePage() {
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const form = useForm({
    initialValues: {
      profilePictureUrl: '',
    },
    validate: {
      profilePictureUrl: (value) => (value ? null : 'Profile picture URL is required'),
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AuthService.getCurrentUser();
        setProfileUser(userData);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="md">
          <Stack align="center" gap="md">
            <Text>Loading profile...</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const displayUser = profileUser || user;

  if (!displayUser) {
    return (
      <Container size="md" py="xl">
        <Paper p="xl" radius="md">
          <Stack align="center" gap="md">
            <Text>No user data available</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditProfilePicture = () => {
    form.setFieldValue('profilePictureUrl', displayUser?.profilePictureUrl || '');
    setEditDialogOpen(true);
  };

  const handleUpdateProfilePicture = async (values: { profilePictureUrl: string }) => {
    setUpdating(true);
    try {
      await ApiService.put('/auth/profile-picture', { profilePictureUrl: values.profilePictureUrl });
      
      const updatedUser = await AuthService.getCurrentUser();
      setProfileUser(updatedUser);
      setEditDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to update profile picture:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Container size="md" py="xl">
      <Paper p="xl" radius="md" withBorder>
        <Group align="flex-start" gap="xl">
          <Stack align="center" gap="md">
            {displayUser.profilePictureUrl ? (
              <div 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  overflow: 'hidden',
                  border: '1px solid var(--mantine-color-gray-3)',
                  backgroundColor: 'var(--mantine-color-gray-1)'
                }}
              >
                <img 
                  src={displayUser.profilePictureUrl} 
                  alt={displayUser.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  crossOrigin="anonymous"
                />
              </div>
            ) : (
              <Avatar 
                size="xl" 
                radius="xl"
                color="blue"
              >
                {getInitials(displayUser.username)}
              </Avatar>
            )}
            <Button variant="outline" size="sm" onClick={handleEditProfilePicture}>
              Edit
            </Button>
          </Stack>

          <Stack gap="md" style={{ flex: 1 }}>
            <Title order={2}>Profile</Title>
            
            <Stack gap="md">
              <Group >
                <Text fw={500}>Username:</Text>
                <Text>{displayUser.username}</Text>
              </Group>
              
              <Group >
                <Text fw={500}>Email:</Text>
                <Text>{displayUser.email}</Text>
              </Group>
              
              <Group >
                <Text fw={500}>User ID:</Text>
                <Text size="sm" c="dimmed">{displayUser.id}</Text>
              </Group>
            </Stack>
          </Stack>
        </Group>
      </Paper>

      <Modal 
        opened={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        title="Edit Profile Picture"
        centered
      >
        <form onSubmit={form.onSubmit(handleUpdateProfilePicture)}>
          <Stack gap="md">
            <TextInput
              label="Profile Picture URL"
              placeholder="Enter image URL"
              {...form.getInputProps('profilePictureUrl')}
            />
            <Group justify="flex-end" gap="xs">
              <Button variant="subtle" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={updating}>
                Update
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
} 
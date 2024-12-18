import { UserConfig } from '@shared-types/api';
import { getSession } from 'next-auth/react';

/**
 * Fetch user configuration.
 * @returns A promise that resolves to the user's configuration object.
 * @throws Will throw an error if the fetch fails or the user is not authenticated.
 */
export const fetchUserConfigApi = async (): Promise<UserConfig> => {
  const session = await getSession();
  if (!session) throw new Error('User is not authenticated');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/config`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as UserConfig;
};

/**
 * Update a specific user configuration key.
 * @param configKey - The key of the configuration to update.
 * @param configValue - The new value for the configuration key.
 * @returns A promise that resolves to a success message.
 * @throws Will throw an error if the fetch fails or the user is not authenticated.
 */
export const updateUserConfigApi = async <K extends keyof UserConfig>(
  configKey: K,
  configValue: UserConfig[K]
): Promise<{ message: string }> => {
  const session = await getSession();
  if (!session) throw new Error('User is not authenticated');

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/user/config`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ configKey, configValue }),
    }
  );

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as { message: string };
};

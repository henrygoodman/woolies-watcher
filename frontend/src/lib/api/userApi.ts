import { getSession } from 'next-auth/react';

/**
 * Fetch the user's destination email.
 * @returns A promise that resolves to the user's destination email as a string.
 * @throws Will throw an error if the fetch fails or the user is not authenticated.
 */
export const fetchUserDestinationEmailApi = async (): Promise<string> => {
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
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.destinationEmail as string;
};

/**
 * Update the user's destination email.
 * @param destinationEmail - The new destination email to set.
 * @returns A promise that resolves to a success message.
 * @throws Will throw an error if the fetch fails or the user is not authenticated.
 */
export const updateUserDestinationEmailApi = async (
  destinationEmail: string
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
      body: JSON.stringify({ destinationEmail }),
    }
  );

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as { message: string };
};

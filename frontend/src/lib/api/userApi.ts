import { DBUser, DBUserSchema } from '@shared-types/db';
import { getSession } from 'next-auth/react';

/**
 * Fetch the user's data.
 * @returns A promise that resolves to the user's data object.
 * @throws Will throw an error if the fetch fails or the user is not authenticated.
 */
export const fetchUserApi = async (): Promise<DBUser> => {
  const session = await getSession();
  if (!session) throw new Error('User is not authenticated');

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return DBUserSchema.parse(data.user);
};

/**
 * Update the user's data.
 * @param updatedFields - The fields to update in the user data.
 * @returns A promise that resolves to a success message.
 * @throws Will throw an error if the fetch fails or the user is not authenticated.
 */
export const updateUserApi = async (
  updatedFields: Partial<DBUser>
): Promise<{ message: string }> => {
  const session = await getSession();
  if (!session) throw new Error('User is not authenticated');

  const { email } = session.user!;
  if (!email) throw new Error('User email is missing');

  const existingUser = await fetchUserApi();

  const updatedUser: DBUser = {
    ...existingUser,
    ...updatedFields,
    email,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify(updatedUser),
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return (await response.json()) as { message: string };
};

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface NotificationSettingsRequest {
  email: string;
  notify_time: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
}

export type UserConfig = {
  daily_notification_time?: string;
  notification_email?: string;
  timezone?: string;
  [key: string]: string | undefined;
};

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

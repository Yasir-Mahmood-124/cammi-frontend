export interface LoginResponse {
  message: string;
  token: string;
  onboarding_status: boolean;
  user: {
    email: string;
    id: string;
  };
}
export interface LoginRequest {
  email: string;
  password: string;
}

export default interface UserInterface {
  _id: string;
  google_id: string | null;
  github_id: string | null;
  github_username: string | null;
  github_profile_url: string | null;
  github_avatar_url: string | null;
  github_connected: boolean | null;
  github_connected_at: Date | null;
  name: string;
  email: string;
  password: string | null;
  bio: string;
  profile_picture: string;
  account_role: "user" | "admin";
  otp?: string | null;
  otp_expiry?: Date | null;
  is_verified?: boolean;
  github_access_token?: string | null;
  resetPassword_token?: string | null;
  resetPassword_token_expiry?: Date | null;
  job_role: string;
  created_at: Date;
  updated_at: Date;
}
export interface UserUpdateInterface {
  name?: string;
  bio?: string;
  profile_picture?: string;
  job_role?: string;
  password?: string;
  email?: string;
}

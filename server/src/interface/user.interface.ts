export default interface UserInterface {
  _id: string;
  google_id: string | null;
  github_id: string | null;
  name: string;
  email: string;
  password: string | null;
  bio: string;
  profile_picture: string;
  account_role: "user" | "admin";
  otp?: string | null;
  otp_expiry?: Date | null;
  is_verified?: boolean;
  resetPassword_token?: string | null;
  resetPassword_token_expiry?: Date | null;
  job_role: string;
  created_at: Date;
  updated_at: Date;
}

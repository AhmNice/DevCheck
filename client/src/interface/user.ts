export interface UserInterface {
  _id: string;
  google_id?: string | null;
  github_id?: string | null;
  name: string;
  email: string;
  bio?: string | null;
  profile_picture?: string | null;
  account_role: string;
  is_verified: boolean;
  role?: string | null;
  jobTitle?: string | null;
  account_type?: string | null;
  created_at: string;
  updated_at: string;
  failed_attempts: number;
  lock_until?: string | null;
  is_suspended: boolean;
  github_avatar_url?: string | null;
  github_username?: string | null;
  github_profile_url?: string | null;
  github_connected: boolean;
  github_connected_at?: string | null;
  sync_personal_repos: boolean;
}

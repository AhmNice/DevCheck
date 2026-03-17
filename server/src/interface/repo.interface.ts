export interface RepoInterface {
  user_id: string;
  github_repo_id: string;
  owner: string;
  name: string;
  full_name: string;
  default_branch?: string;
  connected_at?: Date;
  visibility?: string;
  repo_url?: string;
  last_synced_at?: Date;
  active?: boolean;
}

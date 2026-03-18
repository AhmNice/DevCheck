import { Octokit } from "@octokit/rest";
import { GitHubRepo } from "../model/Repo.js";

export class GitHubService {
  static getUserRepos = async (accessToken: string) => {
    try {
      const octokitWithAuth = new Octokit({ auth: accessToken });
      const { data } = await octokitWithAuth.repos.listForAuthenticatedUser();
      return data;
    } catch (error) {
      console.error("Error fetching GitHub repos:", error);
      throw error;
    }
  };
  static searchRepos = async (query: string, accessToken: string) => {
    try {
      const octokit = new Octokit({ auth: accessToken });
      const { data: repos } = await octokit.repos.listForAuthenticatedUser({
        per_page: 100,
      });
      const filteredRepos = repos.filter((repo) =>
        repo.name.toLowerCase().includes(query.toLowerCase()),
      );
      return filteredRepos;
    } catch (error) {
      console.error("Error searching GitHub repos:", error);
      throw error;
    }
  };
  static connectRepo = async ({
    user_id,
    accessToken,
    repoFullName,
  }: {
    user_id: string;
    accessToken: string;
    repoFullName: string;
  }) => {
    const octokit = new Octokit({ auth: accessToken });
    try {
      const { data: repo } = await octokit.repos.get({
        owner: repoFullName.split("/")[0],
        repo: repoFullName.split("/")[1],
      });
      const Repo = await new GitHubRepo({
        user_id: user_id,
        github_repo_id: repo.id.toString(),
        owner: repo.owner.login,
        name: repo.name,
        full_name: repo.full_name,
        default_branch: repo.default_branch,
        visibility: repo.visibility,
        repo_url: repo.html_url,
        last_synced_at: new Date(),
        active: true,
      }).connect();
      return Repo;
    } catch (error) {
      console.error("Error connecting to GitHub repo:", error);
      throw error;
    }
  };
}

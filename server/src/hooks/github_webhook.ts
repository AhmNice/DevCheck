import { Octokit } from "@octokit/rest";
import config from "../config/config.js";

export const createGitHubWebhook = async (
  github_access_token: string,
  ownerPayload: { owner: string; repo: string },
) => {
  const octokit = new Octokit({
    auth: github_access_token,
  });
  await octokit.rest.repos.createWebhook({
    owner: ownerPayload.owner,
    repo: ownerPayload.repo,
    config: {
      url:
        config.NODE_ENV === "development"
          ? config.DEV_WEBHOOK_URL
          : config.PROD_WEBHOOK_URL,
      secret: config.GITHUB_WEBHOOK_SECRET,
      content_type: "json",
    },
    events: ["issues"],
    active: true,
  });
};

import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_ORG = process.env.GITHUB_ORG || 'whoisdesirtech';
const GITHUB_TEMPLATE_OWNER = process.env.GITHUB_TEMPLATE_OWNER || GITHUB_ORG;
const GITHUB_TEMPLATE_REPO = process.env.GITHUB_TEMPLATE_REPO || 'training-template';

function getOctokit(): Octokit {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }
  return new Octokit({ auth: GITHUB_TOKEN });
}

export interface CreateRepoResult {
  success: boolean;
  repoName?: string;
  repoUrl?: string;
  owner?: string;
  githubRepositoryId?: number;
  defaultBranch?: string;
  error?: string;
}

export function generateRepoName(lessonSlug: string): string {
  const shortId = Math.random().toString(36).substring(2, 8);
  const safeSlug = lessonSlug.replace(/[^a-z0-9-]/g, '-').substring(0, 30);
  return `wid-${safeSlug}-${shortId}`;
}

export async function createTrainingRepo(
  repoName: string,
  lessonTitle: string,
): Promise<CreateRepoResult> {
  try {
    const octokit = getOctokit();

    // Verify the template repo exists
    try {
      await octokit.repos.get({
        owner: GITHUB_TEMPLATE_OWNER,
        repo: GITHUB_TEMPLATE_REPO,
      });
    } catch {
      // Template doesn't exist — create a regular empty repo instead
      const result = await octokit.repos.createInOrg({
        org: GITHUB_ORG,
        name: repoName,
        description: `Training: ${lessonTitle}`,
        private: true,
        auto_init: true,
      });

      return {
        success: true,
        repoName: result.data.name,
        repoUrl: result.data.html_url,
        owner: result.data.owner.login,
        githubRepositoryId: result.data.id,
        defaultBranch: result.data.default_branch,
      };
    }

    // Create repo from template
    const result = await octokit.repos.createUsingTemplate({
      template_owner: GITHUB_TEMPLATE_OWNER,
      template_repo: GITHUB_TEMPLATE_REPO,
      name: repoName,
      description: `Training: ${lessonTitle}`,
      include_all_branches: false,
      private: true,
    });

    return {
      success: true,
      repoName: result.data.name,
      repoUrl: result.data.html_url,
      owner: result.data.owner.login,
      githubRepositoryId: result.data.id,
      defaultBranch: result.data.default_branch,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function getRepoStatus(
  owner: string,
  repoName: string,
): Promise<{ exists: boolean; archived?: boolean; url?: string }> {
  try {
    const octokit = getOctokit();
    const result = await octokit.repos.get({ owner, repo: repoName });
    return {
      exists: true,
      archived: result.data.archived,
      url: result.data.html_url,
    };
  } catch {
    return { exists: false };
  }
}

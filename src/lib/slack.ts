const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_WORKSPACE_URL = process.env.SLACK_WORKSPACE_URL || '';

export interface SlackLookupResult {
  success: boolean;
  slackUserId?: string;
  realName?: string;
  displayName?: string;
  workspaceId?: string;
  workspaceName?: string;
  error?: string;
}

export async function lookupSlackUser(email: string): Promise<SlackLookupResult> {
  if (!SLACK_BOT_TOKEN) {
    return { success: false, error: 'Slack integration not configured' };
  }

  try {
    const res = await fetch(
      `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(email)}`,
      {
        headers: {
          Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await res.json();

    if (!data.ok) {
      return { success: false, error: data.error || 'lookup_failed' };
    }

    return {
      success: true,
      slackUserId: data.user.id,
      realName: data.user.real_name,
      displayName: data.user.profile?.display_name || data.user.name,
      workspaceId: data.team,
      workspaceName: undefined,
    };
  } catch {
    return { success: false, error: 'Failed to reach Slack API' };
  }
}

export function isSlackConfigured(): boolean {
  return !!SLACK_BOT_TOKEN;
}

export function getWorkspaceUrl(): string {
  return SLACK_WORKSPACE_URL;
}

export type RoleTrainingConfig = {
  lessons: string[];
  integrations: string[];
  deliverableTypes: string[];
};

export const ROLE_TRAINING: Record<string, RoleTrainingConfig> = {
  'developer': {
    lessons: ['developer-full', 'secret-key-rotation', 'google-calendar-setup', 'slack-fundamentals'],
    integrations: ['github', 'slack'],
    deliverableTypes: ['code', 'document'],
  },
  'developer-intern': {
    lessons: ['developer-intern', 'secret-key-rotation', 'google-calendar-setup', 'slack-fundamentals'],
    integrations: ['github', 'slack'],
    deliverableTypes: ['code', 'document'],
  },
  'photography': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['image'],
  },
  'videography': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['video', 'image'],
  },
  'social-media': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['image', 'video', 'document'],
  },
  'designer': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['design', 'image'],
  },
  'ai-automation': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['document', 'code'],
  },
  'web-designer': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['design', 'code', 'image'],
  },
  'copywriter': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['document'],
  },
  'motion-designer': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['video', 'design'],
  },
  'virtual-assistant': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['document'],
  },
  'marketing-specialist': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['document', 'image'],
  },
  'podcast-editor': {
    lessons: ['contractor-onboarding'],
    integrations: ['slack'],
    deliverableTypes: ['video', 'document'],
  },
};

export const INTEGRATION_LABELS: Record<string, string> = {
  github: 'GitHub',
  slack: 'Slack',
};

export function getRoleConfig(role: string): RoleTrainingConfig | undefined {
  return ROLE_TRAINING[role];
}

export function getRequiredIntegrations(role: string): string[] {
  return ROLE_TRAINING[role]?.integrations ?? [];
}

export function getRoleLessons(role: string): string[] {
  return ROLE_TRAINING[role]?.lessons ?? [];
}

export type ContractorReadiness = {
  trained: boolean;
  trainingProgress: number;
  totalLessons: number;
  completedLessons: number;
  integrationsVerified: { github: boolean; slack: boolean };
  integrationsRequired: string[];
  currentProject: string | null;
  activeTasks: number;
  status: 'ready' | 'in_training' | 'not_started';
};

export function computeReadiness(data: {
  roleLessons: string[];
  completedLessonIds: string[];
  githubVerified: boolean;
  slackVerified: boolean;
  integrationsRequired: string[];
  projectName: string | null;
  activeTaskCount: number;
}): ContractorReadiness {
  const total = data.roleLessons.length;
  const completed = data.completedLessonIds.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const allIntegrationsMet = data.integrationsRequired.every(integration => {
    if (integration === 'github') return data.githubVerified;
    if (integration === 'slack') return data.slackVerified;
    return true;
  });

  const trained = progress === 100 && allIntegrationsMet;

  let status: ContractorReadiness['status'] = 'not_started';
  if (trained) {
    status = 'ready';
  } else if (progress > 0) {
    status = 'in_training';
  }

  return {
    trained,
    trainingProgress: progress,
    totalLessons: total,
    completedLessons: completed,
    integrationsVerified: {
      github: data.githubVerified,
      slack: data.slackVerified,
    },
    integrationsRequired: data.integrationsRequired,
    currentProject: data.projectName,
    activeTasks: data.activeTaskCount,
    status,
  };
}

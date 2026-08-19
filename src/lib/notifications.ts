import { prisma } from './prisma';

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  return prisma.notification.create({ data: params });
}

export async function createNotificationForUsers(
  userIds: string[],
  type: string,
  title: string,
  message: string,
  link?: string
) {
  if (userIds.length === 0) return;
  return prisma.notification.createMany({
    data: userIds.map(userId => ({ userId, type, title, message, link })),
  });
}

export async function getUnreadCount(userId: string) {
  const result = await prisma.notification.aggregate({
    where: { userId, read: false },
    _count: true,
  });
  return result._count;
}

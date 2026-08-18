import { getServerSession } from 'next-auth';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { prisma } from './prisma';
import { logAudit } from './audit';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  agencyId: string | null;
  contractorId: string | null;
  clientId: string | null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          agencyId: user.agencyId,
          contractorId: user.contractorId,
          clientId: user.clientId,
        };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  events: {
    async signIn({ user, isNewUser }) {
      const u = user as SessionUser | null;
      if (u?.email) {
        await logAudit({
          id: u.id,
          email: u.email,
          name: u.name || '',
          role: u.role || 'unknown',
          agencyId: u.agencyId ?? null,
          contractorId: u.contractorId ?? null,
          clientId: u.clientId ?? null,
        }, { action: 'auth.signin', entity: 'User', entityId: u.id, metadata: { isNewUser: !!isNewUser } });
      }
    },
    async signOut({ token }) {
      if (token?.email) {
        await logAudit(null, { action: 'auth.signout', metadata: { email: token.email as string } });
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as SessionUser).role;
        token.agencyId = (user as SessionUser).agencyId ?? null;
        token.contractorId = (user as SessionUser).contractorId ?? null;
        token.clientId = (user as SessionUser).clientId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as SessionUser).id = token.id as string;
        (session.user as SessionUser).role = token.role as string;
        (session.user as SessionUser).agencyId = token.agencyId as string | null ?? null;
        (session.user as SessionUser).contractorId = token.contractorId as string | null ?? null;
        (session.user as SessionUser).clientId = token.clientId as string | null ?? null;
      }
      return session;
    },
  },
  pages: { signIn: '/login' },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function getSession() {
  return getServerSession(authOptions);
}

export function getSessionUser(session: Awaited<ReturnType<typeof getSession>>): SessionUser | null {
  if (!session?.user) return null;
  const u = session.user as SessionUser;
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    agencyId: u.agencyId ?? null,
    contractorId: u.contractorId ?? null,
    clientId: u.clientId ?? null,
  };
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export function forbiddenResponse(message = 'Forbidden: insufficient permissions'): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export async function requireAuth(roles?: string[]): Promise<SessionUser | NextResponse> {
  const session = await getSession();
  const user = getSessionUser(session);
  if (!user) return unauthorizedResponse();
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return forbiddenResponse();
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  return requireAuth(['admin']);
}

export async function requireAdminOrStaff(): Promise<SessionUser | NextResponse> {
  return requireAuth(['admin', 'staff']);
}

export async function requireContractor(): Promise<SessionUser | NextResponse> {
  return requireAuth(['contractor']);
}

export async function requireClient(): Promise<SessionUser | NextResponse> {
  return requireAuth(['client']);
}

export function isNextResponse(value: SessionUser | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}

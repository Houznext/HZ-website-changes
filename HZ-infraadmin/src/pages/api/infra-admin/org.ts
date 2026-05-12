import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import type { InfraOrgUser } from '@/types/infra-admin-org.types';
import {
  applyOrgSnapshotPut,
  listPublicUsers,
  readInfraOrgStore,
  writeInfraOrgStore,
} from '@/server/infraAdminFileStore';

function canMutateOrg(session: Session | null): boolean {
  if (!session?.user) return false;
  if (session.user.role === 'SuperAdmin') return true;
  const memberships = session.branchMemberships ?? session.user.branchMemberships ?? [];
  return memberships.some((m) =>
    m.permissions.some(
      (p) =>
        (p.resource === 'users' || p.resource === 'branches' || p.resource === 'roles') && p.edit,
    ),
  );
}

function canReadOrg(session: Session | null): boolean {
  return !!session?.user?.email;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'GET') {
    if (!canReadOrg(session)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const store = readInfraOrgStore();
    const users = listPublicUsers(store);
    const loginReady = new Map(
      store.accounts.map((a) => [a.id, !!(a.passwordHash && a.passwordHash.length > 10)]),
    );
    res.status(200).json({
      branches: store.branches,
      roles: store.roles,
      users,
      loginReady: Object.fromEntries(loginReady),
    });
    return;
  }

  if (req.method === 'PUT') {
    if (!canMutateOrg(session)) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const body = req.body as {
      branches?: unknown;
      roles?: unknown;
      users?: unknown;
      userPasswords?: Record<string, string>;
    };

    if (!Array.isArray(body.branches) || !Array.isArray(body.roles) || !Array.isArray(body.users)) {
      res.status(400).json({ error: 'Invalid body' });
      return;
    }

    const current = readInfraOrgStore();
    try {
      const next = applyOrgSnapshotPut(current, {
        branches: body.branches as typeof current.branches,
        roles: body.roles as typeof current.roles,
        users: body.users as InfraOrgUser[],
        userPasswords: body.userPasswords,
      });
      writeInfraOrgStore(next);
      res.status(200).json({
        branches: next.branches,
        roles: next.roles,
        users: listPublicUsers(next),
        loginReady: Object.fromEntries(
          next.accounts.map((a) => [a.id, !!(a.passwordHash && a.passwordHash.length > 10)]),
        ),
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.startsWith('NEW_USER_NEEDS_PASSWORD')) {
        res.status(400).json({ error: 'New users must have a password set once.' });
        return;
      }
      console.error('[infra-admin/org PUT]', e);
      res.status(500).json({ error: 'Save failed' });
    }
    return;
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end();
}

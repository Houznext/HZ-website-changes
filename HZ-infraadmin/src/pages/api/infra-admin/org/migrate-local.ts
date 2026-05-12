import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import type { Session } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import type { InfraOrgBranch, InfraOrgRole, InfraOrgUser } from '@/types/infra-admin-org.types';
import {
  listPublicUsers,
  mergeLegacyBrowserOrg,
  readInfraOrgStore,
  writeInfraOrgStore,
} from '@/server/infraAdminFileStore';

function isSuperAdmin(session: Session | null): boolean {
  return session?.user?.role === 'SuperAdmin';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end();
    return;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  if (!isSuperAdmin(session)) {
    res.status(403).json({ error: 'Only Super Admin can import legacy browser data.' });
    return;
  }

  const body = req.body as {
    branches?: unknown;
    roles?: unknown;
    users?: unknown;
  };

  if (!Array.isArray(body.branches) || !Array.isArray(body.roles) || !Array.isArray(body.users)) {
    res.status(400).json({ error: 'Invalid body: expected branches, roles, and users arrays.' });
    return;
  }

  const legacy = {
    branches: body.branches as InfraOrgBranch[],
    roles: body.roles as InfraOrgRole[],
    users: body.users as InfraOrgUser[],
  };

  try {
    const current = readInfraOrgStore();
    const next = mergeLegacyBrowserOrg(current, legacy);
    writeInfraOrgStore(next);
    res.status(200).json({
      branches: next.branches,
      roles: next.roles,
      users: listPublicUsers(next),
      loginReady: Object.fromEntries(
        next.accounts.map((a) => [a.id, !!(a.passwordHash && a.passwordHash.length > 10)]),
      ),
      imported: {
        branches: legacy.branches.length,
        roles: legacy.roles.length,
        users: legacy.users.length,
      },
    });
  } catch (e) {
    console.error('[infra-admin/migrate-local]', e);
    res.status(500).json({ error: 'Import failed' });
  }
}

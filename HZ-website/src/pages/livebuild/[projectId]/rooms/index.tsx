import { useEffect } from 'react';
import { useRouter } from 'next/router';

/** Rooms list is on project home — redirect to match mockup navigation. */
export default function LivebuildRoomsRedirect() {
  const router = useRouter();
  const projectId = String(router.query.projectId ?? '');

  useEffect(() => {
    if (!projectId) return;
    void router.replace(`/livebuild/${projectId}`);
  }, [projectId, router]);

  return null;
}

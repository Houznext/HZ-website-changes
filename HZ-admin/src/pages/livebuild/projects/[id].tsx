import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  CalendarCheck,
  CreditCard,
  FileText,
  Home,
  LayoutGrid,
  MessageSquare,
  Package,
  Building2,
  Box,
} from 'lucide-react';
import withLivebuildLayout from '@/src/common/LivebuildAdminLayout';
import livebuildApi from '@/src/livebuild/lib/api';
import type { LbProjectDetail, LbRoom } from '@/src/livebuild/lib/types';
import { Badge, Btn, LiveBuildPageHeader, lbToast } from '@/src/livebuild/components';
import { useLbStickyTop } from '@/src/livebuild/hooks/useLbStickyTop';
import { ProjectOverviewTab } from '@/src/livebuild/project/ProjectOverviewTab';
import { ProjectRoomsTab } from '@/src/livebuild/project/ProjectRoomsTab';
import { ProjectDprTab } from '@/src/livebuild/project/ProjectDprTab';
import { ProjectPaymentsTab } from '@/src/livebuild/project/ProjectPaymentsTab';
import { ProjectQueriesTab } from '@/src/livebuild/project/ProjectQueriesTab';
import { ProjectDocumentsTab } from '@/src/livebuild/project/ProjectDocumentsTab';
import { ProjectMaterialsTab } from '@/src/livebuild/project/ProjectMaterialsTab';
import { ProjectPropertyInfoTab } from '@/src/livebuild/project/ProjectPropertyInfoTab';
import { Project3dTab } from '@/src/livebuild/project/Project3dTab';
import Loader from '@/src/common/Loader';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'rooms', label: 'Rooms & Progress', icon: Home },
  { id: 'dpr', label: 'DPR Upload', icon: CalendarCheck, pulse: true },
  { id: 'materials', label: 'Materials & BOQ', icon: Package },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: '3d', label: '3D', icon: Box },
  { id: 'property-info', label: 'Property Info', icon: Building2 },
  { id: 'queries', label: 'Queries', icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]['id'];

function LiveBuildProjectDetailPage() {
  useLbStickyTop();
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const tabFromQuery =
    typeof router.query.tab === 'string' ? (router.query.tab as TabId) : 'overview';

  const [project, setProject] = useState<LbProjectDetail | null>(null);
  const [rooms, setRooms] = useState<LbRoom[]>([]);
  const [tab, setTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const overviewSaveRef = useRef<((publish?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    if (TABS.some((t) => t.id === tabFromQuery)) setTab(tabFromQuery);
  }, [tabFromQuery]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [p, r] = await Promise.all([
        livebuildApi.getProject(id),
        livebuildApi.listRooms(id),
      ]);
      setProject(p);
      setRooms(r);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load project', 'err');
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const switchTab = (next: TabId) => {
    setTab(next);
    router.replace({ pathname: `/livebuild/projects/${id}`, query: { tab: next } }, undefined, {
      shallow: true,
    });
  };

  const saveProject = async (publish = false) => {
    if (tab === 'overview' && overviewSaveRef.current) {
      await overviewSaveRef.current(publish);
      return;
    }
    if (!project) return;
    try {
      const updated = await livebuildApi.updateProject(project.id, {
        name: project.name,
        propertyType: project.propertyType,
        projectType: project.projectType,
        startDate: project.startDate,
        dueDate: project.dueDate,
        address: project.address ?? project.location,
        progressMethod: project.progressMethod,
        progressOverridePct: project.progressOverridePct ?? null,
        progressOverrideReason: project.progressOverrideReason ?? null,
        phase: project.phase,
        status: project.status,
        onHoldReason: project.onHoldReason ?? null,
      });
      setProject(updated);
      lbToast(publish ? 'Update published to customer portal' : 'Project saved', 'ok');
    } catch (e: any) {
      lbToast(e?.body?.message || 'Save failed', 'err');
    }
  };

  if (!id) return null;

  return (
    <div className="lb-page lb-page-pd">
      <div className="lb-pd-head">
        <LiveBuildPageHeader
          leading={
            <Link href="/livebuild/projects">
              <Btn variant="ghost" size="sm">
                ← Back
              </Btn>
            </Link>
          }
          title={
            loading ? (
              'Loading…'
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {project?.name}
                {project?.code ? (
                  <Badge variant="prog" className="!text-[10px]">
                    {project.code}
                  </Badge>
                ) : null}
              </span>
            )
          }
          subtitle={
            project
              ? `${project.location || project.address || ''} · ${project.customerName}`
              : undefined
          }
          actions={
            project ? (
              <>
                <Btn variant="ghost" size="sm" onClick={() => saveProject(false)}>
                  Save changes
                </Btn>
                <Btn variant="blue" size="sm" onClick={() => saveProject(true)}>
                  Publish update
                </Btn>
              </>
            ) : null
          }
        />

        <div className="lb-pd-tabs" role="tablist">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={`lb-pd-tab ${tab === t.id ? 'on' : ''}`}
                onClick={() => switchTab(t.id)}
              >
                <Icon size={13} strokeWidth={1.8} />
                {t.label}
                {'pulse' in t && t.pulse ? <span className="lb-live-dot" /> : null}
                {t.id === 'queries' && project?.openQueries ? (
                  <Badge variant="red" className="!text-[8px] !py-0 !px-1">
                    {project.openQueries}
                  </Badge>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="lb-content lb-pd-content">
        {loading ? (
          <div className="lb-loading">
            <Loader />
          </div>
        ) : !project ? (
          <div className="lb-empty">Project not found</div>
        ) : (
          <div className="lb-pdt-panel">
            {tab === 'overview' && (
              <ProjectOverviewTab
                project={project}
                onUpdated={setProject}
                onSwitchTab={(t) => switchTab(t as TabId)}
                onRegisterSave={(fn) => {
                  overviewSaveRef.current = fn;
                }}
              />
            )}
            {tab === 'rooms' && (
              <ProjectRoomsTab
                projectId={id}
                projectName={project.name}
                propertyType={project.propertyType ?? '2BHK Apartment'}
                rooms={rooms}
                onReload={load}
              />
            )}
            {tab === 'property-info' && (
              <ProjectPropertyInfoTab
                projectId={id}
                projectName={project.name}
                propertyType={project.propertyType ?? '2BHK Apartment'}
              />
            )}
            {tab === '3d' && (
              <Project3dTab projectId={id} projectName={project.name} rooms={rooms} />
            )}
            {tab === 'dpr' && (
              <ProjectDprTab projectId={id} projectName={project.name} rooms={rooms} />
            )}
            {tab === 'payments' && (
              <ProjectPaymentsTab projectId={id} projectName={project.name} />
            )}
            {tab === 'queries' && (
              <ProjectQueriesTab projectId={id} projectName={project.name} />
            )}
            {tab === 'documents' && (
              <ProjectDocumentsTab
                projectId={id}
                projectName={project.name}
                rooms={rooms}
              />
            )}
            {tab === 'materials' && (
              <ProjectMaterialsTab projectId={id} projectName={project.name} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default withLivebuildLayout(LiveBuildProjectDetailPage);

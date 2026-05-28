import { useEffect, useState } from 'react';
import { GripVertical, Plus, Copy, Wrench } from 'lucide-react';
import withLivebuildLayout from '@/src/common/LivebuildAdminLayout';
import livebuildApi from '@/src/livebuild/lib/api';
import type { LbWorkType } from '@/src/livebuild/lib/types';
import { WorkTypeModal } from '@/src/livebuild/components/WorkTypeModal';
import {
  Btn,
  LiveBuildPageHeader,
  StatCard,
  Table,
  Toggle,
  Badge,
  lbToast,
} from '@/src/livebuild/components';
import { useLbStickyTop } from '@/src/livebuild/hooks/useLbStickyTop';
import Loader from '@/src/common/Loader';

function LiveBuildWorkTypesPage() {
  useLbStickyTop();
  const [items, setItems] = useState<LbWorkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [edit, setEdit] = useState<LbWorkType | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await livebuildApi.listWorkTypes();
      setItems(Array.isArray(list) ? list : []);
    } catch (e: any) {
      lbToast(e?.body?.message || 'Failed to load work types', 'err');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (wt: LbWorkType) => {
    const next = wt.status === 'active' ? 'disabled' : 'active';
    try {
      await livebuildApi.updateWorkType(wt.id, { status: next });
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Update failed', 'err');
    }
  };

  const duplicate = async (wt: LbWorkType) => {
    try {
      await livebuildApi.createWorkType({
        name: `${wt.name} (copy)`,
        category: wt.category,
        description: wt.description,
        defaultRooms: wt.defaultRooms,
        status: 'active',
        requiresPhotos: wt.requiresPhotos,
      });
      lbToast('Duplicated', 'ok');
      load();
    } catch (e: any) {
      lbToast(e?.body?.message || 'Duplicate failed', 'err');
    }
  };

  const active = items.filter((w) => w.status === 'active').length;
  const projectUses = items.reduce((s, w) => s + (w.activeProjectCount ?? 0), 0);

  return (
    <div className="lb-page">
      <LiveBuildPageHeader
        title="Work Types"
        subtitle="Manage all work type categories"
        actions={
          <Btn
            variant="blue"
            size="sm"
            onClick={() => {
              setEdit(null);
              setModalOpen(true);
            }}
          >
            <Plus size={12} strokeWidth={2.5} />
            New work type
          </Btn>
        }
      />
      <div className="lb-content">
        {loading ? (
          <div className="lb-loading">
            <Loader />
          </div>
        ) : (
          <>
            <div className="lb-g4" style={{ marginBottom: 16 }}>
              <StatCard
                label="Total types"
                value={items.length}
                valueColor="var(--lb-blue)"
                icon={<Wrench size={18} strokeWidth={1.8} color="#2563eb" />}
              />
              <StatCard
                label="Active"
                value={active}
                valueColor="var(--lb-tl)"
                icon={<Wrench size={18} strokeWidth={1.8} color="var(--lb-tl)" />}
              />
              <StatCard
                label="Disabled"
                value={items.length - active}
                valueColor="var(--lb-mu)"
                icon={<Wrench size={18} strokeWidth={1.8} color="#64748b" />}
              />
              <StatCard
                label="Project assignments"
                value={projectUses}
                sub="Across active projects"
                valueColor="var(--lb-am)"
                icon={<Wrench size={18} strokeWidth={1.8} color="#ca8a04" />}
              />
            </div>
            <div className="lb-card" style={{ padding: 0, overflow: 'hidden' }}>
              <Table
                headers={[
                  '',
                  'Work type name',
                  'Category',
                  'Default for',
                  'Active projects',
                  'Status',
                  'Actions',
                ]}
              >
                {items.map((w) => (
                  <tr key={w.id}>
                    <td style={{ width: 28, color: 'var(--lb-mu)' }}>
                      <GripVertical size={14} strokeWidth={1.5} style={{ opacity: 0.35 }} />
                    </td>
                    <td style={{ fontWeight: 600 }}>{w.name}</td>
                    <td>
                      <Badge variant="gray">{w.category}</Badge>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--lb-mu)', maxWidth: 180 }}>
                      {(w.defaultRooms ?? []).join(', ') || '—'}
                    </td>
                    <td>
                      <Badge variant="prog">{w.activeProjectCount ?? 0} projects</Badge>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Badge variant={w.status === 'active' ? 'tl' : 'gray'}>{w.status}</Badge>
                        <Toggle
                          on={w.status === 'active'}
                          onChange={() => toggleStatus(w)}
                          aria-label="Toggle active"
                        />
                      </div>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <Btn
                          variant="ghost"
                          size="xs"
                          onClick={() => {
                            setEdit(w);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </Btn>
                        <Btn variant="ghost" size="xs" onClick={() => duplicate(w)} aria-label="Duplicate">
                          <Copy size={12} />
                        </Btn>
                        <Btn
                          variant="red"
                          size="xs"
                          onClick={async () => {
                            if (!confirm('Delete work type?')) return;
                            try {
                              await livebuildApi.deleteWorkType(w.id);
                              lbToast('Deleted', 'ok');
                              load();
                            } catch (err: any) {
                              lbToast(err?.body?.message || 'Delete failed', 'err');
                            }
                          }}
                        >
                          Delete
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </div>
          </>
        )}
      </div>

      <WorkTypeModal
        open={modalOpen}
        edit={edit}
        onClose={() => {
          setModalOpen(false);
          setEdit(null);
        }}
        onSaved={load}
      />
    </div>
  );
}

export default withLivebuildLayout(LiveBuildWorkTypesPage);

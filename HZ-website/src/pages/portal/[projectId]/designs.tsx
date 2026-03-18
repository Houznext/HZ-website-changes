import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../../components/portal/PortalLayout';

interface IDesign {
  id: string; roomTag: string; s3Url: string;
  designType: 'sample' | 'full'; designNotes: string | null;
  version: number; createdAt: string;
}
interface IProject {
  id: string; designStatus: string;
  city: string; locality: string; bhk?: string;
  customer: { fullName: string };
}

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const getToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('hz_customer_token') ?? ''
    : '';

export default function DesignsPortalPage() {
  const router = useRouter();
  const { projectId } = router.query;

  const [project, setProject]   = useState<IProject | null>(null);
  const [designs, setDesigns]   = useState<Record<string, IDesign[]>>({});
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [comment, setComment]   = useState('');
  const [acting, setActing]     = useState(false);
  const [lightbox, setLightbox] = useState<IDesign | null>(null);

  const load = useCallback(async () => {
    if (!projectId || typeof projectId !== 'string') return;
    setLoading(true); setError('');
    try {
      const h = { Authorization: `Bearer ${getToken()}` };
      const [pRes, dRes] = await Promise.all([
        fetch(`${API}/interiors/projects/${projectId}`, { headers: h }),
        fetch(`${API}/interiors/projects/${projectId}/designs`, { headers: h }),
      ]);
      if (!pRes.ok) throw new Error('Failed to load');
      const p = await pRes.json() as IProject;
      const d = await dRes.json() as Record<string, IDesign[]>;
      setProject(p);
      setDesigns(typeof d === 'object' && !Array.isArray(d) ? d : {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async () => {
    if (!projectId) return;
    setActing(true); setError('');
    try {
      const res = await fetch(`${API}/interiors/projects/${projectId}/designs/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Failed to approve');
      setSuccess('Design approved! Your project execution will begin soon.');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to approve');
    } finally {
      setActing(false);
    }
  };

  const handleRevision = async () => {
    if (!projectId || !comment.trim()) {
      setError('Please add a comment explaining the changes needed');
      return;
    }
    setActing(true); setError('');
    try {
      const res = await fetch(`${API}/interiors/projects/${projectId}/designs/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ comment }),
      });
      if (!res.ok) throw new Error('Failed to request revision');
      setSuccess('Revision requested. Your designer will update the designs shortly.');
      setComment('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to request revision');
    } finally {
      setActing(false);
    }
  };

  const totalDesigns = Object.values(designs).reduce((s, a) => s + a.length, 0);
  const rooms = Object.keys(designs);

  const statusBanner: Record<string, { bg: string; border: string; text: string; icon: string; message: string }> = {
    pending:            { bg: 'bg-gray-50',     border: 'border-gray-200', text: 'text-gray-600',   icon: '⏳', message: 'Your 3D designs are being prepared. We\'ll notify you once they\'re ready to review.' },
    uploaded:           { bg: 'bg-[#EBF3FF]',   border: 'border-[#B5D4F4]', text: 'text-[#1A56DB]', icon: '🎨', message: 'Your 3D designs are ready! Please review them and approve or request changes below.' },
    approved:           { bg: 'bg-[#E1F5EE]',   border: 'border-[#9FE1CB]', text: 'text-[#085041]',  icon: '✅', message: 'You have approved these designs. Execution is underway.' },
    revision_requested: { bg: 'bg-[#FFFBEB]',   border: 'border-[#FAC775]', text: 'text-[#92400E]',  icon: '🔄', message: 'Revision requested. Your designer is working on the updated designs.' },
  };

  const banner = statusBanner[project?.designStatus ?? 'pending'] ?? statusBanner.pending;

  return (
    <PortalLayout
      activePage="designs"
      projectId={project?.id ?? (projectId as string ?? '')}
      projectAddress={`${project?.bhk ? project.bhk + ' · ' : ''}${project?.city ?? ''}`}
      customerName={project?.customer?.fullName}
    >
      {project && (
        <div className={`${banner.bg} ${banner.border} border rounded-xl p-4 mb-4 flex items-start gap-3`}>
          <span className="text-xl">{banner.icon}</span>
          <div>
            <p className={`text-sm font-medium ${banner.text}`}>
              {project.designStatus === 'approved' ? 'Design approved'
                : project.designStatus === 'revision_requested' ? 'Revision in progress'
                : project.designStatus === 'uploaded' ? 'Designs ready for review'
                : 'Awaiting designs'}
            </p>
            <p className={`text-xs mt-0.5 ${banner.text} opacity-80`}>{banner.message}</p>
          </div>
        </div>
      )}

      {error   && <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-xs text-red-700">{error}</div>}
      {success && <div className="bg-[#E1F5EE] border border-[#9FE1CB] rounded-xl p-3 mb-4 text-xs text-[#085041]">{success}</div>}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1,2].map(i => <div key={i} className="h-48 bg-gray-100 rounded-xl" />)}
        </div>
      ) : totalDesigns === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <span className="text-4xl block mb-3">🎨</span>
          <p className="text-sm font-medium text-gray-700">No designs uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">Your designer will upload 3D renders here for your review</p>
        </div>
      ) : (
        <>
          {rooms.map(room => (
            <div key={room} className="bg-white rounded-xl border border-gray-100 mb-4">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">{room}</h3>
                <span className="text-xs text-gray-400">
                  {designs[room].length} image{designs[room].length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {designs[room].map(d => (
                  <div key={d.id}
                    onClick={() => setLightbox(d)}
                    className="rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:border-[#1A56DB] transition-colors group"
                  >
                    <div className="h-32 bg-gray-100 overflow-hidden">
                      <img
                        src={d.s3Url}
                        alt={d.roomTag}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            `https://via.placeholder.com/300x200?text=${encodeURIComponent(room)}`;
                        }}
                      />
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[10px] text-gray-600 font-medium">
                        {d.designType === 'full' ? 'Full design' : 'Sample'}
                      </p>
                      {d.designNotes && (
                        <p className="text-[9px] text-gray-400 mt-0.5 line-clamp-2">
                          {d.designNotes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {project?.designStatus === 'uploaded' && (
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Your decision</h3>
              <p className="text-xs text-gray-400 mb-4">
                Please review all designs carefully before approving. Once approved, execution begins.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApprove}
                  disabled={acting}
                  className="w-full bg-[#1D9E75] text-white rounded-xl py-3 text-sm font-medium hover:bg-[#159669] transition-colors disabled:opacity-60"
                >
                  {acting ? 'Processing...' : '✓ Approve all designs — start execution'}
                </button>
                <div className="border-t border-gray-100 pt-3">
                  <label className="text-xs font-medium text-gray-700 block mb-1.5">
                    Request changes (describe what you want changed)
                  </label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 outline-none focus:border-[#1A56DB] transition-colors resize-none"
                    placeholder="e.g. Can we change the kitchen colour to grey? Living room sofa placement needs adjustment..."
                  />
                  <button
                    onClick={handleRevision}
                    disabled={acting || !comment.trim()}
                    className="mt-2 px-4 py-2 text-xs font-medium border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Request changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {lightbox.roomTag}
                </p>
                <p className="text-xs text-gray-400">
                  {lightbox.designType === 'full' ? 'Full design' : 'Sample'}
                </p>
              </div>
              <button
                onClick={() => setLightbox(null)}
                className="text-gray-400 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            <img
              src={lightbox.s3Url}
              alt={lightbox.roomTag}
              className="w-full h-auto"
              onError={e => {
                (e.target as HTMLImageElement).src =
                  `https://via.placeholder.com/600x400?text=${encodeURIComponent(
                    lightbox.roomTag,
                  )}`;
              }}
            />
            {lightbox.designNotes && (
              <div className="px-4 py-3 bg-gray-50">
                <p className="text-xs text-gray-600">
                  <span className="font-medium">Designer notes:</span>{' '}
                  {lightbox.designNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </PortalLayout>
  );
}


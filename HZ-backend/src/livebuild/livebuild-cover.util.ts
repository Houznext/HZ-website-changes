type DprPhotoLike = { fileUrl?: string | null; displayOrder?: number | null };
type DprLike = { projectId: number; photos?: DprPhotoLike[] | null };

const COVER_GRADIENTS = [
  'linear-gradient(135deg,#1a3d5c,#0f2a44)',
  'linear-gradient(135deg,#1e3a5f,#162d4a)',
  'linear-gradient(135deg,#0d2233,#1a3d5c)',
  'linear-gradient(135deg,#1a365d,#0c4a6e)',
];

export function coverGradientForProject(id: number): string {
  return COVER_GRADIENTS[id % COVER_GRADIENTS.length];
}

/** Latest DPR photos per project (up to 4), same order as customer portal cards. */
export function thumbnailsByProjectFromDprs(dprs: DprLike[]): Map<number, string[]> {
  const map = new Map<number, string[]>();
  for (const d of dprs) {
    const urls = map.get(d.projectId) ?? [];
    if (urls.length >= 4) continue;
    const sorted = [...(d.photos ?? [])].sort(
      (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
    );
    for (const ph of sorted) {
      if (urls.length >= 4) break;
      if (ph.fileUrl && !urls.includes(ph.fileUrl)) urls.push(ph.fileUrl);
    }
    if (urls.length) map.set(d.projectId, urls);
  }
  return map;
}

export function resolveCoverThumbnails(
  coverImageUrl: string | null | undefined,
  fromDprs?: string[],
): string[] {
  if (fromDprs?.length) return fromDprs.slice(0, 4);
  if (coverImageUrl) return [coverImageUrl];
  return [];
}

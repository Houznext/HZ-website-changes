'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Heart, Eye, MessageCircle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useSavedProperties } from '@/hooks/useSavedProperties';
import { getSeenProperties, type StoredPropertyRef } from '@/lib/propertyListsLocal';
import api from '@/lib/axios';
import type { InfraProperty } from '@/types/infra.types';
import type { PublicProperty } from '@/types/property.types';
import { ProfileEditModal } from './ProfileEditModal';
import {
  type CustomerEnquiry,
  type ProfileTab,
  enquiryStatusMeta,
  formatEnquiryDate,
  formatProfilePhone,
  parseProfileTab,
  profileInitials,
} from './profileUtils';

const WA =
  process.env.NEXT_PUBLIC_INFRA_WHATSAPP_E164?.replace(/\D/g, '') || '919759750770';

function toPublicProperty(p: InfraProperty): PublicProperty {
  return p as unknown as PublicProperty;
}

export function ProfilePageClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items: savedItems, reload: reloadSaved } = useSavedProperties();
  const [tab, setTab] = useState<ProfileTab>(() =>
    router.isReady ? parseProfileTab(router.query.tab) : 'saved',
  );
  const [me, setMe] = useState<{
    name?: string | null;
    phone?: string | null;
    email?: string | null;
  } | null>(null);
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>([]);
  const [seenItems, setSeenItems] = useState<StoredPropertyRef[]>([]);
  const [seenProperties, setSeenProperties] = useState<PublicProperty[]>([]);
  const [seenLoading, setSeenLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!router.isReady) return;
    setTab(parseProfileTab(router.query.tab));
  }, [router.isReady, router.query.tab]);

  const switchTab = (next: ProfileTab) => {
    setTab(next);
    void router.push({ pathname: '/profile', query: { tab: next } }, undefined, { shallow: true });
  };

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const t = (session as { accessToken?: string }).accessToken;
      if (t && typeof window !== 'undefined') localStorage.setItem('infra_token', t);
    }
  }, [session, status]);

  const loadMe = useCallback(async () => {
    try {
      const { data } = await api.get('/customers/me');
      setMe(data);
    } catch {
      setMe(null);
    }
  }, []);

  const loadEnquiries = useCallback(async () => {
    try {
      const { data } = await api.get<CustomerEnquiry[]>('/customers/me/enquiries');
      setEnquiries(Array.isArray(data) ? data : []);
    } catch {
      setEnquiries([]);
    }
  }, []);

  const loadSeenProperties = useCallback(async () => {
    const refs = getSeenProperties();
    setSeenItems(refs);
    if (!refs.length) {
      setSeenProperties([]);
      return;
    }
    setSeenLoading(true);
    try {
      const slugs = refs.map((r) => r.slug).join(',');
      const { data } = await api.get<PublicProperty[]>('/properties/by-slugs/list', {
        params: { slugs },
      });
      setSeenProperties(Array.isArray(data) ? data : []);
    } catch {
      setSeenProperties([]);
    } finally {
      setSeenLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;
    void loadMe();
    void loadEnquiries();
    void loadSeenProperties();
  }, [status, loadMe, loadEnquiries, loadSeenProperties]);

  useEffect(() => {
    if (tab === 'seen' && status === 'authenticated') {
      void loadSeenProperties();
    }
  }, [tab, status, loadSeenProperties]);

  const displayName = me?.name || session?.user?.name || 'Customer';
  const displayEmail = me?.email || session?.user?.email || '';
  const displayPhone = me?.phone || (session?.user as { phone?: string })?.phone || '';

  if (status === 'loading' || !mounted) {
    return (
      <div className="min-h-screen overflow-x-hidden bg-offwhite">
        <Navbar />
        <div className="infra-profile-wrap py-20 text-center font-inter text-sm text-muted">Loading…</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen overflow-x-hidden bg-offwhite">
        <Navbar />
        <div className="infra-profile-wrap py-20 text-center">
          <p className="font-inter text-muted">Please sign in to view your profile.</p>
          <Link href="/login?callbackUrl=/profile" className="infra-btn infra-btn-blue mt-4 inline-flex px-6 py-3">
            Go to login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-offwhite">
      <Navbar />
      <div className="infra-profile-wrap">
        <div className="infra-profile-grid">
          <aside className="flex flex-col gap-3.5">
            <div className="infra-profile-card">
              <div className="infra-profile-avatar">{profileInitials(displayName, displayEmail)}</div>
              <div className="infra-profile-name">{displayName}</div>
              <div className="infra-profile-phone">{formatProfilePhone(displayPhone)}</div>
              <button
                type="button"
                className="infra-btn infra-btn-ghost w-full justify-center px-3 py-2 text-[12.5px]"
                onClick={() => setEditOpen(true)}
              >
                Edit profile
              </button>
            </div>

            <nav className="infra-profile-tabs" aria-label="Profile sections">
              <button
                type="button"
                className={`infra-profile-tab ${tab === 'saved' ? 'on' : ''}`}
                onClick={() => switchTab('saved')}
              >
                <Heart size={15} strokeWidth={1.8} className={tab === 'saved' ? 'text-hz-blue' : 'text-muted'} />
                <span className="infra-profile-tab-label">Saved properties</span>
                <span className="infra-profile-tab-count">{savedItems.length}</span>
              </button>
              <button
                type="button"
                className={`infra-profile-tab ${tab === 'seen' ? 'on' : ''}`}
                onClick={() => switchTab('seen')}
              >
                <Eye size={15} strokeWidth={1.8} className={tab === 'seen' ? 'text-hz-blue' : 'text-muted'} />
                <span className="infra-profile-tab-label">Seen properties</span>
                <span className="infra-profile-tab-count">{seenItems.length}</span>
              </button>
              <button
                type="button"
                className={`infra-profile-tab ${tab === 'enq' ? 'on' : ''}`}
                onClick={() => switchTab('enq')}
              >
                <MessageCircle
                  size={15}
                  strokeWidth={1.8}
                  className={tab === 'enq' ? 'text-hz-blue' : 'text-muted'}
                />
                <span className="infra-profile-tab-label">My enquiries</span>
                <span className="infra-profile-tab-count">{enquiries.length}</span>
              </button>
            </nav>
          </aside>

          <div className="infra-profile-panel">
            {tab === 'saved' && (
              <>
                <h1 className="infra-profile-panel-title">Saved properties</h1>
                {savedItems.length === 0 ? (
                  <p className="infra-profile-empty">
                    No saved properties yet. Tap the heart on a listing to save it here.
                  </p>
                ) : (
                  <div className="infra-profile-cards-grid">
                    {savedItems.map((p) => (
                      <PropertyCard key={p.propertyId} property={toPublicProperty(p)} />
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'seen' && (
              <>
                <h1 className="infra-profile-panel-title">Recently viewed</h1>
                {seenLoading ? (
                  <p className="infra-profile-empty">Loading properties…</p>
                ) : seenItems.length === 0 ? (
                  <p className="infra-profile-empty">
                    No properties viewed yet. Browse listings to build your history on this device.
                  </p>
                ) : seenProperties.length > 0 ? (
                  <div className="infra-profile-cards-grid">
                    {seenProperties.map((p) => (
                      <PropertyCard key={p.propertyId} property={p} />
                    ))}
                  </div>
                ) : (
                  <div className="infra-profile-cards-grid">
                    {seenItems.map((p) => (
                      <Link
                        key={p.slug}
                        href={`/property/${encodeURIComponent(p.slug)}`}
                        className="infra-profile-seen-card p-4"
                      >
                        <p className="font-montserrat text-[15px] font-bold leading-snug text-charcoal">{p.title}</p>
                        <p className="mt-1 font-inter text-xs text-muted">
                          {[p.locality, p.city].filter(Boolean).join(' · ') || 'Property'}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {tab === 'enq' && (
              <>
                <h1 className="infra-profile-panel-title">My enquiries</h1>
                {enquiries.length === 0 ? (
                  <p className="infra-profile-empty">
                    No enquiries yet. Use &quot;Enquire now&quot; on a property to reach our team.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {enquiries.map((e) => {
                      const badge = enquiryStatusMeta(e.status);
                      const loc = [e.locality, e.city].filter(Boolean).join(', ');
                      const slug = e.propertySlug || e.propertyId;
                      const href = slug ? `/property/${encodeURIComponent(slug)}` : '/buy';
                      return (
                        <article key={e.enquiryId} className="infra-enquiry-card">
                          <div className="infra-enquiry-card-hd">
                            <div>
                              <p className="font-montserrat text-sm font-bold text-charcoal">
                                {e.propertyTitle ?? 'Property enquiry'}
                              </p>
                              <p className="mt-0.5 font-inter text-xs text-muted">
                                {loc ? `${loc} · ` : ''}
                                Sent {formatEnquiryDate(e.createdAt)}
                              </p>
                            </div>
                            <span className={badge.className}>{badge.label}</span>
                          </div>
                          <div className="border-t border-[#dde8f5] px-[18px] py-3">
                            {e.message ? (
                              <p className="font-inter text-[13px] text-muted">
                                <span className="font-semibold text-charcoal">Your message: </span>
                                {e.message}
                              </p>
                            ) : null}
                            {e.adminResponse ? (
                              <p className="mt-2 whitespace-pre-wrap font-inter text-[13px] text-charcoal">
                                <span className="font-semibold text-[#2f80ed]">Team: </span>
                                {e.adminResponse}
                              </p>
                            ) : (
                              <p className="mt-2 font-inter text-[13px] text-muted">
                                Our team will respond here shortly.
                              </p>
                            )}
                          </div>
                          <div className="infra-enquiry-card-ft">
                            <div className="flex gap-2">
                              <Link href={href} className="infra-btn infra-btn-ghost px-3 py-1.5 text-xs">
                                View
                              </Link>
                              <a
                                href={`https://wa.me/${WA}`}
                                target="_blank"
                                rel="noreferrer"
                                className="infra-btn infra-btn-wa px-3 py-1.5 text-xs"
                              >
                                WhatsApp
                              </a>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        name={displayName === 'Customer' ? '' : displayName}
        email={displayEmail}
        phone={displayPhone.replace(/\D/g, '').slice(-10)}
        onSaved={() => {
          void loadMe();
          void reloadSaved();
          void loadEnquiries();
          setSeenItems(getSeenProperties());
        }}
      />

      <Footer />
    </div>
  );
}

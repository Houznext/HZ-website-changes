import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import apiClient from "@/src/utils/apiClient";
import BackRoute from "@/src/common/BackRoute";
import Button from "@/src/common/Button";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import {
  MdPerson,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdHome,
} from "react-icons/md";
import { HiDocumentText } from "react-icons/hi";
import { CheckCircle2 } from "lucide-react";
import Loader from "@/src/common/Loader";

const STEPS = [
  "Calling & informing",
  "Site visit & confirmation",
  "Finances",
  "Advance Payment",
  "Registration",
];

enum ReferralCaseStatus {
  OPEN = "OPEN",
  WON = "WON",
  LOST = "LOST",
  CANCELLED = "CANCELLED",
}

const STATUS_OPTIONS = [
  ReferralCaseStatus.OPEN,
  ReferralCaseStatus.WON,
  ReferralCaseStatus.LOST,
  ReferralCaseStatus.CANCELLED,
];

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  WON: "bg-green-50 text-green-700 border-green-200",
  LOST: "bg-red-50 text-red-700 border-red-200",
  CANCELLED: "bg-gray-50 text-gray-600 border-gray-200",
};

/** Display labels matching web UI (e.g. OPEN → "In Progress") */
const STATUS_LABELS: Record<string, string> = {
  OPEN: "In Progress",
  WON: "Won",
  LOST: "Lost",
  CANCELLED: "Cancelled",
};

function getReferrerDisplayName(referrer: any): string {
  if (!referrer) return "—";
  const name =
    `${referrer.firstName || ""} ${referrer.lastName || ""}`.trim() ||
    referrer.fullName ||
    referrer.username ||
    referrer.email;
  return name || "—";
}

function parseReferralCodeDisplay(raw: string | null | undefined): string {
  if (!raw || typeof raw !== "string") return "—";
  const t = raw.trim();
  if (/^\d+$/.test(t)) return t;
  try {
    const o = JSON.parse(t);
    if (o && typeof o.referralCode !== "undefined")
      return String(o.referralCode);
  } catch {
    // ignore
  }
  return t;
}

function formatDate(d: string | Date | null | undefined) {
  return d
    ? new Date(d).toLocaleString("en-IN", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";
}

export default function ReferralDetailComponent() {
  const router = useRouter();
  const propertyId = router.query.id as string;
  const referralId = router.query.referralId as string;
  const session = useSession();
  const [user, setUser] = useState<any>(null);

  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [status, setStatus] = useState<string>(ReferralCaseStatus.OPEN);
  const [step, setStep] = useState(1);
  const [initialStatus, setInitialStatus] = useState<string | null>(null);
  const [initialStep, setInitialStep] = useState<number | null>(null);

  useEffect(() => {
    if (session?.data?.user) setUser(session.data.user);
  }, [session?.data?.user]);

  const fetchReferral = useCallback(async () => {
    if (!referralId) return;
    setLoading(true);
    try {
      const res = await apiClient.get(
        `${apiClient.URLS.referandearn}/referrals/${referralId}`,
        undefined,
        true,
      );
      if (res?.body) {
        setReferral(res.body);
        setStatus(res.body.status ?? ReferralCaseStatus.OPEN);
        setStep(Number(res.body.currentStep) || 1);
        setInitialStatus(res.body.status ?? ReferralCaseStatus.OPEN);
        setInitialStep(Number(res.body.currentStep) || 1);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to load referral");
      setReferral(null);
    } finally {
      setLoading(false);
    }
  }, [referralId]);

  useEffect(() => {
    fetchReferral();
  }, [fetchReferral]);

  const handleUpdateStatusStep = async () => {
    if (!referralId || !user?.id) return;
    if (status === initialStatus && step === initialStep) {
      toast("No changes to update");
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch(
        `${apiClient.URLS.propertyReferral}/referrals/${referralId}/step`,
        {
          adminUserId: String(user.id),
          toStep: step,
          status,
          relationshipType: referral?.relationshipType,
          category: referral?.category,
        },
        true,
      );
      toast.success("Updated");
      fetchReferral();
    } catch (e) {
      console.error(e);
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (!referralId || !user?.id) return;
    const note = newNote.trim();
    if (!note) {
      toast.error("Please enter a note");
      return;
    }
    setSaving(true);
    try {
      await apiClient.patch(
        `${apiClient.URLS.propertyReferral}/referrals/${referralId}/step`,
        {
          adminUserId: String(user.id),
          toStep: referral?.currentStep ?? step,
          status: referral?.status ?? status,
          note,
          relationshipType: referral?.relationshipType,
          category: referral?.category,
        },
        true,
      );
      toast.success("Note saved");
      setNewNote("");
      fetchReferral();
    } catch (e) {
      console.error(e);
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  if (!referralId) {
    return (
      <div className="w-full p-4 md:p-6">
        <BackRoute />
        <p className="mt-4 text-gray-700">No referral selected.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center w-full h-full py-12">
        <Loader />
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="w-full p-4 md:p-6">
        <BackRoute />
        <p className="mt-4 text-gray-700">Referral not found.</p>
      </div>
    );
  }

  const property = referral.property;
  const propertyName =
    property?.propertyDetails?.propertyName ??
    property?.basicDetails?.title ??
    property?.propertyName ??
    (property?.propertyId ? `Property ${property.propertyId}` : null) ??
    "—";
  const propertyIdForLink = property?.propertyId ?? propertyId;
  const code = parseReferralCodeDisplay(referral.referralCode);
  const stepLogs = (referral.stepLogs ?? [])
    .slice()
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  const currentStepSafe = Math.min(Math.max(referral.currentStep ?? 1, 1), 5);
  const canUpdate = referral.status === ReferralCaseStatus.OPEN;

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="mx-auto max-w-[1200px] p-4 md:p-6">
        <BackRoute />

        {/* OneCasa-style page title */}
        <div className="mt-4 flex flex-col gap-1">
          <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
            Referral #{code}
            <span className="ml-2 font-semibold text-gray-600">
              · {referral.leadName || "Lead"}
            </span>
          </h1>
          <p className="text-sm text-gray-700">
            Created {formatDate(referral.createdAt)}
          </p>
        </div>

        {/* Status & progress – display only; no controls here */}
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-semibold ${
                STATUS_STYLES[referral.status] ?? STATUS_STYLES.OPEN
              }`}
            >
              {STATUS_LABELS[referral.status] ?? referral.status}
            </span>
            <span className="text-sm font-medium text-[#3586FF]">
              Step {referral.currentStep} of 5 ·{" "}
              {STEPS[referral.currentStep - 1]}
            </span>
          </div>

          {/* Progress timeline – with connecting line (1 → 2 → 3 …) */}
          <div className="mt-4">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-700">
              Progress
            </p>
            <div className="relative px-2 sm:px-0">
              {/* Track: full gray line behind circles */}
              <div
                className="absolute left-[10%] right-[10%] top-4 h-0.5 rounded-full bg-gray-200"
                style={{ top: "1rem" }}
                aria-hidden
              />
              {/* Filled segment: from start up to current step */}
              <div
                className="absolute left-[10%] top-4 h-0.5 rounded-full bg-[#3586FF] transition-all duration-300"
                style={{
                  width: `${((currentStepSafe - 1) / 4) * 80}%`,
                  top: "1rem",
                }}
                aria-hidden
              />
              <div className="relative flex justify-between items-start">
                {STEPS.map((label, idx) => {
                  const stepNo = idx + 1;
                  const isDone = stepNo < currentStepSafe;
                  const isActive = stepNo === currentStepSafe;
                  return (
                    <div
                      key={label}
                      className="flex flex-col items-center flex-1 min-w-0"
                    >
                      <div
                        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isDone
                            ? "bg-[#3586FF] text-white"
                            : isActive
                              ? "border-2 border-[#3586FF] bg-white text-[#3586FF]"
                              : "bg-gray-200 text-gray-400"
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : stepNo}
                      </div>
                      <span
                        className={`mt-1.5 text-center text-[11px] font-medium sm:block ${
                          isActive
                            ? "text-[#3586FF]"
                            : isDone
                              ? "text-gray-700"
                              : "text-gray-400"
                        }`}
                      >
                        {isActive ? "Current" : label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Details + Add update */}
          <div className="space-y-6 lg:col-span-2">
            {/* Details card – lead info + current state */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-3">
                <h2 className="subheading-text font-semibold uppercase tracking-wide text-gray-800">
                  Details
                </h2>
              </div>
              <div className="p-5">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div className="flex gap-3">
                    <MdPerson className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div>
                      <dt className="text-xs font-medium text-gray-700">
                        Lead
                      </dt>
                      <dd className="mt-0.5 text-sm font-medium text-gray-900">
                        {referral.leadName || "—"}
                      </dd>
                    </div>
                  </div>
                  {referral.leadPhone && (
                    <div className="flex gap-3">
                      <MdPhone className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div>
                        <dt className="text-xs font-medium text-gray-700">
                          Phone
                        </dt>
                        <dd className="mt-0.5 text-sm text-gray-900">
                          {referral.leadPhone}
                        </dd>
                      </div>
                    </div>
                  )}
                  {referral.leadEmail && (
                    <div className="flex gap-3">
                      <MdEmail className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div>
                        <dt className="text-xs font-medium text-gray-700">
                          Email
                        </dt>
                        <dd className="mt-0.5 text-sm text-gray-900 break-all">
                          {referral.leadEmail}
                        </dd>
                      </div>
                    </div>
                  )}
                  {referral.leadCity && (
                    <div className="flex gap-3">
                      <MdLocationOn className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div>
                        <dt className="text-xs font-medium text-gray-700">
                          City
                        </dt>
                        <dd className="mt-0.5 text-sm text-gray-900">
                          {referral.leadCity}
                        </dd>
                      </div>
                    </div>
                  )}
                  <div className="col-span-full flex gap-3 sm:col-span-2">
                    <HiDocumentText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-medium text-gray-700">
                        Requirement
                      </dt>
                      <dd className="mt-0.5 text-sm text-gray-700">
                        {referral.requirementNote || "—"}
                      </dd>
                    </div>
                  </div>
                  <div className="col-span-full flex gap-3 border-t border-gray-100 pt-4 sm:col-span-2">
                    <MdHome className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-medium text-gray-700">
                        Property
                      </dt>
                      <dd className="mt-0.5">
                        {propertyIdForLink ? (
                          <Link
                            href={`/property/${propertyIdForLink}`}
                            className="text-sm font-medium text-[#3586FF] hover:underline"
                          >
                            {propertyName}
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-900">
                            {propertyName}
                          </span>
                        )}
                      </dd>
                      <dd className="mt-1 text-xs text-gray-700">
                        Referred by {getReferrerDisplayName(referral.referrer)}
                        {referral.referrer?.email && (
                          <span className="ml-1">
                            ({referral.referrer.email})
                          </span>
                        )}
                      </dd>
                    </div>
                  </div>
                </dl>

                {/* Update status and step – only when status is Open; can revert to Open when closed */}
                <div className="mt-5 border-t border-gray-100 pt-5 space-y-3">
                  {!canUpdate && (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Updates are only allowed when status is Open. Set status
                      to Open and click Update to make changes again.
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-gray-700 w-14">
                      Status
                    </span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="rounded-lg border btn-text border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 focus:border-[#3586FF] focus:outline-none focus:ring-2 focus:ring-[#3586FF]/20"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs font-medium text-gray-700 w-14 ml-1">
                      Step
                    </span>
                    <select
                      value={step}
                      onChange={(e) => setStep(Number(e.target.value))}
                      disabled={!canUpdate}
                      className="rounded-lg border border-gray-300 label-text bg-white px-3 py-1 text-sm text-gray-900 focus:border-[#3586FF] focus:outline-none focus:ring-2 focus:ring-[#3586FF]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {STEPS.map((label, i) => (
                        <option key={i} value={i + 1}>
                          {i + 1}. {label}
                        </option>
                      ))}
                    </select>
                    <Button
                      onClick={handleUpdateStatusStep}
                      disabled={
                        saving ||
                        (status === initialStatus && step === initialStep)
                      }
                      className="rounded-lg bg-[#3586FF] px-4 py-1.5 text-sm font-medium text-white hover:bg-[#2a6de8] disabled:opacity-50"
                    >
                      {saving ? "Updating…" : "Update"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add a note – only when status is Open */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-5 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Add a note
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  {canUpdate
                    ? "Record a call, follow-up, or comment. Each save appears in the activity timeline."
                    : "Revert status to Open above to add notes."}
                </p>
              </div>
              <div className="p-5">
                <label className="mb-1.5 block text-xs font-medium text-gray-600">
                  Note
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={
                    canUpdate
                      ? "e.g. Called lead, will try again tomorrow…"
                      : "Set status to Open to add a note."
                  }
                  rows={4}
                  disabled={!canUpdate}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#3586FF] focus:outline-none focus:ring-2 focus:ring-[#3586FF]/20 disabled:opacity-60 disabled:cursor-not-allowed"
                />
                <Button
                  onClick={handleSaveNote}
                  disabled={saving || !canUpdate}
                  className="mt-4 rounded-lg bg-[#3586FF] btn-text px-6 py-1.5 font-medium text-white hover:bg-[#2a6de8] disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save note"}
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Activity timeline */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-4 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                  Activity
                </h2>
                <p className="mt-0.5 text-xs text-gray-400">
                  All notes and step changes
                </p>
              </div>
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto p-4">
                {stepLogs.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-700">
                    No activity yet. Add a note above to get started.
                  </p>
                ) : (
                  <ul className="relative space-y-0">
                    {/* Vertical line */}
                    <span
                      className="absolute left-[11px] top-2 bottom-2 w-px bg-gray-200"
                      aria-hidden
                    />
                    {stepLogs.map((log: any, i: number) => (
                      <li
                        key={log.id ?? i}
                        className="relative flex gap-4 pb-6 last:pb-0"
                      >
                        <span
                          className="relative z-10 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#3586FF] bg-white text-[10px] font-bold text-[#3586FF]"
                          aria-hidden
                        >
                          {log.toStep}
                        </span>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className="text-sm font-medium text-gray-900">
                            {log.fromStep === 0
                              ? "Referral created"
                              : `Step ${log.fromStep} → ${log.toStep}`}
                            {log.fromStep > 0 && (
                              <span className="ml-1.5 text-gray-700">
                                · {STEPS[log.toStep - 1]}
                              </span>
                            )}
                          </p>
                          {log.note && (
                            <div className="mt-1.5 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                              {log.note}
                            </div>
                          )}
                          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0 text-xs text-gray-700">
                            <span>{formatDate(log.createdAt)}</span>
                            {log.updatedBy && (
                              <>
                                <span>·</span>
                                <span>
                                  By{" "}
                                  {getReferrerDisplayName(log.updatedBy) || "—"}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

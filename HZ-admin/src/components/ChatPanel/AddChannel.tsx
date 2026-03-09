"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Users, Check } from "lucide-react";
import apiClient from "../../utils/apiClient";
import toast from "react-hot-toast";

type UserPick = {
  id: string;
  name: string;
  email?: string;
  designation?: string;
};

type CreateChannelResponse = {
  id: string;
  title: string;
  description?: string;
  kind: "channel";
};

export function AddChannel({
  open,
  onClose,
  users,
  currentUserId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  users: UserPick[];
  currentUserId: string;
  onCreated: (payload: {
    threadId: string;
    title: string;
    description?: string;
    memberIds: string[];
  }) => void;
}) {
  console.log("AddChannel users:", users);
  const [query, setQuery] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(""); // ✅ NEW
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) => {
      const name = `${u.name ?? ""}`.trim().toLowerCase();
      const email = (u.email ?? "").toLowerCase();
      const designation = (u.designation ?? "").toLowerCase();
      return name.includes(q) || email.includes(q) || designation.includes(q);
    });
  }, [users, query]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedCount = selected.size;

  const createChannel = async () => {
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle) {
      toast.error("Please enter channel name");
      return;
    }
    if (selected.size < 1) {
      toast.error("Select at least 1 user");
      return;
    }

    // Include admin himself always
    const memberIds = Array.from(
      new Set([currentUserId, ...Array.from(selected)])
    );

    try {
      setLoading(true);
      const res = await apiClient.post(
        `${apiClient.URLS.chatChannels}?userId=${currentUserId}`,
        {
          title: trimmedTitle,
          description: trimmedDesc,
          memberIds,
        },
        true
      );

      const data: CreateChannelResponse = (res.data ?? res.body) as any;
      if (!data?.id) throw new Error("threadId missing");

      onCreated({
        threadId: data.id,
        title: data.title ?? trimmedTitle,
        description: data.description ?? trimmedDesc,
        memberIds,
      });

      onClose();

      // reset UI
      setTitle("");
      setDescription(""); // ✅ NEW
      setQuery("");
      setSelected(new Set());
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Failed to create channel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close modal"
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-[90] left-1/2 top-1/2 w-[95vw] max-w-2xl -translate-x-1/2 -translate-y-1/2
rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden
max-h-[90vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ type: "spring", stiffness: 420, damping: 35 }}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-[#3586FF]">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="leading-tight">
                  <h2 className="text-lg font-bold text-gray-900">
                    Create Channel
                  </h2>
                  <p className="text-xs text-gray-600">
                    Select members and start real-time chat
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Channel name <span className="text-red-500">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sales Team"
                  maxLength={100}
                  className="mt-1 w-full rounded-xl border placeholder:text-[12px] label-text border-gray-200 bg-gray-50 px-4 md:py-[6px] py-1 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Choose a name that clearly describes the channel's purpose
                </p>
              </div>

              {/* ✅ NEW: Description */}
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1 block">
                  Description <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this channel about? e.g. Updates and discussions for the Sales Team"
                  rows={3}
                  maxLength={500}
                  className="mt-1 w-full rounded-lg border label-text border-gray-200 placeholder:text-[12px] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-[#3586FF]/20 focus:border-[#3586FF] resize-none transition-all"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {description?.length ?? 0}/500
                </p>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-11 pr-4 py-2 rounded-lg border placeholder:text-[12px] border-gray-200 bg-white outline-none focus:ring-2 focus:ring-[#3586FF]/20 focus:border-[#3586FF]"
                />
              </div>

              {/* Selected count */}
              <div className="flex items-center sublabel-text justify-between text-sm">
                <p className="text-gray-700">
                  Selected: <span className="font-bold">{selectedCount}</span> out of <span className="font-bold">{filtered.length}</span>
                </p>
                <p className="text-gray-400 text-xs">
                  Admin will be added automatically
                </p>
              </div>

              {/* User list */}
              <div className="max-h-[40vh] overflow-auto rounded-xl border border-gray-200">
                {filtered.map((u) => {
                  const name = u?.name ?? "name";
                  const designation = u?.designation ?? "";
                  const checked = selected.has(u.id);

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => toggle(u.id)}
                      className="w-full px-4 py-2 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold label-text text-gray-900 truncate">
                            {name}
                          </p>
                          {designation && (
                            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
                              {designation}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {u.email ?? ""}
                        </p>
                      </div>

                      <div
                        className={[
                          "w-4 h-4 rounded-lg border flex items-center justify-center",
                          checked
                            ? "bg-blue-600 border-blue-600"
                            : "bg-white border-gray-300",
                        ].join(" ")}
                      >
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-white transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createChannel}
                disabled={loading}
                className={[
                  "px-5 py-2 rounded-lg font-semibold text-white transition-all",
                  loading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#3586FF] hover:bg-[#2970E5] hover:shadow-lg",
                ].join(" ")}
              >
                {loading ? "Creating..." : "Create Channel"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

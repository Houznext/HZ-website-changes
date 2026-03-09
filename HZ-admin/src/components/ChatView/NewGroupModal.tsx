import Modal from "@/src/common/Modal";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Button from "@/src/common/Button";
import CustomInput from "@/src/common/FormElements/CustomInput";
import Loader from "@/src/common/Loader";
import { ChatConversation } from "@/src/stores/useChatStore";

type User = {
  id: number;
  username: string;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  kind?: string;
};

type BranchUser = {
  id: number;
  firstName: string;
  username?: string;
  phone?: string | null;
  email?: string | null;
  profile?: string | null;
  isBranchHead?: boolean;
};

export function NewGroupModal({
  isOpen,
  onClose,
  onOpenConversation,
  onConversationCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenConversation: (convId: string) => Promise<void>;
  onConversationCreated?: (conversation: ChatConversation) => void;
}) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [branchHasHead, setBranchHasHead] = useState(false);

  const { data: session } = useSession();

  const branchId = session?.user?.branchMemberships?.[0]?.branchId;

  useEffect(() => {
    if (!isOpen || !branchId) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);

        // ✅ FIX: use branchId instead of hardcoded 2
        const res = await apiClient.get(
          `${apiClient.URLS.user}/by-branch/${branchId}/admin-users`,
          {},
          true
        );

        const rawList = Array.isArray(res.body) ? res.body : [];

        const normalizedUsers: BranchUser[] = rawList.map((item: any) => ({
          id: item.user.id,
          firstName: item.user.firstName,
          username: item.user.firstName,
          phone: item.user.phone,
          email: item.user.email,
          profile: "/images/user.png",
          isBranchHead: item.membership?.isBranchHead ?? false,
        }));

        setUsers(normalizedUsers as any);
        setBranchHasHead(normalizedUsers.some((u) => u.isBranchHead === true));
      } catch (error) {
        console.error("Error fetching branch users:", error);
        toast.error("Failed to load staff");
        setUsers([]);
        setBranchHasHead(false);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, branchId]);

  const filteredUsers = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;

    return users.filter((u) => {
      const name = (u.fullName || u.username || "").toLowerCase();
      const phone = (u.phone || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(term) || phone.includes(term) || email.includes(term);
    });
  }, [users, q]);

  const selectedUsers = useMemo(
    () => users.filter((u) => selected.includes(u.id)),
    [users, selected]
  );

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  if (loading)
    return <div className="w-full h-full">
      <Loader />
    </div>

  const createGroup = async () => {
    if (!title.trim()) return toast.error("Group title required");
    if (selected.length < 1) return toast.error("Select members");

    try {
      const res = await apiClient.post(
        `${apiClient.URLS.chat}/conversations/group`,
        {
          title: title.trim(),
          memberIds: selected,
        },
        true
      );

      if (![200, 201].includes(res.status)) {
        toast.error("Failed to create group");
        return;
      }

      const conversation: ChatConversation = {
        ...res.body,
        lastMessage: res.body?.lastMessage ?? null,
        unread: res.body?.unread ?? 0,
      };

      onConversationCreated?.(conversation);
      await onOpenConversation(res.body.id);

      onClose();
      setTitle("");
      setSelected([]);
      setQ("");
      setUsers([]);
    } catch {
      toast.error("Something went wrong");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className="max-w-[640px] md:min-h-[620px] min-h-[560px]"
      rootCls="z-[99999]"
      title="New Group"
      isCloseRequired={false}
      titleCls="font-bold text-center heading-text text-blue-500"
    >
      <div className="">
        <div className="flex gap-2 flex-row items-center justify-center">
          <div className="w-full">
            <CustomInput
              label="Group title"
              placeholder="Enter group title..."
              labelCls="label-text"
              value={title}
              onChange={(e: any) => setTitle(e.target.value)}
              className="w-full py-0"
              type="text"
              name="groupTitle"
            />
          </div>
        </div>
        <div className="mt-3">
          <CustomInput
            label="Search users"
            placeholder="Search by name / phone / email..."
            value={q}
            onChange={(e: any) => setQ(e.target.value)}
            className="w-full"
            type={"number"}
            name={""}
          />
        </div>
        {selectedUsers.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedUsers.map((u) => (
              <span
                key={u.id}
                className="text-xs bg-blue-50 border border-blue-100 text-blue-700 px-2 py-1 rounded-[4px] flex items-center gap-1"
              >
                {u.fullName || u.username}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 max-h-[380px] overflow-y-auto space-y-2">

          {filteredUsers.length === 0 ? (
            <p className="text-sm text-gray-500">No users found.</p>
          ) : (
            filteredUsers.map((u) => {
              const checked = selected.includes(u.id);
              return (
                <Button
                  key={u.id}
                  onClick={() => toggle(u.id)}
                  className={`w-full flex items-center gap-3 border rounded-[6px] p-3 text-left hover:bg-gray-50 ${checked ? "border-blue-500 bg-blue-50" : ""
                    }`}
                >
                  <input type="checkbox" checked={checked} readOnly />
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {u.fullName || u.username}
                      {u.kind && (
                        <span className="ml-2 text-xs text-gray-500">
                          ({u.kind})
                        </span>
                      )}
                      {"isBranchHead" in (u as any) && (u as any).isBranchHead ? (
                        <span className="ml-2 text-[11px] px-2 py-[2px] rounded-[6px] bg-amber-50 border border-amber-200 text-amber-800">
                          Branch Head
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-gray-500">
                      {u.phone || u.email || "-"}
                    </div>
                  </div>
                </Button>
              );
            })
          )}
        </div>
        <div className="mt-4 flex flex-row justify-between">
          <Button
            className="border-gray-500 btn-text font-medium text-black bg-gray-100 px-4 md:py-[6px] py-1 rounded-md"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            onClick={createGroup}
            className="bg-blue-500 btn-text font-medium text-white px-4 md:py-[6px] py-1 rounded-md"
          >
            Create
          </Button>

        </div>

        {branchHasHead ? null : (
          <p className="mt-3 text-[12px] text-center text-amber-700">
            Note: This branch has no branch head assigned.
          </p>
        )}
      </div>
    </Modal>
  );
}

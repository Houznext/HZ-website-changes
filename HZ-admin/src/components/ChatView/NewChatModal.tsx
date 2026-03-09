import { useEffect, useState } from "react";
import Modal from "@/src/common/Modal";
import apiClient from "@/src/utils/apiClient";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import Button from "@/src/common/Button";
import Loader from "@/src/common/Loader";
import { ChatConversation } from "@/src/stores/useChatStore";

type BranchUser = {
  id: string;
  firstName: string;
  username?: string;
  phone?: string | null;
  email?: string | null;
  profile?: string | null;
  isBranchHead?: boolean;
};

export function NewChatModal({
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
  const { data: session } = useSession();

  const branchId = session?.user?.branchMemberships?.[0]?.branchId;

  const [users, setUsers] = useState<BranchUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [branchHasHead, setBranchHasHead] = useState(false);




  useEffect(() => {
    if (!isOpen || !branchId) return;

    const fetchUsers = async () => {
      try {
        setLoading(true);

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

        setUsers(normalizedUsers);
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


  const startDirect = async (userId: string) => {
    try {
      const res = await apiClient.post(
        `${apiClient.URLS.chat}/conversations/direct`,
        { userId },
        true
      );

      if (![200, 201].includes(res.status)) {
        toast.error("Failed to start chat");
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
    } catch {
      toast.error("Something went wrong");
    }
  };

  if (loading)
    return <div className="w-full h-full">
      <Loader />
    </div>

  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      className="max-w-[520px] md:min-h-[540px] min-h-[500px]"
      rootCls="z-[99999]"
      title="New Chat"
      isCloseRequired={false}
      titleCls="font-bold text-center heading-text text-blue-500"
    >
      <div className="p-4">
        <div className="mt-2 max-h-[380px] overflow-y-auto space-y-2">
          {loading ? (
            <p className="text-sm text-gray-500">Loading staff...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-center text-gray-500">
              No staff available in this branch.
            </p>
          ) : (
            users.map((u:any) => (
              <Button
                key={u.id}
                onClick={() => startDirect(u.id)}
                className="w-full flex items-center gap-3 border rounded-xl p-3 hover:bg-gray-50 text-left"
              >
                <div className="md:w-10 w-8 md:h-10 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold md:text-[12px] text-[10px] flex-shrink-0">
                  {u?.firstName?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    {u.firstName}
                    {u.isBranchHead && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-500">
                        Head
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500">
                    {u.phone || u.email || "-"}
                  </div>
                </div>

                <span className="text-xs text-blue-500 font-bold">
                  Chat
                </span>
              </Button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

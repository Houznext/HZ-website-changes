import { Channel, ChatUser, DmUser } from "../../utils/chat/types";
import { motion } from "framer-motion";
import {
  Users,
  Lock,
  MessageSquare,
  Search,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  getStatusColor,
  getStatusText,
  initials,
  formatWhatsAppTimestamp,
} from "../../utils/chat/utilFunctions";
import SearchBar2 from "../../common/SearchBar2";

export function SidebarContent({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  filteredUsers,
  filteredChannels,
  selectedChat,
  selectedChannel,
  onSelectChat,
  onSelectChannel,
  onDeleteDm,
  deletingDmId,
  onClickCreateChannel,
  availableUsers,
}: {
  activeTab: "chats" | "channels";
  setActiveTab: (v: "chats" | "channels") => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (v: boolean) => void;
  filteredUsers: DmUser[];
  filteredChannels: Channel[];
  selectedChat: ChatUser | null;
  selectedChannel: Channel | null;
  onSelectChat: (u: DmUser) => void;
  onSelectChannel: (c: Channel) => void;
  onDeleteDm?: (u: DmUser) => void;
  deletingDmId?: string | null;
  showProfileFooter?: boolean;
  isAdmin?: boolean;
  onClickCreateChannel?: () => void;
  availableUsers: any[];
}) {

  return (
    <div className="flex flex-col h-full min-h-0 bg-white">
      <div className="px-5 py-4 border-b border-gray-200 bg-white">
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Search
              className={`w-5 h-5 transition-all duration-300 ${
                isSearchFocused
                  ? "text-[#3586FF]"
                  : "text-gray-400"
              }`}
            />
          </div>
          <SearchBar2
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search conversations..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />

          {searchQuery && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold px-2.5 py-1 bg-blue-50 text-[#3586FF] rounded-lg border border-blue-100">
              {activeTab === "chats"
                ? filteredUsers.length
                : filteredChannels.length}
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-gray-200 bg-white">
        {(["chats", "channels"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3.5 flex items-center justify-center gap-2 relative overflow-hidden group transition-colors ${
              activeTab === tab ? "text-[#3586FF] font-semibold" : "text-gray-600 hover:text-gray-900"
            }`}
            type="button"
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 bg-blue-50/50"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            {activeTab === tab && (
              <motion.div
                layoutId="activeTabLine"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3586FF]"
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            <div className="relative z-10">
              {tab === "chats" ? (
                <MessageSquare className="w-5 h-5" />
              ) : (
                <Users className="w-5 h-5" />
              )}
            </div>

            <span className="relative z-10 font-medium text-sm">
              {tab === "chats" ? "Chats" : "Channels"}
            </span>

            {activeTab === tab && filteredUsers.some((u) => u.unreadCount) && (
              <div className="absolute top-3 right-6 z-10">
                <div className="w-2 h-2 bg-[#3586FF] rounded-full animate-pulse" />
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-white">
        <div className="sticky top-0 z-10 px-5 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center justify-between w-full gap-2">
              <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                {activeTab === "chats" ? "Direct Messages" : "Team Channels"}
              </h2>
              {activeTab === "channels" && (
                <button
                  type="button"
                  onClick={onClickCreateChannel}
                  className="px-3 py-1.5 rounded-lg text-xs text-nowrap bg-[#3586FF] text-white font-semibold hover:bg-[#2970E5] hover:shadow-md transition-all duration-300"
                >
                  + Channel
                </button>
              )}
            </div>
          </div>
          <div className="text-xs flex items-center justify-start gap-2 text-gray-500 font-medium mt-2">
            <div className="px-2 py-1 bg-blue-50 rounded-md border border-blue-100">
              <span className="text-xs font-semibold text-[#3586FF]">
                {activeTab === "chats"
                  ? filteredUsers.length
                  : filteredChannels.length}
              </span>
            </div>
            {activeTab === "chats"
              ? `${filteredUsers.length} contacts`
              : `${filteredChannels.reduce(
                  (acc, c) => acc + c.memberCount,
                  0,
                )} total members`}
          </div>
        </div>

        <div className="p-3">
          <h2 className="text-white px-3 py-1 bg-[#3586FF] text-[10px] font-semibold uppercase tracking-wide rounded-md mb-3 inline-block">
            Recent
          </h2>
          {activeTab === "chats" ? (
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const selected = selectedChat?.id === user.id;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectChat(user)}
                    className={`relative p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                      selected
                        ? "bg-blue-50 shadow-md border border-blue-100"
                        : "bg-gray-50 hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {onDeleteDm && user.threadId && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDm(user);
                        }}
                        disabled={deletingDmId === user.threadId}
                        className={`z-30 absolute right-2 bottom-2 p-1.5 rounded-lg transition-all duration-200 ease-out ${
                          deletingDmId === user.threadId
                            ? "text-red-500 cursor-not-allowed"
                            : "text-gray-400 hover:text-red-500 hover:scale-110 hover:bg-red-50 active:scale-95"
                        }`}
                        title="Delete chat"
                        aria-label="Delete chat"
                      >
                        {deletingDmId === user.threadId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}

                    {selected && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

                    <div className="flex items-center gap-3 relative">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${user.avatarColor}`}
                          style={{
                            backgroundImage: user.avatarColor.includes(
                              "gradient",
                            )
                              ? user.avatarColor
                              : `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}99)`,
                          }}
                        >
                          <span className="text-base font-bold">
                            {initials(user.name)}
                          </span>
                        </div>

                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white shadow-sm ${getStatusColor(
                            user.status,
                          )} flex items-center justify-center`}
                        >
                          {user.status === "online" && (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 ">
                        <div className="flex items-start justify-between gap-2 ">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-sm">
                              {user.name}
                            </h3>
                          </div>
                          {user.timestamp && (
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                              {formatWhatsAppTimestamp(user.timestamp)}
                            </span>
                          )}
                        </div>

                        <p className="sublabel-text text-gray-600 truncate mb-[2px] leading-tight">
                          {user.lastMessage || "Start a conversation..."}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-[2px] rounded-full font-medium ${
                                user.status === "online"
                                  ? "bg-green-100 text-emerald-700 border border-emerald-200"
                                  : user.status === "away"
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                              }`}
                            >
                              {getStatusText(user.status)}
                            </span>
                          </div>

                          {!!user.unreadCount && user.unreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-2 py-0.5 text-[10px] font-bold bg-[#3586FF] text-white rounded-full min-w-[20px] text-center shadow-sm"
                            >
                              {user.unreadCount}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <h2 className="text-white px-6  py-1 bg-gradient-to-r text-[10px] from-blue-500 to-purple-500 w-20 rounded-sm">
                +New
              </h2>
              {availableUsers.map((user) => {
                const selected = selectedChat?.id === user.id;
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectChat(user)}
                    className={`relative p-3 rounded-2xl cursor-pointer transition-all duration-300 group ${
                      selected
                        ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 shadow-md shadow-blue-100/50 border-2 border-blue-100/50"
                        : "bg-white/80 backdrop-blur-sm hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-50/30 hover:shadow-sm border-2 border-transparent hover:border-gray-200/60"
                    }`}
                  >
                    {selected && (
                      <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-12 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

                    <div className="flex items-center gap-3 relative">
                      <div className="relative">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg ${user.avatarColor}`}
                          // style={{
                          //   backgroundImage: user.avatarColor.includes(
                          //     "gradient",
                          //   )
                          //     ? user.avatarColor
                          //     : `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}99)`,
                          // }}
                        >
                          <span className="text-base font-bold">
                            {initials(user.name)}
                          </span>
                        </div>

                        <div
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-3 border-white shadow-sm ${getStatusColor(
                            user.status,
                          )} flex items-center justify-center`}
                        >
                          {user.status === "online" && (
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 ">
                        <div className="flex items-start justify-between gap-2 ">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-sm">
                              {user.name}
                            </h3>
                          </div>
                          {user.timestamp && (
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                              {formatWhatsAppTimestamp(user.timestamp)}
                            </span>
                          )}
                        </div>

                        <p className="sublabel-text text-gray-600 truncate mb-[2px] leading-tight">
                          {user.lastMessage || "Start a conversation..."}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] px-2 py-[2px] rounded-full font-medium ${
                                user.status === "online"
                                  ? "bg-green-100 text-emerald-700 border border-emerald-200"
                                  : user.status === "away"
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-gray-100 text-gray-600 border border-gray-200"
                              }`}
                            >
                              {getStatusText(user.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredChannels.map((channel) => {
                const selected = selectedChannel?.id === channel.id;
                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => onSelectChannel(channel)}
                    className={`relative p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                      selected
                        ? "bg-blue-50 shadow-md border border-blue-100"
                        : "bg-gray-50 hover:bg-gray-100 hover:shadow-sm border border-transparent hover:border-gray-200"
                    }`}
                  >
                    {selected && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-[#3586FF] rounded-r-full" />
                    )}

                    <div className="flex items-center gap-3 relative">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shadow-sm border border-blue-100">
                          {channel.isPrivate ? (
                            <Lock className="w-6 h-6 text-gray-600" />
                          ) : (
                            <div className="w-10 h-10 bg-[#3586FF] rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        {channel.isPrivate && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center shadow-sm">
                            <Lock className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="font-bold text-gray-900 truncate text-base">
                              {channel.name}
                            </h3>
                          </div>
                          {channel.timestamp && (
                            <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                              {formatWhatsAppTimestamp(channel.timestamp)}
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 truncate mb-3 leading-tight">
                          {channel.lastMessage || "No messages yet"}
                        </p>
                        {channel.description && (
                          <p className="text-xs text-gray-500 truncate mb-2 leading-tight italic">
                            {channel.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                              <Users className="w-3 h-3" />
                              <span className="font-medium">
                                {channel.memberCount}
                              </span>
                            </div>

                            {channel.isPrivate && (
                              <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full font-medium border border-gray-200">
                                Private
                              </span>
                            )}
                          </div>

                          {!!channel.unreadCount && channel.unreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-2 py-0.5 text-[10px] font-bold bg-[#3586FF] text-white rounded-full min-w-[20px] text-center shadow-sm"
                            >
                              {channel.unreadCount}
                            </motion.span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

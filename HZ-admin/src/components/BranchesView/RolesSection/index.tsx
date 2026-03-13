"use client";
import {
    User,
    Users,
    Crown,
    Phone,
    Tag,
    Shield,
    Pencil,
    Trash2,
    UserPlus,
} from "lucide-react";
import Button from "@/src/common/Button";
import Loader from "@/src/common/Loader";

interface Branch {
    id: number;
    name: string;
    level: string;
}

interface UserItem {
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    membership: {
        branchId: string;
        kind: string;
        isBranchHead: boolean;
        branchRoleIds: number[];
    };
}

interface UsersSectionProps {
    users: UserItem[];
    isLoading: boolean;
    selectedBranch: Branch | null;
    onEditUser: (user: UserItem) => void;
    onDeleteUser: (id: number) => void;
    view: "cards" | "compact";
}

export default function UsersSection({
    users,
    isLoading,
    selectedBranch,
    onEditUser,
    onDeleteUser,
    view,
}: UsersSectionProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 flex justify-center items-center min-h-[400px]">
                <Loader />
            </div>
        );
    }

    if (!selectedBranch) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Branch Selected
                </h3>
                <p className="text-sm text-gray-600 font-medium">
                    Please select a branch from the hierarchy to view its users
                </p>
            </div>
        );
    }

    if (users?.length === 0) {
        return (
            <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 rounded-xl border-2 border-dashed border-blue-200 shadow-sm p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <User className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No Users in This Branch
                </h3>
                <p className="text-sm text-gray-600 font-medium mb-5 max-w-md">
                    Get started by adding team members to{" "}
                    <span className="font-bold text-blue-600">
                        {selectedBranch?.name}
                    </span>{" "}
                    to manage branch operations and permissions.
                </p>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" />
                        Add First User
                    </div>
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-xl border border-gray-200 shadow-sm p-4 md:p-6 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-100 to-green-200 rounded-lg shadow-sm">
                        <Users className="w-5 h-5 text-green-700" />
                    </div>
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">
                            Users in{" "}
                            <span className="text-blue-600">{selectedBranch?.name}</span>
                        </h2>
                        <p className="text-xs md:text-sm text-gray-600 font-medium">
                            {users?.length} {users?.length === 1 ? "member" : "members"} in this
                            branch
                        </p>
                    </div>
                </div>
            </div>

            {view === "cards" && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                    {users?.length > 0 && users.map((item) => {
                        const { user, membership } = item;
                        const isBranchHead = membership?.isBranchHead;

                        return (
                            <div
                                key={user.id}
                                className="relative group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 p-4 md:p-5 hover:-translate-y-1"
                            >
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent via-blue-50/5 to-blue-100/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                                <div className="relative z-10">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`relative ${isBranchHead
                                                    ? "p-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full shadow-md"
                                                    : ""
                                                    }`}
                                            >
                                                <div
                                                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center ${isBranchHead
                                                        ? "bg-white"
                                                        : "bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200"
                                                        }`}
                                                >
                                                    <User
                                                        className={`w-5 h-5 ${isBranchHead ? "text-yellow-600" : "text-blue-600"
                                                            }`}
                                                    />
                                                </div>
                                                {isBranchHead && (
                                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                                                        <Crown className="w-3 h-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-1">
                                                    {user.firstName} {user.lastName}
                                                </h3>
                                                <p className="text-xs md:text-sm text-gray-600 font-medium line-clamp-1">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-[10px] px-2 py-1 rounded-full font-bold flex-shrink-0 ${isBranchHead
                                                ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300"
                                                : "bg-gray-100 text-gray-700 border border-gray-300"
                                                }`}
                                        >
                                            {isBranchHead ? "HEAD" : "MEMBER"}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-xs md:text-sm">
                                            <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Phone className="w-3.5 h-3.5 text-blue-600" />
                                            </div>
                                            <span className="text-gray-800 font-medium truncate">
                                                {user.phone || "—"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs md:text-sm">
                                            <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Tag className="w-3.5 h-3.5 text-green-600" />
                                            </div>
                                            <span className="text-gray-800 font-medium capitalize truncate">
                                                {membership.kind}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2 text-xs md:text-sm">
                                            <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Shield className="w-3.5 h-3.5 text-purple-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {membership.branchRoleIds.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {membership.branchRoleIds.slice(0, 2).map((roleId) => (
                                                            <span
                                                                key={roleId}
                                                                className="inline-block px-2 py-1 bg-purple-50 border border-purple-200 rounded-md text-[10px] font-bold text-purple-700"
                                                            >
                                                                Role #{roleId}
                                                            </span>
                                                        ))}
                                                        {membership.branchRoleIds.length > 2 && (
                                                            <span className="inline-block px-2 py-1 bg-gray-100 rounded-md text-[10px] font-bold text-gray-600">
                                                                +{membership.branchRoleIds.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">
                                                        No roles assigned
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-4"></div>

                                    {/* Actions */}
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            onClick={() => onEditUser(item)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 hover:scale-105 border border-blue-200"
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => onDeleteUser(user.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 hover:scale-105 border border-red-200"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>

                                {/* Bottom Accent */}
                                <div
                                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-xl ${isBranchHead
                                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                        : "bg-gradient-to-r from-blue-400 to-indigo-500"
                                        } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}
                                ></div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Compact View */}
            {view === "compact" && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">
                                        User
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">
                                        Contact
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">
                                        Type
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">
                                        Status
                                    </th>
                                    <th className="text-center px-4 py-3 text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">
                                        Roles
                                    </th>
                                    <th className="text-right px-4 py-3 text-xs md:text-sm font-bold text-gray-700 uppercase tracking-wide">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users && users?.map((item, index) => {
                                    const { user, membership } = item;
                                    const isBranchHead = membership.isBranchHead;

                                    return (
                                        <tr
                                            key={user.id}
                                            className={`hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/20 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                                                }`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`relative ${isBranchHead
                                                            ? "p-1 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full"
                                                            : ""
                                                            }`}
                                                    >
                                                        <div
                                                            className={`w-10 h-10 rounded-full flex items-center justify-center ${isBranchHead
                                                                ? "bg-white"
                                                                : "bg-gradient-to-br from-blue-100 to-indigo-100"
                                                                }`}
                                                        >
                                                            <User
                                                                className={`w-4 h-4 ${isBranchHead
                                                                    ? "text-yellow-600"
                                                                    : "text-blue-600"
                                                                    }`}
                                                            />
                                                        </div>
                                                        {isBranchHead && (
                                                            <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-600 font-medium">
                                                            {user.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-700 font-medium">
                                                        {user.phone || "—"}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center gap-1 text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold border border-green-300">
                                                    <Tag className="w-3 h-3" />
                                                    {membership.kind}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold ${isBranchHead
                                                        ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300"
                                                        : "bg-gray-100 text-gray-700 border border-gray-300"
                                                        }`}
                                                >
                                                    {isBranchHead && <Crown className="w-3 h-3" />}
                                                    {isBranchHead ? "Branch Head" : "Member"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                                                    {membership.branchRoleIds.length}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        onClick={() => onEditUser(item)}
                                                        className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all hover:scale-110"
                                                        title="Edit User"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => onDeleteUser(user.id)}
                                                        className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all hover:scale-110"
                                                        title="Delete User"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
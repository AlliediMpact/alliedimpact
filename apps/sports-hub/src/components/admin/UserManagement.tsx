'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, updateDoc, doc, deleteDoc, orderBy, limit, startAfter, DocumentSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  MoreVertical, 
  UserCheck, 
  UserX, 
  Shield, 
  Trash2, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin' | 'moderator';
  status: 'active' | 'suspended' | 'banned';
  createdAt: Date;
  lastLoginAt?: Date;
  emailVerified: boolean;
  mfaEnabled: boolean;
  walletBalance: number;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'activate' | 'delete' | 'bulk-suspend' | 'bulk-activate' | 'bulk-delete';
    userId?: string;
  } | null>(null);
  const [pageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async (loadMore = false) => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      let q = query(usersRef, orderBy('createdAt', 'desc'), limit(pageSize));

      if (loadMore && lastDoc) {
        q = query(usersRef, orderBy('createdAt', 'desc'), startAfter(lastDoc), limit(pageSize));
      }

      const snapshot = await getDocs(q);
      const userData: User[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        userData.push({
          id: doc.id,
          email: data.email || '',
          displayName: data.displayName || 'Unknown',
          role: data.role || 'user',
          status: data.status || 'active',
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate(),
          emailVerified: data.emailVerified || false,
          mfaEnabled: data.mfaEnabled || false,
          walletBalance: data.walletBalance || 0,
        });
      });

      if (loadMore) {
        setUsers((prev) => [...prev, ...userData]);
      } else {
        setUsers(userData);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === pageSize);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          user.displayName.toLowerCase().includes(term) ||
          user.id.toLowerCase().includes(term)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateUserStatus = async (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: 'user' | 'admin' | 'moderator') => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date(),
      });

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setSelectedUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleBulkAction = async (action: 'suspend' | 'activate' | 'delete') => {
    const userIds = Array.from(selectedUsers);
    
    try {
      for (const userId of userIds) {
        if (action === 'delete') {
          await handleDeleteUser(userId);
        } else {
          await handleUpdateUserStatus(userId, action === 'suspend' ? 'suspended' : 'active');
        }
      }
      setSelectedUsers(new Set());
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    switch (confirmAction.type) {
      case 'suspend':
        if (confirmAction.userId) await handleUpdateUserStatus(confirmAction.userId, 'suspended');
        break;
      case 'activate':
        if (confirmAction.userId) await handleUpdateUserStatus(confirmAction.userId, 'active');
        break;
      case 'delete':
        if (confirmAction.userId) await handleDeleteUser(confirmAction.userId);
        break;
      case 'bulk-suspend':
        await handleBulkAction('suspend');
        break;
      case 'bulk-activate':
        await handleBulkAction('activate');
        break;
      case 'bulk-delete':
        await handleBulkAction('delete');
        break;
    }

    setConfirmModalOpen(false);
    setConfirmAction(null);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const exportUsers = () => {
    const csv = [
      ['ID', 'Email', 'Name', 'Role', 'Status', 'Created', 'Last Login', 'Email Verified', 'MFA', 'Wallet Balance'],
      ...filteredUsers.map((u) => [
        u.id,
        u.email,
        u.displayName,
        u.role,
        u.status,
        format(u.createdAt, 'yyyy-MM-dd'),
        u.lastLoginAt ? format(u.lastLoginAt, 'yyyy-MM-dd') : 'Never',
        u.emailVerified ? 'Yes' : 'No',
        u.mfaEnabled ? 'Yes' : 'No',
        u.walletBalance.toFixed(2),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      admin: 'destructive',
      moderator: 'default',
      user: 'secondary',
    };
    return <Badge variant={variants[role] || 'outline'}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      suspended: 'bg-yellow-500',
      banned: 'bg-red-500',
    };
    return (
      <Badge variant="outline" className={colors[status]}>
        {status}
      </Badge>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
        <Button onClick={exportUsers} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email, name, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => loadUsers()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <span>{selectedUsers.size} user(s) selected</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setConfirmAction({ type: 'bulk-activate' });
                  setConfirmModalOpen(true);
                }}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setConfirmAction({ type: 'bulk-suspend' });
                  setConfirmModalOpen(true);
                }}
              >
                <UserX className="h-4 w-4 mr-2" />
                Suspend
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setConfirmAction({ type: 'bulk-delete' });
                  setConfirmModalOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr className="bg-muted/50">
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left font-medium">User</th>
                  <th className="p-4 text-left font-medium">Role</th>
                  <th className="p-4 text-left font-medium">Status</th>
                  <th className="p-4 text-left font-medium">Created</th>
                  <th className="p-4 text-left font-medium">Last Login</th>
                  <th className="p-4 text-left font-medium">Wallet</th>
                  <th className="p-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{user.displayName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="flex gap-2 mt-1">
                          {user.emailVerified && (
                            <Badge variant="outline" className="text-xs">
                              Verified
                            </Badge>
                          )}
                          {user.mfaEnabled && (
                            <Badge variant="outline" className="text-xs">
                              MFA
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getRoleBadge(user.role)}</td>
                    <td className="p-4">{getStatusBadge(user.status)}</td>
                    <td className="p-4 text-sm">{format(user.createdAt, 'MMM dd, yyyy')}</td>
                    <td className="p-4 text-sm">
                      {user.lastLoginAt ? format(user.lastLoginAt, 'MMM dd, yyyy') : 'Never'}
                    </td>
                    <td className="p-4 text-sm font-medium">R{user.walletBalance.toFixed(2)}</td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setDetailsModalOpen(true);
                            }}
                          >
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setConfirmAction({ type: user.status === 'active' ? 'suspend' : 'activate', userId: user.id });
                              setConfirmModalOpen(true);
                            }}
                          >
                            {user.status === 'active' ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Suspend User
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Activate User
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setConfirmAction({ type: 'delete', userId: user.id });
                              setConfirmModalOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No users found matching your criteria
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={() => loadUsers(true)} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* User Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View and manage user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-sm font-medium mt-1">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Display Name</Label>
                  <p className="text-sm font-medium mt-1">{selectedUser.displayName}</p>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select
                    value={selectedUser.role}
                    onValueChange={(value) =>
                      handleUpdateUserRole(selectedUser.id, value as any)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="text-sm mt-1">{format(selectedUser.createdAt, 'PPP')}</p>
                </div>
                <div>
                  <Label>Last Login</Label>
                  <p className="text-sm mt-1">
                    {selectedUser.lastLoginAt ? format(selectedUser.lastLoginAt, 'PPP') : 'Never'}
                  </p>
                </div>
                <div>
                  <Label>Email Verified</Label>
                  <p className="text-sm mt-1">{selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label>MFA Enabled</Label>
                  <p className="text-sm mt-1">{selectedUser.mfaEnabled ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <Label>Wallet Balance</Label>
                  <p className="text-sm font-medium mt-1">R{selectedUser.walletBalance.toFixed(2)}</p>
                </div>
                <div>
                  <Label>User ID</Label>
                  <p className="text-xs mt-1 font-mono text-muted-foreground">{selectedUser.id}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              {confirmAction?.type.includes('bulk')
                ? `Are you sure you want to ${confirmAction.type.replace('bulk-', '')} ${selectedUsers.size} user(s)?`
                : `Are you sure you want to ${confirmAction?.type} this user?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={confirmAction?.type.includes('delete') ? 'destructive' : 'default'}
              onClick={handleConfirm}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

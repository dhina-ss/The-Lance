import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
	Clock,
	Lock,
	Bell,
	Save,
	CheckCircle2,
	AlertTriangle,
	X,
	ShieldCheck,
	Pencil,
	RotateCcw,
	Users,
	UserPlus,
	Trash2,
	Search,
	Eye,
	EyeOff,
	Key,
	Mail,
	User as UserIcon,
	BadgeCheck,
	AlertCircle,
} from 'lucide-react';
import {
	fetchTenantSettings,
	saveTenantSettings,
	fetchUsers,
	createUser,
	updateUser,
	deleteUser,
	fetchUserLimit,
	formatDateOnly,
} from '../../api/ems';
import {
	DEFAULT_TENANT_ROLES,
	AVAILABLE_RULES,
	ALL_SUBRULE_IDS,
	getStoredTenantRoles,
	saveStoredTenantRoles,
	PermissionsCategoryList,
} from './tenantRoles';

const AVATAR_BG = ['bg-primary', 'bg-accent', 'bg-emerald-600', 'bg-amber-600', 'bg-indigo-600', 'bg-purple-600'];

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState('dashboard-users'); // 'dashboard-users' | 'roles-rules' | 'auto-lock' | 'all'
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [toast, setToast] = useState(null); // { kind: 'ok'|'err', text }

	// Inactivity Auto-Lock settings
	const [lockMinutes, setLockMinutes] = useState(5);
	const [alertMinutes, setAlertMinutes] = useState(10);

	// Roles and Rules state
	const [tenantRoles, setTenantRoles] = useState(getStoredTenantRoles);
	const [activeRoleId, setActiveRoleId] = useState('super_admin');
	const [editingRoleNameId, setEditingRoleNameId] = useState(null);
	const [tempRoleName, setTempRoleName] = useState('');

	// Dashboard Users state
	const [users, setUsers] = useState([]);
	const [usersLoading, setUsersLoading] = useState(false);
	const [userLimit, setUserLimit] = useState(null);
	const [searchUser, setSearchUser] = useState('');

	// Modal states
	const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
	const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
	const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null);
	const [deleteTargetUser, setDeleteTargetUser] = useState(null);

	// Add User Form State
	const [addUsername, setAddUsername] = useState('');
	const [addEmail, setAddEmail] = useState('');
	const [addEmpCode, setAddEmpCode] = useState('');
	const [addPassword, setAddPassword] = useState('');
	const [addConfirmPassword, setAddConfirmPassword] = useState('');
	const [addRole, setAddRole] = useState(tenantRoles[0]?.name || 'Super Admin');
	const [addError, setAddError] = useState('');
	const [addSubmitting, setAddSubmitting] = useState(false);
	const [showAddPassword, setShowAddPassword] = useState(false);

	// Edit User Form State
	const [editUsername, setEditUsername] = useState('');
	const [editEmail, setEditEmail] = useState('');
	const [editEmpCode, setEditEmpCode] = useState('');
	const [editPassword, setEditPassword] = useState('');
	const [editRole, setEditRole] = useState('Super Admin');
	const [editError, setEditError] = useState('');
	const [editSubmitting, setEditSubmitting] = useState(false);
	const [showEditPassword, setShowEditPassword] = useState(false);

	// Delete State
	const [deleteSubmitting, setDeleteSubmitting] = useState(false);

	const loadSettings = async () => {
		try {
			const s = await fetchTenantSettings();
			setLockMinutes(s.inactivityLockMinutes ?? 5);
			setAlertMinutes(s.inactivityAlertMinutes ?? 10);
		} catch (err) {
			setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to load settings.' });
		}
	};

	const loadUsers = async () => {
		setUsersLoading(true);
		try {
			const [usersData, limitData] = await Promise.all([
				fetchUsers().catch(() => []),
				fetchUserLimit().catch(() => null),
			]);
			setUsers(usersData || []);
			if (limitData && typeof limitData.limit === 'number') {
				setUserLimit(limitData.limit);
			}
		} catch {
			// fallback
		} finally {
			setUsersLoading(false);
		}
	};

	useEffect(() => {
		Promise.all([loadSettings(), loadUsers()]).finally(() => setLoading(false));
	}, []);

	useEffect(() => {
		if (toast) {
			const t = setTimeout(() => setToast(null), 4000);
			return () => clearTimeout(t);
		}
	}, [toast]);

	// Auto-persist tenantRoles changes
	const updateRolesAndSave = (updatedRoles) => {
		setTenantRoles(updatedRoles);
		saveStoredTenantRoles(updatedRoles);
	};

	const handleSaveSettings = async () => {
		setSaving(true);
		try {
			await saveTenantSettings({
				inactivityLockMinutes: Number(lockMinutes) || 5,
				inactivityAlertMinutes: Number(alertMinutes) || 10,
			});
			saveStoredTenantRoles(tenantRoles);
			setToast({ kind: 'ok', text: 'All settings and access rules saved successfully.' });
		} catch (err) {
			setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to save settings.' });
		} finally {
			setSaving(false);
		}
	};

	const handleRenameRole = (roleId, newName) => {
		const trimmed = newName.trim();
		if (!trimmed) return;
		const nextRoles = tenantRoles.map((r) => {
			if (r.id === roleId && r.isEditableName) {
				return { ...r, name: trimmed };
			}
			return r;
		});
		updateRolesAndSave(nextRoles);
		setEditingRoleNameId(null);
		setToast({ kind: 'ok', text: `Role renamed to "${trimmed}" successfully!` });
	};

	const handleSaveRoleDefaultRules = (roleId, rulesToSave) => {
		const nextRoles = tenantRoles.map((r) =>
			r.id === roleId ? { ...r, rules: [...rulesToSave] } : r
		);
		updateRolesAndSave(nextRoles);
		setToast({ kind: 'ok', text: 'Updated role access permissions!' });
	};

	const handleResetRoles = () => {
		updateRolesAndSave(DEFAULT_TENANT_ROLES);
		setToast({ kind: 'ok', text: 'Reset all roles and rules to factory default settings.' });
	};

	// ----------------- Dashboard Users Handlers -----------------
	const dashboardUsers = users.filter(
		(u) =>
			u.type === 'Dashboard User' ||
			u.userType === 'Dashboard User' ||
			u.role !== 'Device User'
	);

	const filteredDashboardUsers = dashboardUsers.filter((u) => {
		const q = searchUser.trim().toLowerCase();
		if (!q) return true;
		return (
			(u.username || u.name || '').toLowerCase().includes(q) ||
			(u.email || '').toLowerCase().includes(q) ||
			(u.employeeCode || u.empCode || '').toLowerCase().includes(q) ||
			(u.role || '').toLowerCase().includes(q)
		);
	});

	const handleOpenAddUser = () => {
		setAddUsername('');
		setAddEmail('');
		setAddEmpCode('');
		setAddPassword('');
		setAddConfirmPassword('');
		setAddRole(tenantRoles[0]?.name || 'Super Admin');
		setAddError('');
		setShowAddPassword(false);
		setIsAddUserModalOpen(true);
	};

	const handleCreateDashboardUser = async (e) => {
		e.preventDefault();
		if (!addUsername.trim() || !addEmail.trim() || !addPassword) {
			setAddError('Please fill out all required fields.');
			return;
		}
		if (addPassword.length < 8) {
			setAddError('Password must be at least 8 characters long.');
			return;
		}
		if (addPassword !== addConfirmPassword) {
			setAddError('Passwords do not match.');
			return;
		}

		setAddSubmitting(true);
		setAddError('');
		try {
			const assignedRoleObj = tenantRoles.find((r) => r.name === addRole) || tenantRoles[0];
			await createUser({
				username: addUsername.trim(),
				email: addEmail.trim(),
				password: addPassword,
				userType: 'Dashboard User',
				role: addRole,
				rules: assignedRoleObj?.rules || ALL_SUBRULE_IDS,
				employeeCode: addEmpCode.trim() || undefined,
			});
			await loadUsers();
			setIsAddUserModalOpen(false);
			setToast({ kind: 'ok', text: `Dashboard user "${addUsername.trim()}" created successfully!` });
		} catch (err) {
			setAddError(err instanceof Error ? err.message : 'Failed to create dashboard user.');
		} finally {
			setAddSubmitting(false);
		}
	};

	const handleOpenEditUser = (user) => {
		setEditingUser(user);
		setEditUsername(user.username || user.name || '');
		setEditEmail(user.email || '');
		setEditEmpCode(user.employeeCode || user.empCode || '');
		setEditPassword('');
		setEditRole(user.role || 'Super Admin');
		setEditError('');
		setShowEditPassword(false);
		setIsEditUserModalOpen(true);
	};

	const handleUpdateDashboardUser = async (e) => {
		e.preventDefault();
		if (!editingUser) return;
		if (!editUsername.trim() || !editEmail.trim()) {
			setEditError('Name and email are required.');
			return;
		}
		if (editPassword && editPassword.length < 8) {
			setEditError('Password must be at least 8 characters long.');
			return;
		}

		setEditSubmitting(true);
		setEditError('');
		try {
			const assignedRoleObj = tenantRoles.find((r) => r.name === editRole) || tenantRoles[0];
			await updateUser(editingUser.id, {
				username: editUsername.trim(),
				email: editEmail.trim(),
				userType: 'Dashboard User',
				role: editRole,
				rules: assignedRoleObj?.rules || editingUser.rules || ALL_SUBRULE_IDS,
				employeeCode: editEmpCode.trim() || undefined,
				...(editPassword ? { password: editPassword } : {}),
			});
			await loadUsers();
			setIsEditUserModalOpen(false);
			setToast({ kind: 'ok', text: `Updated dashboard user "${editUsername.trim()}" successfully!` });
		} catch (err) {
			setEditError(err instanceof Error ? err.message : 'Failed to update user.');
		} finally {
			setEditSubmitting(false);
		}
	};

	const handleOpenDeleteUser = (user) => {
		setDeleteTargetUser(user);
		setIsDeleteUserModalOpen(true);
	};

	const handleConfirmDeleteUser = async () => {
		if (!deleteTargetUser) return;
		setDeleteSubmitting(true);
		try {
			await deleteUser(deleteTargetUser.id);
			await loadUsers();
			setIsDeleteUserModalOpen(false);
			setToast({ kind: 'ok', text: `Dashboard user "${deleteTargetUser.username || deleteTargetUser.name}" deleted.` });
		} catch (err) {
			setToast({ kind: 'err', text: err instanceof Error ? err.message : 'Failed to delete user.' });
		} finally {
			setDeleteSubmitting(false);
			setDeleteTargetUser(null);
		}
	};

	const activeRole = tenantRoles.find((r) => r.id === activeRoleId) || tenantRoles[0];

	if (loading) {
		return (
			<div className="p-6 lg:p-10 text-sm text-muted-foreground flex items-center gap-2">
				<div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
				<span>Loading tenant settings & dashboard users…</span>
			</div>
		);
	}

	return (
		<div className="p-6 lg:p-10 space-y-6 max-w-full">
			{/* Toast Notification */}
			{toast && (
				<div
					className={`rounded-2xl p-4 flex items-center justify-between shadow-sm border animate-in fade-in slide-in-from-top-2 ${
						toast.kind === 'ok'
							? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
							: 'bg-rose-500/10 border-rose-500/30 text-rose-600'
					}`}
				>
					<div className="flex items-center gap-3">
						<div
							className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
								toast.kind === 'ok' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
							}`}
						>
							{toast.kind === 'ok' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
						</div>
						<span className="text-xs font-bold">{toast.text}</span>
					</div>
					<button
						onClick={() => setToast(null)}
						className="p-1 rounded-lg hover:bg-black/5 cursor-pointer"
					>
						<X size={16} />
					</button>
				</div>
			)}

			{/* Settings Sub-Tab Navigation Bar */}
			<div className="flex items-center gap-2 border-b border-border/60 pb-3 overflow-x-auto">
				<button
					type="button"
					onClick={() => setActiveTab('dashboard-users')}
					className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
						activeTab === 'dashboard-users'
							? 'bg-primary text-primary-foreground shadow-xs'
							: 'bg-background border border-border/80 text-muted-foreground hover:text-primary hover:bg-slate-100'
					}`}
				>
					<Users size={15} />
					<span>Dashboard Users</span>
					<span
						className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
							activeTab === 'dashboard-users'
								? 'bg-primary-foreground/20 text-white'
								: 'bg-primary/10 text-primary'
						}`}
					>
						{dashboardUsers.length}
					</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab('roles-rules')}
					className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
						activeTab === 'roles-rules'
							? 'bg-primary text-primary-foreground shadow-xs'
							: 'bg-background border border-border/80 text-muted-foreground hover:text-primary hover:bg-slate-100'
					}`}
				>
					<ShieldCheck size={15} />
					<span>Roles & Access Rules</span>
					<span
						className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
							activeTab === 'roles-rules'
								? 'bg-primary-foreground/20 text-white'
								: 'bg-slate-200/80 text-muted-foreground'
						}`}
					>
						{tenantRoles.length}
					</span>
				</button>

				<button
					type="button"
					onClick={() => setActiveTab('auto-lock')}
					className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
						activeTab === 'auto-lock'
							? 'bg-primary text-primary-foreground shadow-xs'
							: 'bg-background border border-border/80 text-muted-foreground hover:text-primary hover:bg-slate-100'
					}`}
				>
					<Clock size={15} />
					<span>Inactivity Auto-Lock</span>
				</button>
			</div>

			{/* ========================================================= */}
			{/* SECTION 1: DASHBOARD USERS TABLE & CRUD                  */}
			{/* ========================================================= */}
			{(activeTab === 'dashboard-users' || activeTab === 'all') && (
				<section className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm space-y-5">
					<div className="flex items-center justify-between gap-4 border-b border-border/60 pb-5 flex-wrap">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
								<Users size={20} />
							</div>
							<div>
								<div className="flex items-center gap-2">
									<h2 className="text-lg font-extrabold text-primary tracking-tight">
										Dashboard Users
									</h2>
									{userLimit != null && (
										<span
											className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
												dashboardUsers.length >= userLimit
													? 'bg-rose-500/10 text-rose-600 border-rose-500/20'
													: 'bg-primary/10 text-primary border-primary/20'
											}`}
										>
											{dashboardUsers.length} / {userLimit} users
										</span>
									)}
								</div>
								<p className="text-xs text-muted-foreground mt-0.5">
									Administrators and operators with dashboard console management privileges
								</p>
							</div>
						</div>

						<button
							type="button"
							onClick={handleOpenAddUser}
							disabled={userLimit != null && dashboardUsers.length >= userLimit}
							className="px-4 py-2.5 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
							title={
								userLimit != null && dashboardUsers.length >= userLimit
									? `User limit reached (${userLimit}). Contact owner to increase.`
									: 'Add a new dashboard console user'
							}
						>
							<UserPlus size={16} />
							<span>Add Dashboard User</span>
						</button>
					</div>

					{/* Search Bar */}
					<div className="flex items-center justify-between gap-3">
						<div className="relative flex-1 max-w-md">
							<Search
								className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
								size={15}
							/>
							<input
								type="text"
								placeholder="Search dashboard user name, email, or role..."
								value={searchUser}
								onChange={(e) => setSearchUser(e.target.value)}
								className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all h-[36px]"
							/>
						</div>
						<span className="text-xs text-muted-foreground font-semibold">
							Showing {filteredDashboardUsers.length} of {dashboardUsers.length} users
						</span>
					</div>

					{/* Users Table */}
					<div className="border border-border/70 rounded-2xl overflow-hidden bg-background shadow-2xs">
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse text-xs">
								<thead>
									<tr className="bg-slate-50/80 border-b border-border/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">
										<th className="px-5 py-3">Username</th>
										<th className="px-5 py-3">Email Address</th>
										<th className="px-5 py-3">Role</th>
										<th className="px-5 py-3">Registered on</th>
										<th className="px-5 py-3 text-right">Actions</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/40 font-medium text-slate-700">
									{filteredDashboardUsers.length === 0 ? (
										<tr>
											<td colSpan={5} className="py-12 text-center text-muted-foreground">
												<div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2 text-muted-foreground">
													<Users size={20} />
												</div>
												<p className="text-xs font-bold text-primary">No dashboard users found</p>
												<p className="text-[11px] text-muted-foreground mt-0.5">
													{searchUser ? 'Try adjusting your search term' : 'Click "Add Dashboard User" above to create one'}
												</p>
											</td>
										</tr>
									) : (
										filteredDashboardUsers.map((u, idx) => {
											const initials = (u.username || u.name || u.email || 'U').slice(0, 2).toUpperCase();
											const colorClass = AVATAR_BG[idx % AVATAR_BG.length];
											return (
												<tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
													<td className="px-5 py-3.5">
														<div className="flex items-center gap-3">
															<div
																className={`w-8 h-8 rounded-xl ${colorClass} text-white font-black text-xs flex items-center justify-center shadow-2xs shrink-0`}
															>
																{initials}
															</div>
															<div>
																<span className="font-bold text-primary block leading-tight">
																	{u.username || u.name || 'Dashboard Admin'}
																</span>
																<span className="text-[11px] text-muted-foreground block mt-0.5">
																	{u.employeeCode || u.empCode || '—'}
																</span>
															</div>
														</div>
													</td>
													<td className="px-5 py-3.5 text-muted-foreground font-mono text-[11px]">
														{u.email}
													</td>
													<td className="px-5 py-3.5">
														<span
															className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
																u.role === 'Super Admin'
																	? 'bg-primary/10 text-primary border-primary/20'
																	: u.role === 'Admin'
																	? 'bg-accent/15 text-accent font-bold border-accent/20'
																	: 'bg-slate-100 text-slate-700 border-slate-200'
															}`}
														>
															<BadgeCheck size={12} />
															<span>{u.role || 'Super Admin'}</span>
														</span>
													</td>
													<td className="px-5 py-3.5 text-muted-foreground text-[11px]">
														{formatDateOnly(u.createdDate || u.registered)}
													</td>
													<td className="px-5 py-3.5 text-right">
														<div className="flex items-center justify-end gap-1.5">
															<button
																type="button"
																onClick={() => handleOpenEditUser(u)}
																className="p-1.5 rounded-lg border border-border/80 hover:border-primary/40 hover:bg-slate-100 text-muted-foreground hover:text-primary transition-all cursor-pointer shadow-2xs"
																title="Edit user details and role"
															>
																<Pencil size={13} />
															</button>
															<button
																type="button"
																onClick={() => handleOpenDeleteUser(u)}
																className="p-1.5 rounded-lg border border-border/80 hover:border-rose-500/40 hover:bg-rose-50 text-muted-foreground hover:text-rose-600 transition-all cursor-pointer shadow-2xs"
																title="Delete user account"
															>
																<Trash2 size={13} />
															</button>
														</div>
													</td>
												</tr>
											);
										})
									)}
								</tbody>
							</table>
						</div>
					</div>
				</section>
			)}

			{/* ========================================================= */}
			{/* SECTION 2: ROLES & ACCESS RULES                           */}
			{/* ========================================================= */}
			{(activeTab === 'roles-rules' || activeTab === 'all') && (
				<section className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm space-y-5">
					<div className="flex items-start justify-between gap-4 border-b border-border/60 pb-5 flex-wrap">
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
								<ShieldCheck size={20} />
							</div>
							<div>
								<h2 className="text-lg font-extrabold text-primary tracking-tight">Roles & Access Rules</h2>
								<p className="text-xs text-muted-foreground mt-0.5">
									Configure tenant user roles and customize granular permissions across device telemetry, security, software, and logs.
								</p>
							</div>
						</div>

						<button
							type="button"
							onClick={handleResetRoles}
							className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1.5 cursor-pointer"
						>
							<RotateCcw size={13} />
							<span>Reset to Factory Defaults</span>
						</button>
					</div>

					{/* Role Tabs */}
					<div className="flex items-center gap-2 overflow-x-auto pb-1">
						{tenantRoles.map((role) => {
							const isSelected = role.id === activeRoleId;
							const assignedCount = ALL_SUBRULE_IDS.filter((id) => role.rules?.includes(id)).length;
							return (
								<button
									key={role.id}
									type="button"
									onClick={() => setActiveRoleId(role.id)}
									className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
										isSelected
											? 'bg-primary text-primary-foreground shadow-xs'
											: 'bg-background border border-border/80 text-muted-foreground hover:text-primary hover:bg-slate-100'
									}`}
								>
									<span>{role.name}</span>
									<span
										className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
											isSelected
												? 'bg-primary-foreground/20 text-white'
												: 'bg-primary/10 text-primary'
										}`}
									>
										{assignedCount} rules
									</span>
								</button>
							);
						})}
					</div>

					{/* Active Role Card & Permissions Editor */}
					{activeRole && (
						<div className="p-4 rounded-xl border border-border/80 bg-background space-y-4 shadow-2xs">
							<div className="flex items-center justify-between gap-3 border-b border-border/40 pb-3 flex-wrap">
								<div className="flex items-center gap-2">
									{editingRoleNameId === activeRole.id ? (
										<div className="flex items-center gap-2">
											<input
												type="text"
												value={tempRoleName}
												onChange={(e) => setTempRoleName(e.target.value)}
												onKeyDown={(e) => {
													if (e.key === 'Enter') handleRenameRole(activeRole.id, tempRoleName);
												}}
												autoFocus
												className="bg-background border border-primary rounded-lg px-2.5 py-1 text-xs font-bold text-primary focus:outline-none"
											/>
											<button
												type="button"
												onClick={() => handleRenameRole(activeRole.id, tempRoleName)}
												className="px-2.5 py-1 bg-primary text-primary-foreground font-bold text-xs rounded-lg cursor-pointer shadow-2xs"
											>
												Save
											</button>
											<button
												type="button"
												onClick={() => setEditingRoleNameId(null)}
												className="px-2.5 py-1 bg-slate-200 text-primary font-bold text-xs rounded-lg cursor-pointer"
											>
												Cancel
											</button>
										</div>
									) : (
										<div className="flex items-center gap-2">
											<span className="text-base font-extrabold text-primary flex items-center gap-2">
												{activeRole.name}
												{!activeRole.isEditableName ? (
													<span className="text-[10px] bg-slate-100 text-muted-foreground border border-border/60 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
														<Lock size={10} /> System Locked
													</span>
												) : (
													<button
														type="button"
														onClick={() => {
															setEditingRoleNameId(activeRole.id);
															setTempRoleName(activeRole.name);
														}}
														className="p-1 text-muted-foreground hover:text-primary hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
														title="Edit role name"
													>
														<Pencil size={13} />
													</button>
												)}
											</span>
										</div>
									)}
								</div>

								<span className="text-xs text-muted-foreground font-medium">
									<strong className="text-primary font-bold">
										{ALL_SUBRULE_IDS.filter((id) => activeRole.rules?.includes(id)).length}
									</strong>{' '}
									of {ALL_SUBRULE_IDS.length} permissions enabled
								</span>
							</div>

							<p className="text-xs text-muted-foreground">{activeRole.desc}</p>

							{/* Continuous Permissions Tree View */}
							<PermissionsCategoryList
								currentRules={activeRole.rules}
								onChangeRules={(nextRules) => handleSaveRoleDefaultRules(activeRole.id, nextRules)}
							/>
						</div>
					)}
				</section>
			)}

			{/* ========================================================= */}
			{/* SECTION 3: INACTIVITY AUTO-LOCK                           */}
			{/* ========================================================= */}
			{(activeTab === 'auto-lock' || activeTab === 'all') && (
				<section className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm">
					<div className="flex items-start gap-3 mb-5">
						<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
							<Clock size={20} />
						</div>
						<div>
							<h2 className="text-lg font-extrabold text-primary tracking-tight">Inactivity Auto-Lock</h2>
							<p className="text-xs text-muted-foreground mt-0.5">
								Lock idle devices automatically and email the assigned manager if the user does not return. Applies to every device in your tenant.
							</p>
						</div>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5">
								<Lock size={13} /> Lock screen after (minutes)
							</label>
							<input
								type="number"
								min={1}
								max={240}
								value={lockMinutes}
								onChange={(e) => setLockMinutes(e.target.value)}
								className={inputCls}
							/>
						</div>
						<div>
							<label className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5">
								<Bell size={13} /> Alert manager after locked (minutes)
							</label>
							<input
								type="number"
								min={1}
								max={1440}
								value={alertMinutes}
								onChange={(e) => setAlertMinutes(e.target.value)}
								className={inputCls}
							/>
						</div>
					</div>
					<div className="flex items-center justify-between pt-5 border-t border-border/60 mt-5 flex-wrap gap-3">
						<p className="text-[11px] text-muted-foreground">
							Alert emails are sent through the mail server configured by the software provider.
						</p>
						<button
							type="button"
							onClick={handleSaveSettings}
							disabled={saving}
							className="px-6 py-2.5 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60"
						>
							<Save size={16} /> {saving ? 'Saving…' : 'Save Auto-Lock Settings'}
						</button>
					</div>
				</section>
			)}

			{/* ========================================================= */}
			{/* MODAL 1: ADD DASHBOARD USER                               */}
			{/* ========================================================= */}
			{isAddUserModalOpen &&
				ReactDOM.createPortal(
					<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
						<div className="bg-background border border-border/80 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
							<div className="flex justify-between items-center border-b border-border/60 pb-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
										<UserPlus size={20} />
									</div>
									<div>
										<h3 className="text-base font-bold text-primary">Add Dashboard User</h3>
										<p className="text-xs text-muted-foreground">Create an administrator account with console access</p>
									</div>
								</div>
								<button
									onClick={() => setIsAddUserModalOpen(false)}
									className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 cursor-pointer flex items-center justify-center"
								>
									<X size={18} />
								</button>
							</div>

							{addError && (
								<div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
									<AlertCircle size={15} />
									<span>{addError}</span>
								</div>
							)}

							<form onSubmit={handleCreateDashboardUser} className="space-y-4 text-xs">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<label className="block font-bold text-primary mb-1">
											Full Name / Username <span className="text-rose-500">*</span>
										</label>
										<input
											type="text"
											required
											placeholder="e.g. John Admin"
											value={addUsername}
											onChange={(e) => setAddUsername(e.target.value)}
											className={inputCls}
										/>
									</div>

									<div>
										<label className="block font-bold text-primary mb-1">Employee Code</label>
										<input
											type="text"
											placeholder="e.g. EMP-001 (optional)"
											value={addEmpCode}
											onChange={(e) => setAddEmpCode(e.target.value)}
											className={inputCls}
										/>
									</div>
								</div>

								<div>
									<label className="block font-bold text-primary mb-1">
										Email Address <span className="text-rose-500">*</span>
									</label>
									<input
										type="email"
										required
										placeholder="e.g. admin@company.com"
										value={addEmail}
										onChange={(e) => setAddEmail(e.target.value)}
										className={inputCls}
									/>
								</div>

								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<label className="block font-bold text-primary mb-1">
											Password <span className="text-rose-500">*</span>
										</label>
										<div className="relative">
											<input
												type={showAddPassword ? 'text' : 'password'}
												required
												minLength={8}
												placeholder="Min 8 characters"
												value={addPassword}
												onChange={(e) => setAddPassword(e.target.value)}
												className={`${inputCls} pr-9`}
											/>
											<button
												type="button"
												onClick={() => setShowAddPassword(!showAddPassword)}
												className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer"
											>
												{showAddPassword ? <EyeOff size={14} /> : <Eye size={14} />}
											</button>
										</div>
									</div>

									<div>
										<label className="block font-bold text-primary mb-1">
											Confirm Password <span className="text-rose-500">*</span>
										</label>
										<input
											type={showAddPassword ? 'text' : 'password'}
											required
											minLength={8}
											placeholder="Re-enter password"
											value={addConfirmPassword}
											onChange={(e) => setAddConfirmPassword(e.target.value)}
											className={inputCls}
										/>
									</div>
								</div>

								{/* Role Selector */}
								<div className="space-y-1.5 pt-1">
									<label className="block font-bold text-primary">
										Assign Administrative Role <span className="text-rose-500">*</span>
									</label>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
										{tenantRoles.map((role) => {
											const isSelected = addRole === role.name || addRole === role.id;
											return (
												<div
													key={role.id}
													onClick={() => setAddRole(role.name)}
													className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
														isSelected
															? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
															: 'bg-background border-border/80 text-muted-foreground hover:border-primary/40'
													}`}
												>
													<div className="flex items-center justify-between mb-0.5">
														<span className="font-bold text-xs truncate">{role.name}</span>
														{isSelected && <CheckCircle2 size={13} className="text-primary shrink-0" />}
													</div>
													<span className="text-[10px] text-muted-foreground block truncate">
														{role.desc}
													</span>
												</div>
											);
										})}
									</div>
								</div>

								<div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
									<button
										type="button"
										onClick={() => setIsAddUserModalOpen(false)}
										className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-muted-foreground font-bold rounded-xl cursor-pointer"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={addSubmitting}
										className="px-5 py-2 bg-primary text-primary-foreground hover:bg-accent font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
									>
										{addSubmitting && (
											<div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
										)}
										<span>Create Dashboard User</span>
									</button>
								</div>
							</form>
						</div>
					</div>,
					document.body
				)}

			{/* ========================================================= */}
			{/* MODAL 2: EDIT DASHBOARD USER                              */}
			{/* ========================================================= */}
			{isEditUserModalOpen &&
				ReactDOM.createPortal(
					<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
						<div className="bg-background border border-border/80 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
							<div className="flex justify-between items-center border-b border-border/60 pb-4">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
										<Pencil size={20} />
									</div>
									<div>
										<h3 className="text-base font-bold text-primary">Edit Dashboard User</h3>
										<p className="text-xs text-muted-foreground">Modify account credentials and administrative role</p>
									</div>
								</div>
								<button
									onClick={() => setIsEditUserModalOpen(false)}
									className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 cursor-pointer flex items-center justify-center"
								>
									<X size={18} />
								</button>
							</div>

							{editError && (
								<div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 text-xs font-semibold flex items-center gap-2">
									<AlertCircle size={15} />
									<span>{editError}</span>
								</div>
							)}

							<form onSubmit={handleUpdateDashboardUser} className="space-y-4 text-xs">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<div>
										<label className="block font-bold text-primary mb-1">
											Full Name / Username <span className="text-rose-500">*</span>
										</label>
										<input
											type="text"
											required
											value={editUsername}
											onChange={(e) => setEditUsername(e.target.value)}
											className={inputCls}
										/>
									</div>

									<div>
										<label className="block font-bold text-primary mb-1">Employee Code</label>
										<input
											type="text"
											placeholder="optional"
											value={editEmpCode}
											onChange={(e) => setEditEmpCode(e.target.value)}
											className={inputCls}
										/>
									</div>
								</div>

								<div>
									<label className="block font-bold text-primary mb-1">
										Email Address <span className="text-rose-500">*</span>
									</label>
									<input
										type="email"
										required
										value={editEmail}
										onChange={(e) => setEditEmail(e.target.value)}
										className={inputCls}
									/>
								</div>

								<div>
									<label className="block font-bold text-primary mb-1">
										Reset Password (optional)
									</label>
									<div className="relative">
										<input
											type={showEditPassword ? 'text' : 'password'}
											minLength={8}
											placeholder="Leave blank to keep current password"
											value={editPassword}
											onChange={(e) => setEditPassword(e.target.value)}
											className={`${inputCls} pr-9`}
										/>
										<button
											type="button"
											onClick={() => setShowEditPassword(!showEditPassword)}
											className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer"
										>
											{showEditPassword ? <EyeOff size={14} /> : <Eye size={14} />}
										</button>
									</div>
								</div>

								{/* Role Selector */}
								<div className="space-y-1.5 pt-1">
									<label className="block font-bold text-primary">
										Administrative Role <span className="text-rose-500">*</span>
									</label>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
										{tenantRoles.map((role) => {
											const isSelected = editRole === role.name || editRole === role.id;
											return (
												<div
													key={role.id}
													onClick={() => setEditRole(role.name)}
													className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
														isSelected
															? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
															: 'bg-background border-border/80 text-muted-foreground hover:border-primary/40'
													}`}
												>
													<div className="flex items-center justify-between mb-0.5">
														<span className="font-bold text-xs truncate">{role.name}</span>
														{isSelected && <CheckCircle2 size={13} className="text-primary shrink-0" />}
													</div>
													<span className="text-[10px] text-muted-foreground block truncate">
														{role.desc}
													</span>
												</div>
											);
										})}
									</div>
								</div>

								<div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
									<button
										type="button"
										onClick={() => setIsEditUserModalOpen(false)}
										className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-muted-foreground font-bold rounded-xl cursor-pointer"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={editSubmitting}
										className="px-5 py-2 bg-primary text-primary-foreground hover:bg-accent font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2"
									>
										{editSubmitting && (
											<div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
										)}
										<span>Save Changes</span>
									</button>
								</div>
							</form>
						</div>
					</div>,
					document.body
				)}

			{/* ========================================================= */}
			{/* MODAL 3: DELETE CONFIRMATION CARD                         */}
			{/* ========================================================= */}
			{isDeleteUserModalOpen &&
				deleteTargetUser &&
				ReactDOM.createPortal(
					<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
						<div className="bg-background border border-border/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
							<div className="flex items-center gap-3">
								<div className="w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-600 flex items-center justify-center shrink-0">
									<Trash2 size={22} />
								</div>
								<div>
									<h3 className="text-base font-bold text-primary">Delete Dashboard User</h3>
									<p className="text-xs text-muted-foreground">Permanent credential revocation</p>
								</div>
							</div>

							<div className="p-3.5 bg-slate-100/70 rounded-xl border border-border/60 text-xs text-slate-700 leading-relaxed">
								Are you sure you want to permanently delete{' '}
								<strong className="text-primary font-bold">
									{deleteTargetUser.username || deleteTargetUser.name}
								</strong>{' '}
								(<span className="font-mono text-[11px]">{deleteTargetUser.email}</span>)?
								<p className="text-rose-600 font-semibold text-[11px] mt-1.5">
									This action cannot be undone and will immediately revoke their access to the EMS dashboard console.
								</p>
							</div>

							<div className="flex items-center justify-end gap-2.5 pt-2">
								<button
									type="button"
									onClick={() => {
										setIsDeleteUserModalOpen(false);
										setDeleteTargetUser(null);
									}}
									className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-muted-foreground font-bold rounded-xl cursor-pointer text-xs"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={handleConfirmDeleteUser}
									disabled={deleteSubmitting}
									className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs cursor-pointer disabled:opacity-60 flex items-center gap-2 text-xs"
								>
									{deleteSubmitting && (
										<div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
									)}
									<span>Delete User</span>
								</button>
							</div>
						</div>
					</div>,
					document.body
				)}
		</div>
	);
}

const inputCls =
	'w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all';

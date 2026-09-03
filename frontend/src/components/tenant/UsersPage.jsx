import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import {
	Users, UserPlus, TrendingUp, BadgeCheck, Search, X, Mail, Lock, ShieldCheck, User,
	Pencil, Trash2, CheckCircle2, AlertTriangle, Eye, EyeOff, Calendar, Clock, Activity,
	LogIn, Unlock, Power, ChevronDown, Check, FileText, Bell, Laptop, ArrowRight
} from 'lucide-react';
import { fetchUsers, createUser, updateUser, deleteUser, fetchUserLimit, relativeTime, fetchUserLogs } from '../../api/ems';

const AVATAR_BG = ['bg-primary', 'bg-accent', 'bg-emerald-600', 'bg-amber-600'];

function mapUser(u) {
	const initials = (u.username || u.name || u.email || '?').slice(0, 2);
	const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % AVATAR_BG.length;
	return {
		id: u.id,
		empCode: u.employeeCode || u.empCode || '—',
		name: u.username || u.name || 'App User',
		email: u.email,
		type: u.type || u.userType || 'Device User',
		role: u.role || 'Device User',
		rules: u.rules || [],
		registered: u.createdDate || u.registered,
		deviceId: u.deviceId,
		deviceName: u.deviceName,
		managerUserId: u.managerUserId ?? null,
		managerName: u.managerName || null,
		avatarBg: AVATAR_BG[idx],
	};
}

function getDateKey(dateInput) {
	if (!dateInput) return '';
	try {
		const d = new Date(dateInput);
		if (isNaN(d.getTime())) return '';
		const y = d.getFullYear();
		const m = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		return `${y}-${m}-${day}`;
	} catch {
		return '';
	}
}

function formatLogTime(iso) {
	if (!iso) return '—';
	try {
		const d = new Date(iso);
		if (isNaN(d.getTime())) return String(iso);
		return d.toLocaleTimeString(undefined, {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: true,
		});
	} catch {
		return String(iso);
	}
}

function formatDateHeader(dateInput) {
	if (!dateInput) return '';
	const d = new Date(dateInput);
	if (isNaN(d.getTime())) return String(dateInput);

	const today = new Date();
	const isToday = d.toDateString() === today.toDateString();

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const isYesterday = d.toDateString() === yesterday.toDateString();

	const dayNum = String(d.getDate()).padStart(2, '0');
	const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
	const year = d.getFullYear();
	const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });

	if (isToday) {
		return `Today - ${dayNum} ${monthStr} ${year} (${weekday})`;
	}
	if (isYesterday) {
		return `Yesterday - ${dayNum} ${monthStr} ${year} (${weekday})`;
	}
	return `${dayNum} ${monthStr} ${year} (${weekday})`;
}

function getLogActionMeta(type, detail) {
	const t = (type || '').toLowerCase();
	switch (t) {
		case 'login':
			return {
				action: 'User Login',
				icon: LogIn,
				color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
				dot: 'bg-emerald-500',
				desc: detail ? `User signed in: ${detail}` : 'Employee signed in to endpoint session',
			};
		case 'lock':
			return {
				action: 'Screen Locked',
				icon: Lock,
				color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
				dot: 'bg-amber-500',
				desc: detail ? `Screen locked: ${detail}` : 'Inactivity timeout auto-lock / user screen locked',
			};
		case 'unlock':
		case 'wake':
			return {
				action: 'Screen Unlocked',
				icon: Unlock,
				color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
				dot: 'bg-blue-500',
				desc: detail || 'Endpoint screen unlocked / session resumed',
			};
		case 'shutdown':
			return {
				action: 'Device Shutdown',
				icon: Power,
				color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
				dot: 'bg-rose-500',
				desc: detail ? `Session ended (gap: ${detail})` : 'Endpoint powered off / session terminated',
			};
		case 'alert':
			return {
				action: 'Manager Inactivity Alert',
				icon: Bell,
				color: 'text-rose-600 bg-rose-500/10 border-rose-500/20',
				dot: 'bg-rose-500',
				desc: detail ? `Manager notified: ${detail}` : 'Prolonged inactivity alert triggered to manager',
			};
		case 'account_created':
			return {
				action: 'Account Enrolled',
				icon: UserPlus,
				color: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
				dot: 'bg-purple-500',
				desc: detail || 'EMS account created and enrolled into workspace',
			};
		default:
			return {
				action: (type || 'Activity').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
				icon: Activity,
				color: 'text-primary bg-primary/10 border-primary/20',
				dot: 'bg-primary',
				desc: detail || 'Activity recorded on endpoint',
			};
	}
}

export default function UsersPage({ onNavigateToDevice, activeSubTab = 'users-logs' }) {
	const [users, setUsers] = useState([]);
	const [userLimit, setUserLimit] = useState(null);
	const [newManagerId, setNewManagerId] = useState('');
	const [editManagerId, setEditManagerId] = useState('');
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

	// User Details & Logs modal state
	const [inspectUser, setInspectUser] = useState(null);
	const [userLogs, setUserLogs] = useState([]);
	const [logsLoading, setLogsLoading] = useState(false);
	const [openDateKeys, setOpenDateKeys] = useState(() => new Set([getDateKey(new Date())]));

	// Group logs by YYYY-MM-DD
	const logsByDate = useMemo(() => {
		const map = {};
		(userLogs || []).forEach((log) => {
			const key = getDateKey(log.at);
			if (!key) return;
			if (!map[key]) map[key] = [];
			map[key].push(log);
		});
		return map;
	}, [userLogs]);

	// Build past dates list: dates with logs only, sorted descending (newest date first)
	const dateGroupsList = useMemo(() => {
		const todayKey = getDateKey(new Date());
		const dateKeysSet = new Set(Object.keys(logsByDate));

		// If no logs exist yet, add todayKey as fallback
		if (dateKeysSet.size === 0) {
			dateKeysSet.add(todayKey);
		}

		// Sort descending (newest date first)
		const sortedKeys = Array.from(dateKeysSet).sort((a, b) => b.localeCompare(a));

		return sortedKeys.map((key) => {
			const [y, m, d] = key.split('-').map(Number);
			const dateObj = new Date(y, m - 1, d);
			const logs = logsByDate[key] || [];
			const isToday = key === todayKey;

			return {
				key,
				dateObj,
				label: formatDateHeader(dateObj),
				logs,
				count: logs.length,
				isToday,
			};
		});
	}, [logsByDate]);

	// Fetch logs when inspectUser changes
	useEffect(() => {
		if (!inspectUser) {
			setUserLogs([]);
			setOpenDateKeys(new Set());
			return;
		}
		let mounted = true;
		setLogsLoading(true);
		fetchUserLogs(inspectUser.id, inspectUser.deviceId)
			.then((logs) => {
				if (!mounted) return;
				const fetchedLogs = logs || [];
				setUserLogs(fetchedLogs);

				const todayKey = getDateKey(new Date());
				const hasToday = fetchedLogs.some((l) => getDateKey(l.at) === todayKey);
				if (hasToday) {
					setOpenDateKeys(new Set([todayKey]));
				} else if (fetchedLogs.length > 0) {
					// Default to newest date that has logs
					const datesWithLogs = Array.from(
						new Set(fetchedLogs.map((l) => getDateKey(l.at)).filter(Boolean))
					).sort((a, b) => b.localeCompare(a));
					setOpenDateKeys(new Set([datesWithLogs[0] || todayKey]));
				} else {
					setOpenDateKeys(new Set([todayKey]));
				}
			})
			.catch(() => {
				if (!mounted) return;
				setUserLogs([]);
			})
			.finally(() => {
				if (mounted) setLogsLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, [inspectUser]);

	const handleOpenUserDetails = (u) => {
		setInspectUser(u);
		setOpenDateKeys(new Set([getDateKey(new Date())])); // today date defaultly opened
	};

	const toggleDate = (key) => {
		setOpenDateKeys((prev) => {
			// If clicking the only open date, toggle it closed
			if (prev.has(key) && prev.size === 1) {
				return new Set();
			}
			// Hold this date open until another date expands
			return new Set([key]);
		});
	};

	// Registration state
	const [newEmpCode, setNewEmpCode] = useState('');
	const [newUsername, setNewUsername] = useState('');
	const [newEmail, setNewEmail] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [newConfirmPassword, setNewConfirmPassword] = useState('');
	const [formError, setFormError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	// Edit User state
	const [editingUser, setEditingUser] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editEmpCode, setEditEmpCode] = useState('');
	const [editUsername, setEditUsername] = useState('');
	const [editEmail, setEditEmail] = useState('');
	const [editPassword, setEditPassword] = useState('');
	const [editError, setEditError] = useState('');
	const [editSubmitting, setEditSubmitting] = useState(false);

	// Delete Confirmation state
	const [deletingUser, setDeletingUser] = useState(null);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [deleteSubmitting, setDeleteSubmitting] = useState(false);

	// Success message toast state
	const [successMsg, setSuccessMsg] = useState(null);

	const loadUsers = async () => {
		try {
			const data = await fetchUsers();
			setUsers(data.map(mapUser));
			setLoadError(null);
		} catch (err) {
			setLoadError(err instanceof Error ? err.message : 'Failed to load users.');
		} finally {
			setLoading(false);
		}
		try {
			const q = await fetchUserLimit();
			setUserLimit(typeof q?.limit === 'number' ? q.limit : null);
		} catch { /* quota is best-effort */ }
	};

	useEffect(() => {
		loadUsers();
	}, []);

	useEffect(() => {
		document.body.style.overflow = isRegisterModalOpen || isEditModalOpen || isDeleteModalOpen || inspectUser ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isRegisterModalOpen, isEditModalOpen, isDeleteModalOpen, inspectUser]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 4000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	const resetForm = () => {
		setNewEmpCode('');
		setNewUsername('');
		setNewEmail('');
		setNewPassword('');
		setNewConfirmPassword('');
		setNewManagerId('');
		setFormError('');
	};

	const handleRegisterUser = async (e) => {
		if (e) e.preventDefault();
		if (!newEmpCode.trim() || !newUsername.trim() || !newEmail.trim() || !newPassword) {
			setFormError('Please fill in all required fields.');
			return;
		}
		if (newPassword.length < 8) {
			setFormError('Password must be at least 8 characters long.');
			return;
		}
		if (newPassword !== newConfirmPassword) {
			setFormError('Passwords do not match.');
			return;
		}

		setSubmitting(true);
		setFormError('');
		try {
			const created = await createUser({
				email: newEmail.trim(),
				employeeCode: newEmpCode.trim(),
				username: newUsername.trim(),
				password: newPassword,
				confirmPassword: newConfirmPassword,
				type: 'Device User',
				role: 'Device User',
				managerUserId: newManagerId ? Number(newManagerId) : null,
				rules: [],
			});
			setUsers((us) => [mapUser(created), ...us]);
			resetForm();
			setIsRegisterModalOpen(false);
			setSuccessMsg(`Registered user "${newUsername.trim()}" successfully!`);
		} catch (err) {
			setFormError(err instanceof Error ? err.message : 'Failed to register user.');
		} finally {
			setSubmitting(false);
		}
	};

	const handleOpenEditModal = (user) => {
		setEditingUser(user);
		setEditEmpCode(user.empCode === '—' ? '' : user.empCode);
		setEditUsername(user.name);
		setEditEmail(user.email);
		setEditManagerId(user.managerUserId ? String(user.managerUserId) : '');
		setEditPassword('');
		setEditError('');
		setIsEditModalOpen(true);
	};

	const handleUpdateUser = async (e) => {
		e.preventDefault();
		if (!editingUser) return;
		if (editPassword && editPassword.length < 8) {
			setEditError('Password must be at least 8 characters long.');
			return;
		}
		setEditSubmitting(true);
		setEditError('');
		try {
			const updated = await updateUser(editingUser.id, {
				email: editEmail.trim(),
				employeeCode: editEmpCode.trim(),
				username: editUsername.trim(),
				name: editUsername.trim(),
				type: 'Device User',
				role: 'Device User',
				managerUserId: editManagerId ? Number(editManagerId) : null,
				rules: [],
				...(editPassword ? { password: editPassword } : {}),
			});
			setUsers((us) =>
				us.map((u) => (u.id === editingUser.id ? mapUser({ ...u, ...updated }) : u))
			);
			setIsEditModalOpen(false);
			setEditingUser(null);
			setSuccessMsg('User account updated successfully.');
		} catch (err) {
			setEditError(err instanceof Error ? err.message : 'Update failed.');
		} finally {
			setEditSubmitting(false);
		}
	};

	const handleOpenDeleteModal = (user) => {
		setDeletingUser(user);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!deletingUser) return;
		setDeleteSubmitting(true);
		try {
			await deleteUser(deletingUser.id);
			setUsers((us) => us.filter((u) => u.id !== deletingUser.id));
			setIsDeleteModalOpen(false);
			setDeletingUser(null);
			setSuccessMsg('User account deleted successfully!');
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to delete user.');
		} finally {
			setDeleteSubmitting(false);
		}
	};

	const managerOptions = [{ value: '', label: 'Unassigned' }].concat(
		users.filter((u) => u.type === 'Dashboard User').map((u) => ({ value: String(u.id), label: u.name }))
	);

	const filteredUsers = users.filter((u) => {
		const term = searchTerm.toLowerCase();
		return (
			!term ||
			[u.name, u.email, u.empCode, u.deviceId, u.deviceName]
				.filter(Boolean)
				.some((v) => v.toLowerCase().includes(term))
		);
	});

	const totalCount = users.length;
	const now = Date.now();
	const newToday = users.filter((u) => now - Date.parse(u.registered) < 86400000).length;
	const newWeek = users.filter((u) => now - Date.parse(u.registered) < 7 * 86400000).length;

	return (
		<div className="p-6 lg:p-10 space-y-6">
			{loadError && (
				<div className="bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl px-4 py-3 text-xs font-semibold">{loadError}</div>
			)}

			{/* Success Notification Message Card */}
			{successMsg && (
				<div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-2xl p-4 flex items-center justify-between shadow-sm transition-all animate-in fade-in slide-in-from-top-2">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold shrink-0">
							<CheckCircle2 size={18} />
						</div>
						<span className="text-xs font-bold">{successMsg}</span>
					</div>
					<button onClick={() => setSuccessMsg(null)} className="text-emerald-600/70 hover:text-emerald-600 p-1 rounded-lg hover:bg-emerald-500/10 cursor-pointer">
						<X size={16} />
					</button>
				</div>
			)}

			{/* Top User Summary Cards */}
			<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
				<UserSummary
					title="Total Users"
					value={totalCount}
					icon={Users}
					tone="primary"
					badge={`${users.filter((u) => u.deviceId).length} connected`}
					sub="Fleet wide"
				/>
				<UserSummary
					title="Connected"
					value={users.filter((u) => u.deviceId).length}
					icon={Laptop}
					tone="secondary"
					badge={totalCount ? `${Math.round((users.filter((u) => u.deviceId).length / (totalCount || 1)) * 100)}% active` : '0%'}
					sub="Paired devices"
				/>
				<UserSummary
					title="New Today"
					value={newToday}
					icon={UserPlus}
					tone="tertiary"
					badge={newToday > 0 ? `+${newToday} joined` : 'No new'}
					sub="Last 24 hours"
				/>
				<UserSummary
					title="New This Week"
					value={newWeek}
					icon={TrendingUp}
					tone="primary"
					badge={newWeek > 0 ? `+${newWeek} enrolled` : '0 enrolled'}
					sub="Last 7 days"
				/>
			</section>

			{/* Table Card */}
			<div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl overflow-hidden shadow-sm">
				<div className="p-6 border-b border-border/60 space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h2 className="text-xl font-extrabold text-primary tracking-tight inline-flex items-center gap-2.5">
								{activeSubTab === 'users-logs' || activeSubTab === 'logs' ? 'User Activity & Audit Logs' : 'User Management'}
								{userLimit != null && (
									<span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${users.length >= userLimit ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{users.length} / {userLimit} users</span>
								)}
							</h2>
							<p className="text-xs text-muted-foreground mt-0.5">
								{activeSubTab === 'users-logs' || activeSubTab === 'logs'
									? 'Click any user row to view their daily session & activity logs'
									: 'Manage EMS accounts that activate and manage the fleet'}
							</p>
						</div>
						<div className="flex items-center gap-2.5">
							<button
								onClick={() => setIsRegisterModalOpen(true)}
								disabled={userLimit != null && users.length >= userLimit}
								title={userLimit != null && users.length >= userLimit ? `User limit reached (${userLimit}). Contact the software owner to increase it.` : 'Register a new dashboard user'}
								className="px-4 py-2.5 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary disabled:hover:text-primary-foreground"
							>
								<UserPlus size={16} /> Register User
							</button>
						</div>
					</div>

					<div className="flex items-center justify-between gap-3 w-full">
						<div className="relative flex-1 w-full">
							<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
							<input type="text" placeholder="Search name, email, employee code, device..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all h-[38px]" />
						</div>
					</div>
				</div>

				<div className="overflow-x-auto min-h-[450px]">
					<table className="w-full min-w-full text-left border-collapse">
						<thead className="border-b border-border/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground bg-slate-100/80">
							<tr>
								<th className="px-6 py-3.5 w-12 text-center">#</th>
								<th className="px-6 py-3.5 w-[18%]">User</th>
								<th className="px-6 py-3.5 w-[22%]">Email</th>
								<th className="px-6 py-3.5 w-[13%]">Device Name</th>
								<th className="px-6 py-3.5 w-[11%] text-center">Status</th>
								<th className="px-6 py-3.5 w-[10%]">Registered</th>
								<th className="px-6 py-3.5 text-right w-24">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40 text-xs">
							{loading ? (
								<tr><td colSpan={9} className="py-12 text-center text-muted-foreground">Loading users…</td></tr>
							) : filteredUsers.length > 0 ? (
								filteredUsers.map((u, index) => (
									<tr
										key={u.id}
										onClick={() => handleOpenUserDetails(u)}
										className="hover:bg-slate-100/80 transition-colors cursor-pointer group select-none"
										title="Click to view user details and activity logs"
									>
										<td className="px-6 py-4 text-center font-bold text-muted-foreground/80 font-mono text-[11px]">
											{index + 1}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div>
													<span className="font-bold text-primary block group-hover:text-accent transition-colors">{u.name}</span>
													<span className="text-muted-foreground text-[11px] block">{u.empCode}</span>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 text-muted-foreground font-medium">{u.email}</td>
										<td className="px-6 py-4">
											{u.deviceId ? (
												<div>
													{u.deviceName && <span className="text-[11px] text-muted-foreground font-medium">{u.deviceName}</span>}
												</div>
											) : (
												<span className="text-muted-foreground text-xs font-mono">—</span>
											)}
										</td>
										<td className="px-6 py-4 text-center">
											{u.deviceId ? (
												<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
													<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Connected
												</span>
											) : (
												<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-300">
													<span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>No
												</span>
											)}
										</td>
										<td className="px-6 py-4 text-muted-foreground font-semibold">{relativeTime(u.registered)}</td>
										<td className="px-6 py-4 text-right">
											<div className="flex items-center justify-end gap-1.5">
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														handleOpenEditModal(u);
													}}
													title="Edit user"
													className="p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
												>
													<Pencil size={15} />
												</button>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														handleOpenDeleteModal(u);
													}}
													title="Delete user"
													className="p-1.5 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
												>
													<Trash2 size={15} />
												</button>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr><td colSpan={9} className="py-12 text-center text-muted-foreground">No users found.</td></tr>
							)}
						</tbody>
					</table>
				</div>

				<div className="p-4 border-t border-border/60 text-xs text-muted-foreground">
					Showing <span className="font-bold text-primary">{filteredUsers.length}</span> of{' '}
					<span className="font-bold text-primary">{totalCount}</span> registered users
				</div>
			</div>

			{/* User Details & Date-Wise Activity Logs Modal */}
			{inspectUser && ReactDOM.createPortal(
				<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
					<div className="w-full max-w-[80%] h-[calc(100vh-60px)] max-h-[880px] bg-background border border-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
						
						{/* Top Header: User Identity */}
						<div className="px-6 py-5 border-b border-border/60 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-md">
							<div className="flex items-center gap-4">
								<div className={`w-12 h-12 rounded-2xl ${inspectUser.avatarBg} text-white font-extrabold text-lg flex items-center justify-center shadow-md shrink-0`}>
									{(inspectUser.name || inspectUser.username || '?').slice(0, 2).toUpperCase()}
								</div>
								<div>
									<div className="flex items-center gap-2.5 flex-wrap">
										<h3 className="text-lg font-extrabold text-primary tracking-tight">{inspectUser.name}</h3>
										<span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 text-primary border border-border/60">
											{inspectUser.empCode}
										</span>
										{inspectUser.deviceId ? (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
												<span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Connected: {inspectUser.deviceName || 'Device'}
											</span>
										) : (
											<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-300">
												<span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>No Connected Device
											</span>
										)}
									</div>
									<p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
										<span>{inspectUser.email}</span>
										{inspectUser.registered && <span>• Enrolled {relativeTime(inspectUser.registered)}</span>}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-2">
								{inspectUser.deviceId && onNavigateToDevice && (
									<button
										type="button"
										onClick={() => {
											const dId = inspectUser.deviceId;
											setInspectUser(null);
											onNavigateToDevice(dId);
										}}
										className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent font-bold text-xs rounded-xl transition-all cursor-pointer mr-2"
										title="View assigned device details"
									>
										<Laptop size={14} />
										<span>Device</span>
									</button>
								)}
								<button
									type="button"
									onClick={() => setInspectUser(null)}
									className="w-9 h-9 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
								>
									<X size={20} />
								</button>
							</div>
						</div>

						{/* Sub-Header Toolbar: Summary & Expand/Collapse Controls */}
						<div className="px-6 py-3.5 bg-slate-50/90 border-b border-border/60 flex items-center justify-between gap-4 shrink-0">
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-border/60 rounded-xl text-xs shadow-2xs">
									<Activity size={14} className="text-primary" />
									<span className="text-muted-foreground font-medium">Total Activity:</span>
									<span className="font-extrabold text-primary font-mono">{userLogs.length} events</span>
								</div>
								<span className="text-xs text-muted-foreground hidden sm:inline">
									Click any date header to open that date's user logs
								</span>
							</div>

							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => setOpenDateKeys(new Set(dateGroupsList.map((g) => g.key)))}
									className="px-3 py-1.5 bg-background border border-border/80 hover:border-primary/40 text-primary font-bold text-xs rounded-xl hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
								>
									Expand All
								</button>
								<button
									type="button"
									onClick={() => setOpenDateKeys(new Set())}
									className="px-3 py-1.5 bg-background border border-border/80 hover:border-primary/40 text-muted-foreground hover:text-primary font-bold text-xs rounded-xl hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
								>
									Collapse All
								</button>
							</div>
						</div>

						{/* Main Content Body: Date Header Accordions (pt-0 so held date header sticks with 0 gap) */}
						<div className="flex-1 overflow-y-auto px-6 pb-6 pt-0 space-y-3">
							{logsLoading ? (
								<div className="py-20 text-center space-y-3">
									<div className="w-9 h-9 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
									<p className="text-xs font-semibold text-muted-foreground">Loading activity logs for {inspectUser.name}…</p>
								</div>
							) : userLogs.length === 0 ? (
								<div className="py-20 text-center space-y-3 max-w-md mx-auto">
									<div className="w-12 h-12 rounded-2xl bg-slate-100 text-muted-foreground flex items-center justify-center mx-auto">
										<Calendar size={24} />
									</div>
									<h4 className="text-sm font-bold text-primary">No activity logs recorded</h4>
									<p className="text-xs text-muted-foreground">
										There are no recorded endpoint sessions or activity logs for {inspectUser.name}.
									</p>
								</div>
							) : (
								<div className="space-y-3 pt-3">
									{dateGroupsList.map((group) => {
										const isOpen = openDateKeys.has(group.key);
										return (
											<div
												key={group.key}
												className={`rounded-2xl border transition-all ${
													isOpen
														? 'bg-background border-primary/40 shadow-xs'
														: 'bg-background/80 border-border/70 hover:border-primary/30 hover:bg-slate-50/60'
												}`}
											>
												{/* Date Header: Click to Open Logs for this Date (Sticky when scrolling logs) */}
												<button
													type="button"
													onClick={() => toggleDate(group.key)}
													className={`w-full px-5 py-2.5 flex items-center justify-between text-left transition-colors cursor-pointer select-none sticky top-0 z-20 ${
														isOpen
															? 'bg-slate-100/95 backdrop-blur-md border-b border-border/60 rounded-t-2xl shadow-xs'
															: 'bg-slate-50/70 hover:bg-slate-100/80 rounded-2xl'
													}`}
												>
													<div className="flex items-center gap-3">
														<div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
															group.isToday
																? 'bg-accent/15 text-accent font-bold'
																: group.count > 0
																? 'bg-primary/10 text-primary'
																: 'bg-slate-200/60 text-muted-foreground'
														}`}>
															<Calendar size={15} />
														</div>
														<div>
															<span className="font-semibold text-xs text-primary block leading-tight">
																{group.label}
															</span>
														</div>
													</div>

													<div className="flex items-center gap-3">
														{group.count > 0 ? (
															<span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
																{group.count} {group.count === 1 ? 'event' : 'events'}
															</span>
														) : (
															<span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-muted-foreground border border-border/60">
																No activity
															</span>
														)}
														<ChevronDown
															size={16}
															className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary' : ''}`}
														/>
													</div>
												</button>

												{/* When Date Header is Opened: Show time | action | detail | timestamp */}
												{isOpen && (
													<div className="p-0 animate-in fade-in slide-in-from-top-1 duration-150">
														{group.count === 0 ? (
															<div className="py-8 text-center text-xs text-muted-foreground">
																No user activity recorded on this date.
															</div>
														) : (
															<div className="overflow-x-auto rounded-b-2xl">
																<table className="w-full text-left border-collapse">
																	<thead className="border-b border-border/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground bg-slate-100/60">
																		<tr>
																			<th className="px-5 py-3 w-[18%] font-bold">Time</th>
																			<th className="px-5 py-3 w-[22%] font-bold">Action</th>
																			<th className="px-5 py-3 w-[42%] font-bold">Detail</th>
																			<th className="px-5 py-3 text-right w-[18%] font-bold">Timestamp</th>
																		</tr>
																	</thead>
																	<tbody className="divide-y divide-border/40 text-xs">
																		{group.logs.map((log, idx) => {
																			const meta = getLogActionMeta(log.type, log.detail);
																			const Icon = meta.icon;
																			return (
																				<tr key={idx} className="hover:bg-slate-100/50 transition-colors">
																					<td className="px-5 py-3">
																						<div className="flex items-center gap-2">
																							<Clock size={13} className="text-muted-foreground shrink-0" />
																							<span className="font-bold text-primary font-mono text-xs">
																								{formatLogTime(log.at)}
																							</span>
																						</div>
																					</td>
																					<td className="px-5 py-3">
																						<span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${meta.color}`}>
																							<Icon size={12} className="shrink-0" />
																							<span>{meta.action}</span>
																						</span>
																					</td>
																					<td className="px-5 py-3 text-muted-foreground font-medium text-xs">
																						{meta.desc}
																					</td>
																					<td className="px-5 py-3 text-right font-mono text-[11px] text-muted-foreground">
																						{relativeTime(log.at)}
																					</td>
																				</tr>
																			);
																		})}
																	</tbody>
																</table>
															</div>
														)}
													</div>
												)}
											</div>
										);
									})}
								</div>
							)}
						</div>

						{/* Modal Footer */}
						<div className="px-6 py-3.5 bg-slate-50/80 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground shrink-0">
							<div>
								Showing logs across <span className="font-bold text-primary">{dateGroupsList.length}</span> dates ({userLogs.length} total events)
							</div>
							<button
								type="button"
								onClick={() => setInspectUser(null)}
								className="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer shadow-xs"
							>
								Close
							</button>
						</div>
					</div>
				</div>,
				document.body
			)}

			{/* Register Modal */}
			{isRegisterModalOpen && ReactDOM.createPortal(
				<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
					<div className="bg-background border border-border/80 rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center border-b border-border/60 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
									<UserPlus size={20} />
								</div>
								<div>
									<h3 className="text-base font-bold text-primary">Register User</h3>
									<p className="text-xs text-muted-foreground">Add a new endpoint device user to your tenant</p>
								</div>
							</div>
							<button onClick={() => { setIsRegisterModalOpen(false); resetForm(); }} className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 cursor-pointer flex items-center justify-center">
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleRegisterUser} className="space-y-4 text-xs">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<FormField label="Employee Code" required mono value={newEmpCode} onChange={setNewEmpCode} placeholder="e.g. EMP1001" />
								<FormField label="Username" required value={newUsername} onChange={setNewUsername} placeholder="e.g. john.doe" />
							</div>
							<FormField label="Email Address" required type="email" value={newEmail} onChange={setNewEmail} placeholder="e.g. john.doe@enterprise.com" />
							<CustomSelect label="Assign Manager (optional)" value={newManagerId} onChange={setNewManagerId} options={managerOptions} description="The dashboard user emailed if this user's device stays idle." />
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<FormField label="Password" required type="password" minLength={8} value={newPassword} onChange={(v) => { setNewPassword(v); if (formError) setFormError(''); }} placeholder="At least 8 characters" />
								<FormField label="Confirm Password" required type="password" minLength={8} value={newConfirmPassword} onChange={(v) => { setNewConfirmPassword(v); if (formError) setFormError(''); }} placeholder="At least 8 characters" />
							</div>
							{formError && <p className="text-xs text-rose-500 font-semibold">{formError}</p>}

							<div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
								<button type="button" onClick={() => { setIsRegisterModalOpen(false); resetForm(); }} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
								<button type="submit" disabled={submitting} className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all disabled:opacity-60 flex items-center gap-2">
									{submitting && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>}
									<span>Register User</span>
								</button>
							</div>
						</form>
					</div>
				</div>,
				document.body
			)}

			{/* Edit Modal */}
			{isEditModalOpen && ReactDOM.createPortal(
				<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
					<div className="bg-background border border-border/80 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center border-b border-border/60 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
									<Pencil size={20} />
								</div>
								<div>
									<h3 className="text-base font-bold text-primary">Edit User Account</h3>
									<p className="text-xs text-muted-foreground">Update account credentials, roles, and access rules</p>
								</div>
							</div>
							<button onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }} className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 cursor-pointer flex items-center justify-center">
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								<FormField label="Employee Code" required mono value={editEmpCode} onChange={setEditEmpCode} placeholder="e.g. EMP1001" />
								<FormField label="Username" required value={editUsername} onChange={setEditUsername} placeholder="e.g. john.doe" />
							</div>
							<FormField label="Email Address" required type="email" value={editEmail} onChange={setEditEmail} placeholder="e.g. john.doe@enterprise.com" />
							<CustomSelect label="Assign Manager (optional)" value={editManagerId} onChange={setEditManagerId} options={managerOptions} description="The dashboard user emailed if this user's device stays idle." />
							<FormField label="New Password (optional)" type="password" minLength={8} value={editPassword} onChange={(v) => { setEditPassword(v); if (editError) setEditError(''); }} placeholder="Leave blank or enter at least 8 characters" />
							{editError && <p className="text-xs text-rose-500 font-semibold">{editError}</p>}

							<div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
								<button type="button" onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
								<button type="submit" disabled={editSubmitting} className="px-5 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all disabled:opacity-60 flex items-center gap-2">
									{editSubmitting && <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>}
									<span>Save Changes</span>
								</button>
							</div>
						</form>
					</div>
				</div>,
				document.body
			)}

			{/* Delete Confirmation Modal */}
			{isDeleteModalOpen && deletingUser && ReactDOM.createPortal(
				<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
					<div className="bg-background border border-border/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
						<div className="flex justify-between items-center border-b border-border/60 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
									<AlertTriangle size={20} />
								</div>
								<div>
									<h3 className="text-base font-bold text-primary">Delete User Account</h3>
									<p className="text-xs text-muted-foreground">Confirm permanent deletion</p>
								</div>
							</div>
							<button onClick={() => { setIsDeleteModalOpen(false); setDeletingUser(null); }} className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 cursor-pointer flex items-center justify-center">
								<X size={18} />
							</button>
						</div>

						<div className="space-y-3 text-xs">
							<p className="text-primary font-medium">
								Are you sure you want to delete user account <span className="font-bold text-rose-600">{deletingUser.name}</span> ({deletingUser.email})?
							</p>
							<p className="text-muted-foreground bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-[11px] font-semibold text-rose-600">
								This action cannot be undone and will permanently remove this account from Neon DB.
							</p>
						</div>

						<div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
							<button type="button" onClick={() => { setIsDeleteModalOpen(false); setDeletingUser(null); }} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-100 rounded-xl cursor-pointer">
								Cancel
							</button>
							<button type="button" onClick={handleConfirmDelete} disabled={deleteSubmitting} className="px-4 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-rose-700 cursor-pointer transition-all disabled:opacity-60 flex items-center gap-2">
								<Trash2 size={14} />
								{deleteSubmitting ? 'Deleting…' : 'Delete User'}
							</button>
						</div>
					</div>
				</div>,
				document.body
			)}


		</div>
	);
}

function UserSummary({ title, value, icon: IconComp, tone = 'primary', badge, sub }) {
	const iconBgClass =
		tone === 'secondary'
			? 'bg-accent/10 text-accent'
			: tone === 'tertiary'
			? 'bg-amber-500/10 text-amber-500'
			: tone === 'error'
			? 'bg-rose-500/10 text-rose-500'
			: 'bg-primary/10 text-primary';

	return (
		<div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
			<div className="flex justify-between items-start mb-3">
				<div>
					<h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{title}</h3>
					<p className="text-3xl font-black text-primary">{value}</p>
				</div>
				<div className={`w-9 h-9 ${iconBgClass} rounded-xl flex items-center justify-center shrink-0`}>
					<IconComp size={18} />
				</div>
			</div>
			<div className="flex items-center gap-2">
				<span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{badge}</span>
				{sub && <span className="text-[11px] text-muted-foreground font-medium">{sub}</span>}
			</div>
		</div>
	);
}

function FormField({ label, required, mono, type = 'text', value, onChange, placeholder, minLength }) {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = type === 'password';

	return (
		<div>
			<label className="text-xs font-semibold text-primary block mb-1.5">
				{label} {required && <span className="text-rose-500">*</span>}
			</label>
			<div className="relative w-full">
				<input
					type={isPassword ? (showPassword ? 'text' : 'password') : type}
					placeholder={placeholder}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					required={required}
					minLength={minLength}
					className={`w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all ${mono ? 'font-mono' : ''} ${isPassword ? 'pr-10' : ''}`}
				/>
				{isPassword && (
					<button
						type="button"
						onClick={() => setShowPassword((prev) => !prev)}
						title={showPassword ? 'Hide password' : 'Show password'}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
					>
						{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
					</button>
				)}
			</div>
		</div>
	);
}

function CustomSelect({ label, required, value, onChange, options, description }) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = React.useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const selectedOption = options.find((o) => o.value === value) || options[0];

	return (
		<div className="relative w-full" ref={dropdownRef}>
			{label && (
				<label className="text-xs font-semibold text-primary block mb-1.5">
					{label} {required && <span className="text-rose-500">*</span>}
				</label>
			)}
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs font-medium text-primary flex items-center justify-between cursor-pointer focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all h-[38px]"
			>
				<span>{selectedOption?.label || value}</span>
				<span className={`material-symbols-outlined text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ fontSize: '18px' }}>
					expand_more
				</span>
			</button>

			{isOpen && (
				<div className="absolute left-0 right-0 top-full mt-1.5 bg-background border border-border/80 rounded-xl shadow-xl z-[100] p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1">
					{options.map((opt) => {
						const isSelected = opt.value === value;
						return (
							<button
								key={opt.value}
								type="button"
								onClick={() => {
									onChange(opt.value);
									setIsOpen(false);
								}}
								className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
									isSelected
										? 'bg-primary text-primary-foreground font-bold shadow-xs'
										: 'text-muted-foreground hover:text-primary hover:bg-slate-100'
								}`}
							>
								<span>{opt.label}</span>
								{isSelected && <CheckCircle2 size={14} className="text-primary-foreground" />}
							</button>
						);
					})}
				</div>
			)}

			{description && (
				<p className="text-[11px] text-muted-foreground mt-1">{description}</p>
			)}
		</div>
	);
}

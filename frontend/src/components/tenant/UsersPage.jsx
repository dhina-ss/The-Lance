import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Users, UserPlus, TrendingUp, BadgeCheck, Search, X, Mail, Lock, ShieldCheck, User, Pencil, Trash2, CheckCircle2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { fetchUsers, createUser, updateUser, deleteUser, relativeTime } from '../../api/ems';

const AVATAR_BG = ['bg-primary', 'bg-accent', 'bg-emerald-600', 'bg-amber-600'];

function mapUser(u) {
	const initials = (u.username || u.name || u.email || '?').slice(0, 2);
	const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % AVATAR_BG.length;
	return {
		id: u.id,
		empCode: u.employeeCode || u.empCode || '—',
		name: u.username || u.name || 'App User',
		email: u.email,
		registered: u.createdDate || u.registered,
		deviceId: u.deviceId,
		deviceName: u.deviceName,
		avatarBg: AVATAR_BG[idx],
	};
}

export default function UsersPage({ onNavigateToDevice }) {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

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
	};

	useEffect(() => {
		loadUsers();
	}, []);

	useEffect(() => {
		document.body.style.overflow = isRegisterModalOpen || isEditModalOpen || isDeleteModalOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isRegisterModalOpen, isEditModalOpen, isDeleteModalOpen]);

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
		setFormError('');
	};

	const handleRegisterUser = async (e) => {
		e.preventDefault();
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
			});
			setUsers((us) => [mapUser(created), ...us]);
			resetForm();
			setIsRegisterModalOpen(false);
			setSuccessMsg('User account registered successfully!');
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
				password: editPassword,
			});
			setUsers((us) =>
				us.map((u) => (u.id === editingUser.id ? mapUser({ ...u, ...updated }) : u))
			);
			setIsEditModalOpen(false);
			setEditingUser(null);
			setSuccessMsg('User details saved successfully!');
		} catch (err) {
			setEditError(err instanceof Error ? err.message : 'Failed to update user.');
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

	const filteredUsers = users.filter((u) => {
		const term = searchTerm.toLowerCase();
		return (
			!term ||
			[u.name, u.email, u.empCode, u.deviceId, u.deviceName].filter(Boolean).some((v) => v.toLowerCase().includes(term))
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

			{/* Summary KPI Cards */}
			<section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
				<UserSummary title="Total Users" value={totalCount} icon={Users} tone="bg-primary/10 text-primary" badge="Workspace wide" />
				<UserSummary title="New Today" value={newToday} icon={UserPlus} tone="bg-accent/10 text-accent" badge="Last 24h" />
				<UserSummary title="New This Week" value={newWeek} icon={TrendingUp} tone="bg-emerald-500/10 text-emerald-600" badge="Last 7 days" />
				<UserSummary title="Enrolled" value={totalCount} icon={BadgeCheck} tone="bg-primary/10 text-primary" badge="EMS accounts" />
			</section>

			{/* Table Card */}
			<div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl overflow-hidden shadow-sm">
				<div className="p-6 border-b border-border/60 space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h2 className="text-xl font-extrabold text-primary tracking-tight">User Management</h2>
							<p className="text-xs text-muted-foreground mt-0.5">Manage EMS accounts that activate and manage the fleet</p>
						</div>
						<button onClick={() => setIsRegisterModalOpen(true)} className="px-4 py-2.5 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer">
							<UserPlus size={16} /> Register User
						</button>
					</div>

					<div className="relative w-full lg:max-w-xs">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
						<input type="text" placeholder="Search name, email, emp code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
					</div>
				</div>

				<div className="overflow-x-auto min-h-[450px]">
					<table className="w-full text-left border-collapse">
						<thead className="border-b border-border/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground bg-slate-100/80">
							<tr>
								<th className="px-6 py-3.5 w-14 text-center">#</th>
								<th className="px-6 py-3.5">User</th>
								<th className="px-6 py-3.5">Emp Code</th>
								<th className="px-6 py-3.5">Email</th>
								<th className="px-6 py-3.5">Device Name</th>
								<th className="px-6 py-3.5 text-center">Status</th>
								<th className="px-6 py-3.5">Registered</th>
								<th className="px-6 py-3.5 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40 text-xs">
							{loading ? (
								<tr><td colSpan={8} className="py-12 text-center text-muted-foreground">Loading users…</td></tr>
							) : filteredUsers.length > 0 ? (
								filteredUsers.map((u, index) => (
									<tr key={u.id} className="hover:bg-slate-100/80 transition-colors">
										<td className="px-6 py-4 text-center font-bold text-muted-foreground/80 font-mono text-[11px]">
											{index + 1}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<span className="font-bold text-primary">{u.name}</span>
											</div>
										</td>
										<td className="px-6 py-4">
											<span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-100 text-primary border border-border/60">{u.empCode}</span>
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
												{u.deviceId && (
													<button
														type="button"
														onClick={() => onNavigateToDevice && onNavigateToDevice(u.deviceId)}
														title={`View connected device (${u.deviceName}) details`}
														className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
													>
														<span className="material-symbols-outlined leading-none" style={{fontSize: '17px'}}>arrow_outward</span>
													</button>
												)}
												<button
													type="button"
													onClick={() => handleOpenEditModal(u)}
													title="Edit user"
													className="p-1.5 text-muted-foreground hover:text-primary hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
												>
													<Pencil size={15} />
												</button>
												<button
													type="button"
													onClick={() => handleOpenDeleteModal(u)}
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
								<tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No users found.</td></tr>
							)}
						</tbody>
					</table>
				</div>

				<div className="p-4 border-t border-border/60 text-xs text-muted-foreground">
					Showing <span className="font-bold text-primary">{filteredUsers.length}</span> of{' '}
					<span className="font-bold text-primary">{totalCount}</span> registered users
				</div>
			</div>

			{/* Register Modal */}
			{isRegisterModalOpen && ReactDOM.createPortal(
				<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
					<div className="bg-background border border-border/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
						<div className="flex justify-between items-center border-b border-border/60 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
									<UserPlus size={20} />
								</div>
								<div>
									<h3 className="text-base font-bold text-primary">Register User</h3>
									<p className="text-xs text-muted-foreground">Create a new EMS account</p>
								</div>
							</div>
							<button onClick={() => { setIsRegisterModalOpen(false); resetForm(); }} className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 cursor-pointer flex items-center justify-center">
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleRegisterUser} className="space-y-4 text-xs">
							<FormField label="Employee Code" required mono value={newEmpCode} onChange={setNewEmpCode} placeholder="e.g. EMP1001" />
							<FormField label="Username" required value={newUsername} onChange={setNewUsername} placeholder="e.g. john.doe" />
							<FormField label="Email Address" required type="email" value={newEmail} onChange={setNewEmail} placeholder="e.g. john.doe@enterprise.com" />
							<FormField label="Password" required type="password" minLength={8} value={newPassword} onChange={(v) => { setNewPassword(v); if (formError) setFormError(''); }} placeholder="At least 8 characters" />
							<FormField label="Confirm Password" required type="password" minLength={8} value={newConfirmPassword} onChange={(v) => { setNewConfirmPassword(v); if (formError) setFormError(''); }} placeholder="At least 8 characters" />
							{formError && <p className="text-xs text-rose-500 font-semibold">{formError}</p>}

							<div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
								<button type="button" onClick={() => { setIsRegisterModalOpen(false); resetForm(); }} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
								<button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all disabled:opacity-60">
									{submitting ? 'Registering…' : 'Register User'}
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
					<div className="bg-background border border-border/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5">
						<div className="flex justify-between items-center border-b border-border/60 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
									<Pencil size={20} />
								</div>
								<div>
									<h3 className="text-base font-bold text-primary">Edit User</h3>
									<p className="text-xs text-muted-foreground">Update user account details</p>
								</div>
							</div>
							<button onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }} className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 cursor-pointer flex items-center justify-center">
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleUpdateUser} className="space-y-4 text-xs">
							<FormField label="Employee Code" required mono value={editEmpCode} onChange={setEditEmpCode} placeholder="e.g. EMP1001" />
							<FormField label="Username" required value={editUsername} onChange={setEditUsername} placeholder="e.g. john.doe" />
							<FormField label="Email Address" required type="email" value={editEmail} onChange={setEditEmail} placeholder="e.g. john.doe@enterprise.com" />
							<FormField label="New Password" type="password" minLength={8} value={editPassword} onChange={(v) => { setEditPassword(v); if (editError) setEditError(''); }} placeholder="Leave blank or enter at least 8 characters" />
							{editError && <p className="text-xs text-rose-500 font-semibold">{editError}</p>}

							<div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
								<button type="button" onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
								<button type="submit" disabled={editSubmitting} className="px-4 py-2 bg-accent text-accent-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-primary hover:text-primary-foreground cursor-pointer transition-all disabled:opacity-60">
									{editSubmitting ? 'Saving…' : 'Save Changes'}
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

function UserSummary({ title, value, icon: IconComponent, tone, badge }) {
	return (
		<div className="bg-background/90 backdrop-blur-xl border border-border/80 p-5 rounded-2xl shadow-sm relative overflow-hidden group hover:border-primary/40 transition-all">
			<div className="flex items-center justify-between mb-3">
				<span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</span>
				<div className={`w-9 h-9 rounded-xl ${tone} flex items-center justify-center`}>
					<IconComponent size={18} />
				</div>
			</div>
			<div className="text-3xl font-black text-primary mb-2">{value}</div>
			<span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">{badge}</span>
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

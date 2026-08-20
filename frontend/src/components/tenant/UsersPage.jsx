import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Users, UserPlus, TrendingUp, BadgeCheck, Search, X, Mail, Lock, ShieldCheck, User } from 'lucide-react';
import { fetchUsers, createUser, relativeTime } from '../../api/ems';

const AVATAR_BG = ['bg-primary', 'bg-accent', 'bg-emerald-600', 'bg-amber-600'];

function mapUser(u) {
	const initials = (u.username || u.email || '?').slice(0, 2);
	const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % AVATAR_BG.length;
	return {
		id: u.id,
		empCode: u.employeeCode,
		name: u.username,
		email: u.email,
		registered: u.createdDate,
		avatarBg: AVATAR_BG[idx],
	};
}

export default function UsersPage() {
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
		document.body.style.overflow = isRegisterModalOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isRegisterModalOpen]);

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
		} catch (err) {
			setFormError(err instanceof Error ? err.message : 'Failed to register user.');
		} finally {
			setSubmitting(false);
		}
	};

	const filteredUsers = users.filter((u) => {
		const term = searchTerm.toLowerCase();
		return (
			!term ||
			[u.name, u.email, u.empCode].filter(Boolean).some((v) => v.toLowerCase().includes(term))
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

				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead className="border-b border-border/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted/20">
							<tr>
								<th className="px-6 py-3.5">User</th>
								<th className="px-6 py-3.5">Emp Code</th>
								<th className="px-6 py-3.5">Email</th>
								<th className="px-6 py-3.5">Registered</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40 text-xs">
							{loading ? (
								<tr><td colSpan={4} className="py-12 text-center text-muted-foreground">Loading users…</td></tr>
							) : filteredUsers.length > 0 ? (
								filteredUsers.map((u) => (
									<tr key={u.id} className="hover:bg-muted/40 transition-colors">
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div className={`w-9 h-9 rounded-xl ${u.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>
													{(u.name || '?').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
												</div>
												<span className="font-bold text-primary">{u.name}</span>
											</div>
										</td>
										<td className="px-6 py-4">
											<span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-muted/30 text-primary border border-border/60">{u.empCode}</span>
										</td>
										<td className="px-6 py-4 text-muted-foreground font-medium">{u.email}</td>
										<td className="px-6 py-4 text-muted-foreground font-semibold">{relativeTime(u.registered)}</td>
									</tr>
								))
							) : (
								<tr><td colSpan={4} className="py-12 text-center text-muted-foreground">No users found.</td></tr>
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
							<button onClick={() => { setIsRegisterModalOpen(false); resetForm(); }} className="w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 cursor-pointer flex items-center justify-center">
								<X size={18} />
							</button>
						</div>

						<form onSubmit={handleRegisterUser} className="space-y-4 text-xs">
							<FormField label="Employee Code" required mono value={newEmpCode} onChange={setNewEmpCode} placeholder="e.g. EMP1001" />
							<FormField label="Username" required value={newUsername} onChange={setNewUsername} placeholder="e.g. john.doe" />
							<FormField label="Email Address" required type="email" value={newEmail} onChange={setNewEmail} placeholder="e.g. john.doe@enterprise.com" />
							<FormField label="Password" required type="password" value={newPassword} onChange={(v) => { setNewPassword(v); if (formError) setFormError(''); }} placeholder="••••••••" />
							<FormField label="Confirm Password" required type="password" value={newConfirmPassword} onChange={(v) => { setNewConfirmPassword(v); if (formError) setFormError(''); }} placeholder="••••••••" />
							{formError && <p className="text-xs text-rose-500 font-semibold">{formError}</p>}

							<div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
								<button type="button" onClick={() => { setIsRegisterModalOpen(false); resetForm(); }} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted rounded-xl cursor-pointer">Cancel</button>
								<button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all disabled:opacity-60">
									{submitting ? 'Registering…' : 'Register User'}
								</button>
							</div>
						</form>
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

function FormField({ label, required, mono, type = 'text', value, onChange, placeholder }) {
	return (
		<div>
			<label className="text-xs font-semibold text-primary block mb-1.5">
				{label} {required && <span className="text-rose-500">*</span>}
			</label>
			<input
				type={type}
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				required={required}
				className={`w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all ${mono ? 'font-mono' : ''}`}
			/>
		</div>
	);
}

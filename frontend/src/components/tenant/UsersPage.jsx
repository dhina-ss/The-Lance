import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Users, UserPlus, TrendingUp, BadgeCheck, Search, X, Mail, Lock, ShieldCheck, User, Pencil, Trash2, CheckCircle2, AlertTriangle, Eye, EyeOff, Clock, Save, Bell } from 'lucide-react';
import { fetchUsers, createUser, updateUser, deleteUser, fetchUserLimit, fetchTenantSettings, saveTenantSettings, relativeTime } from '../../api/ems';

const AVATAR_BG = ['bg-primary', 'bg-accent', 'bg-emerald-600', 'bg-amber-600'];

const DEFAULT_TENANT_ROLES = [
	{
		id: 'super_admin',
		name: 'Super Admin',
		isEditableName: false,
		rules: [
			'device_mgmt', 'device_mgmt:view', 'device_mgmt:remote_lock', 'device_mgmt:restart_shutdown', 'device_mgmt:gating',
			'software_deploy', 'software_deploy:view', 'software_deploy:install', 'software_deploy:uninstall', 'software_deploy:upload',
			'usb_url_rules', 'usb_url_rules:usb_blocking', 'usb_url_rules:website_blocking',
			'user_mgmt', 'user_mgmt:view', 'user_mgmt:create', 'user_mgmt:edit', 'user_mgmt:delete',
			'audit_geo', 'audit_geo:view_logs', 'audit_geo:live_map', 'audit_geo:export_logs',
			'reports_export', 'reports_export:view_analytics', 'reports_export:download_pdf', 'reports_export:export_csv',
		],
		desc: 'Full administrative control over tenant workspace and security rules',
	},
	{
		id: 'admin',
		name: 'Admin',
		isEditableName: false,
		rules: [
			'device_mgmt', 'device_mgmt:view', 'device_mgmt:remote_lock', 'device_mgmt:restart_shutdown',
			'software_deploy', 'software_deploy:view', 'software_deploy:install',
			'usb_url_rules', 'usb_url_rules:usb_blocking', 'usb_url_rules:website_blocking',
			'user_mgmt', 'user_mgmt:view', 'user_mgmt:create',
			'reports_export', 'reports_export:view_analytics', 'reports_export:download_pdf',
		],
		desc: 'Workspace administration and device fleet control',
	},
	{
		id: 'role_1',
		name: 'Role 1',
		isEditableName: true,
		rules: [
			'device_mgmt', 'device_mgmt:view', 'device_mgmt:restart_shutdown',
			'software_deploy', 'software_deploy:view', 'software_deploy:install',
			'user_mgmt', 'user_mgmt:view',
		],
		desc: 'Customizable tenant role 1',
	},
	{
		id: 'role_2',
		name: 'Role 2',
		isEditableName: true,
		rules: [
			'usb_url_rules', 'usb_url_rules:usb_blocking', 'usb_url_rules:website_blocking',
			'audit_geo', 'audit_geo:view_logs', 'audit_geo:live_map',
			'reports_export', 'reports_export:view_analytics',
		],
		desc: 'Customizable tenant role 2',
	},
	{
		id: 'role_3',
		name: 'Role 3',
		isEditableName: true,
		rules: [
			'device_mgmt', 'device_mgmt:view',
			'software_deploy', 'software_deploy:view',
		],
		desc: 'Customizable tenant role 3',
	},
];

const AVAILABLE_RULES = [
	{
		id: 'device_mgmt',
		label: 'Device Management & Fleet Control',
		desc: 'View, monitor, and issue commands to connected devices',
		subRules: [
			{ id: 'device_mgmt:view', label: 'View Telemetry & Fleet Status', desc: 'Monitor live device heartbeats and system specs' },
			{ id: 'device_mgmt:remote_lock', label: 'Remote Lock & Wipe Commands', desc: 'Execute emergency device lock and security wipe' },
			{ id: 'device_mgmt:restart_shutdown', label: 'Power Control (Reboot/Shutdown)', desc: 'Send remote reboot and shutdown commands' },
			{ id: 'device_mgmt:gating', label: 'Store Gating Controls', desc: 'Enable or disable Windows Store gating policy' },
		],
	},
	{
		id: 'software_deploy',
		label: 'Software Deployment & Package Installs',
		desc: 'Push silently installed software packages to endpoints',
		subRules: [
			{ id: 'software_deploy:view', label: 'View Installed Applications', desc: 'Inspect software inventory across all devices' },
			{ id: 'software_deploy:install', label: 'Push App Package Installs', desc: 'Trigger remote silent software installations' },
			{ id: 'software_deploy:uninstall', label: 'Queue Remote App Uninstallation', desc: 'Uninstall unwanted software packages' },
			{ id: 'software_deploy:upload', label: 'Upload Installer Packages', desc: 'Upload new .exe or .msi installer files' },
		],
	},
	{
		id: 'usb_url_rules',
		label: 'USB & Website Security Rules',
		desc: 'Configure USB storage blocking and URL web filters',
		subRules: [
			{ id: 'usb_url_rules:usb_blocking', label: 'USB Storage Device Blocking Option', desc: 'Configure USB storage read/write blocking & mass storage lock' },
			{ id: 'usb_url_rules:website_blocking', label: 'Website & URL Filtering Option', desc: 'Block domain categories, custom URL blacklists & web filters' },
		],
	},
	{
		id: 'user_mgmt',
		label: 'User Account Management',
		desc: 'Create, edit, and revoke dashboard & device user accounts',
		subRules: [
			{ id: 'user_mgmt:view', label: 'View Registered Accounts', desc: 'Browse employee list and assigned devices' },
			{ id: 'user_mgmt:create', label: 'Register New EMS Users', desc: 'Create dashboard and device user accounts' },
			{ id: 'user_mgmt:edit', label: 'Edit Credentials & Roles', desc: 'Modify employee codes, email addresses, and roles' },
			{ id: 'user_mgmt:delete', label: 'Delete User Accounts', desc: 'Permanently remove user credentials from workspace' },
		],
	},
	{
		id: 'audit_geo',
		label: 'Audit Logs & Device Geolocation',
		desc: 'Access real-time authentication logs & GPS/IP location maps',
		subRules: [
			{ id: 'audit_geo:view_logs', label: 'View Real-time Audit Logs', desc: 'Stream security events and authentication attempts' },
			{ id: 'audit_geo:live_map', label: 'Live Device Geolocation Map', desc: 'Track device IP/GPS location on interactive map' },
			{ id: 'audit_geo:export_logs', label: 'Export Audit Logs', desc: 'Download security event history in CSV/JSON' },
		],
	},
	{
		id: 'reports_export',
		label: 'Reports & Analytics Export',
		desc: 'Generate system PDF/CSV performance and compliance reports',
		subRules: [
			{ id: 'reports_export:view_analytics', label: 'View Performance Matrix', desc: 'Analyze OS distribution and antivirus status' },
			{ id: 'reports_export:download_pdf', label: 'Download PDF Security Reports', desc: 'Generate printable official PDF compliance reports' },
			{ id: 'reports_export:export_csv', label: 'Export Fleet Metrics to CSV', desc: 'Export raw device metrics and inventory data' },
		],
	},
];

function isCategoryEnabled(activeRules, catId) {
	if (!activeRules) return false;
	return activeRules.includes(catId) || activeRules.some((r) => r.startsWith(catId + ':'));
}

function getSubRuleCount(activeRules, catObj) {
	if (!activeRules || !catObj || !catObj.subRules) return 0;
	return catObj.subRules.filter((sr) =>
		activeRules.includes(sr.id) || activeRules.includes(catObj.id)
	).length;
}

function toggleCategoryRules(activeRules, catObj) {
	const enabled = isCategoryEnabled(activeRules, catObj.id);
	const subIds = catObj.subRules.map((sr) => sr.id);
	if (enabled) {
		return activeRules.filter((r) => r !== catObj.id && !subIds.includes(r));
	} else {
		return Array.from(new Set([...activeRules, catObj.id, ...subIds]));
	}
}

function toggleSubRulePermission(activeRules, catObj, subRuleId) {
	const subIds = catObj.subRules.map((sr) => sr.id);
	let currentSubs = catObj.subRules
		.filter((sr) => activeRules.includes(sr.id) || activeRules.includes(catObj.id))
		.map((sr) => sr.id);

	if (currentSubs.includes(subRuleId)) {
		currentSubs = currentSubs.filter((id) => id !== subRuleId);
	} else {
		currentSubs = [...currentSubs, subRuleId];
	}

	const cleaned = activeRules.filter((r) => r !== catObj.id && !subIds.includes(r));
	if (currentSubs.length > 0) {
		return [...cleaned, catObj.id, ...currentSubs];
	} else {
		return cleaned;
	}
}

function PermissionsCategoryList({ currentRules, onChangeRules }) {
	return (
		<div className="space-y-2.5 bg-slate-100/50 p-3 rounded-xl border border-border/60 max-h-[360px] overflow-y-auto">
			{AVAILABLE_RULES.map((rule) => {
				const catEnabled = isCategoryEnabled(currentRules, rule.id);
				const activeSubCount = getSubRuleCount(currentRules, rule);
				const totalSubCount = rule.subRules.length;

				return (
					<div
						key={rule.id}
						className={`rounded-xl border transition-all ${
							catEnabled
								? 'bg-background border-primary/40 shadow-2xs'
								: 'bg-background/60 border-border/80 opacity-85'
						}`}
					>
						<label className="flex items-start gap-2.5 p-3 cursor-pointer">
							<input
								type="checkbox"
								checked={catEnabled}
								onChange={() => {
									const nextRules = toggleCategoryRules(currentRules, rule);
									onChangeRules(nextRules);
								}}
								className="mt-0.5 rounded border-input text-primary focus:ring-accent accent-accent cursor-pointer"
							/>
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between gap-2">
									<span className="font-bold text-xs text-primary">{rule.label}</span>
									{catEnabled && (
										<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
											{activeSubCount}/{totalSubCount} sub-rules active
										</span>
									)}
								</div>
								<p className="text-[10px] text-muted-foreground mt-0.5">{rule.desc}</p>
							</div>
						</label>

						{/* Sub Category Permissions Card */}
						{catEnabled && rule.subRules && rule.subRules.length > 0 && (
							<div className="px-3 pb-3 pt-2 border-t border-border/40 bg-slate-50/80 rounded-b-xl space-y-2 border-l-3 border-l-primary">
								<span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1 block">
									<ShieldCheck size={12} className="text-primary" /> Sub Category Permissions ({rule.label})
								</span>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{rule.subRules.map((sub) => {
										const isSubChecked =
											currentRules.includes(sub.id) ||
											(currentRules.includes(rule.id) &&
												!currentRules.some((r) => r.startsWith(rule.id + ':')));
										return (
											<label
												key={sub.id}
												className={`flex items-start gap-2 p-2 rounded-lg border text-[11px] transition-all cursor-pointer ${
													isSubChecked
														? 'bg-primary/10 border-primary/30 text-primary font-semibold'
														: 'bg-background border-border/60 text-muted-foreground hover:bg-slate-100'
												}`}
											>
												<input
													type="checkbox"
													checked={isSubChecked}
													onChange={() => {
														const nextRules = toggleSubRulePermission(currentRules, rule, sub.id);
														onChangeRules(nextRules);
													}}
													className="mt-0.5 rounded border-input text-primary focus:ring-accent accent-accent cursor-pointer"
												/>
												<div>
													<span className="block font-bold text-xs leading-tight">{sub.label}</span>
													<span className="text-[10px] opacity-75 font-normal block leading-tight mt-0.5">{sub.desc}</span>
												</div>
											</label>
										);
									})}
								</div>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}

function mapUser(u) {
	const initials = (u.username || u.name || u.email || '?').slice(0, 2);
	const idx = (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % AVATAR_BG.length;
	return {
		id: u.id,
		empCode: u.employeeCode || u.empCode || '—',
		name: u.username || u.name || 'App User',
		email: u.email,
		type: u.type || u.userType || 'Device User',
		role: u.role || (u.type === 'Device User' ? 'Device User' : 'Super Admin'),
		rules: u.rules || ['device_mgmt', 'software_deploy', 'usb_url_rules', 'user_mgmt', 'audit_geo', 'reports_export'],
		registered: u.createdDate || u.registered,
		deviceId: u.deviceId,
		deviceName: u.deviceName,
		managerUserId: u.managerUserId ?? null,
		managerName: u.managerName || null,
		avatarBg: AVATAR_BG[idx],
	};
}

export default function UsersPage({ onNavigateToDevice }) {
	const [users, setUsers] = useState([]);
	const [userLimit, setUserLimit] = useState(null);
	const [settings, setSettings] = useState({ inactivityLockMinutes: 5, inactivityAlertMinutes: 10 });
	const [settingsSaving, setSettingsSaving] = useState(false);
	const [newManagerId, setNewManagerId] = useState('');
	const [editManagerId, setEditManagerId] = useState('');
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

	// Tenant Roles configuration state (5 roles: Super Admin, Admin, Role 1, Role 2, Role 3)
	const [tenantRoles, setTenantRoles] = useState(() => {
		try {
			const saved = localStorage.getItem('ems_tenant_roles_v4');
			return saved ? JSON.parse(saved) : DEFAULT_TENANT_ROLES;
		} catch {
			return DEFAULT_TENANT_ROLES;
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem('ems_tenant_roles_v4', JSON.stringify(tenantRoles));
		} catch {}
	}, [tenantRoles]);

	const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
	const [editingRoleNameId, setEditingRoleNameId] = useState(null);
	const [tempRoleName, setTempRoleName] = useState('');

	// Multi-step registration state
	const [regStep, setRegStep] = useState(1);
	const [newEmpCode, setNewEmpCode] = useState('');
	const [newUsername, setNewUsername] = useState('');
	const [newEmail, setNewEmail] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [newConfirmPassword, setNewConfirmPassword] = useState('');
	const [newType, setNewType] = useState('Device User');
	const [newRole, setNewRole] = useState('Super Admin');
	const [newRules, setNewRules] = useState(tenantRoles[0]?.rules || []);
	const [formError, setFormError] = useState('');
	const [submitting, setSubmitting] = useState(false);

	// Edit User state
	const [editingUser, setEditingUser] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [editEmpCode, setEditEmpCode] = useState('');
	const [editUsername, setEditUsername] = useState('');
	const [editEmail, setEditEmail] = useState('');
	const [editPassword, setEditPassword] = useState('');
	const [editType, setEditType] = useState('Device User');
	const [editRole, setEditRole] = useState('Super Admin');
	const [editRules, setEditRules] = useState([]);
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
		try {
			const s = await fetchTenantSettings();
			setSettings({ inactivityLockMinutes: s.inactivityLockMinutes ?? 5, inactivityAlertMinutes: s.inactivityAlertMinutes ?? 10 });
		} catch { /* settings are best-effort */ }
	};

	useEffect(() => {
		loadUsers();
	}, []);

	useEffect(() => {
		document.body.style.overflow = isRegisterModalOpen || isEditModalOpen || isDeleteModalOpen || isRolesModalOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	}, [isRegisterModalOpen, isEditModalOpen, isDeleteModalOpen, isRolesModalOpen]);

	useEffect(() => {
		if (successMsg) {
			const timer = setTimeout(() => setSuccessMsg(null), 4000);
			return () => clearTimeout(timer);
		}
	}, [successMsg]);

	const resetForm = () => {
		setRegStep(1);
		setNewEmpCode('');
		setNewUsername('');
		setNewEmail('');
		setNewPassword('');
		setNewConfirmPassword('');
		setNewType('Device User');
		setNewManagerId('');
		setNewRole(tenantRoles[0]?.name || 'Super Admin');
		setNewRules(tenantRoles[0]?.rules || []);
		setFormError('');
	};

	const handleRenameRole = (roleId, newName) => {
		const trimmed = newName.trim();
		if (!trimmed) return;
		setTenantRoles((prev) =>
			prev.map((r) => {
				if (r.id === roleId && r.isEditableName) {
					if (newRole === r.name) setNewRole(trimmed);
					if (editRole === r.name) setEditRole(trimmed);
					return { ...r, name: trimmed };
				}
				return r;
			})
		);
		setEditingRoleNameId(null);
		setSuccessMsg(`Role renamed to "${trimmed}" successfully!`);
	};

	const handleSaveRoleDefaultRules = (roleId, rulesToSave) => {
		setTenantRoles((prev) =>
			prev.map((r) => (r.id === roleId ? { ...r, rules: [...rulesToSave] } : r))
		);
		setSuccessMsg('Updated default permissions for role!');
	};

	const toggleRule = (ruleId) => {
		setNewRules((prev) =>
			prev.includes(ruleId) ? prev.filter((r) => r !== ruleId) : [...prev, ruleId]
		);
	};

	const toggleEditRule = (ruleId) => {
		setEditRules((prev) =>
			prev.includes(ruleId) ? prev.filter((r) => r !== ruleId) : [...prev, ruleId]
		);
	};

	const handleNextStep = (e) => {
		if (e) e.preventDefault();
		if (!newEmpCode.trim() || !newUsername.trim() || !newEmail.trim()) {
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
		setFormError('');

		if (newType === 'Dashboard User') {
			setRegStep(2);
		} else {
			handleRegisterUser();
		}
	};

	const handleRegisterUser = async () => {
		setSubmitting(true);
		setFormError('');
		try {
			const matchedRoleObj = tenantRoles.find((r) => r.name === newRole || r.id === newRole);
			const assignedRules = matchedRoleObj ? matchedRoleObj.rules : newRules;

			const created = await createUser({
				email: newEmail.trim(),
				employeeCode: newEmpCode.trim(),
				username: newUsername.trim(),
				password: newPassword,
				confirmPassword: newConfirmPassword,
				type: newType,
				role: newType === 'Dashboard User' ? newRole : 'Device User',
				managerUserId: newType === 'Device User' && newManagerId ? Number(newManagerId) : null,
				rules: newType === 'Dashboard User' ? assignedRules : [],
			});
			setUsers((us) => [mapUser(created), ...us]);
			resetForm();
			setIsRegisterModalOpen(false);
			setSuccessMsg(`Registered ${newType === 'Dashboard User' ? `${newRole} account` : 'device user'} successfully!`);
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
		setEditType(user.type || 'Dashboard User');
		setEditManagerId(user.managerUserId ? String(user.managerUserId) : '');
		setEditRole(user.role || 'Tenant Admin');
		setEditRules(user.rules || ['device_mgmt', 'software_deploy', 'usb_url_rules', 'user_mgmt', 'audit_geo', 'reports_export']);
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
				type: editType,
				role: editType === 'Dashboard User' ? editRole : 'Device User',
				managerUserId: editType === 'Device User' && editManagerId ? Number(editManagerId) : null,
				rules: editType === 'Dashboard User' ? editRules : [],
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

	const handleSaveSettings = async () => {
		setSettingsSaving(true);
		try {
			const saved = await saveTenantSettings({
				inactivityLockMinutes: Number(settings.inactivityLockMinutes) || 5,
				inactivityAlertMinutes: Number(settings.inactivityAlertMinutes) || 10,
			});
			setSettings({ inactivityLockMinutes: saved.inactivityLockMinutes, inactivityAlertMinutes: saved.inactivityAlertMinutes });
			setSuccessMsg('Inactivity auto-lock settings saved successfully!');
		} catch (err) {
			alert(err instanceof Error ? err.message : 'Failed to save settings.');
		} finally {
			setSettingsSaving(false);
		}
	};

	const managerOptions = [{ value: '', label: 'Unassigned' }].concat(
		users.filter((u) => u.type === 'Dashboard User').map((u) => ({ value: String(u.id), label: u.name }))
	);

	const filteredUsers = users.filter((u) => {
		const term = searchTerm.toLowerCase();
		return (
			!term ||
			[u.name, u.email, u.empCode, u.type, u.role, u.deviceId, u.deviceName].filter(Boolean).some((v) => v.toLowerCase().includes(term))
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

			{/* Inactivity Auto-Lock Settings */}
			<section className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl p-6 shadow-sm">
				<div className="flex items-start gap-3 mb-4">
					<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Clock size={20} /></div>
					<div>
						<h2 className="text-lg font-extrabold text-primary tracking-tight">Inactivity Auto-Lock</h2>
						<p className="text-xs text-muted-foreground mt-0.5">Lock idle devices automatically and email the assigned manager if the user does not return. Applies to every device in your tenant.</p>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
					<div>
						<label className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5"><Lock size={13} /> Lock screen after (minutes)</label>
						<input type="number" min={1} max={240} value={settings.inactivityLockMinutes} onChange={(e) => setSettings((s) => ({ ...s, inactivityLockMinutes: e.target.value }))} className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs font-medium text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
					</div>
					<div>
						<label className="text-xs font-semibold text-primary mb-1.5 flex items-center gap-1.5"><Bell size={13} /> Alert manager after locked (minutes)</label>
						<input type="number" min={1} max={1440} value={settings.inactivityAlertMinutes} onChange={(e) => setSettings((s) => ({ ...s, inactivityAlertMinutes: e.target.value }))} className="w-full bg-background border border-input rounded-xl px-3.5 py-2 text-xs font-medium text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
					</div>
					<button type="button" onClick={handleSaveSettings} disabled={settingsSaving} className="px-4 py-2.5 bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-60 h-[38px]"><Save size={16} /> {settingsSaving ? 'Saving…' : 'Save Settings'}</button>
				</div>
				<p className="text-[11px] text-muted-foreground mt-3">Managers are assigned per device user below (edit a user to set their manager).</p>
			</section>

			{/* Table Card */}
			<div className="bg-background/90 backdrop-blur-xl border border-border/80 rounded-2xl overflow-hidden shadow-sm">
				<div className="p-6 border-b border-border/60 space-y-4">
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div>
							<h2 className="text-xl font-extrabold text-primary tracking-tight inline-flex items-center gap-2.5">User Management
									{userLimit != null && (
										<span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${users.length >= userLimit ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>{users.length} / {userLimit} users</span>
									)}
								</h2>
							<p className="text-xs text-muted-foreground mt-0.5">Manage EMS accounts that activate and manage the fleet</p>
						</div>
						<div className="flex items-center gap-2.5">
							<button onClick={() => setIsRolesModalOpen(true)} className="px-3.5 py-2.5 bg-background border border-border/80 text-primary hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer">
								<ShieldCheck size={16} /> Roles & Rules
							</button>
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

					<div className="relative w-full lg:max-w-xs">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
						<input type="text" placeholder="Search name, email, type, emp code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-background border border-input rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-primary placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all" />
					</div>
				</div>

				<div className="overflow-x-auto min-h-[450px]">
					<table className="w-full text-left border-collapse">
						<thead className="border-b border-border/60 text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground bg-slate-100/80">
							<tr>
								<th className="px-6 py-3.5 w-14 text-center">#</th>
								<th className="px-6 py-3.5">User</th>
								<th className="px-6 py-3.5">Emp Code</th>
								<th className="px-6 py-3.5">User Type</th>
								<th className="px-6 py-3.5">Email</th>
								<th className="px-6 py-3.5">Device Name</th>
								<th className="px-6 py-3.5 text-center">Status</th>
								<th className="px-6 py-3.5">Registered</th>
								<th className="px-6 py-3.5 text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border/40 text-xs">
							{loading ? (
								<tr><td colSpan={9} className="py-12 text-center text-muted-foreground">Loading users…</td></tr>
							) : filteredUsers.length > 0 ? (
								filteredUsers.map((u, index) => (
									<tr key={u.id} className="hover:bg-slate-100/80 transition-colors">
										<td className="px-6 py-4 text-center font-bold text-muted-foreground/80 font-mono text-[11px]">
											{index + 1}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center gap-3">
												<div><span className="font-bold text-primary block">{u.name}</span>{u.type === 'Device User' && u.managerName && (<span className="block text-[10px] text-muted-foreground font-medium mt-0.5">Manager: {u.managerName}</span>)}</div>
											</div>
										</td>
										<td className="px-6 py-4">
											<span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-slate-100 text-primary border border-border/60">{u.empCode}</span>
										</td>
										<td className="px-6 py-4">
											<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
												u.type === 'Device User'
													? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
													: 'bg-primary/10 text-primary border-primary/20'
											}`}>
												{u.type || 'Dashboard User'}
											</span>
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

			{/* Register Modal */}
			{isRegisterModalOpen && ReactDOM.createPortal(
				<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
					<div className="bg-background border border-border/80 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center border-b border-border/60 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
									{regStep === 1 ? <UserPlus size={20} /> : <ShieldCheck size={20} />}
								</div>
								<div>
									<h3 className="text-base font-bold text-primary">
										{regStep === 1 ? 'Register User' : 'Assign Tenant Role'}
									</h3>
									<p className="text-xs text-muted-foreground">
										{regStep === 1
											? 'Step 1 of 2: Basic Account Details'
											: 'Step 2 of 2: Select Tenant Administrative Role'}
									</p>
								</div>
							</div>
							<button onClick={() => { setIsRegisterModalOpen(false); resetForm(); }} className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 cursor-pointer flex items-center justify-center">
								<X size={18} />
							</button>
						</div>

						{/* Step indicator pills */}
						{newType === 'Dashboard User' && (
							<div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-border/60 text-xs">
								<button
									type="button"
									onClick={() => setRegStep(1)}
									className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
										regStep === 1 ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-primary'
									}`}
								>
									1. Account Details
								</button>
								<button
									type="button"
									onClick={() => {
										if (newUsername && newEmail && newPassword.length >= 8 && newPassword === newConfirmPassword) {
											setFormError('');
											setRegStep(2);
										} else {
											setFormError('Please fill in valid account details first.');
										}
									}}
									className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
										regStep === 2 ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-primary'
									}`}
								>
									2. Select Role
								</button>
							</div>
						)}

						{regStep === 1 ? (
							<form onSubmit={handleNextStep} className="space-y-4 text-xs">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<FormField label="Employee Code" required mono value={newEmpCode} onChange={setNewEmpCode} placeholder="e.g. EMP1001" />
									<CustomSelect
										label="User Type"
										required
										value={newType}
										onChange={(val) => {
											setNewType(val);
											if (val === 'Device User') setRegStep(1);
										}}
										options={[
											{ value: 'Device User', label: 'Device User' },
											{ value: 'Dashboard User', label: 'Dashboard User' },
										]}
									/>
								</div>
								<p className="text-[11px] text-muted-foreground -mt-2">
									{newType === 'Dashboard User'
										? 'Dashboard users have portal access with assigned roles & permission rules.'
										: 'Device users are assigned directly to endpoints without administrative portal access.'}
								</p>
								{newType === 'Device User' && (
									<CustomSelect label="Assign Manager (optional)" value={newManagerId} onChange={setNewManagerId} options={managerOptions} description="The dashboard user emailed if this user's device stays idle." />
								)}
								<FormField label="Username" required value={newUsername} onChange={setNewUsername} placeholder="e.g. john.doe" />
								<FormField label="Email Address" required type="email" value={newEmail} onChange={setNewEmail} placeholder="e.g. john.doe@enterprise.com" />
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<FormField label="Password" required type="password" minLength={8} value={newPassword} onChange={(v) => { setNewPassword(v); if (formError) setFormError(''); }} placeholder="At least 8 characters" />
									<FormField label="Confirm Password" required type="password" minLength={8} value={newConfirmPassword} onChange={(v) => { setNewConfirmPassword(v); if (formError) setFormError(''); }} placeholder="At least 8 characters" />
								</div>
								{formError && <p className="text-xs text-rose-500 font-semibold">{formError}</p>}

								<div className="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
									<button type="button" onClick={() => { setIsRegisterModalOpen(false); resetForm(); }} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
									<button type="submit" className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all">
										{newType === 'Dashboard User' ? 'Next: Select Role →' : 'Register User'}
									</button>
								</div>
							</form>
						) : (
							<div className="space-y-4 text-xs">
								<div>
									<div className="flex items-center justify-between mb-2">
										<label className="text-xs font-bold text-primary block">
											Select Tenant Role <span className="text-rose-500">*</span>
										</label>
										<span className="text-[10px] text-muted-foreground">
											Super Admin & Admin fixed; Role 1-3 editable
										</span>
									</div>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
										{tenantRoles.map((role) => {
											const isSelected = newRole === role.name || newRole === role.id;
											const isEditingThisName = editingRoleNameId === role.id;

											return (
												<div
													key={role.id}
													onClick={() => {
														setNewRole(role.name);
														setNewRules([...role.rules]);
													}}
													className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
														isSelected
															? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
															: 'bg-background border-border/80 text-muted-foreground hover:border-primary/50'
													}`}
												>
													<div className="flex items-center justify-between gap-2 mb-1">
														{isEditingThisName ? (
															<div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
																<input
																	type="text"
																	value={tempRoleName}
																	onChange={(e) => setTempRoleName(e.target.value)}
																	onKeyDown={(e) => {
																		if (e.key === 'Enter') handleRenameRole(role.id, tempRoleName);
																	}}
																	autoFocus
																	className="w-full bg-background border border-primary rounded-lg px-2 py-0.5 text-xs font-bold text-primary focus:outline-none"
																/>
																<button
																	type="button"
																	onClick={() => handleRenameRole(role.id, tempRoleName)}
																	className="bg-primary text-primary-foreground font-bold px-2 py-0.5 text-[10px] rounded-md shrink-0 cursor-pointer"
																>
																	Save
																</button>
															</div>
														) : (
															<>
																<span className="font-bold text-xs flex items-center gap-1.5 truncate">
																	{role.name}
																	{!role.isEditableName ? (
																		<span title="Locked role name (Super Admin / Admin)" className="text-muted-foreground/70">
																			<Lock size={11} />
																		</span>
																	) : (
																		<button
																			type="button"
																			onClick={(e) => {
																				e.stopPropagation();
																				setEditingRoleNameId(role.id);
																				setTempRoleName(role.name);
																			}}
																			title="Rename role"
																			className="p-1 rounded hover:bg-slate-200 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
																		>
																			<Pencil size={11} />
																		</button>
																	)}
																</span>
																{isSelected && <CheckCircle2 size={14} className="text-primary shrink-0" />}
															</>
														)}
													</div>
													<span className="text-[10px] opacity-75 font-normal block truncate">
														{role.desc}
													</span>
												</div>
											);
										})}
									</div>
								</div>

								<div className="bg-slate-100/70 border border-border/80 rounded-xl p-3.5 space-y-1.5 text-[11px]">
									<div className="flex items-center gap-2 font-extrabold text-primary">
										<ShieldCheck size={16} className="text-primary" />
										<span>Permissions Inherited from Role</span>
									</div>
									<p className="text-muted-foreground leading-relaxed">
										This account will automatically inherit all permissions and sub-category security rules assigned to <span className="font-bold text-primary">{newRole}</span>. You can manage or customize role permissions anytime in <span className="font-semibold text-primary">Roles & Rules</span> settings.
									</p>
								</div>

								{formError && <p className="text-xs text-rose-500 font-semibold">{formError}</p>}

								<div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
									<button
										type="button"
										onClick={() => setRegStep(1)}
										className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-slate-100 rounded-xl cursor-pointer"
									>
										Back to Account Info
									</button>
									<button
										type="button"
										disabled={submitting}
										onClick={handleRegisterUser}
										className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all disabled:opacity-60"
									>
										{submitting ? 'Creating Account…' : 'Complete Registration'}
									</button>
								</div>
							</div>
						)}
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
								<CustomSelect
									label="User Type"
									required
									value={editType}
									onChange={setEditType}
									options={[
										{ value: 'Device User', label: 'Device User' },
										{ value: 'Dashboard User', label: 'Dashboard User' },
									]}
								/>
							</div>
							<FormField label="Username" required value={editUsername} onChange={setEditUsername} placeholder="e.g. john.doe" />

							{editType === 'Dashboard User' && (
								<>
									<div>
										<div className="flex items-center justify-between mb-2">
											<label className="text-xs font-bold text-primary block">
												Tenant Role <span className="text-rose-500">*</span>
											</label>
											<span className="text-[10px] text-muted-foreground">
												Role 1-3 names editable
											</span>
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
											{tenantRoles.map((role) => {
												const isSelected = editRole === role.name || editRole === role.id;
												const isEditingThisName = editingRoleNameId === role.id;

												return (
													<div
														key={role.id}
														onClick={() => {
															setEditRole(role.name);
															setEditRules([...role.rules]);
														}}
														className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
															isSelected
																? 'bg-accent/15 border-accent text-accent-foreground font-bold shadow-xs'
																: 'bg-background border-border/80 text-muted-foreground hover:border-accent/50'
														}`}
													>
														<div className="flex items-center justify-between gap-2">
															{isEditingThisName ? (
																<div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
																	<input
																		type="text"
																		value={tempRoleName}
																		onChange={(e) => setTempRoleName(e.target.value)}
																		onKeyDown={(e) => {
																			if (e.key === 'Enter') handleRenameRole(role.id, tempRoleName);
																		}}
																		autoFocus
																		className="w-full bg-background border border-accent rounded-lg px-2 py-0.5 text-xs font-bold text-primary focus:outline-none"
																	/>
																	<button
																		type="button"
																		onClick={() => handleRenameRole(role.id, tempRoleName)}
																		className="bg-accent text-accent-foreground font-bold px-2 py-0.5 text-[10px] rounded-md shrink-0 cursor-pointer"
																	>
																		Save
																	</button>
																</div>
															) : (
																<>
																	<span className="font-bold text-xs flex items-center gap-1.5 truncate">
																		{role.name}
																		{!role.isEditableName ? (
																			<span title="Locked role name (Super Admin / Admin)" className="text-muted-foreground/70">
																				<Lock size={11} />
																			</span>
																		) : (
																			<button
																				type="button"
																				onClick={(e) => {
																					e.stopPropagation();
																					setEditingRoleNameId(role.id);
																					setTempRoleName(role.name);
																				}}
																				title="Edit role name"
																				className="p-1 rounded hover:bg-slate-200 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
																			>
																				<Pencil size={11} />
																			</button>
																		)}
																	</span>
																	{isSelected && <CheckCircle2 size={14} className="text-accent shrink-0" />}
																</>
															)}
														</div>
													</div>
												);
											})}
										</div>
									</div>

									<div>
										<label className="text-xs font-bold text-primary block mb-1.5">
											Access Rules & Permissions
										</label>
										<PermissionsCategoryList currentRules={editRules} onChangeRules={setEditRules} />
									</div>
								</>
							)}

							{editType === 'Device User' && (
								<CustomSelect label="Assign Manager (optional)" value={editManagerId} onChange={setEditManagerId} options={managerOptions} description="The dashboard user emailed if this user's device stays idle." />
							)}
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

			{/* Manage Tenant Roles Modal */}
			{isRolesModalOpen && ReactDOM.createPortal(
				<div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
					<div className="bg-background border border-border/80 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center border-b border-border/60 pb-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
									<ShieldCheck size={20} />
								</div>
								<div>
									<h3 className="text-base font-bold text-primary">Tenant Roles & Access Rules</h3>
									<p className="text-xs text-muted-foreground">Manage role names and customize access permissions across your tenant</p>
								</div>
							</div>
							<button onClick={() => setIsRolesModalOpen(false)} className="w-8 h-8 rounded-full text-muted-foreground hover:text-primary hover:bg-slate-100 cursor-pointer flex items-center justify-center">
								<X size={18} />
							</button>
						</div>

						<div className="space-y-4 text-xs">
							<div className="bg-slate-100/60 p-3 rounded-xl border border-border/60 text-muted-foreground text-[11px]">
								<p className="font-semibold text-primary mb-0.5">Role Naming & Permission Rules:</p>
								<ul className="list-disc list-inside space-y-0.5">
									<li><span className="font-bold text-primary">Super Admin</span> & <span className="font-bold text-primary">Admin</span> role names are system-locked and cannot be edited.</li>
									<li><span className="font-bold text-primary">Role 1</span>, <span className="font-bold text-primary">Role 2</span>, and <span className="font-bold text-primary">Role 3</span> names can be customized.</li>
									<li>Permission rules for all 5 roles can be customized below.</li>
								</ul>
							</div>

							<div className="space-y-4">
								{tenantRoles.map((role) => (
									<div key={role.id} className="p-4 rounded-xl border border-border/80 bg-background space-y-3 shadow-2xs">
										<div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2.5">
											<div className="flex items-center gap-2">
												{editingRoleNameId === role.id ? (
													<div className="flex items-center gap-2">
														<input
															type="text"
															value={tempRoleName}
															onChange={(e) => setTempRoleName(e.target.value)}
															onKeyDown={(e) => {
																if (e.key === 'Enter') handleRenameRole(role.id, tempRoleName);
															}}
															autoFocus
															className="bg-background border border-primary rounded-lg px-2.5 py-1 text-xs font-bold text-primary focus:outline-none"
														/>
														<button
															type="button"
															onClick={() => handleRenameRole(role.id, tempRoleName)}
															className="px-2.5 py-1 bg-primary text-primary-foreground font-bold text-xs rounded-lg cursor-pointer"
														>
															Save
														</button>
													</div>
												) : (
													<>
														<span className="text-sm font-extrabold text-primary flex items-center gap-1.5">
															{role.name}
															{!role.isEditableName ? (
																<span className="text-[10px] bg-slate-200 text-muted-foreground px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
																	<Lock size={10} /> Locked
																</span>
															) : (
																<button
																	type="button"
																	onClick={() => {
																		setEditingRoleNameId(role.id);
																		setTempRoleName(role.name);
																	}}
																	className="p-1 text-muted-foreground hover:text-primary hover:bg-slate-100 rounded cursor-pointer"
																	title="Edit role name"
																>
																	<Pencil size={13} />
																</button>
															)}
														</span>
													</>
												)}
											</div>
											<span className="text-[11px] text-muted-foreground font-semibold">
												{role.rules.length} of {AVAILABLE_RULES.length} permissions enabled
											</span>
										</div>

										<PermissionsCategoryList
											currentRules={role.rules}
											onChangeRules={(nextRules) => handleSaveRoleDefaultRules(role.id, nextRules)}
										/>
									</div>
								))}
							</div>

							<div className="flex items-center justify-between pt-3 border-t border-border/60">
								<button
									type="button"
									onClick={() => {
										setTenantRoles(DEFAULT_TENANT_ROLES);
										setSuccessMsg('Reset all tenant roles to default settings.');
									}}
									className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
								>
									Reset to Factory Defaults
								</button>
								<button
									type="button"
									onClick={() => setIsRolesModalOpen(false)}
									className="px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded-xl shadow-sm hover:bg-accent cursor-pointer"
								>
									Done
								</button>
							</div>
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
								className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
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

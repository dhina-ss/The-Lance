import React, { useState } from 'react';
import {
	Check,
	Minus,
	ChevronRight,
	Monitor,
	Shield,
	Package,
	Users,
} from 'lucide-react';

export const AVAILABLE_RULES = [
	{
		id: 'telemetry_monitoring',
		label: 'Device Telemetry & Monitoring',
		desc: 'Real-time performance metrics, system hardware, network, and location',
		icon: Monitor,
		subRules: [
			{
				id: 'perf:realtime',
				label: 'Real-time Performance',
				desc: 'Monitor live CPU usage, RAM, Disk usage, and system vitals',
			},
			{
				id: 'device:hardware_identity',
				label: 'Hardware & Device Identity',
				desc: 'Inspect device manufacturer, model, serial number, processor, and RAM specs',
			},
			{
				id: 'device:os_build',
				label: 'Operating System & Build Details',
				desc: 'Inspect OS version, Windows build number, boot time, and registration date',
			},
			{
				id: 'device:network_telemetry',
				label: 'Network & Connectivity Telemetry',
				desc: 'Inspect local IP, MAC address, and 7-day network data transfer',
			},
			{
				id: 'device:precise_location',
				label: 'Precise Location',
				desc: 'View live GPS / IP device geo-coordinates and interactive location map',
			},
			{
				id: 'device:app_usage',
				label: 'Application Usage',
				desc: 'Track foreground application runtimes and daily usage analytics',
			},
		],
	},
	{
		id: 'security_controls',
		label: 'Security & Endpoint Control',
		desc: 'Startup policies, USB peripheral restrictions, web filtering, and antivirus',
		icon: Shield,
		subRules: [
			{
				id: 'control:startup_login',
				label: 'Startup Login Policy',
				desc: 'Require user authentication on each startup vs one-time activation',
			},
			{
				id: 'security:usb_control',
				label: 'USB Peripheral Control',
				desc: 'Enforce USB mass storage read/write blocking permanently or timed',
			},
			{
				id: 'security:website_filter',
				label: 'Website Content Filter',
				desc: 'Block custom domain URLs and blacklist website categories',
			},
			{
				id: 'security:antivirus_threat',
				label: 'Antivirus & Threat Protection',
				desc: 'Microsoft Defender status, real-time protection, definitions, and threat history',
			},
		],
	},
	{
		id: 'software_mgmt',
		label: 'Software Management',
		desc: 'Installed applications inventory and remote deployment',
		icon: Package,
		subRules: [
			{
				id: 'software:installed_apps',
				label: 'Installed Applications',
				desc: 'Inspect installed software packages inventory and execute remote uninstall',
			},
			{
				id: 'software:remote_push',
				label: 'Software Management & Remote Push',
				desc: 'Remotely deploy and push MSI / EXE installer packages to devices',
			},
		],
	},
	{
		id: 'user_auditing',
		label: 'User Logs & Auditing',
		desc: 'Session activity events, authentication logs, and daily timeline',
		icon: Users,
		subRules: [
			{
				id: 'users:user_logs',
				label: 'User Logs',
				desc: 'Inspect user daily session activity, authentication events, and timestamp history',
			},
		],
	},
];

export const ALL_SUBRULE_IDS = AVAILABLE_RULES.flatMap((cat) =>
	cat.subRules.map((sr) => sr.id)
);

export const ALL_PERMISSION_IDS = AVAILABLE_RULES.flatMap((cat) => [
	cat.id,
	...cat.subRules.map((sr) => sr.id),
]);

export const DEFAULT_TENANT_ROLES = [
	{
		id: 'super_admin',
		name: 'Super Admin',
		isEditableName: false,
		rules: [
			'telemetry_monitoring',
			'perf:realtime',
			'device:hardware_identity',
			'device:os_build',
			'device:network_telemetry',
			'device:precise_location',
			'device:app_usage',
			'security_controls',
			'control:startup_login',
			'security:usb_control',
			'security:website_filter',
			'security:antivirus_threat',
			'software_mgmt',
			'software:installed_apps',
			'software:remote_push',
			'user_auditing',
			'users:user_logs',
		],
		desc: 'Full administrative access across all device telemetry, security controls, software deployment, and user logs',
	},
	{
		id: 'admin',
		name: 'Admin',
		isEditableName: false,
		rules: [
			'telemetry_monitoring',
			'perf:realtime',
			'device:hardware_identity',
			'device:os_build',
			'device:network_telemetry',
			'device:precise_location',
			'device:app_usage',
			'security_controls',
			'control:startup_login',
			'security:usb_control',
			'security:website_filter',
			'security:antivirus_threat',
			'software_mgmt',
			'software:installed_apps',
			'software:remote_push',
			'user_auditing',
			'users:user_logs',
		],
		desc: 'Full administrative control over fleet telemetry, security policies, and software management',
	},
	{
		id: 'role_1',
		name: 'Role 1',
		isEditableName: true,
		rules: [
			'telemetry_monitoring',
			'perf:realtime',
			'device:hardware_identity',
			'device:os_build',
			'device:network_telemetry',
			'device:precise_location',
			'software_mgmt',
			'software:installed_apps',
			'software:remote_push',
		],
		desc: 'Customizable role for device telemetry, hardware inventory, and software deployment',
	},
	{
		id: 'role_2',
		name: 'Role 2',
		isEditableName: true,
		rules: [
			'security_controls',
			'control:startup_login',
			'security:usb_control',
			'security:website_filter',
			'security:antivirus_threat',
			'telemetry_monitoring',
			'device:precise_location',
			'user_auditing',
			'users:user_logs',
		],
		desc: 'Customizable role for security policies, endpoint protection, and user audit logs',
	},
	{
		id: 'role_3',
		name: 'Role 3',
		isEditableName: true,
		rules: [
			'telemetry_monitoring',
			'perf:realtime',
			'device:hardware_identity',
			'device:os_build',
			'device:app_usage',
			'user_auditing',
			'users:user_logs',
		],
		desc: 'Customizable view-only role for monitoring performance, application usage, and user logs',
	},
];

export function getStoredTenantRoles() {
	try {
		const saved = localStorage.getItem('ems_tenant_roles_v6');
		if (saved) {
			const parsed = JSON.parse(saved);
			if (
				Array.isArray(parsed) &&
				parsed.length > 0 &&
				parsed.some((r) => r.rules?.some((x) => x.includes('perf:realtime') || x.includes('device:') || x.includes('security:')))
			) {
				return parsed;
			}
		}
		// Reset/initialize with real application options
		localStorage.setItem('ems_tenant_roles_v6', JSON.stringify(DEFAULT_TENANT_ROLES));
		return DEFAULT_TENANT_ROLES;
	} catch {
		return DEFAULT_TENANT_ROLES;
	}
}

export function saveStoredTenantRoles(roles) {
	try {
		localStorage.setItem('ems_tenant_roles_v6', JSON.stringify(roles));
	} catch {}
}

export function isCategoryEnabled(activeRules, catId) {
	if (!activeRules) return false;
	return activeRules.includes(catId) || activeRules.some((r) => r.startsWith(catId + ':'));
}

export function getSubRuleCount(activeRules, catObj) {
	if (!activeRules || !catObj || !catObj.subRules) return 0;
	return catObj.subRules.filter((sr) =>
		activeRules.includes(sr.id) || activeRules.includes(catObj.id)
	).length;
}

export function toggleCategoryRules(activeRules, catObj) {
	const enabled = isCategoryEnabled(activeRules, catObj.id);
	const subIds = catObj.subRules.map((sr) => sr.id);
	if (enabled) {
		return activeRules.filter((r) => r !== catObj.id && !subIds.includes(r));
	} else {
		return Array.from(new Set([...activeRules, catObj.id, ...subIds]));
	}
}

export function toggleSubRulePermission(activeRules, catObj, subRuleId) {
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

/**
 * Tri-state Tree Checkbox (Checked, Indeterminate, Unchecked)
 */
function TreeCheckbox({ checked, indeterminate, onChange, ariaLabel }) {
	return (
		<button
			type="button"
			role="checkbox"
			aria-checked={indeterminate ? 'mixed' : checked}
			aria-label={ariaLabel}
			onClick={(e) => {
				e.stopPropagation();
				onChange();
			}}
			className={`w-4 h-4 rounded flex items-center justify-center transition-all cursor-pointer shrink-0 border ${
				checked || indeterminate
					? 'bg-primary border-primary text-primary-foreground shadow-2xs'
					: 'bg-background border-input hover:border-primary/60'
			}`}
		>
			{checked && <Check size={11} strokeWidth={3} />}
			{indeterminate && !checked && <Minus size={11} strokeWidth={3} />}
		</button>
	);
}

/**
 * Tree format with checkboxes for rules selection (continuous tree, only real application rules)
 */
export function PermissionsCategoryList({ currentRules = [], onChangeRules }) {
	// All categories expanded by default
	const [expandedCats, setExpandedCats] = useState(
		() => new Set(AVAILABLE_RULES.map((c) => c.id))
	);

	const activeRules = currentRules || [];

	const toggleExpand = (catId) => {
		setExpandedCats((prev) => {
			const next = new Set(prev);
			if (next.has(catId)) next.delete(catId);
			else next.add(catId);
			return next;
		});
	};

	const allExpanded = expandedCats.size === AVAILABLE_RULES.length;

	const handleToggleExpandAll = () => {
		if (allExpanded) {
			setExpandedCats(new Set());
		} else {
			setExpandedCats(new Set(AVAILABLE_RULES.map((c) => c.id)));
		}
	};

	const handleSelectAll = () => {
		onChangeRules(ALL_PERMISSION_IDS);
	};

	const handleDeselectAll = () => {
		onChangeRules([]);
	};

	const toggleCategoryAll = (cat, isAllChecked) => {
		const subIds = cat.subRules.map((sr) => sr.id);
		if (isAllChecked) {
			// Uncheck all in this category
			const next = activeRules.filter((r) => r !== cat.id && !subIds.includes(r));
			onChangeRules(next);
		} else {
			// Check all in this category
			const next = Array.from(new Set([...activeRules, cat.id, ...subIds]));
			onChangeRules(next);
		}
	};

	const toggleSubRule = (cat, subRuleId) => {
		const subIds = cat.subRules.map((sr) => sr.id);
		const isCurrentlyActive = activeRules.includes(subRuleId);
		let next;
		if (isCurrentlyActive) {
			const remaining = activeRules.filter((r) => r !== subRuleId);
			const anyRemaining = subIds.some((id) => id !== subRuleId && remaining.includes(id));
			if (!anyRemaining) {
				next = remaining.filter((r) => r !== cat.id);
			} else {
				next = remaining;
			}
		} else {
			next = Array.from(new Set([...activeRules, cat.id, subRuleId]));
		}
		onChangeRules(next);
	};

	const activeSubCount = ALL_SUBRULE_IDS.filter((id) => activeRules.includes(id)).length;
	const totalSubCount = ALL_SUBRULE_IDS.length;

	return (
		<div className="border border-border/80 rounded-2xl bg-background overflow-hidden shadow-2xs">
			{/* Tree Toolbar Header */}
			<div className="bg-slate-50/90 border-b border-border/60 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap">
				<div className="flex items-center gap-2">
					<span className="text-xs font-bold text-primary">Permissions Tree</span>
					<span className="text-[11px] font-bold text-primary/90 bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
						{activeSubCount} of {totalSubCount} selected
					</span>
				</div>

				<div className="flex items-center gap-1.5 text-xs">
					<button
						type="button"
						onClick={handleSelectAll}
						className="px-2.5 py-1 text-primary hover:bg-slate-200/70 rounded-lg font-bold transition-colors cursor-pointer"
					>
						Select All
					</button>
					<span className="text-border/80">|</span>
					<button
						type="button"
						onClick={handleDeselectAll}
						className="px-2.5 py-1 text-muted-foreground hover:text-primary hover:bg-slate-200/70 rounded-lg font-bold transition-colors cursor-pointer"
					>
						Deselect All
					</button>
					<span className="text-border/80">|</span>
					<button
						type="button"
						onClick={handleToggleExpandAll}
						className="px-2.5 py-1 text-muted-foreground hover:text-primary hover:bg-slate-200/70 rounded-lg font-bold transition-colors cursor-pointer"
					>
						{allExpanded ? 'Collapse All' : 'Expand All'}
					</button>
				</div>
			</div>

			{/* Tree Content Body - Continuous single tree without separate boxed sections */}
			<div className="divide-y divide-border/40 max-h-[500px] overflow-y-auto">
				{AVAILABLE_RULES.map((cat) => {
					const isExpanded = expandedCats.has(cat.id);
					const subIds = cat.subRules.map((sr) => sr.id);
					const activeCatSubs = subIds.filter((id) => activeRules.includes(id)).length;
					const isAllChecked = activeCatSubs === subIds.length;
					const isIndeterminate = activeCatSubs > 0 && activeCatSubs < subIds.length;
					const isChecked = isAllChecked;
					const IconComponent = cat.icon || Monitor;

					return (
						<div key={cat.id} className="transition-colors">
							{/* Category Tree Branch Row */}
							<div
								onClick={() => toggleExpand(cat.id)}
								className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50/90 cursor-pointer select-none transition-colors"
							>
								<div className="flex items-center gap-2.5 min-w-0 flex-1">
									{/* Expand / Collapse toggle chevron */}
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											toggleExpand(cat.id);
										}}
										className="w-5 h-5 rounded hover:bg-slate-200/80 flex items-center justify-center text-muted-foreground cursor-pointer transition-colors shrink-0"
										title={isExpanded ? 'Collapse category' : 'Expand category'}
									>
										<ChevronRight
											size={14}
											className={`transition-transform duration-200 ${
												isExpanded ? 'rotate-90 text-primary' : ''
											}`}
										/>
									</button>

									{/* Category Tri-State Checkbox */}
									<TreeCheckbox
										checked={isChecked}
										indeterminate={isIndeterminate}
										onChange={() => toggleCategoryAll(cat, isAllChecked)}
										ariaLabel={`Toggle all permissions for ${cat.label}`}
									/>

									{/* Category Icon & Label */}
									<div className="flex items-center gap-2 min-w-0">
										<div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
											<IconComponent size={13} />
										</div>
										<span className="text-xs font-bold text-primary truncate">
											{cat.label}
										</span>
										<span className="text-[11px] text-muted-foreground hidden md:inline truncate opacity-75">
											• {cat.desc}
										</span>
									</div>
								</div>

								{/* Counter Badge */}
								<div className="flex items-center gap-2 shrink-0 ml-2">
									<span
										className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
											isAllChecked
												? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30'
												: isIndeterminate
												? 'bg-primary/10 text-primary border border-primary/20'
												: 'bg-slate-100 text-muted-foreground border border-border/40'
										}`}
									>
										{activeCatSubs} / {subIds.length}
									</span>
								</div>
							</div>

							{/* Tree Leaves: Indented Sub-Rules directly inside the continuous tree */}
							{isExpanded && (
								<div className="ml-10 mr-4 mb-2 pl-4 border-l-2 border-primary/20 space-y-0.5 pt-1">
									{cat.subRules.map((sub) => {
										const isSubChecked = activeRules.includes(sub.id);

										return (
											<div
												key={sub.id}
												onClick={() => toggleSubRule(cat, sub.id)}
												className="flex items-center gap-2.5 py-1.5 px-2.5 rounded-lg hover:bg-slate-100/70 cursor-pointer select-none transition-colors group"
											>
												<TreeCheckbox
													checked={isSubChecked}
													indeterminate={false}
													onChange={() => toggleSubRule(cat, sub.id)}
													ariaLabel={`Toggle permission ${sub.label}`}
												/>

												<div className="flex items-center gap-2 min-w-0 flex-1">
													<span
														className={`text-xs ${
															isSubChecked
																? 'text-primary font-bold'
																: 'text-slate-600 font-medium'
														}`}
													>
														{sub.label}
													</span>
													<span className="text-[11px] text-muted-foreground hidden sm:inline truncate opacity-75">
														— {sub.desc}
													</span>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

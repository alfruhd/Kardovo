import React, { useState, useMemo, useEffect } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmationModal from '@/Components/ConfirmationModal';
import { 
    validateEmail, 
    validatePhone, 
    validatePassword,
    generateStrongPassword,
    validateRequired 
} from '@/Utils/validation';
import { 
    Users, 
    Smartphone, 
    UserCheck, 
    Search, 
    Plus, 
    Edit, 
    Trash2, 
    Check, 
    X, 
    Calendar, 
    Lock, 
    Building2, 
    Shield, 
    MapPin, 
    CheckCircle2, 
    XCircle,
    SlidersHorizontal,
    FileSpreadsheet,
    Send,
    Palette,
    Download,
    Sparkles,
    ShieldCheck,
    ShieldAlert,
    Crown,
    CheckCheck,
    ArrowRight
} from 'lucide-react';

export default function UsersPage({
    isSuperAdmin = true,
    isSubAdmin = false,
    customers = [],
    gateStaff = [],
    subAdmins = [],
    allEvents = [],
}) {
    const { url } = usePage();
    const [userCategory, setUserCategory] = useState('customers'); // 'customers' | 'scanners' | 'sub_admins'
    
    // Sync category from URL if present
    useEffect(() => {
        try {
            const search = url && url.includes('?') ? url.split('?')[1] : (typeof window !== 'undefined' ? window.location.search.replace(/^\?/, '') : '');
            const params = new URLSearchParams(search);
            const cat = params.get('category') || params.get('sub');
            if (cat && ['customers', 'scanners', 'sub_admins'].includes(cat)) {
                setUserCategory(cat);
            }
        } catch (e) {
            console.error(e);
        }
    }, [url]);

    const handleCategoryChange = (category) => {
        setUserCategory(category);
        if (typeof window !== 'undefined') {
            const urlObj = new URL(window.location.href);
            urlObj.searchParams.set('category', category);
            window.history.replaceState({}, '', urlObj.toString());
        }
    };

    // Searches
    const [customerSearch, setCustomerSearch] = useState('');
    const [staffSearch, setStaffSearch] = useState('');
    const [subAdminSearch, setSubAdminSearch] = useState('');

    // Modal Visibility States
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [createScannerModalOpen, setCreateScannerModalOpen] = useState(false);
    const [editingScanner, setEditingScanner] = useState(null);
    const [subAdminModalOpen, setSubAdminModalOpen] = useState(false);
    const [editingSubAdmin, setEditingSubAdmin] = useState(null);

    // Confirmation Modal
    const [confirmModal, setConfirmModal] = useState({
        show: false,
        title: '',
        message: '',
        warning: '',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
        loading: false,
        onConfirm: () => {},
    });

    const DEFAULT_ORGANIZER_PERMS = {
        can_create_events: true,
        can_import_guests: true,
        can_send_broadcasts: true,
        can_customize_templates: true,
        can_manage_scanners: true,
        can_export_data: true,
    };

    // Client-side validation errors
    const [customerClientErrors, setCustomerClientErrors] = useState({});
    const [editCustomerClientErrors, setEditCustomerClientErrors] = useState({});
    const [scannerClientErrors, setScannerClientErrors] = useState({});
    const [editScannerClientErrors, setEditScannerClientErrors] = useState({});
    const [subAdminClientErrors, setSubAdminClientErrors] = useState({});

    // ================= FORMS =================
    // 1. Organiser / Customer Forms
    const customerForm = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        password: '',
        role: 'customer',
        status: 'active',
        max_events_limit: '',
        max_whatsapp_limit: '',
        max_sms_limit: '',
        has_payment_override: false,
        permissions: { ...DEFAULT_ORGANIZER_PERMS },
    });

    const editCustomerForm = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        password: '',
        role: 'customer',
        status: 'active',
        max_events_limit: '',
        max_whatsapp_limit: '',
        max_sms_limit: '',
        has_payment_override: false,
        suspension_reason: '',
        permissions: { ...DEFAULT_ORGANIZER_PERMS },
    });

    // 2. Scanner / Gate Staff Forms
    const createScannerForm = useForm({
        name: '',
        email: '',
        phone: '',
        gate_label: '',
        customer_id: customers[0]?.id || '',
        password: '',
    });

    const editScannerForm = useForm({
        name: '',
        email: '',
        phone: '',
        gate_label: '',
        customer_id: '',
        password: '',
    });

    // 3. Sub Admin Forms
    const createSubAdminForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        organizer_ids: [],
        event_ids: [],
    });

    const editSubAdminForm = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        organizer_ids: [],
        event_ids: [],
    });

    // ================= FILTERED LISTS =================
    const filteredCustomers = useMemo(() => {
        if (!customerSearch.trim()) return customers;
        const q = customerSearch.toLowerCase();
        return customers.filter(c => 
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q) ||
            c.company?.toLowerCase().includes(q) ||
            c.phone?.includes(q) ||
            c.role?.toLowerCase().includes(q)
        );
    }, [customers, customerSearch]);

    const filteredStaff = useMemo(() => {
        if (!staffSearch.trim()) return gateStaff;
        const q = staffSearch.toLowerCase();
        return gateStaff.filter(s => 
            s.name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.gate_label?.toLowerCase().includes(q) ||
            s.customer?.name?.toLowerCase().includes(q)
        );
    }, [gateStaff, staffSearch]);

    const filteredSubAdmins = useMemo(() => {
        if (!subAdminSearch.trim()) return subAdmins;
        const q = subAdminSearch.toLowerCase();
        return subAdmins.filter(s =>
            s.name?.toLowerCase().includes(q) ||
            s.email?.toLowerCase().includes(q) ||
            s.phone?.includes(q) ||
            s.assigned_organizers?.some(o => o.name?.toLowerCase().includes(q)) ||
            s.assigned_events?.some(e => e.title?.toLowerCase().includes(q))
        );
    }, [subAdmins, subAdminSearch]);

    // ================= HANDLERS =================
    // Customer Handlers
    const handleCreateCustomer = (e) => {
        e.preventDefault();
        const errs = {};
        if (!validateRequired(customerForm.data.name, 2)) {
            errs.name = 'Organizer name must be at least 2 characters.';
        }
        if (!customerForm.data.email && !customerForm.data.phone) {
            errs.email = 'Please provide either an email address or a phone number.';
        } else if (customerForm.data.email && !validateEmail(customerForm.data.email)) {
            errs.email = 'Please provide a valid email address.';
        }
        if (customerForm.data.phone && !validatePhone(customerForm.data.phone)) {
            errs.phone = 'Please provide a valid phone number (e.g. +255 712 345 678).';
        }
        const pwdCheck = validatePassword(customerForm.data.password);
        if (!customerForm.data.password || !pwdCheck.isStrong) {
            errs.password = 'Initial password must be strong (min 8 chars, uppercase, lowercase, numbers & symbols).';
        }

        if (Object.keys(errs).length > 0) {
            setCustomerClientErrors(errs);
            return;
        }

        setCustomerClientErrors({});
        customerForm.post(route('admin.storeCustomer'), {
            onSuccess: () => {
                setCustomerModalOpen(false);
                customerForm.reset();
            }
        });
    };

    const openEditCustomerModal = (customer) => {
        setEditingCustomer(customer);
        setEditCustomerClientErrors({});
        editCustomerForm.clearErrors();
        const perms = customer.effective_permissions || customer.permissions || DEFAULT_ORGANIZER_PERMS;
        editCustomerForm.setData({
            name: customer.name || '',
            email: (customer.email && !customer.email.endsWith('@phone.kardovo.com')) ? customer.email : '',
            phone: customer.phone || '',
            company: customer.company || '',
            password: '',
            role: customer.role || 'customer',
            status: customer.status || 'active',
            max_events_limit: customer.max_events_limit ?? '',
            max_whatsapp_limit: customer.max_whatsapp_limit ?? customer.message_quotas?.whatsapp_limit ?? '',
            max_sms_limit: customer.max_sms_limit ?? customer.message_quotas?.sms_limit ?? '',
            has_payment_override: customer.has_payment_override || false,
            suspension_reason: customer.suspension_reason || '',
            permissions: {
                can_create_events: perms.can_create_events !== false,
                can_import_guests: perms.can_import_guests !== false,
                can_send_broadcasts: perms.can_send_broadcasts !== false,
                can_customize_templates: perms.can_customize_templates !== false,
                can_manage_scanners: perms.can_manage_scanners !== false,
                can_export_data: perms.can_export_data !== false,
            },
        });
    };

    const handleUpdateCustomer = (e) => {
        e.preventDefault();
        if (!editingCustomer) return;

        const errs = {};
        if (!validateRequired(editCustomerForm.data.name, 2)) {
            errs.name = 'Organizer name must be at least 2 characters.';
        }
        if (!editCustomerForm.data.email && !editCustomerForm.data.phone) {
            errs.email = 'Please provide either an email address or a phone number.';
        } else if (editCustomerForm.data.email && !validateEmail(editCustomerForm.data.email)) {
            errs.email = 'Please provide a valid email address.';
        }
        if (editCustomerForm.data.phone && !validatePhone(editCustomerForm.data.phone)) {
            errs.phone = 'Please provide a valid phone number (e.g. +255 712 345 678).';
        }
        if (editCustomerForm.data.password) {
            const pwdCheck = validatePassword(editCustomerForm.data.password);
            if (!pwdCheck.isStrong) {
                errs.password = 'New password must be strong (min 8 chars, uppercase, lowercase, numbers & symbols).';
            }
        }

        if (Object.keys(errs).length > 0) {
            setEditCustomerClientErrors(errs);
            return;
        }

        setEditCustomerClientErrors({});
        editCustomerForm.put(route('admin.updateCustomer', editingCustomer.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingCustomer(null);
                editCustomerForm.reset();
            },
            onError: (errors) => {
                console.error('Governance update error:', errors);
            }
        });
    };

    const handleDeleteCustomer = (customer) => {
        setConfirmModal({
            show: true,
            title: 'Delete Customer?',
            message: `Delete customer "${customer.name}" and all their events?`,
            warning: 'This cannot be undone.',
            confirmText: 'Delete',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('admin.destroyCustomer', customer.id), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    // Scanner Handlers
    const handleCreateScanner = (e) => {
        e.preventDefault();
        const errs = {};
        if (!validateRequired(createScannerForm.data.name, 2)) {
            errs.name = 'Name is required.';
        }
        if (!validateEmail(createScannerForm.data.email)) {
            errs.email = 'Valid email is required.';
        }
        if (createScannerForm.data.phone && !validatePhone(createScannerForm.data.phone)) {
            errs.phone = 'Valid phone is required.';
        }
        if (!validateRequired(createScannerForm.data.gate_label, 2)) {
            errs.gate_label = 'Gate assignment label is required.';
        }
        const pwdCheck = validatePassword(createScannerForm.data.password);
        if (!createScannerForm.data.password || !pwdCheck.isStrong) {
            errs.password = 'Initial password must be strong (min 8 chars).';
        }

        if (Object.keys(errs).length > 0) {
            setScannerClientErrors(errs);
            return;
        }

        setScannerClientErrors({});
        createScannerForm.post(route('admin.storeScanner'), {
            onSuccess: () => {
                setCreateScannerModalOpen(false);
                createScannerForm.reset();
            }
        });
    };

    const openEditScannerModal = (scanner) => {
        setEditingScanner(scanner);
        setEditScannerClientErrors({});
        editScannerForm.setData({
            name: scanner.name,
            email: scanner.email,
            phone: scanner.phone || '',
            gate_label: scanner.gate_label || 'Gate 1 — Main VIP Entrance',
            customer_id: scanner.customer_id || '',
            password: '',
        });
    };

    const handleUpdateScanner = (e) => {
        e.preventDefault();
        if (!editingScanner) return;

        const errs = {};
        if (!validateRequired(editScannerForm.data.name, 2)) {
            errs.name = 'Gate staff name must be at least 2 characters.';
        }
        if (!validateEmail(editScannerForm.data.email)) {
            errs.email = 'Please provide a valid email address.';
        }
        if (editScannerForm.data.phone && !validatePhone(editScannerForm.data.phone)) {
            errs.phone = 'Please provide a valid phone number (e.g. +255 712 345 678).';
        }
        if (!validateRequired(editScannerForm.data.gate_label, 2)) {
            errs.gate_label = 'Gate assignment label is required.';
        }
        if (editScannerForm.data.password) {
            const pwdCheck = validatePassword(editScannerForm.data.password);
            if (!pwdCheck.isStrong) {
                errs.password = 'New password must be strong (min 8 chars, uppercase, lowercase, numbers & symbols).';
            }
        }

        if (Object.keys(errs).length > 0) {
            setEditScannerClientErrors(errs);
            return;
        }

        setEditScannerClientErrors({});
        editScannerForm.put(route('admin.updateScanner', editingScanner.id), {
            onSuccess: () => {
                setEditingScanner(null);
                editScannerForm.reset();
            }
        });
    };

    const handleDeleteScanner = (scanner) => {
        setConfirmModal({
            show: true,
            title: 'Delete Gate Staff?',
            message: `Delete gate staff account "${scanner.name}"?`,
            warning: 'They will no longer be able to scan passes.',
            confirmText: 'Delete',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('admin.destroyScanner', scanner.id), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    // Sub-Admin Handlers
    const handleCreateSubAdmin = (e) => {
        e.preventDefault();
        const errs = {};
        if (!validateRequired(createSubAdminForm.data.name, 2)) {
            errs.name = 'Name is required.';
        }
        if (!validateEmail(createSubAdminForm.data.email)) {
            errs.email = 'Valid email is required.';
        }
        if (createSubAdminForm.data.phone && !validatePhone(createSubAdminForm.data.phone)) {
            errs.phone = 'Valid phone is required.';
        }
        const pwdCheck = validatePassword(createSubAdminForm.data.password);
        if (!createSubAdminForm.data.password || !pwdCheck.isStrong) {
            errs.password = 'Min 8 chars with uppercase, lowercase, numbers & symbols.';
        }

        if (Object.keys(errs).length > 0) {
            setSubAdminClientErrors(errs);
            return;
        }

        setSubAdminClientErrors({});
        createSubAdminForm.post(route('admin.storeSubAdmin'), {
            onSuccess: () => {
                setSubAdminModalOpen(false);
                createSubAdminForm.reset();
            }
        });
    };

    const openEditSubAdminModal = (subAdmin) => {
        setEditingSubAdmin(subAdmin);
        editSubAdminForm.setData({
            name: subAdmin.name || '',
            email: subAdmin.email || '',
            phone: subAdmin.phone || '',
            password: '',
            organizer_ids: subAdmin.assigned_organizers?.map(o => o.id) || [],
            event_ids: subAdmin.assigned_events?.map(ev => ev.id) || [],
        });
    };

    const handleUpdateSubAdmin = (e) => {
        e.preventDefault();
        if (!editingSubAdmin) return;
        editSubAdminForm.put(route('admin.updateSubAdmin', editingSubAdmin.id), {
            onSuccess: () => {
                setEditingSubAdmin(null);
                editSubAdminForm.reset();
            }
        });
    };

    const handleDeleteSubAdmin = (subAdmin) => {
        setConfirmModal({
            show: true,
            title: 'Delete Sub-Admin?',
            message: `Delete sub-admin account "${subAdmin.name}"?`,
            warning: 'This cannot be undone.',
            confirmText: 'Delete',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('admin.destroySubAdmin', subAdmin.id), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    return (
        <KardovoAppLayout
            title="User Governance & Fleet"
            headerActions={
                <div className="flex items-center gap-2">
                    <Link
                        href={route('admin.dashboard')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95"
                    >
                        <Shield className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Operations Center</span>
                    </Link>
                </div>
            }
        >
            <Head title="User Governance - Kardovo Admin" />

            <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/60 dark:border-white/[0.06]">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-2.5">
                            <Users className="w-6 h-6 text-[#16A34A]" />
                            User Governance Directory
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Unified directory for event organizers, gate staff scanner fleet, and delegated sub-administrators.
                        </p>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.06]">
                        <button
                            type="button"
                            onClick={() => handleCategoryChange('customers')}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                userCategory === 'customers'
                                    ? 'bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white font-bold shadow-xs'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Organisers</span>
                            <span className="text-[10.5px] font-mono opacity-70">({customers.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => handleCategoryChange('scanners')}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                userCategory === 'scanners'
                                    ? 'bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white font-bold shadow-xs'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Gate Staff</span>
                            <span className="text-[10.5px] font-mono opacity-70">({gateStaff.length})</span>
                        </button>

                        {isSuperAdmin && (
                            <button
                                type="button"
                                onClick={() => handleCategoryChange('sub_admins')}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                                    userCategory === 'sub_admins'
                                        ? 'bg-white dark:bg-white/[0.12] text-slate-900 dark:text-white font-bold shadow-xs'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                                <span>Sub Admins</span>
                                <span className="text-[10.5px] font-mono opacity-70">({subAdmins.length})</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* ================= TAB 1: ORGANISERS / CUSTOMERS ================= */}
                {userCategory === 'customers' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        {/* Table Header / Action Bar */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                            Organisers Directory
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
                                            {filteredCustomers.length} total
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Host accounts managing event passes and guest dispatch campaigns.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search organisers..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 w-full sm:w-56"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCustomerModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Create Organiser</span>
                                </button>
                            </div>
                        </div>

                        {/* Organisers Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 dark:bg-white/[0.02] text-[10.5px] uppercase font-bold text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08] font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                        <th className="py-3 px-4 font-bold text-left">Organiser</th>
                                        <th className="py-3 px-4 font-bold text-left">Role</th>
                                        <th className="py-3 px-4 font-bold text-left">Status</th>
                                        <th className="py-3 px-4 font-bold text-left">Permissions</th>
                                        <th className="py-3 px-4 font-bold text-center">Events</th>
                                        <th className="py-3 px-4 font-bold text-center">Fleet</th>
                                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] font-medium">
                                    {filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                                                No organisers found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredCustomers.map((c) => {
                                            const perms = c.effective_permissions || c.permissions || DEFAULT_ORGANIZER_PERMS;
                                            const isSuspended = c.status === 'suspended';
                                            const role = c.role || 'customer';

                                            return (
                                                <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition">
                                                    {/* Contact */}
                                                    <td className="py-3.5 px-4 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative flex-shrink-0">
                                                                {c.avatar ? (
                                                                    <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xs bg-slate-100 dark:bg-slate-800">
                                                                        <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-9 h-9 rounded-xl font-bold font-mono flex items-center justify-center text-xs border border-slate-200/80 dark:border-white/[0.08] bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-100 shadow-2xs">
                                                                        {c.name.charAt(0).toUpperCase()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-slate-900 dark:text-white text-sm truncate flex items-center gap-1.5">
                                                                    <span>{c.name}</span>
                                                                    {c.company && (
                                                                        <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate">
                                                                            ({c.company})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                                                    {c.email && !c.email.endsWith('@phone.kardovo.com') ? (
                                                                        <>
                                                                            <span className="truncate">{c.email}</span>
                                                                            {c.phone && <span className="flex-shrink-0 text-slate-400 dark:text-slate-500">• {c.phone}</span>}
                                                                        </>
                                                                    ) : (
                                                                        <span className="truncate flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                                                                            <Smartphone className="w-3 h-3 text-emerald-500" />
                                                                            {c.phone || c.email}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Role */}
                                                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-white/[0.08] text-[10.5px] font-bold uppercase tracking-wider font-mono">
                                                            {role === 'admin' ? (
                                                                <>
                                                                    <Crown className="w-3 h-3 text-amber-500" />
                                                                    <span>Admin</span>
                                                                </>
                                                            ) : role === 'sub_admin' ? (
                                                                <>
                                                                    <ShieldCheck className="w-3 h-3 text-sky-500" />
                                                                    <span>Sub-Admin</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Users className="w-3 h-3 text-emerald-500" />
                                                                    <span>Organiser</span>
                                                                </>
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                        {isSuspended ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                                                <span>Suspended</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                                <span>Active</span>
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Permissions Matrix */}
                                                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                        {role === 'admin' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold font-mono border border-emerald-500/20">
                                                                <Crown className="w-3 h-3" />
                                                                <span>Unrestricted</span>
                                                            </span>
                                                        ) : isSuspended ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-rose-600 dark:text-rose-400 text-[11px] font-medium font-mono border border-slate-200/70 dark:border-white/[0.08]">
                                                                <XCircle className="w-3 h-3 text-rose-500" />
                                                                <span>Access Suspended</span>
                                                            </span>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08]">
                                                                {[
                                                                    { key: 'can_create_events', label: 'Event Creation & Hosting', icon: Calendar },
                                                                    { key: 'can_import_guests', label: 'Guest Import & Registration', icon: FileSpreadsheet },
                                                                    { key: 'can_send_broadcasts', label: 'WhatsApp & SMS Campaigns', icon: Send },
                                                                    { key: 'can_customize_templates', label: '4K Card Design Studio', icon: Palette },
                                                                    { key: 'can_manage_scanners', label: 'Gate Scanner Staff Fleet', icon: Smartphone },
                                                                    { key: 'can_export_data', label: 'Audit & Data Export', icon: Download },
                                                                ].map((p) => {
                                                                    const allowed = perms[p.key] !== false;
                                                                    const IconComp = p.icon;
                                                                    return (
                                                                        <div
                                                                            key={p.key}
                                                                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                                                                allowed
                                                                                    ? 'bg-white dark:bg-white/[0.1] text-slate-900 dark:text-white shadow-2xs border border-slate-200/80 dark:border-white/10'
                                                                                    : 'bg-transparent text-slate-300 dark:text-slate-700'
                                                                            }`}
                                                                            title={`${p.label}: ${allowed ? 'Enabled' : 'Disabled'}`}
                                                                        >
                                                                            <IconComp className="w-3 h-3" />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Events Count */}
                                                    <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                                                        <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                                                            {c.events_count || 0}
                                                        </span>
                                                    </td>

                                                    {/* Fleet / Scanners Count */}
                                                    <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                                                        <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                                                            {c.scanners_count || 0}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 px-4 align-middle text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditCustomerModal(c)}
                                                                className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                                title="Edit Organiser"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteCustomer(c)}
                                                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                                title="Delete Customer Account"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
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
                )}

                {/* ================= TAB 2: GATE STAFF (SCANNERS) ================= */}
                {userCategory === 'scanners' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        {/* Table Header / Action Bar */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                            Gate Staff Fleet
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
                                            {filteredStaff.length} active
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Field scanner operators stationed at event checkpoints.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search staff, gates..."
                                        value={staffSearch}
                                        onChange={(e) => setStaffSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 w-full sm:w-56"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCreateScannerModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Create Gate Staff</span>
                                </button>
                            </div>
                        </div>

                        {/* Gate Staff Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 dark:bg-white/[0.02] text-[10.5px] uppercase font-bold text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08] font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                        <th className="py-3 px-4 font-bold text-left">Staff Member</th>
                                        <th className="py-3 px-4 font-bold text-left">Gate Assigned</th>
                                        <th className="py-3 px-4 font-bold text-left">Organiser Account</th>
                                        <th className="py-3 px-4 font-bold text-center">Total Scanned</th>
                                        <th className="py-3 px-4 font-bold text-center">Verified / Denied</th>
                                        <th className="py-3 px-5 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] font-medium">
                                    {filteredStaff.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                                No gate staff found matching your filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStaff.map((st) => {
                                            const total = st.total_scans_count || 0;
                                            const granted = st.granted_scans_count || 0;

                                            return (
                                                <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition">
                                                    <td className="py-3.5 px-4 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 font-bold font-mono flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                                                                {st.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{st.name}</div>
                                                                <div className="font-mono text-slate-500 dark:text-slate-400 text-[11px] truncate">{st.email}</div>
                                                                {st.phone && <div className="text-[10px] text-slate-400 truncate">{st.phone}</div>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] text-slate-700 dark:text-slate-300 font-medium text-xs">
                                                            <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                                            <span>{st.gate_label || 'Main Entrance'}</span>
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 align-middle">
                                                        <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                                            {st.customer?.name || 'All Events / Global Platform'}
                                                        </div>
                                                        {st.customer?.company && (
                                                            <div className="text-[10.5px] text-slate-400 truncate">{st.customer.company}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                                                        <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08] font-mono font-black text-xs text-slate-800 dark:text-white">
                                                            {total}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 align-middle whitespace-nowrap text-center">
                                                        <div className="inline-flex items-center gap-1.5 text-xs font-bold font-mono">
                                                            <span className="text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/50">
                                                                <Check className="w-3 h-3 stroke-[3]" /> {granted}
                                                            </span>
                                                            <span className="text-rose-600 dark:text-rose-400 inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-800/50">
                                                                <X className="w-3 h-3 stroke-[3]" /> {st.rejected_scans_count || 0}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-5 align-middle text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditScannerModal(st)}
                                                                className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                                title="Edit Gate Staff Account"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDeleteScanner(st)}
                                                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                                                                title="Delete Gate Staff Account"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
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
                )}

                {/* ================= TAB 3: SUB ADMINS ================= */}
                {isSuperAdmin && userCategory === 'sub_admins' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        {/* Table Header / Action Bar */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-800/50 flex items-center justify-center text-sky-600 dark:text-sky-400 shadow-2xs">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                            Delegated Sub-Administrators
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300">
                                            {filteredSubAdmins.length} active
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Team accounts with scoped oversight across specific event hosts and operations.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search sub-admins..."
                                        value={subAdminSearch}
                                        onChange={(e) => setSubAdminSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 w-full sm:w-56"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSubAdminModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Create Sub-Admin</span>
                                </button>
                            </div>
                        </div>

                        {/* Sub Admins Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/70 dark:bg-white/[0.02] text-[10.5px] uppercase font-bold text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08] font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                        <th className="py-3 px-4 font-bold text-left">Administrator</th>
                                        <th className="py-3 px-4 font-bold text-left">Phone Number</th>
                                        <th className="py-3 px-4 font-bold text-left">Assigned Organisers</th>
                                        <th className="py-3 px-4 font-bold text-left">Assigned Events</th>
                                        <th className="py-3 px-4 font-bold text-left">Role</th>
                                        <th className="py-3 px-5 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] font-medium">
                                    {filteredSubAdmins.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                                No sub administrators found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubAdmins.map((admin) => (
                                            <tr key={admin.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition">
                                                <td className="py-3.5 px-4 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 font-bold font-mono flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                                                            {admin.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-bold text-slate-900 dark:text-white text-sm truncate">
                                                                {admin.name}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">{admin.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 align-middle text-slate-600 dark:text-slate-300 font-mono text-xs whitespace-nowrap">
                                                    {admin.phone || '—'}
                                                </td>
                                                <td className="py-3.5 px-4 align-middle">
                                                    {admin.assigned_organizers && admin.assigned_organizers.length > 0 ? (
                                                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                                                            {admin.assigned_organizers.map(org => (
                                                                <span key={org.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 text-[10.5px] font-medium border border-slate-200/70 dark:border-white/[0.08]">
                                                                    <Users className="w-2.5 h-2.5 text-slate-400" />
                                                                    <span>{org.name}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">None assigned</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 align-middle">
                                                    {admin.assigned_events && admin.assigned_events.length > 0 ? (
                                                        <div className="flex flex-wrap items-center gap-1 max-w-xs">
                                                            {admin.assigned_events.map(ev => (
                                                                <span key={ev.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 text-[10.5px] font-medium border border-slate-200/70 dark:border-white/[0.08]">
                                                                    <Calendar className="w-2.5 h-2.5 text-slate-400" />
                                                                    <span className="truncate max-w-[120px]">{ev.title}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">None assigned</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-white/[0.08] text-[10.5px] font-bold uppercase tracking-wider font-mono shadow-2xs">
                                                        <ShieldCheck className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                        <span>Sub-Admin</span>
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 align-middle text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditSubAdminModal(admin)}
                                                            className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                            title="Edit Sub Admin & Assignments"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteSubAdmin(admin)}
                                                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                                                            title="Delete Sub Admin"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* ========================================================================= */}
            {/* ========================== MODALS SECTION =============================== */}
            {/* ========================================================================= */}

            {/* 1. Modal: Create Organiser (Customer) */}
            <Modal show={customerModalOpen} onClose={() => setCustomerModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleCreateCustomer} className="p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <Users className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                Create New Organiser Account
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCustomerModalOpen(false)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1">
                        {/* Basic Identity Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Full Name *" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="e.g. Neema Baraka"
                                    value={customerForm.data.name}
                                    onChange={(e) => {
                                        customerForm.setData('name', e.target.value);
                                        if (customerClientErrors.name) setCustomerClientErrors(prev => ({ ...prev, name: undefined }));
                                    }}
                                    hasError={Boolean(customerClientErrors.name || customerForm.errors.name)}
                                    required
                                />
                                <InputError message={customerClientErrors.name || customerForm.errors.name} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Email Address (Optional if Phone provided)" />
                                <TextInput
                                    type="email"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="e.g. neema@events.co.tz"
                                    value={customerForm.data.email}
                                    onChange={(e) => {
                                        customerForm.setData('email', e.target.value);
                                        if (customerClientErrors.email) setCustomerClientErrors(prev => ({ ...prev, email: undefined }));
                                    }}
                                    hasError={Boolean(customerClientErrors.email || customerForm.errors.email)}
                                    required={!customerForm.data.phone}
                                />
                                <InputError message={customerClientErrors.email || customerForm.errors.email} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Company" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="e.g. Pristine Events"
                                    value={customerForm.data.company}
                                    onChange={(e) => customerForm.setData('company', e.target.value)}
                                />
                                <InputError message={customerForm.errors.company} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Phone Number (Optional if Email provided)" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    placeholder="e.g. +255 712 345 678"
                                    value={customerForm.data.phone}
                                    onChange={(e) => {
                                        customerForm.setData('phone', e.target.value);
                                        if (customerClientErrors.phone) setCustomerClientErrors(prev => ({ ...prev, phone: undefined }));
                                    }}
                                    hasError={Boolean(customerClientErrors.phone || customerForm.errors.phone)}
                                />
                                <InputError message={customerClientErrors.phone || customerForm.errors.phone} className="mt-1" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel value="Password *" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const pwd = generateStrongPassword(16);
                                            customerForm.setData('password', pwd);
                                            if (customerClientErrors.password) setCustomerClientErrors(prev => ({ ...prev, password: undefined }));
                                        }}
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40"
                                    >
                                        <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Suggest</span>
                                    </button>
                                </div>
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    placeholder="Enter password"
                                    value={customerForm.data.password}
                                    onChange={(e) => {
                                        customerForm.setData('password', e.target.value);
                                        if (customerClientErrors.password) setCustomerClientErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                    hasError={Boolean(customerClientErrors.password || customerForm.errors.password)}
                                    required
                                />
                                <InputError message={customerClientErrors.password || customerForm.errors.password} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Role *" />
                                <select
                                    value={customerForm.data.role}
                                    onChange={(e) => customerForm.setData('role', e.target.value)}
                                    className="mt-1 block w-full text-xs font-bold rounded-xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="customer">🏢 Organiser</option>
                                    <option value="sub_admin">🛡️ Sub-Admin</option>
                                    <option value="admin">👑 Super Admin</option>
                                    <option value="scanner">📱 Gate Scanner</option>
                                </select>
                            </div>
                        </div>

                        {/* Status & Limits */}
                        <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60 dark:border-white/[0.04]">
                                <InputLabel value="Account Status" className="!mb-0" />
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => customerForm.setData('status', 'active')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                                            customerForm.data.status === 'active'
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60'
                                                : 'bg-white dark:bg-[#08121E] text-slate-500 border-slate-200 dark:border-white/[0.08] hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${customerForm.data.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        <span>Active</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => customerForm.setData('status', 'suspended')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                                            customerForm.data.status === 'suspended'
                                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800/60'
                                                : 'bg-white dark:bg-[#08121E] text-slate-500 border-slate-200 dark:border-white/[0.08] hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${customerForm.data.status === 'suspended' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                                        <span>Suspended</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <InputLabel value="Events Limit" />
                                    <TextInput
                                        type="number"
                                        min="1"
                                        placeholder="Unlimited"
                                        className="mt-1 block w-full text-xs font-mono font-bold"
                                        value={customerForm.data.max_events_limit}
                                        onChange={(e) => customerForm.setData('max_events_limit', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <InputLabel value="WhatsApp Limit" />
                                    <TextInput
                                        type="number"
                                        min="0"
                                        placeholder="Unlimited"
                                        className="mt-1 block w-full text-xs font-mono font-bold"
                                        value={customerForm.data.max_whatsapp_limit}
                                        onChange={(e) => customerForm.setData('max_whatsapp_limit', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <InputLabel value="SMS Limit" />
                                    <TextInput
                                        type="number"
                                        min="0"
                                        placeholder="Unlimited"
                                        className="mt-1 block w-full text-xs font-mono font-bold"
                                        value={customerForm.data.max_sms_limit}
                                        onChange={(e) => customerForm.setData('max_sms_limit', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Payment Override (Cash Paid) */}
                            <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <div className={`w-10 h-5 rounded-full flex items-center p-0.5 transition-colors duration-200 ${customerForm.data.has_payment_override ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${customerForm.data.has_payment_override ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white block leading-tight">Payment Access Override</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Unlock Paywalled Features (Cash Payment)</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={customerForm.data.has_payment_override}
                                        onChange={(e) => customerForm.setData('has_payment_override', e.target.checked)}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Permissions Matrix */}
                        <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Permissions</span>
                                </h4>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => customerForm.setData('permissions', { ...DEFAULT_ORGANIZER_PERMS })}
                                        className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                    >
                                        Full
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => customerForm.setData('permissions', {
                                            can_create_events: true,
                                            can_import_guests: true,
                                            can_send_broadcasts: false,
                                            can_customize_templates: false,
                                            can_manage_scanners: true,
                                            can_export_data: true,
                                        })}
                                        className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                    >
                                        Standard
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => customerForm.setData('permissions', {
                                            can_create_events: false,
                                            can_import_guests: false,
                                            can_send_broadcasts: false,
                                            can_customize_templates: false,
                                            can_manage_scanners: false,
                                            can_export_data: false,
                                        })}
                                        className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                    >
                                        None
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                    { key: 'can_create_events', label: 'Manage Events', icon: Calendar },
                                    { key: 'can_import_guests', label: 'Import Guests', icon: FileSpreadsheet },
                                    { key: 'can_send_broadcasts', label: 'Send Broadcasts', icon: Send },
                                    { key: 'can_customize_templates', label: 'Pass Studio', icon: Palette },
                                    { key: 'can_manage_scanners', label: 'Gate Scanners', icon: Smartphone },
                                    { key: 'can_export_data', label: 'Export Data', icon: Download },
                                ].map((cap) => {
                                    const IconComp = cap.icon;
                                    const isChecked = customerForm.data.permissions[cap.key] !== false;

                                    return (
                                        <label
                                            key={cap.key}
                                            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                                                isChecked
                                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-70'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className={`p-1 rounded-lg ${
                                                    isChecked ? 'bg-[#16A34A] text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-500'
                                                }`}>
                                                    <IconComp className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                    {cap.label}
                                                </span>
                                            </div>

                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    customerForm.setData('permissions', {
                                                        ...customerForm.data.permissions,
                                                        [cap.key]: e.target.checked,
                                                    });
                                                }}
                                                className="rounded text-[#16A34A] focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer shrink-0"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="pt-3.5 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-end gap-2.5">
                        <SecondaryButton onClick={() => setCustomerModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={customerForm.processing}>
                            Create Account
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* 2. Modal: Edit Organiser (Customer) Preview & Settings */}
            <Modal show={!!editingCustomer} onClose={() => setEditingCustomer(null)} maxWidth="2xl">
                <form onSubmit={handleUpdateCustomer} className="p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <Edit className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                Edit Organiser: {editingCustomer?.name}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingCustomer(null)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3.5 max-h-[72vh] overflow-y-auto pr-1">
                        {/* Basic Identity Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Full Name *" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="e.g. Salim Juma"
                                    value={editCustomerForm.data.name}
                                    onChange={(e) => {
                                        editCustomerForm.setData('name', e.target.value);
                                        if (editCustomerClientErrors.name) setEditCustomerClientErrors(prev => ({ ...prev, name: undefined }));
                                    }}
                                    hasError={Boolean(editCustomerClientErrors.name || editCustomerForm.errors.name)}
                                    required
                                />
                                <InputError message={editCustomerClientErrors.name || editCustomerForm.errors.name} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Email Address (Optional if Phone provided)" />
                                <TextInput
                                    type="email"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="name@email.com"
                                    value={editCustomerForm.data.email}
                                    onChange={(e) => {
                                        editCustomerForm.setData('email', e.target.value);
                                        if (editCustomerClientErrors.email) setEditCustomerClientErrors(prev => ({ ...prev, email: undefined }));
                                    }}
                                    hasError={Boolean(editCustomerClientErrors.email || editCustomerForm.errors.email)}
                                    required={!editCustomerForm.data.phone}
                                />
                                <InputError message={editCustomerClientErrors.email || editCustomerForm.errors.email} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Company / Brand Name" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="Optional"
                                    value={editCustomerForm.data.company}
                                    onChange={(e) => editCustomerForm.setData('company', e.target.value)}
                                    hasError={Boolean(editCustomerForm.errors.company)}
                                />
                                <InputError message={editCustomerForm.errors.company} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Phone Number (Optional if Email provided)" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    placeholder="+255700000000"
                                    value={editCustomerForm.data.phone}
                                    onChange={(e) => {
                                        editCustomerForm.setData('phone', e.target.value);
                                        if (editCustomerClientErrors.phone) setEditCustomerClientErrors(prev => ({ ...prev, phone: undefined }));
                                    }}
                                    hasError={Boolean(editCustomerClientErrors.phone || editCustomerForm.errors.phone)}
                                />
                                <InputError message={editCustomerClientErrors.phone || editCustomerForm.errors.phone} className="mt-1" />
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel value="Reset Password (Optional)" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const pwd = generateStrongPassword(16);
                                            editCustomerForm.setData('password', pwd);
                                            if (editCustomerClientErrors.password) setEditCustomerClientErrors(prev => ({ ...prev, password: undefined }));
                                        }}
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40"
                                    >
                                        <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Suggest</span>
                                    </button>
                                </div>
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    placeholder="Leave blank to keep unchanged"
                                    value={editCustomerForm.data.password}
                                    onChange={(e) => {
                                        editCustomerForm.setData('password', e.target.value);
                                        if (editCustomerClientErrors.password) setEditCustomerClientErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                    hasError={Boolean(editCustomerClientErrors.password || editCustomerForm.errors.password)}
                                />
                                <InputError message={editCustomerClientErrors.password || editCustomerForm.errors.password} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Role *" />
                                <select
                                    value={editCustomerForm.data.role}
                                    onChange={(e) => {
                                        editCustomerForm.setData('role', e.target.value);
                                        if (editCustomerForm.errors.role) editCustomerForm.clearErrors('role');
                                    }}
                                    className="mt-1 block w-full text-xs font-bold rounded-xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="customer">🏢 Organiser</option>
                                    <option value="sub_admin">🛡️ Sub-Admin</option>
                                    <option value="admin">👑 Super Admin</option>
                                    <option value="scanner">📱 Gate Scanner</option>
                                </select>
                                <InputError message={editCustomerForm.errors.role} className="mt-1" />
                            </div>
                        </div>

                        {/* Status & Limits */}
                        <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200/60 dark:border-white/[0.04]">
                                <InputLabel value="Account Status" className="!mb-0" />
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => editCustomerForm.setData('status', 'active')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                                            editCustomerForm.data.status === 'active'
                                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/60'
                                                : 'bg-white dark:bg-[#08121E] text-slate-500 border-slate-200 dark:border-white/[0.08] hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${editCustomerForm.data.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                        <span>Active</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editCustomerForm.setData('status', 'suspended')}
                                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
                                            editCustomerForm.data.status === 'suspended'
                                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800/60'
                                                : 'bg-white dark:bg-[#08121E] text-slate-500 border-slate-200 dark:border-white/[0.08] hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${editCustomerForm.data.status === 'suspended' ? 'bg-rose-500' : 'bg-slate-400'}`} />
                                        <span>Suspended</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <InputLabel value="Events Limit" />
                                    <TextInput
                                        type="number"
                                        min="1"
                                        placeholder="Unlimited"
                                        className="mt-1 block w-full text-xs font-mono font-bold"
                                        value={editCustomerForm.data.max_events_limit}
                                        onChange={(e) => editCustomerForm.setData('max_events_limit', e.target.value)}
                                        hasError={Boolean(editCustomerForm.errors.max_events_limit)}
                                    />
                                    <InputError message={editCustomerForm.errors.max_events_limit} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel value="WhatsApp Limit" />
                                    <TextInput
                                        type="number"
                                        min="0"
                                        placeholder="Unlimited"
                                        className="mt-1 block w-full text-xs font-mono font-bold"
                                        value={editCustomerForm.data.max_whatsapp_limit}
                                        onChange={(e) => editCustomerForm.setData('max_whatsapp_limit', e.target.value)}
                                        hasError={Boolean(editCustomerForm.errors.max_whatsapp_limit)}
                                    />
                                    <InputError message={editCustomerForm.errors.max_whatsapp_limit} className="mt-1" />
                                </div>

                                <div>
                                    <InputLabel value="SMS Limit" />
                                    <TextInput
                                        type="number"
                                        min="0"
                                        placeholder="Unlimited"
                                        className="mt-1 block w-full text-xs font-mono font-bold"
                                        value={editCustomerForm.data.max_sms_limit}
                                        onChange={(e) => editCustomerForm.setData('max_sms_limit', e.target.value)}
                                        hasError={Boolean(editCustomerForm.errors.max_sms_limit)}
                                    />
                                    <InputError message={editCustomerForm.errors.max_sms_limit} className="mt-1" />
                                </div>
                            </div>

                            {editCustomerForm.data.status === 'suspended' && (
                                <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
                                    <InputLabel value="Suspension Reason" />
                                    <TextInput
                                        type="text"
                                        placeholder="Reason for suspension..."
                                        className="mt-1 block w-full text-xs font-bold text-rose-700 dark:text-rose-300"
                                        value={editCustomerForm.data.suspension_reason}
                                        onChange={(e) => editCustomerForm.setData('suspension_reason', e.target.value)}
                                        hasError={Boolean(editCustomerForm.errors.suspension_reason)}
                                    />
                                    <InputError message={editCustomerForm.errors.suspension_reason} className="mt-1" />
                                </div>
                            )}

                            {/* Payment Override (Cash Paid) */}
                            <div className="pt-2 border-t border-slate-200/60 dark:border-white/[0.04]">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <div className={`w-10 h-5 rounded-full flex items-center p-0.5 transition-colors duration-200 ${editCustomerForm.data.has_payment_override ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform duration-200 ${editCustomerForm.data.has_payment_override ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white block leading-tight">Payment Access Override</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">Unlock Paywalled Features (Cash Payment)</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={editCustomerForm.data.has_payment_override}
                                        onChange={(e) => editCustomerForm.setData('has_payment_override', e.target.checked)}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Permissions Matrix */}
                        <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Permissions</span>
                                </h4>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => editCustomerForm.setData('permissions', { ...DEFAULT_ORGANIZER_PERMS })}
                                        className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                    >
                                        Full
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editCustomerForm.setData('permissions', {
                                            can_create_events: true,
                                            can_import_guests: true,
                                            can_send_broadcasts: false,
                                            can_customize_templates: false,
                                            can_manage_scanners: true,
                                            can_export_data: true,
                                        })}
                                        className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                    >
                                        Standard
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => editCustomerForm.setData('permissions', {
                                            can_create_events: false,
                                            can_import_guests: false,
                                            can_send_broadcasts: false,
                                            can_customize_templates: false,
                                            can_manage_scanners: false,
                                            can_export_data: false,
                                        })}
                                        className="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition cursor-pointer"
                                    >
                                        None
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {[
                                    { key: 'can_create_events', label: 'Manage Events', icon: Calendar },
                                    { key: 'can_import_guests', label: 'Import Guests', icon: FileSpreadsheet },
                                    { key: 'can_send_broadcasts', label: 'Send Broadcasts', icon: Send },
                                    { key: 'can_customize_templates', label: 'Pass Studio', icon: Palette },
                                    { key: 'can_manage_scanners', label: 'Gate Scanners', icon: Smartphone },
                                    { key: 'can_export_data', label: 'Export Data', icon: Download },
                                ].map((cap) => {
                                    const IconComp = cap.icon;
                                    const isChecked = editCustomerForm.data.permissions[cap.key] !== false;

                                    return (
                                        <label
                                            key={cap.key}
                                            className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                                                isChecked
                                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-70'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className={`p-1 rounded-lg ${
                                                    isChecked ? 'bg-[#16A34A] text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-500'
                                                }`}>
                                                    <IconComp className="w-3 h-3" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                    {cap.label}
                                                </span>
                                            </div>

                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                    editCustomerForm.setData('permissions', {
                                                        ...editCustomerForm.data.permissions,
                                                        [cap.key]: e.target.checked,
                                                    });
                                                }}
                                                className="rounded text-[#16A34A] focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer shrink-0"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="pt-3.5 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-end gap-2.5">
                        <SecondaryButton onClick={() => setEditingCustomer(null)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton type="submit" disabled={editCustomerForm.processing}>
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* 3. Modal: Create Gate Staff (Scanner) */}
            <Modal show={createScannerModalOpen} onClose={() => setCreateScannerModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCreateScanner} className="p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <Smartphone className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                Create Gate Staff
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCreateScannerModalOpen(false)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <InputLabel value="Name *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold rounded-xl"
                                placeholder="e.g. Salim Juma"
                                value={createScannerForm.data.name}
                                onChange={(e) => {
                                    createScannerForm.setData('name', e.target.value);
                                    if (scannerClientErrors.name) setScannerClientErrors(prev => ({ ...prev, name: undefined }));
                                }}
                                hasError={Boolean(scannerClientErrors.name || createScannerForm.errors.name)}
                                required
                                autoFocus
                            />
                            <InputError message={scannerClientErrors.name || createScannerForm.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Email *" />
                            <TextInput
                                type="email"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="e.g. gate1@kardovo.com"
                                value={createScannerForm.data.email}
                                onChange={(e) => {
                                    createScannerForm.setData('email', e.target.value);
                                    if (scannerClientErrors.email) setScannerClientErrors(prev => ({ ...prev, email: undefined }));
                                }}
                                hasError={Boolean(scannerClientErrors.email || createScannerForm.errors.email)}
                                required
                            />
                            <InputError message={scannerClientErrors.email || createScannerForm.errors.email} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Gate *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold rounded-xl"
                                placeholder="e.g. Gate 1"
                                value={createScannerForm.data.gate_label}
                                onChange={(e) => {
                                    createScannerForm.setData('gate_label', e.target.value);
                                    if (scannerClientErrors.gate_label) setScannerClientErrors(prev => ({ ...prev, gate_label: undefined }));
                                }}
                                hasError={Boolean(scannerClientErrors.gate_label || createScannerForm.errors.gate_label)}
                                required
                            />
                            <InputError message={scannerClientErrors.gate_label || createScannerForm.errors.gate_label} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Organiser (Optional)" />
                            <select
                                className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#07111D] text-slate-900 dark:text-white text-xs font-bold px-3 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                value={createScannerForm.data.customer_id}
                                onChange={(e) => createScannerForm.setData('customer_id', e.target.value)}
                            >
                                <option value="">Global / All Events</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.company ? `(${c.company})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Phone (Optional)" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="+255 7XX XXX XXX"
                                value={createScannerForm.data.phone}
                                onChange={(e) => {
                                    createScannerForm.setData('phone', e.target.value);
                                    if (scannerClientErrors.phone) setScannerClientErrors(prev => ({ ...prev, phone: undefined }));
                                }}
                                hasError={Boolean(scannerClientErrors.phone || createScannerForm.errors.phone)}
                            />
                            <InputError message={scannerClientErrors.phone || createScannerForm.errors.phone} className="mt-1" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel value="Password *" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const pwd = generateStrongPassword(12);
                                        createScannerForm.setData('password', pwd);
                                        if (scannerClientErrors.password) setScannerClientErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40"
                                >
                                    <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Generate</span>
                                </button>
                            </div>
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="Min 8 chars"
                                value={createScannerForm.data.password}
                                onChange={(e) => {
                                    createScannerForm.setData('password', e.target.value);
                                    if (scannerClientErrors.password) setScannerClientErrors(prev => ({ ...prev, password: undefined }));
                                }}
                                hasError={Boolean(scannerClientErrors.password || createScannerForm.errors.password)}
                                required
                            />
                            <InputError message={scannerClientErrors.password || createScannerForm.errors.password} className="mt-1" />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex justify-end gap-2">
                        <SecondaryButton onClick={() => setCreateScannerModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={createScannerForm.processing}>
                            Create Staff
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* 4. Modal: Edit Gate Staff (Scanner) */}
            <Modal show={!!editingScanner} onClose={() => setEditingScanner(null)} maxWidth="md">
                <form onSubmit={handleUpdateScanner} className="p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <Edit className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                Edit Gate Staff: {editingScanner?.name}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingScanner(null)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <InputLabel value="Name *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold rounded-xl"
                                placeholder="e.g. Salim Juma"
                                value={editScannerForm.data.name}
                                onChange={(e) => {
                                    editScannerForm.setData('name', e.target.value);
                                    if (editScannerClientErrors.name) setEditScannerClientErrors(prev => ({ ...prev, name: undefined }));
                                }}
                                hasError={Boolean(editScannerClientErrors.name || editScannerForm.errors.name)}
                                required
                            />
                            <InputError message={editScannerClientErrors.name || editScannerForm.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Email *" />
                            <TextInput
                                type="email"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="name@email.com"
                                value={editScannerForm.data.email}
                                onChange={(e) => {
                                    editScannerForm.setData('email', e.target.value);
                                    if (editScannerClientErrors.email) setEditScannerClientErrors(prev => ({ ...prev, email: undefined }));
                                }}
                                hasError={Boolean(editScannerClientErrors.email || editScannerForm.errors.email)}
                                required
                            />
                            <InputError message={editScannerClientErrors.email || editScannerForm.errors.email} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Gate *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold rounded-xl"
                                placeholder="e.g. Gate 1"
                                value={editScannerForm.data.gate_label}
                                onChange={(e) => {
                                    editScannerForm.setData('gate_label', e.target.value);
                                    if (editScannerClientErrors.gate_label) setEditScannerClientErrors(prev => ({ ...prev, gate_label: undefined }));
                                }}
                                hasError={Boolean(editScannerClientErrors.gate_label || editScannerForm.errors.gate_label)}
                                required
                            />
                            <InputError message={editScannerClientErrors.gate_label || editScannerForm.errors.gate_label} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Organiser (Optional)" />
                            <select
                                className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#07111D] text-slate-900 dark:text-white text-xs font-bold px-3 py-2.5 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                                value={editScannerForm.data.customer_id}
                                onChange={(e) => editScannerForm.setData('customer_id', e.target.value)}
                            >
                                <option value="">Global / All Events</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} {c.company ? `(${c.company})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Phone (Optional)" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="+255 7XX XXX XXX"
                                value={editScannerForm.data.phone}
                                onChange={(e) => {
                                    editScannerForm.setData('phone', e.target.value);
                                    if (editScannerClientErrors.phone) setEditScannerClientErrors(prev => ({ ...prev, phone: undefined }));
                                }}
                                hasError={Boolean(editScannerClientErrors.phone || editScannerForm.errors.phone)}
                            />
                            <InputError message={editScannerClientErrors.phone || editScannerForm.errors.phone} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Reset Password (Optional)" />
                            <TextInput
                                type="password"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="Leave blank to keep current"
                                value={editScannerForm.data.password}
                                onChange={(e) => {
                                    editScannerForm.setData('password', e.target.value);
                                    if (editScannerClientErrors.password) setEditScannerClientErrors(prev => ({ ...prev, password: undefined }));
                                }}
                                hasError={Boolean(editScannerClientErrors.password || editScannerForm.errors.password)}
                            />
                            <InputError message={editScannerClientErrors.password || editScannerForm.errors.password} className="mt-1" />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex justify-end gap-2">
                        <SecondaryButton onClick={() => setEditingScanner(null)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={editScannerForm.processing}>
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* 5. Modal: Create Sub Admin */}
            <Modal show={subAdminModalOpen} onClose={() => setSubAdminModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleCreateSubAdmin} className="p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                                <UserCheck className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                Create Sub-Administrator
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSubAdminModalOpen(false)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <InputLabel value="Name *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold rounded-xl"
                                placeholder="e.g. Sarah Operations"
                                value={createSubAdminForm.data.name}
                                onChange={(e) => {
                                    createSubAdminForm.setData('name', e.target.value);
                                    if (subAdminClientErrors.name) setSubAdminClientErrors(prev => ({ ...prev, name: undefined }));
                                }}
                                hasError={Boolean(subAdminClientErrors.name || createSubAdminForm.errors.name)}
                                required
                                autoFocus
                            />
                            <InputError message={subAdminClientErrors.name || createSubAdminForm.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Email *" />
                            <TextInput
                                type="email"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="e.g. sarah@kardovo.com"
                                value={createSubAdminForm.data.email}
                                onChange={(e) => {
                                    createSubAdminForm.setData('email', e.target.value);
                                    if (subAdminClientErrors.email) setSubAdminClientErrors(prev => ({ ...prev, email: undefined }));
                                }}
                                hasError={Boolean(subAdminClientErrors.email || createSubAdminForm.errors.email)}
                                required
                            />
                            <InputError message={subAdminClientErrors.email || createSubAdminForm.errors.email} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Phone (Optional)" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="+255 7XX XXX XXX"
                                value={createSubAdminForm.data.phone}
                                onChange={(e) => {
                                    createSubAdminForm.setData('phone', e.target.value);
                                    if (subAdminClientErrors.phone) setSubAdminClientErrors(prev => ({ ...prev, phone: undefined }));
                                }}
                                hasError={Boolean(subAdminClientErrors.phone || createSubAdminForm.errors.phone)}
                            />
                            <InputError message={subAdminClientErrors.phone || createSubAdminForm.errors.phone} className="mt-1" />
                        </div>

                        <div>
                            <div className="flex items-center justify-between">
                                <InputLabel value="Password *" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const pwd = generateStrongPassword(14);
                                        createSubAdminForm.setData('password', pwd);
                                        if (subAdminClientErrors.password) setSubAdminClientErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 cursor-pointer bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40"
                                >
                                    <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Generate</span>
                                </button>
                            </div>
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="Min 8 chars"
                                value={createSubAdminForm.data.password}
                                onChange={(e) => {
                                    createSubAdminForm.setData('password', e.target.value);
                                    if (subAdminClientErrors.password) setSubAdminClientErrors(prev => ({ ...prev, password: undefined }));
                                }}
                                hasError={Boolean(subAdminClientErrors.password || createSubAdminForm.errors.password)}
                                required
                            />
                            <InputError message={subAdminClientErrors.password || createSubAdminForm.errors.password} className="mt-1" />
                        </div>
                    </div>

                    {/* Scope Assignments */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Organisers (Optional)</span>
                                    </span>
                                    {createSubAdminForm.data.organizer_ids.length > 0 && (
                                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                                            {createSubAdminForm.data.organizer_ids.length} selected
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] space-y-1">
                                    {customers.length === 0 ? (
                                        <div className="text-[11px] text-slate-400 p-2 italic text-center">No organisers found</div>
                                    ) : (
                                        customers.map(c => {
                                            const isChecked = createSubAdminForm.data.organizer_ids.includes(c.id);
                                            return (
                                                <label key={c.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/[0.04] cursor-pointer transition text-xs select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            const newIds = e.target.checked
                                                                ? [...createSubAdminForm.data.organizer_ids, c.id]
                                                                : createSubAdminForm.data.organizer_ids.filter(id => id !== c.id);
                                                            createSubAdminForm.setData('organizer_ids', newIds);
                                                        }}
                                                        className="rounded text-[#16A34A] focus:ring-[#16A34A] h-3.5 w-3.5"
                                                    />
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</span>
                                                    {c.company && <span className="text-[10px] text-slate-400 truncate">({c.company})</span>}
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Events (Optional)</span>
                                    </span>
                                    {createSubAdminForm.data.event_ids.length > 0 && (
                                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                                            {createSubAdminForm.data.event_ids.length} selected
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] space-y-1">
                                    {allEvents.length === 0 ? (
                                        <div className="text-[11px] text-slate-400 p-2 italic text-center">No events found</div>
                                    ) : (
                                        allEvents.map(ev => {
                                            const isChecked = createSubAdminForm.data.event_ids.includes(ev.id);
                                            return (
                                                <label key={ev.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/[0.04] cursor-pointer transition text-xs select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            const newIds = e.target.checked
                                                                ? [...createSubAdminForm.data.event_ids, ev.id]
                                                                : createSubAdminForm.data.event_ids.filter(id => id !== ev.id);
                                                            createSubAdminForm.setData('event_ids', newIds);
                                                        }}
                                                        className="rounded text-[#16A34A] focus:ring-[#16A34A] h-3.5 w-3.5"
                                                    />
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{ev.title}</span>
                                                    <span className="text-[10px] text-slate-400 truncate">({ev.venue || 'TBA'})</span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex justify-end gap-2">
                        <SecondaryButton onClick={() => setSubAdminModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={createSubAdminForm.processing}>
                            Create Sub-Admin
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* 6. Modal: Edit Sub Admin */}
            <Modal show={!!editingSubAdmin} onClose={() => setEditingSubAdmin(null)} maxWidth="2xl">
                <form onSubmit={handleUpdateSubAdmin} className="p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                                <Edit className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                Edit Sub Admin: {editingSubAdmin?.name}
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingSubAdmin(null)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <InputLabel value="Name *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold rounded-xl"
                                placeholder="e.g. Sarah Operations"
                                value={editSubAdminForm.data.name}
                                onChange={(e) => editSubAdminForm.setData('name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Email *" />
                            <TextInput
                                type="email"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="e.g. sarah@kardovo.com"
                                value={editSubAdminForm.data.email}
                                onChange={(e) => editSubAdminForm.setData('email', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Phone (Optional)" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="+255 7XX XXX XXX"
                                value={editSubAdminForm.data.phone}
                                onChange={(e) => editSubAdminForm.setData('phone', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel value="Reset Password (Optional)" />
                            <TextInput
                                type="password"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="Leave blank to keep current"
                                value={editSubAdminForm.data.password}
                                onChange={(e) => editSubAdminForm.setData('password', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Scope Assignments */}
                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.08]">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Organisers (Optional)</span>
                                    </span>
                                    {editSubAdminForm.data.organizer_ids.length > 0 && (
                                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                                            {editSubAdminForm.data.organizer_ids.length} selected
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] space-y-1">
                                    {customers.length === 0 ? (
                                        <div className="text-[11px] text-slate-400 p-2 italic text-center">No organisers found</div>
                                    ) : (
                                        customers.map(c => {
                                            const isChecked = editSubAdminForm.data.organizer_ids.includes(c.id);
                                            return (
                                                <label key={c.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/[0.04] cursor-pointer transition text-xs select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            const newIds = e.target.checked
                                                                ? [...editSubAdminForm.data.organizer_ids, c.id]
                                                                : editSubAdminForm.data.organizer_ids.filter(id => id !== c.id);
                                                            editSubAdminForm.setData('organizer_ids', newIds);
                                                        }}
                                                        className="rounded text-[#16A34A] focus:ring-[#16A34A] h-3.5 w-3.5"
                                                    />
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</span>
                                                    {c.company && <span className="text-[10px] text-slate-400 truncate">({c.company})</span>}
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Events (Optional)</span>
                                    </span>
                                    {editSubAdminForm.data.event_ids.length > 0 && (
                                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                                            {editSubAdminForm.data.event_ids.length} selected
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-36 overflow-y-auto p-2 rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] space-y-1">
                                    {allEvents.length === 0 ? (
                                        <div className="text-[11px] text-slate-400 p-2 italic text-center">No events found</div>
                                    ) : (
                                        allEvents.map(ev => {
                                            const isChecked = editSubAdminForm.data.event_ids.includes(ev.id);
                                            return (
                                                <label key={ev.id} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white dark:hover:bg-white/[0.04] cursor-pointer transition text-xs select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={(e) => {
                                                            const newIds = e.target.checked
                                                                ? [...editSubAdminForm.data.event_ids, ev.id]
                                                                : editSubAdminForm.data.event_ids.filter(id => id !== ev.id);
                                                            editSubAdminForm.setData('event_ids', newIds);
                                                        }}
                                                        className="rounded text-[#16A34A] focus:ring-[#16A34A] h-3.5 w-3.5"
                                                    />
                                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{ev.title}</span>
                                                    <span className="text-[10px] text-slate-400 truncate">({ev.venue || 'TBA'})</span>
                                                </label>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex justify-end gap-2">
                        <SecondaryButton onClick={() => setEditingSubAdmin(null)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={editSubAdminForm.processing}>
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* 7. Confirmation Modal (Delete) */}
            <ConfirmationModal
                show={confirmModal.show}
                title={confirmModal.title}
                message={confirmModal.message}
                warning={confirmModal.warning}
                confirmText={confirmModal.confirmText}
                cancelText={confirmModal.cancelText}
                type={confirmModal.type}
                loading={confirmModal.loading}
                onConfirm={confirmModal.onConfirm}
                onClose={() => setConfirmModal(prev => ({ ...prev, show: false }))}
            />

        </KardovoAppLayout>
    );
}

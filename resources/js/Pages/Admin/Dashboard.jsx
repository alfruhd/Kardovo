import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import GatewayConfigModal from '@/Components/GatewayConfigModal';
import { 
    validateEmail, 
    validatePhone, 
    validatePassword,
    generateStrongPassword,
    validateRequired 
} from '@/Utils/validation';
import { 
    Shield, 
    Users,
    UserCheck,
    UserPlus, 
    Calendar, 
    QrCode, 
    Settings, 
    Plus, 
    CheckCircle2, 
    XCircle,
    Server, 
    MessageSquare,
    Sparkles,
    ExternalLink,
    Trash2,
    Palette,
    Smartphone,
    History,
    Edit,
    Check,
    X,
    Activity,
    Lock,
    Search,
    Filter,
    ArrowRight,
    Radio,
    Building2,
    MapPin,
    Clock,
    Flame,
    CheckCheck,
    AlertTriangle,
    SlidersHorizontal,
    Layers,
    CircleDollarSign,
    ChevronDown,
    Crown,
    ShieldAlert,
    ShieldCheck,
    FileSpreadsheet,
    Send,
    Download,
    KeyRound
} from 'lucide-react';

export default function AdminDashboard({ 
    customers = [], 
    gateStaff = [],
    allEvents = [], 
    subAdmins = [],
    isSuperAdmin = true,
    isSubAdmin = false,
    globalTemplates = [], 
    recentScanLogs = [],
    stats = {}, 
    gateways = {} 
}) {
    const [activeTab, setActiveTab] = useState('scanners'); // 'scanners' | 'logs' | 'customers' | 'events' | 'templates' | 'gateways'
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editingEvent, setEditingEvent] = useState(null);
    const [createScannerModalOpen, setCreateScannerModalOpen] = useState(false);
    const [editingScanner, setEditingScanner] = useState(null);
    const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
    const [subAdminModalOpen, setSubAdminModalOpen] = useState(false);
    const [editingSubAdmin, setEditingSubAdmin] = useState(null);
    const [subAdminSearch, setSubAdminSearch] = useState("");
    const [actionDropdownOpen, setActionDropdownOpen] = useState(false);
    const actionDropdownRef = useRef(null);

    // Close action dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
                setActionDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search filters
    const [staffSearch, setStaffSearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [eventSearch, setEventSearch] = useState('');
    const [logStatusFilter, setLogStatusFilter] = useState('all'); // 'all' | 'granted' | 'rejected'

    // Form: Create Sub Admin
    const createSubAdminForm = useForm({
        name: "",
        email: "",
        phone: "",
        password: "password",
        organizer_ids: [],
        event_ids: [],
    });

    // Form: Edit Sub Admin
    const editSubAdminForm = useForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        organizer_ids: [],
        event_ids: [],
    });

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

    const handleCreateSubAdmin = (e) => {
        e.preventDefault();
        createSubAdminForm.post(route("admin.storeSubAdmin"), {
            onSuccess: () => {
                setSubAdminModalOpen(false);
                createSubAdminForm.reset();
            }
        });
    };

    const openEditSubAdminModal = (subAdmin) => {
        setEditingSubAdmin(subAdmin);
        editSubAdminForm.setData({
            name: subAdmin.name,
            email: subAdmin.email,
            phone: subAdmin.phone || "",
            password: "",
            organizer_ids: subAdmin.assigned_organizers?.map(o => o.id) || [],
            event_ids: subAdmin.assigned_events?.map(ev => ev.id) || [],
        });
    };

    const handleUpdateSubAdmin = (e) => {
        e.preventDefault();
        if (!editingSubAdmin) return;
        editSubAdminForm.put(route("admin.updateSubAdmin", editingSubAdmin.id), {
            onSuccess: () => {
                setEditingSubAdmin(null);
                editSubAdminForm.reset();
            }
        });
    };

    const handleDeleteSubAdmin = (subAdmin) => {
        if (confirm(`Are you sure you want to permanently delete Sub Administrator "${subAdmin.name}" (${subAdmin.email})?\n\nThis will remove their administrative assignments without deleting the assigned events or organisers.`)) {
            router.delete(route("admin.destroySubAdmin", subAdmin.id));
        }
    };

    const DEFAULT_ORGANIZER_PERMS = {
        can_create_events: true,
        can_import_guests: true,
        can_send_broadcasts: true,
        can_customize_templates: true,
        can_manage_scanners: true,
        can_export_data: true,
    };

    // Form: Create Customer
    const customerForm = useForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        password: 'password',
        role: 'customer',
        status: 'active',
        max_events_limit: '',
        max_whatsapp_limit: '',
        max_sms_limit: '',
        permissions: { ...DEFAULT_ORGANIZER_PERMS },
    });

    // Form: Edit Customer
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
        suspension_reason: '',
        permissions: { ...DEFAULT_ORGANIZER_PERMS },
    });

    // Form: Edit Event (Admin)
    const editEventForm = useForm({
        title: '',
        event_type: 'Wedding Reception',
        event_date: '',
        event_time: '',
        venue: '',
        city: 'Dar es Salaam',
        description: '',
        card_template_id: '',
        user_id: '',
        status: 'active',
    });

    // Form: Create Gate Staff
    const createScannerForm = useForm({
        name: '',
        email: '',
        phone: '',
        gate_label: 'Gate 1 — Main VIP Entrance',
        customer_id: customers[0]?.id || '',
        password: 'password',
    });

    // Form: Edit Gate Staff
    const editScannerForm = useForm({
        name: '',
        email: '',
        phone: '',
        gate_label: '',
        customer_id: '',
        password: '',
    });

    // Filtered lists
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

    const filteredEvents = useMemo(() => {
        if (!eventSearch.trim()) return allEvents;
        const q = eventSearch.toLowerCase();
        return allEvents.filter(e => 
            e.title?.toLowerCase().includes(q) ||
            e.venue?.toLowerCase().includes(q) ||
            e.user?.name?.toLowerCase().includes(q) ||
            e.event_type?.toLowerCase().includes(q)
        );
    }, [allEvents, eventSearch]);

    const filteredLogs = useMemo(() => {
        if (logStatusFilter === 'all') return recentScanLogs;
        return recentScanLogs.filter(l => l.status === logStatusFilter);
    }, [recentScanLogs, logStatusFilter]);

    const [customerClientErrors, setCustomerClientErrors] = useState({});
    const [editCustomerClientErrors, setEditCustomerClientErrors] = useState({});
    const [scannerClientErrors, setScannerClientErrors] = useState({});
    const [editScannerClientErrors, setEditScannerClientErrors] = useState({});

    const handleCreateCustomer = (e) => {
        e.preventDefault();
        const errs = {};
        if (!validateRequired(customerForm.data.name, 2)) {
            errs.name = 'Organizer name must be at least 2 characters.';
        }
        if (!validateEmail(customerForm.data.email)) {
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
        const perms = customer.effective_permissions || customer.permissions || DEFAULT_ORGANIZER_PERMS;
        editCustomerForm.setData({
            name: customer.name,
            email: customer.email,
            phone: customer.phone || '',
            company: customer.company || '',
            password: '',
            role: customer.role || 'customer',
            status: customer.status || 'active',
            max_events_limit: customer.max_events_limit ?? '',
            max_whatsapp_limit: customer.max_whatsapp_limit ?? customer.message_quotas?.whatsapp_limit ?? '',
            max_sms_limit: customer.max_sms_limit ?? customer.message_quotas?.sms_limit ?? '',
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
        if (!validateEmail(editCustomerForm.data.email)) {
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
            onSuccess: () => {
                setEditingCustomer(null);
                editCustomerForm.reset();
            }
        });
    };

    const handleDeleteCustomer = (customer) => {
        if (confirm(`Are you sure you want to permanently delete customer "${customer.name}" (${customer.email})?\n\nWARNING: This will permanently delete all associated events, guest passes, and gate scan records.`)) {
            router.delete(route('admin.destroyCustomer', customer.id));
        }
    };

    const openEditEventModal = (event) => {
        setEditingEvent(event);
        let dateVal = event.event_date;
        if (typeof dateVal === 'string' && dateVal.includes('T')) {
            dateVal = dateVal.split('T')[0];
        }
        editEventForm.setData({
            title: event.title,
            event_type: event.event_type || 'Wedding Reception',
            event_date: dateVal,
            event_time: event.event_time || '',
            venue: event.venue,
            city: event.city || 'Dar es Salaam',
            description: event.description || '',
            card_template_id: event.card_template_id || '',
            user_id: event.user_id || (event.user ? event.user.id : ''),
            status: event.status || 'active',
        });
    };

    const handleUpdateEvent = (e) => {
        e.preventDefault();
        if (!editingEvent) return;
        editEventForm.put(route('events.update', editingEvent.id), {
            onSuccess: () => {
                setEditingEvent(null);
                editEventForm.reset();
            }
        });
    };

    const handleDeleteEvent = (event) => {
        const ownerName = event.user?.name || 'Organiser';
        if (confirm(`Are you sure you want to permanently delete event "${event.title}" (Organiser: ${ownerName})?\n\nWARNING: This will remove all associated guests (${event.guests_count || 0}), scannable passes, messages, and gate logs.`)) {
            router.delete(route('events.destroy', event.id));
        }
    };

    const handleCreateScanner = (e) => {
        e.preventDefault();
        const errs = {};
        if (!validateRequired(createScannerForm.data.name, 2)) {
            errs.name = 'Gate staff name must be at least 2 characters.';
        }
        if (!validateEmail(createScannerForm.data.email)) {
            errs.email = 'Please provide a valid email address.';
        }
        if (createScannerForm.data.phone && !validatePhone(createScannerForm.data.phone)) {
            errs.phone = 'Please provide a valid phone number (e.g. +255 712 345 678).';
        }
        if (!validateRequired(createScannerForm.data.gate_label, 2)) {
            errs.gate_label = 'Gate assignment label is required.';
        }
        const pwdCheck = validatePassword(createScannerForm.data.password);
        if (!createScannerForm.data.password || !pwdCheck.isStrong) {
            errs.password = 'Staff password must be strong (min 8 chars, uppercase, lowercase, numbers & symbols).';
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
        if (confirm(`Are you sure you want to delete gate staff account "${scanner.name}" (${scanner.email})?`)) {
            router.delete(route('admin.destroyScanner', scanner.id));
        }
    };

    return (
        <KardovoAppLayout
            title="Governance & Administration"
            headerActions={
                <div className="flex items-center gap-2">
                    {/* Gateways Config */}
                    <button
                        type="button"
                        onClick={() => setGatewayModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/[0.08] rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        title="Delivery Gateways"
                    >
                        <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span className="hidden sm:inline">Gateways</span>
                    </button>

                    {/* Clean + Create Dropdown */}
                    <div className="relative" ref={actionDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-kardovo-navy hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${actionDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {actionDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#0C1729] rounded-2xl shadow-xl border border-slate-200 dark:border-white/[0.08] p-1.5 z-50 animate-fadeIn space-y-0.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionDropdownOpen(false);
                                        setCustomerModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition text-left cursor-pointer"
                                >
                                    <Users className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                    <span>Customer Account</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionDropdownOpen(false);
                                        setCreateScannerModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition text-left cursor-pointer"
                                >
                                    <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Gate Staff Scanner</span>
                                </button>
                                {isSuperAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActionDropdownOpen(false);
                                            setSubAdminModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] rounded-xl transition text-left cursor-pointer"
                                    >
                                        <UserCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                                        <span>Sub-Administrator</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Enterprise Admin Portal - Kardovo" />

            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                
                {/* 1. SIMPLE PAGE TITLE HEADER */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                            Platform Operations Center
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            Centralized governance for organizers, delivery gateways, and gate scanner fleet.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-[#0B1524] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                            {gateStaff.length} Scanners Fleet
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-white/80 dark:bg-[#0B1524] px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs">
                            {Number(stats.total_guests || 0).toLocaleString()} Passes Live
                        </span>
                    </div>
                </div>

                {/* 2. EXECUTIVE METRIC TELEMETRY GRID (Uniform Design System) */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-3">
                    {/* Sub Admins */}
                    {isSuperAdmin && (
                        <div 
                            onClick={() => setActiveTab("sub_admins")}
                            className="group rounded-2xl p-3 sm:p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sub Admins</span>
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 transition-colors">
                                    <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </div>
                            </div>
                            <div className="mt-2.5 sm:mt-3">
                                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{stats.total_sub_admins || subAdmins.length}</div>
                                <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Delegated staff</div>
                            </div>
                        </div>
                    )}

                    {/* Organisers */}
                    <div 
                        onClick={() => setActiveTab("customers")}
                        className="group rounded-2xl p-3 sm:p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Organisers</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 transition-colors">
                                <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{stats.total_customers || customers.length}</div>
                            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Active accounts</div>
                        </div>
                    </div>

                    {/* Gate Staff */}
                    <div 
                        onClick={() => setActiveTab("scanners")}
                        className="group rounded-2xl p-3 sm:p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Gate Staff</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 transition-colors">
                                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{stats.total_gate_staff || gateStaff.length}</div>
                            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Mobile scanners</div>
                        </div>
                    </div>

                    {/* Total Events */}
                    <div 
                        onClick={() => setActiveTab("events")}
                        className="group rounded-2xl p-3 sm:p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Global Events</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 transition-colors">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{stats.total_events || allEvents.length}</div>
                            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">All campaigns</div>
                        </div>
                    </div>

                    {/* Total Guests */}
                    <div 
                        onClick={() => setActiveTab("events")}
                        className="group rounded-2xl p-3 sm:p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Guest Passes</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 transition-colors">
                                <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(stats.total_guests || 0).toLocaleString()}</div>
                            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Issued passes</div>
                        </div>
                    </div>

                    {/* Check-ins */}
                    <div 
                        onClick={() => setActiveTab("logs")}
                        className="group rounded-2xl p-3 sm:p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Check-ins</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 transition-colors">
                                <CheckCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(stats.total_checkins || 0).toLocaleString()}</div>
                            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Admitted guests</div>
                        </div>
                    </div>

                    {/* Scan Audits */}
                    <div 
                        onClick={() => setActiveTab("logs")}
                        className="group rounded-2xl p-3 sm:p-4 bg-white dark:bg-[#0B1524] border border-slate-200/80 dark:border-white/[0.08] shadow-xs hover:shadow-card hover:border-cyan-500/40 dark:hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99]"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Scan Audits</span>
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.06] text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 transition-colors">
                                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </div>
                        </div>
                        <div className="mt-2.5 sm:mt-3">
                            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{Number(stats.total_scans || 0).toLocaleString()}</div>
                            <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Total logs</div>
                        </div>
                    </div>
                </div>

                {/* 3. LUXURY SEGMENTED NAVIGATION DOCK (Uniform Design System) */}
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1.5 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 sm:gap-2 sm:p-2 rounded-2xl bg-white/90 dark:bg-[#0B1524]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
                    {[
                        ...(isSuperAdmin ? [{ id: 'sub_admins', label: 'Sub Admins', count: subAdmins.length, icon: UserCheck }] : []),
                        { id: 'scanners', label: 'Gate Staff', count: gateStaff.length, icon: Smartphone },
                        { id: 'logs', label: 'Audit Stream', count: recentScanLogs.length, icon: Activity },
                        { id: 'customers', label: 'Organisers', count: customers.length, icon: Users },
                        { id: 'events', label: 'Events', count: allEvents.length, icon: Calendar },
                        { id: 'templates', label: 'Templates', count: globalTemplates.length, icon: Palette },
                        { id: 'gateways', label: 'Gateways', count: 'API', icon: Server },
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 min-w-[125px] sm:min-w-0 sm:w-full h-10 sm:h-11 px-3 rounded-xl text-xs font-bold flex items-center justify-between gap-1.5 transition-all duration-200 active:scale-[0.98] cursor-pointer group ${
                                    isActive
                                        ? "bg-slate-900 dark:bg-cyan-600 text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                                }`}
                            >
                                <div className="flex items-center gap-1.5 sm:gap-2 truncate">
                                    <IconComponent className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                                        isActive 
                                            ? "text-cyan-400 dark:text-white" 
                                            : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                                    }`} />
                                    <span className="truncate">{tab.label}</span>
                                </div>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex-shrink-0 transition-colors ${
                                    isActive 
                                        ? "bg-white/20 text-white" 
                                        : "bg-slate-100 dark:bg-white/[0.08] text-slate-600 dark:text-slate-300"
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* TAB 0: SUB ADMINISTRATORS FLEET & SCOPED ASSIGNMENTS */}
                {isSuperAdmin && activeTab === 'sub_admins' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2.5">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                        <UserCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <span>Sub Administrators &amp; Delegated Scope</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Manage delegated administrators and assign them to oversee specific event organisers or distinct campaigns. Organisers have zero control over these accounts.
                                </p>
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search sub admins..."
                                        value={subAdminSearch}
                                        onChange={(e) => setSubAdminSearch(e.target.value)}
                                        className="pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500 w-full sm:w-56"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSubAdminModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>New Sub Admin</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/90 dark:bg-[#07111D]/90 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                        <th className="py-3.5 px-5 font-extrabold text-left">Sub Administrator</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Contact Info</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Assigned Organisers</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Assigned Events</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Authority</th>
                                        <th className="py-3.5 px-5 font-extrabold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] font-medium">
                                    {filteredSubAdmins.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                                No sub administrators found matching your filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSubAdmins.map((admin) => (
                                            <tr key={admin.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition">
                                                <td className="py-3.5 px-5 align-middle">
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
                                                            className="p-1.5 rounded-xl text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
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

                {/* TAB 1: GATE STAFF FLEET & STATION ASSIGNMENTS */}
                {activeTab === 'scanners' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2.5">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                        <Smartphone className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <span>Gate Staff Fleet &amp; Station Deployments</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Manage mobile gatekeeper credentials, assigned venue entrance gates, and verification throughput.
                                </p>
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search gate staff..."
                                        value={staffSearch}
                                        onChange={(e) => setStaffSearch(e.target.value)}
                                        className="pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500 w-full sm:w-56"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCreateScannerModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Deploy Scanner</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/90 dark:bg-[#07111D]/90 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                        <th className="py-3.5 px-5 font-extrabold text-left">Staff Member &amp; Account</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Gate Station / Entrance</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Assigned Organiser</th>
                                        <th className="py-3.5 px-4 font-extrabold text-center">Volume</th>
                                        <th className="py-3.5 px-4 font-extrabold text-center">Granted vs Rejected</th>
                                        <th className="py-3.5 px-5 font-extrabold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] font-medium">
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
                                                    <td className="py-3.5 px-5 align-middle">
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
                                                                className="p-1.5 rounded-xl text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
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

                {/* TAB 2: LIVE GATE SCAN AUDIT STREAM */}
                {activeTab === 'logs' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden space-y-0 transition-colors duration-300">
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                    <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400 animate-pulse" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                        Live Security Verification Feed
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Real-time chronological telemetry for pass admissions and rejections across all entrance gates.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <div className="flex items-center bg-slate-100 dark:bg-white/[0.06] p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]">
                                    <button
                                        type="button"
                                        onClick={() => setLogStatusFilter('all')}
                                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                            logStatusFilter === 'all' 
                                                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        All ({recentScanLogs.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLogStatusFilter('granted')}
                                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                            logStatusFilter === 'granted' 
                                                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Admitted
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLogStatusFilter('rejected')}
                                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                                            logStatusFilter === 'rejected' 
                                                ? 'bg-slate-900 dark:bg-cyan-600 text-white shadow-2xs' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Rejected
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="sticky top-0 bg-slate-50/95 dark:bg-[#07111D]/95 backdrop-blur-md z-10">
                                    <tr className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] font-mono tracking-wider">
                                        <th className="py-3.5 px-5 font-extrabold text-left">Verification Result</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Attendee / Pass ID</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Event Campaign</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Gatekeeper &amp; Station</th>
                                        <th className="py-3.5 px-5 font-extrabold text-right">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] font-medium">
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                                                No scan audit logs found matching criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition">
                                                <td className="py-3.5 px-5 align-middle whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10.5px] uppercase ${
                                                        log.status === 'granted'
                                                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60'
                                                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60'
                                                    }`}>
                                                        {log.status === 'granted' ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                                        ) : (
                                                            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                                                        )}
                                                        <span>{log.status === 'granted' ? 'ADMISSION GRANTED' : 'REJECTED / INVALID'}</span>
                                                    </span>
                                                    {log.rejection_reason && (
                                                        <div className="text-[10.5px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
                                                            Reason: {log.rejection_reason}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 align-middle">
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm truncate">{log.guest_name}</div>
                                                    <div className="font-mono text-slate-500 dark:text-slate-400 text-[10.5px] truncate">{log.card_number}</div>
                                                </td>
                                                <td className="py-3.5 px-4 align-middle text-slate-800 dark:text-slate-200 font-semibold">
                                                    <span className="truncate block max-w-xs">{log.event_title}</span>
                                                </td>
                                                <td className="py-3.5 px-4 align-middle">
                                                    <div className="font-bold text-slate-900 dark:text-white truncate">{log.scanner_name}</div>
                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                                                        <MapPin className="w-3 h-3 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                                                        <span className="truncate">{log.gate_label}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 align-middle text-right font-mono text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                                                    {log.scanned_at}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: CUSTOMER ACCOUNTS (ORGANISERS) */}
                {activeTab === 'customers' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2.5">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                        <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <span>Customer Organiser Accounts &amp; Tenancy</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Organisers managing events, personalized pass suites, and attendee dispatch campaigns.
                                </p>
                            </div>

                            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search customers..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500 w-full sm:w-56"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCustomerModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>New Customer</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/90 dark:bg-[#07111D]/90 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                        <th className="py-3.5 px-5 font-extrabold text-left">Organiser / Contact</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Role &amp; Authority</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Status</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Message Quotas</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Activity Permissions</th>
                                        <th className="py-3.5 px-4 font-extrabold text-center">Events</th>
                                        <th className="py-3.5 px-4 font-extrabold text-center">Fleet</th>
                                        <th className="py-3.5 px-5 font-extrabold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] font-medium">
                                    {filteredCustomers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                                                No customer accounts found matching your query.
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
                                                    <td className="py-3.5 px-5 align-middle">
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
                                                                    <span className="truncate">{c.email}</span>
                                                                    {c.phone && <span className="flex-shrink-0 text-slate-400 dark:text-slate-500">• {c.phone}</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Role */}
                                                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-white/[0.08] text-[10.5px] font-bold uppercase tracking-wider font-mono">
                                                            {role === 'admin' ? (
                                                                <>
                                                                    <Crown className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                                    <span>Super Admin</span>
                                                                </>
                                                            ) : role === 'sub_admin' ? (
                                                                <>
                                                                    <ShieldCheck className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                                    <span>Sub-Admin</span>
                                                                </>
                                                            ) : role === 'scanner' ? (
                                                                <>
                                                                    <Smartphone className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                                    <span>Gate Staff</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Building2 className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                                    <span>Organiser</span>
                                                                </>
                                                            )}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                        {isSuspended ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08] text-[10.5px] font-medium">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                                <span>Suspended</span>
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08] text-[10.5px] font-medium">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                <span>Active</span>
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Message Quotas (WhatsApp & SMS) */}
                                                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                        {(role === 'admin' || role === 'sub_admin') && (c.max_whatsapp_limit === null || c.max_whatsapp_limit === undefined) && (c.max_sms_limit === null || c.max_sms_limit === undefined) ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 text-[10.5px] font-mono font-medium border border-slate-200/70 dark:border-white/[0.08]">
                                                                <span>Unrestricted (∞)</span>
                                                            </span>
                                                        ) : (
                                                            <div className="flex flex-col gap-1 w-[135px]">
                                                                {/* WhatsApp Quota Pill */}
                                                                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08] text-[10.5px] font-mono">
                                                                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9.5px]">WA</span>
                                                                    <span className="text-slate-700 dark:text-slate-200 font-medium">
                                                                        <strong className="text-slate-900 dark:text-white font-bold">{c.message_quotas?.whatsapp_used ?? 0}</strong>
                                                                        <span className="text-slate-400 dark:text-slate-500 mx-0.5">/</span>
                                                                        <span className="text-slate-600 dark:text-slate-400">
                                                                            {c.max_whatsapp_limit !== null && c.max_whatsapp_limit !== undefined && c.max_whatsapp_limit !== '' 
                                                                                ? c.max_whatsapp_limit 
                                                                                : (c.message_quotas?.whatsapp_limit !== null && c.message_quotas?.whatsapp_limit !== undefined ? c.message_quotas.whatsapp_limit : '∞')}
                                                                        </span>
                                                                    </span>
                                                                </div>

                                                                {/* SMS Quota Pill */}
                                                                <div className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] border border-slate-200/70 dark:border-white/[0.08] text-[10.5px] font-mono">
                                                                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[9.5px]">SMS</span>
                                                                    <span className="text-slate-700 dark:text-slate-200 font-medium">
                                                                        <strong className="text-slate-900 dark:text-white font-bold">{c.message_quotas?.sms_used ?? 0}</strong>
                                                                        <span className="text-slate-400 dark:text-slate-500 mx-0.5">/</span>
                                                                        <span className="text-slate-600 dark:text-slate-400">
                                                                            {c.max_sms_limit !== null && c.max_sms_limit !== undefined && c.max_sms_limit !== '' 
                                                                                ? c.max_sms_limit 
                                                                                : (c.message_quotas?.sms_limit !== null && c.message_quotas?.sms_limit !== undefined ? c.message_quotas.sms_limit : '∞')}
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>

                                                    {/* Permissions Activities */}
                                                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                        {role === 'admin' || role === 'sub_admin' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 text-[11px] font-medium font-mono border border-slate-200/70 dark:border-white/[0.08]">
                                                                <Shield className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                                <span>Full Administrative Scope</span>
                                                            </span>
                                                        ) : isSuspended ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-rose-600 dark:text-rose-400 text-[11px] font-medium font-mono border border-slate-200/70 dark:border-white/[0.08]">
                                                                <XCircle className="w-3 h-3 text-rose-500" />
                                                                <span>Portal Access Suspended</span>
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

                                                    {/* Events */}
                                                    <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                                                        <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                                                            {c.events_count || 0}
                                                        </span>
                                                    </td>

                                                    {/* Scanners */}
                                                    <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                                                        <span className="inline-flex items-center justify-center min-w-[30px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/70 dark:border-white/[0.08] font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                                                            {c.scanners_count || 0}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 px-5 align-middle text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => openEditCustomerModal(c)}
                                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-white/[0.08] text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
                                                                title="Manage Role & Activity Access"
                                                            >
                                                                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                                                <span>Governance</span>
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

                {/* TAB 4: EVENT DIRECTORY */}
                {activeTab === 'events' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white font-display flex items-center gap-2.5">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                        <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <span>All Platform Events Directory</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Global catalog of events created across all customer organizer accounts.
                                </p>
                            </div>

                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search events, venues, organizers..."
                                    value={eventSearch}
                                    onChange={(e) => setEventSearch(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500 w-56 sm:w-64"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/90 dark:bg-[#07111D]/90 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                        <th className="py-3.5 px-5 font-extrabold text-left">Event Title &amp; Category</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Organiser / Host</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Date &amp; Schedule</th>
                                        <th className="py-3.5 px-4 font-extrabold text-left">Venue &amp; Location</th>
                                        <th className="py-3.5 px-4 font-extrabold text-center">Guest Count</th>
                                        <th className="py-3.5 px-5 font-extrabold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] font-medium">
                                    {filteredEvents.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                                No events found matching your query.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEvents.map((evt) => (
                                            <tr key={evt.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition">
                                                <td className="py-3.5 px-5 align-middle">
                                                    <div className="font-bold text-slate-900 dark:text-white text-sm">{evt.title}</div>
                                                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold uppercase tracking-wider border border-cyan-200 dark:border-cyan-800/50">
                                                        {evt.event_type}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 align-middle text-slate-700 dark:text-slate-300">
                                                    <div className="font-bold text-slate-900 dark:text-white">{evt.user?.name || '—'}</div>
                                                    {evt.user?.company && (
                                                        <div className="text-[10.5px] text-slate-400">{evt.user.company}</div>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 align-middle font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                    <div className="font-bold text-slate-900 dark:text-slate-100">
                                                        {new Date(evt.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                    {evt.event_time && <div className="text-[10.5px] text-slate-400 font-sans">{evt.event_time}</div>}
                                                </td>
                                                <td className="py-3.5 px-4 align-middle text-slate-700 dark:text-slate-300 max-w-[200px]">
                                                    <div className="flex items-center gap-1 truncate font-medium">
                                                        <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
                                                        <span className="truncate">{evt.venue}</span>
                                                    </div>
                                                    {evt.city && <div className="text-[10.5px] text-slate-400 pl-4.5">{evt.city}</div>}
                                                </td>
                                                <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                                                    <span className="inline-flex items-center justify-center min-w-[32px] px-2 py-0.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200/80 dark:border-cyan-800/40 font-mono font-black text-xs text-cyan-800 dark:text-cyan-300">
                                                        {evt.guests_count || 0}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-5 align-middle text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={route('events.show', evt.id)}
                                                            className="p-1.5 rounded-xl text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                            title="Inspect Event Dashboard"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditEventModal(evt)}
                                                            className="p-1.5 rounded-xl text-slate-500 hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                            title="Edit Event Details"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteEvent(evt)}
                                                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                                                            title="Delete Event"
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

                {/* TAB 5: MASTER CARD TEMPLATES */}
                {activeTab === 'templates' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                    <Palette className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                        Master Card Templates &amp; Pass Artwork Library
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        Global preset templates available to all platform customers.
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={route('templates.index')}
                                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                            >
                                <Palette className="w-3.5 h-3.5" />
                                <span>Open Design Studio</span>
                            </Link>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50/80 dark:bg-[#07111D]/80 text-[10.5px] uppercase font-extrabold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] font-mono tracking-wider">
                                        <th className="py-3.5 px-5">Template Preview &amp; Title</th>
                                        <th className="py-3.5 px-4">Engine Type</th>
                                        <th className="py-3.5 px-4">Owner / Global Scope</th>
                                        <th className="py-3.5 px-4">Card Headline</th>
                                        <th className="py-3.5 px-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] font-medium">
                                    {globalTemplates.map((tpl) => {
                                        const isCustom = tpl.template_type === 'custom_art' && tpl.image_path;

                                        return (
                                            <tr key={tpl.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition">
                                                <td className="py-3.5 px-5 flex items-center gap-3">
                                                    {isCustom ? (
                                                        <div className="w-12 h-16 rounded-xl bg-slate-900 border border-slate-200 dark:border-white/[0.08] overflow-hidden flex-shrink-0 relative shadow-sm">
                                                            <img src={tpl.image_path} alt={tpl.name} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div 
                                                            className="w-12 h-16 rounded-xl flex-shrink-0 flex items-center justify-center text-[9px] text-white font-black shadow-sm border border-slate-200/40 dark:border-white/[0.08]"
                                                            style={{
                                                                background: `linear-gradient(135deg, ${tpl.brand_color_from} 0%, ${tpl.brand_color_to} 100%)`
                                                            }}
                                                        >
                                                            PASS
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                                                            <span>{tpl.name}</span>
                                                            {isCustom && (
                                                                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                                                                    ★ Custom Art
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-[10.5px] text-slate-400 font-mono">
                                                            ID: #{tpl.id}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <span className={`text-[10.5px] font-bold px-2.5 py-1 rounded-full ${
                                                        isCustom 
                                                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50' 
                                                            : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
                                                    }`}>
                                                        {isCustom ? 'Custom Art Overlay' : 'Standard Gradient'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                                                    {tpl.user ? (
                                                        <span className="font-bold text-slate-900 dark:text-white">{tpl.user.name}</span>
                                                    ) : (
                                                        <span className="text-slate-400 font-medium italic">Global Platform Template</span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-bold">
                                                    {tpl.headline}
                                                </td>
                                                <td className="py-3.5 px-5 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Link
                                                            href={route('templates.index')}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition cursor-pointer"
                                                            title="Edit Template in Studio"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                if (confirm(`Are you sure you want to delete template "${tpl.name}"?`)) {
                                                                    router.delete(route('templates.destroy', tpl.id));
                                                                }
                                                            }}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                                                            title="Delete Template"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
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

                {/* TAB 6: GATEWAYS & INTEGRATIONS */}
                {activeTab === 'gateways' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] p-6 sm:p-8 shadow-card space-y-6 transition-colors duration-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/[0.08] pb-5">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                        <Server className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                            Messaging Gateways &amp; Delivery Telemetry
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                            Manage Meta WhatsApp Cloud API credentials, SMS provider endpoints, and verify webhook delivery.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setGatewayModalOpen(true)}
                                className="py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition active:scale-95 self-start sm:self-auto cursor-pointer"
                            >
                                <Settings className="w-3.5 h-3.5 text-cyan-400 dark:text-white" />
                                <span>Configure Gateways</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* WhatsApp Gateway Card */}
                            <div className="p-6 rounded-3xl bg-slate-50/70 dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-5">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold text-sm shadow-2xs">
                                                <Smartphone className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-base text-slate-900 dark:text-white">
                                                    {gateways.whatsapp?.provider || 'Meta WhatsApp Cloud API'}
                                                </h4>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                    Sender: {gateways.whatsapp?.sender_number || '+255 700 000 000'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-[10.5px] font-extrabold px-3 py-1 rounded-full ${
                                            gateways.whatsapp?.status === 'Disabled' 
                                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' 
                                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60'
                                        }`}>
                                            {gateways.whatsapp?.status || 'Operational'}
                                        </span>
                                    </div>

                                    <div className="bg-white dark:bg-[#0B1524] p-4 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] space-y-2 text-xs text-slate-600 dark:text-slate-300 font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Phone Number ID:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{gateways.whatsapp?.phone_number_id || '108492019482910'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">WABA ID:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{gateways.whatsapp?.waba_id || '94820194820184'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">API Version:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{gateways.whatsapp?.api_version || 'v20.0'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Production Key:</span>
                                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">✓ Active &amp; Verified</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setGatewayModalOpen(true)}
                                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-xs cursor-pointer"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    <span>Customize WhatsApp Gateway</span>
                                </button>
                            </div>

                            {/* SMS Gateway Card */}
                            <div className="p-6 rounded-3xl bg-slate-50/70 dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.08] shadow-xs flex flex-col justify-between space-y-5">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/[0.06] border border-slate-200/60 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 flex items-center justify-center font-bold text-sm shadow-2xs">
                                                <MessageSquare className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-base text-slate-900 dark:text-white">
                                                    {gateways.sms?.provider || 'NextSMS Tanzania'}
                                                </h4>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                                    Sender ID: <strong className="text-slate-900 dark:text-white font-bold">{gateways.sms?.sender_id || 'KARDOVO'}</strong>
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-[10.5px] font-extrabold px-3 py-1 rounded-full ${
                                            gateways.sms?.status === 'Disabled' 
                                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' 
                                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300 border border-blue-300 dark:border-blue-800/60'
                                        }`}>
                                            {gateways.sms?.status || 'Active'}
                                        </span>
                                    </div>

                                    <div className="bg-white dark:bg-[#0B1524] p-4 rounded-2xl border border-slate-200/90 dark:border-white/[0.08] space-y-2 text-xs text-slate-600 dark:text-slate-300 font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Account Balance:</span>
                                            <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50">{gateways.sms?.balance || '12,450 TZS'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Sender ID:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{gateways.sms?.sender_id || 'KARDOVO'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Country Code:</span>
                                            <span className="font-bold text-slate-900 dark:text-white">{gateways.sms?.country_code || '+255'}</span>
                                        </div>
                                        <div className="flex justify-between truncate">
                                            <span className="text-slate-400">Endpoint:</span>
                                            <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[170px]">{gateways.sms?.api_endpoint || 'NextSMS Single SMS API'}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setGatewayModalOpen(true)}
                                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-xs cursor-pointer"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    <span>Customize SMS Gateway</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal 1: Create Customer Account & Activity Governance */}
            <Modal show={customerModalOpen} onClose={() => setCustomerModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleCreateCustomer} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                                    <span>Create Organiser &amp; Assign Role</span>
                                    <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                                        Governance
                                    </span>
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                    Provision an organizer account, configure administrative role, and customize portal activity capabilities.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCustomerModalOpen(false)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Basic Profile Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Contact Person Name *" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="e.g. Neema Mbwana / Alfred Mashauri"
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
                                <InputLabel value="Email Address (Login Username) *" />
                                <TextInput
                                    type="email"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    placeholder="e.g. neema@events.co.tz"
                                    value={customerForm.data.email}
                                    onChange={(e) => {
                                        customerForm.setData('email', e.target.value);
                                        if (customerClientErrors.email) setCustomerClientErrors(prev => ({ ...prev, email: undefined }));
                                    }}
                                    hasError={Boolean(customerClientErrors.email || customerForm.errors.email)}
                                    required
                                />
                                <InputError message={customerClientErrors.email || customerForm.errors.email} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Company / Event Agency Brand" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="e.g. Pristine Events Tanzania"
                                    value={customerForm.data.company}
                                    onChange={(e) => customerForm.setData('company', e.target.value)}
                                />
                                <InputError message={customerForm.errors.company} className="mt-1" />
                            </div>

                            <div>
                                <InputLabel value="Phone Number (SMS / WhatsApp)" />
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
                                    <InputLabel value="Initial Password *" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const pwd = generateStrongPassword(16);
                                            customerForm.setData('password', pwd);
                                            if (customerClientErrors.password) setCustomerClientErrors(prev => ({ ...prev, password: undefined }));
                                        }}
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 cursor-pointer bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800/40"
                                        title="Generate strong 16-character password"
                                    >
                                        <Sparkles className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
                                        <span>Suggest Strong</span>
                                    </button>
                                </div>
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    placeholder="Min 8 chars, uppercase, lowercase, numbers & symbols"
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
                                <InputLabel value="Assigned System Role *" />
                                <select
                                    value={customerForm.data.role}
                                    onChange={(e) => customerForm.setData('role', e.target.value)}
                                    className="mt-1 block w-full text-xs font-bold rounded-xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500/20"
                                >
                                    <option value="customer">🏢 Event Organiser (Standard Tenant)</option>
                                    <option value="sub_admin">🛡️ Sub-Administrator (Scoped Access)</option>
                                    <option value="admin">👑 Super Administrator (Full Access)</option>
                                    <option value="scanner">📱 Gate Scanner Staff (Mobile Only)</option>
                                </select>
                            </div>
                        </div>

                        {/* Account Status & Event Quota */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                            <div>
                                <InputLabel value="Account Status" />
                                <div className="mt-1.5 flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="create_status"
                                            value="active"
                                            checked={customerForm.data.status === 'active'}
                                            onChange={() => customerForm.setData('status', 'active')}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Active
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="create_status"
                                            value="suspended"
                                            checked={customerForm.data.status === 'suspended'}
                                            onChange={() => customerForm.setData('status', 'suspended')}
                                            className="text-rose-600 focus:ring-rose-500"
                                        />
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                                            Suspended
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Max Events Hosting Quota" />
                                <TextInput
                                    type="number"
                                    min="1"
                                    placeholder="Unlimited"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    value={customerForm.data.max_events_limit}
                                    onChange={(e) => customerForm.setData('max_events_limit', e.target.value)}
                                />
                                <span className="text-[10px] text-slate-400 font-mono">Leave blank for unrestricted</span>
                            </div>
                        </div>

                        {/* Dispatch Quota Customization: WhatsApp & SMS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel value="WhatsApp Dispatch Quota (Messages)" />
                                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">💬 WhatsApp</span>
                                </div>
                                <TextInput
                                    type="number"
                                    min="0"
                                    placeholder="Unlimited"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    value={customerForm.data.max_whatsapp_limit}
                                    onChange={(e) => customerForm.setData('max_whatsapp_limit', e.target.value)}
                                />
                                <span className="text-[10px] text-slate-400 font-mono">Max total WhatsApp passes/messages</span>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel value="SMS Dispatch Quota (SMS Messages)" />
                                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">📱 Regular SMS</span>
                                </div>
                                <TextInput
                                    type="number"
                                    min="0"
                                    placeholder="Unlimited"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    value={customerForm.data.max_sms_limit}
                                    onChange={(e) => customerForm.setData('max_sms_limit', e.target.value)}
                                />
                                <span className="text-[10px] text-slate-400 font-mono">Max total SMS passes/messages</span>
                            </div>
                        </div>

                        {/* Portal Activity Switchboard */}
                        <div className="space-y-3 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                                        <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                        <span>Permitted Portal Activities &amp; Features</span>
                                    </h4>
                                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                                        Toggle specific modules and actions this organizer can access inside their portal.
                                    </p>
                                </div>

                                {/* Presets */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => customerForm.setData('permissions', { ...DEFAULT_ORGANIZER_PERMS })}
                                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition"
                                    >
                                        Full Access
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
                                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition"
                                    >
                                        Standard Host
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
                                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition"
                                    >
                                        Revoke All
                                    </button>
                                </div>
                            </div>

                            {/* 6 Capability Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {[
                                    { key: 'can_create_events', label: 'Event Creation & Management', desc: 'Create, edit, and publish wedding & summit events.', icon: Calendar },
                                    { key: 'can_import_guests', label: 'Guest Import & Registration', desc: 'Upload CSV/Excel spreadsheets and add attendees.', icon: FileSpreadsheet },
                                    { key: 'can_send_broadcasts', label: 'WhatsApp & SMS Campaigns', desc: 'Dispatch instant passes & bulk SMS broadcasts.', icon: Send },
                                    { key: 'can_customize_templates', label: '4K Pass Design Studio', desc: 'Customize typography, QR position, & background art.', icon: Palette },
                                    { key: 'can_manage_scanners', label: 'Gate Scanner Staff Fleet', desc: 'Provision gatekeeper login PIN accounts.', icon: Smartphone },
                                    { key: 'can_export_data', label: 'Audit & RSVP Data Export', desc: 'Download CSV reports and check-in logs.', icon: Download },
                                ].map((cap) => {
                                    const IconComp = cap.icon;
                                    const isChecked = customerForm.data.permissions[cap.key] !== false;

                                    return (
                                        <label
                                            key={cap.key}
                                            className={`p-3 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                                                isChecked
                                                    ? 'bg-cyan-50/40 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800/60'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-70'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div className={`p-1.5 rounded-xl ${
                                                    isChecked ? 'bg-cyan-600 text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-500'
                                                }`}>
                                                    <IconComp className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {cap.label}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                                                        {cap.desc}
                                                    </div>
                                                </div>
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
                                                className="mt-1 rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-end gap-2.5">
                        <SecondaryButton onClick={() => setCustomerModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={customerForm.processing} className="bg-kardovo-navy dark:bg-cyan-600">
                            Create Account &amp; Grant Access
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 2: Edit Customer Account & Role Governance */}
            <Modal show={!!editingCustomer} onClose={() => setEditingCustomer(null)} maxWidth="2xl">
                <form onSubmit={handleUpdateCustomer} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                                <SlidersHorizontal className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display flex items-center gap-2">
                                    <span>Organiser Governance &amp; Permissions</span>
                                    <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/40">
                                        {editingCustomer?.role?.toUpperCase()}
                                    </span>
                                </h3>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                    Edit organizer profile, switch administrative roles, or toggle permitted portal capabilities.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingCustomer(null)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Profile Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Full Name *" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="e.g. Neema Mbwana"
                                    value={editCustomerForm.data.name}
                                    onChange={(e) => editCustomerForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel value="Email Address (Login Username) *" />
                                <TextInput
                                    type="email"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    placeholder="e.g. neema@events.co.tz"
                                    value={editCustomerForm.data.email}
                                    onChange={(e) => editCustomerForm.setData('email', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel value="Company / Event Agency Brand" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="e.g. Pristine Events Tanzania"
                                    value={editCustomerForm.data.company}
                                    onChange={(e) => editCustomerForm.setData('company', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel value="Phone Number (WhatsApp notifications)" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    placeholder="e.g. +255 712 345 678"
                                    value={editCustomerForm.data.phone}
                                    onChange={(e) => editCustomerForm.setData('phone', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel value="Reset Password (Leave blank to keep unchanged)" />
                                <TextInput
                                    type="password"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    placeholder="Leave empty to keep existing password..."
                                    value={editCustomerForm.data.password}
                                    onChange={(e) => editCustomerForm.setData('password', e.target.value)}
                                />
                            </div>

                            <div>
                                <InputLabel value="Assigned System Role *" />
                                <select
                                    value={editCustomerForm.data.role}
                                    onChange={(e) => editCustomerForm.setData('role', e.target.value)}
                                    className="mt-1 block w-full text-xs font-bold rounded-xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-slate-100 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-500/20"
                                >
                                    <option value="customer">🏢 Event Organiser (Standard Tenant)</option>
                                    <option value="sub_admin">🛡️ Sub-Administrator (Scoped Access)</option>
                                    <option value="admin">👑 Super Administrator (Full Governance)</option>
                                    <option value="scanner">📱 Gate Scanner Staff (Mobile Only)</option>
                                </select>
                            </div>
                        </div>

                        {/* Status & Quota Controls */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                            <div>
                                <InputLabel value="Account Status" />
                                <div className="mt-1.5 flex items-center gap-3">
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="edit_status"
                                            value="active"
                                            checked={editCustomerForm.data.status === 'active'}
                                            onChange={() => editCustomerForm.setData('status', 'active')}
                                            className="text-emerald-600 focus:ring-emerald-500"
                                        />
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                            Active
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="edit_status"
                                            value="suspended"
                                            checked={editCustomerForm.data.status === 'suspended'}
                                            onChange={() => editCustomerForm.setData('status', 'suspended')}
                                            className="text-rose-600 focus:ring-rose-500"
                                        />
                                        <span className="flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                                            Suspended
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <InputLabel value="Max Events Hosting Quota" />
                                <TextInput
                                    type="number"
                                    min="1"
                                    placeholder="Unlimited"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    value={editCustomerForm.data.max_events_limit}
                                    onChange={(e) => editCustomerForm.setData('max_events_limit', e.target.value)}
                                />
                                <span className="text-[10px] text-slate-400 font-mono">Leave blank for unrestricted</span>
                            </div>

                            {editCustomerForm.data.status === 'suspended' && (
                                <div className="col-span-full">
                                    <InputLabel value="Suspension Reason / Notice to Organiser" />
                                    <TextInput
                                        type="text"
                                        placeholder="e.g. Account under billing review or terms check..."
                                        className="mt-1 block w-full text-xs font-bold text-rose-700 dark:text-rose-300"
                                        value={editCustomerForm.data.suspension_reason}
                                        onChange={(e) => editCustomerForm.setData('suspension_reason', e.target.value)}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Dispatch Quota Customization: WhatsApp & SMS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.06]">
                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel value="WhatsApp Dispatch Quota (Messages)" />
                                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">💬 WhatsApp</span>
                                </div>
                                <TextInput
                                    type="number"
                                    min="0"
                                    placeholder="Unlimited"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    value={editCustomerForm.data.max_whatsapp_limit}
                                    onChange={(e) => editCustomerForm.setData('max_whatsapp_limit', e.target.value)}
                                />
                                <span className="text-[10px] text-slate-400 font-mono">Max total WhatsApp passes/messages</span>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <InputLabel value="SMS Dispatch Quota (SMS Messages)" />
                                    <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">📱 Regular SMS</span>
                                </div>
                                <TextInput
                                    type="number"
                                    min="0"
                                    placeholder="Unlimited"
                                    className="mt-1 block w-full text-xs font-mono font-bold"
                                    value={editCustomerForm.data.max_sms_limit}
                                    onChange={(e) => editCustomerForm.setData('max_sms_limit', e.target.value)}
                                />
                                <span className="text-[10px] text-slate-400 font-mono">Max total SMS passes/messages</span>
                            </div>
                        </div>

                        {/* Portal Activity Switchboard */}
                        <div className="space-y-3 pt-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                                        <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                        <span>Permitted Portal Activities &amp; Features</span>
                                    </h4>
                                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400">
                                        Control what activities this organizer can conduct inside their portal.
                                    </p>
                                </div>

                                {/* Presets */}
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => editCustomerForm.setData('permissions', { ...DEFAULT_ORGANIZER_PERMS })}
                                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition"
                                    >
                                        Full Access
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
                                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition"
                                    >
                                        Standard Host
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
                                        className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-white/[0.06] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-200 transition"
                                    >
                                        Revoke All
                                    </button>
                                </div>
                            </div>

                            {/* 6 Capability Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {[
                                    { key: 'can_create_events', label: 'Event Creation & Management', desc: 'Create, edit, and publish wedding & summit events.', icon: Calendar },
                                    { key: 'can_import_guests', label: 'Guest Import & Registration', desc: 'Upload CSV/Excel spreadsheets and add attendees.', icon: FileSpreadsheet },
                                    { key: 'can_send_broadcasts', label: 'WhatsApp & SMS Campaigns', desc: 'Dispatch instant passes & bulk SMS broadcasts.', icon: Send },
                                    { key: 'can_customize_templates', label: '4K Pass Design Studio', desc: 'Customize typography, QR position, & background art.', icon: Palette },
                                    { key: 'can_manage_scanners', label: 'Gate Scanner Staff Fleet', desc: 'Provision gatekeeper login PIN accounts.', icon: Smartphone },
                                    { key: 'can_export_data', label: 'Audit & RSVP Data Export', desc: 'Download CSV reports and check-in logs.', icon: Download },
                                ].map((cap) => {
                                    const IconComp = cap.icon;
                                    const isChecked = editCustomerForm.data.permissions[cap.key] !== false;

                                    return (
                                        <label
                                            key={cap.key}
                                            className={`p-3 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                                                isChecked
                                                    ? 'bg-cyan-50/40 dark:bg-cyan-950/20 border-cyan-300 dark:border-cyan-800/60'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] opacity-70'
                                            }`}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                <div className={`p-1.5 rounded-xl ${
                                                    isChecked ? 'bg-cyan-600 text-white' : 'bg-slate-200 dark:bg-white/[0.08] text-slate-500'
                                                }`}>
                                                    <IconComp className="w-3.5 h-3.5" />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                                                        {cap.label}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                                                        {cap.desc}
                                                    </div>
                                                </div>
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
                                                className="mt-1 rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                                            />
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-end gap-2.5">
                        <SecondaryButton onClick={() => setEditingCustomer(null)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={editCustomerForm.processing} className="bg-kardovo-navy dark:bg-cyan-600">
                            Save Governance Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal: Edit Platform Event (Admin) */}
            <Modal show={!!editingEvent} onClose={() => setEditingEvent(null)} maxWidth="lg">
                <form onSubmit={handleUpdateEvent} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-500/30">
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                                    Edit Platform Event (Admin)
                                </h3>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingEvent(null)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3.5">
                        <div>
                            <InputLabel value="Event Title *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold"
                                value={editEventForm.data.title}
                                onChange={(e) => editEventForm.setData('title', e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Owner / Organiser Customer *" />
                                <select
                                    className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold px-3 py-2 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition"
                                    value={editEventForm.data.user_id}
                                    onChange={(e) => editEventForm.setData('user_id', e.target.value)}
                                    required
                                >
                                    <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Select Organiser...</option>
                                    {customers.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                                            {c.name} ({c.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Event Type *" />
                                <select
                                    className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold px-3 py-2 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition"
                                    value={editEventForm.data.event_type}
                                    onChange={(e) => editEventForm.setData('event_type', e.target.value)}
                                    required
                                >
                                    <option value="Wedding Reception" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Wedding Reception</option>
                                    <option value="Engagement Party" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Engagement Party</option>
                                    <option value="Alumni Gala" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Alumni Gala</option>
                                    <option value="Corporate Conference" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Corporate Conference</option>
                                    <option value="Birthday Party" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Birthday Party</option>
                                    <option value="Concert / Festival" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Concert / Festival</option>
                                    <option value="Private Dinner" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Private Dinner</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Event Date *" />
                                <TextInput
                                    type="date"
                                    className="mt-1 block w-full text-xs font-bold"
                                    value={editEventForm.data.event_date}
                                    onChange={(e) => editEventForm.setData('event_date', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel value="Time Label" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="e.g. 4:00 PM — Reception & Dinner"
                                    value={editEventForm.data.event_time}
                                    onChange={(e) => editEventForm.setData('event_time', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Venue Name *" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    value={editEventForm.data.venue}
                                    onChange={(e) => editEventForm.setData('venue', e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <InputLabel value="City" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    value={editEventForm.data.city}
                                    onChange={(e) => editEventForm.setData('city', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Invitation Template" />
                                <select
                                    className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold px-3 py-2 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition"
                                    value={editEventForm.data.card_template_id}
                                    onChange={(e) => editEventForm.setData('card_template_id', e.target.value)}
                                >
                                    <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Default System Pass</option>
                                    {globalTemplates.map((t) => (
                                        <option key={t.id} value={t.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                                            {t.name} ({t.template_type})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <InputLabel value="Event Status" />
                                <select
                                    className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold px-3 py-2 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition"
                                    value={editEventForm.data.status}
                                    onChange={(e) => editEventForm.setData('status', e.target.value)}
                                >
                                    <option value="active" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Active (Live)</option>
                                    <option value="draft" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Draft</option>
                                    <option value="completed" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Completed</option>
                                    <option value="cancelled" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Description / Admin Notes" />
                            <textarea
                                rows={2}
                                className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs p-3 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition outline-none"
                                placeholder="Admin or organiser notes..."
                                value={editEventForm.data.description}
                                onChange={(e) => editEventForm.setData('description', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-end gap-2.5">
                        <SecondaryButton onClick={() => setEditingEvent(null)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={editEventForm.processing} className="bg-kardovo-navy dark:bg-cyan-600">
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 2: Create Gate Staff Account */}
            <Modal show={createScannerModalOpen} onClose={() => setCreateScannerModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCreateScanner} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                                <Smartphone className="w-4 h-4" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                                Create Gate Staff Account
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCreateScannerModalOpen(false)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3.5">
                        <div>
                            <InputLabel value="Staff Member Full Name *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold"
                                placeholder="e.g. Baraka Gatekeeper"
                                value={createScannerForm.data.name}
                                onChange={(e) => {
                                    createScannerForm.setData('name', e.target.value);
                                    if (scannerClientErrors.name) setScannerClientErrors(prev => ({ ...prev, name: undefined }));
                                }}
                                hasError={Boolean(scannerClientErrors.name || createScannerForm.errors.name)}
                                required
                            />
                            <InputError message={scannerClientErrors.name || createScannerForm.errors.name} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel value="Email Address (Login Username) *" />
                            <TextInput
                                type="email"
                                className="mt-1 block w-full text-xs font-mono font-bold"
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
                            <InputLabel value="Assigned Gate Station / Label *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold"
                                placeholder="e.g. Gate 1 — Main VIP Entrance"
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
                            <InputLabel value="Assign to Organiser (Optional)" />
                            <select
                                className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold px-3 py-2 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition"
                                value={createScannerForm.data.customer_id}
                                onChange={(e) => createScannerForm.setData('customer_id', e.target.value)}
                            >
                                <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Global / All Customer Events</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                                        {c.name} {c.company ? `(${c.company})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Phone Number (Optional)" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold"
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
                                <InputLabel value="Staff Password *" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const pwd = generateStrongPassword(16);
                                        createScannerForm.setData('password', pwd);
                                        if (scannerClientErrors.password) setScannerClientErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-700 dark:text-cyan-300 hover:text-cyan-800 dark:hover:text-cyan-200 cursor-pointer bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-200 dark:border-cyan-800/40"
                                    title="Generate strong 16-character password"
                                >
                                    <Sparkles className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
                                    <span>Suggest Strong</span>
                                </button>
                            </div>
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold"
                                placeholder="Min 8 chars, uppercase, lowercase, numbers & symbols"
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

                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-end gap-2.5">
                        <SecondaryButton onClick={() => setCreateScannerModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={createScannerForm.processing} className="bg-kardovo-navy dark:bg-emerald-600">
                            Create Gate Staff Account
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 3: Edit Gate Staff Account */}
            <Modal show={!!editingScanner} onClose={() => setEditingScanner(null)} maxWidth="md">
                <form onSubmit={handleUpdateScanner} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                                <Edit className="w-4 h-4" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                                Edit Gate Staff Account
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingScanner(null)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3.5">
                        <div>
                            <InputLabel value="Staff Member Full Name *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold"
                                value={editScannerForm.data.name}
                                onChange={(e) => editScannerForm.setData('name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Email Address *" />
                            <TextInput
                                type="email"
                                className="mt-1 block w-full text-xs font-mono font-bold"
                                value={editScannerForm.data.email}
                                onChange={(e) => editScannerForm.setData('email', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Assigned Gate Station / Label *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold"
                                value={editScannerForm.data.gate_label}
                                onChange={(e) => editScannerForm.setData('gate_label', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Assign to Organiser" />
                            <select
                                className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold px-3 py-2 hover:border-cyan-500/70 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition"
                                value={editScannerForm.data.customer_id}
                                onChange={(e) => editScannerForm.setData('customer_id', e.target.value)}
                            >
                                <option value="" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Global / All Customer Events</option>
                                {customers.map((c) => (
                                    <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                                        {c.name} {c.company ? `(${c.company})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <InputLabel value="Phone Number" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold"
                                value={editScannerForm.data.phone}
                                onChange={(e) => editScannerForm.setData('phone', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel value="Reset Password (Leave blank to keep current password)" />
                            <TextInput
                                type="password"
                                className="mt-1 block w-full text-xs font-mono font-bold"
                                placeholder="New password..."
                                value={editScannerForm.data.password}
                                onChange={(e) => editScannerForm.setData('password', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-end gap-2.5">
                        <SecondaryButton onClick={() => setEditingScanner(null)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={editScannerForm.processing} className="bg-kardovo-navy dark:bg-cyan-600">
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 4: Configure Messaging Gateways */}
            <GatewayConfigModal 
                show={gatewayModalOpen} 
                onClose={() => setGatewayModalOpen(false)} 
                gateways={gateways} 
            />
        {/* Modal 5: Create Sub Administrator */}
            <Modal show={subAdminModalOpen} onClose={() => setSubAdminModalOpen(false)} maxWidth="lg">
                <form onSubmit={handleCreateSubAdmin} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                                <UserCheck className="w-4 h-4" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                                Create Sub Administrator Account
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSubAdminModalOpen(false)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Full Name *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold"
                                placeholder="e.g. Sarah Operations"
                                value={createSubAdminForm.data.name}
                                onChange={(e) => createSubAdminForm.setData('name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Email Address (Login) *" />
                            <TextInput
                                type="email"
                                className="mt-1 block w-full text-xs font-mono font-bold"
                                placeholder="e.g. sarah@kardovo.com"
                                value={createSubAdminForm.data.email}
                                onChange={(e) => createSubAdminForm.setData('email', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Phone Number (Optional)" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold"
                                placeholder="+255 7XX XXX XXX"
                                value={createSubAdminForm.data.phone}
                                onChange={(e) => createSubAdminForm.setData('phone', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel value="Initial Password *" />
                            <TextInput
                                type="password"
                                className="mt-1 block w-full text-xs font-mono font-bold"
                                value={createSubAdminForm.data.password}
                                onChange={(e) => createSubAdminForm.setData('password', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Assignment Scope Section */}
                    <div className="space-y-4 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
                        <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                                <Users className="w-3.5 h-3.5 text-blue-500" />
                                <span>Assign to Organisers</span>
                                <span className="text-[10px] text-slate-400 font-normal">(Sub Admin can oversee all events created by checked organisers)</span>
                            </div>
                            <div className="max-h-32 overflow-y-auto p-2.5 rounded-2xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] space-y-1.5">
                                {customers.length === 0 ? (
                                    <div className="text-xs text-slate-400 italic">No organisers available.</div>
                                ) : (
                                    customers.map(c => {
                                        const isChecked = createSubAdminForm.data.organizer_ids.includes(c.id);
                                        return (
                                            <label key={c.id} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white dark:hover:bg-white/[0.04] cursor-pointer transition text-xs select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const newIds = e.target.checked
                                                            ? [...createSubAdminForm.data.organizer_ids, c.id]
                                                            : createSubAdminForm.data.organizer_ids.filter(id => id !== c.id);
                                                        createSubAdminForm.setData('organizer_ids', newIds);
                                                    }}
                                                    className="rounded text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5"
                                                />
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                                                {c.company && <span className="text-[10.5px] text-slate-400">({c.company})</span>}
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                                <span>Assign to Specific Events</span>
                                <span className="text-[10px] text-slate-400 font-normal">(Sub Admin can oversee these individual events)</span>
                            </div>
                            <div className="max-h-32 overflow-y-auto p-2.5 rounded-2xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] space-y-1.5">
                                {allEvents.length === 0 ? (
                                    <div className="text-xs text-slate-400 italic">No events available.</div>
                                ) : (
                                    allEvents.map(ev => {
                                        const isChecked = createSubAdminForm.data.event_ids.includes(ev.id);
                                        return (
                                            <label key={ev.id} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white dark:hover:bg-white/[0.04] cursor-pointer transition text-xs select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const newIds = e.target.checked
                                                            ? [...createSubAdminForm.data.event_ids, ev.id]
                                                            : createSubAdminForm.data.event_ids.filter(id => id !== ev.id);
                                                        createSubAdminForm.setData('event_ids', newIds);
                                                    }}
                                                    className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                                                />
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{ev.title}</span>
                                                <span className="text-[10.5px] text-slate-400">({ev.venue || 'TBA'})</span>
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-end gap-2.5">
                        <SecondaryButton onClick={() => setSubAdminModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={createSubAdminForm.processing} className="bg-kardovo-navy dark:bg-cyan-600">
                            Create Sub Administrator
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 6: Edit Sub Administrator */}
            <Modal show={!!editingSubAdmin} onClose={() => setEditingSubAdmin(null)} maxWidth="lg">
                <form onSubmit={handleUpdateSubAdmin} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                                <Edit className="w-4 h-4" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white font-display">
                                Edit Sub Administrator &amp; Assignments
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setEditingSubAdmin(null)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <InputLabel value="Full Name *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold"
                                value={editSubAdminForm.data.name}
                                onChange={(e) => editSubAdminForm.setData('name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Email Address *" />
                            <TextInput
                                type="email"
                                className="mt-1 block w-full text-xs font-mono font-bold"
                                value={editSubAdminForm.data.email}
                                onChange={(e) => editSubAdminForm.setData('email', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Phone Number" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-mono font-bold"
                                value={editSubAdminForm.data.phone}
                                onChange={(e) => editSubAdminForm.setData('phone', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel value="Reset Password (Leave blank to keep current)" />
                            <TextInput
                                type="password"
                                className="mt-1 block w-full text-xs font-mono font-bold"
                                placeholder="New password..."
                                value={editSubAdminForm.data.password}
                                onChange={(e) => editSubAdminForm.setData('password', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Assignment Scope Section */}
                    <div className="space-y-4 pt-3 border-t border-slate-200/80 dark:border-white/[0.08]">
                        <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                                <Users className="w-3.5 h-3.5 text-blue-500" />
                                <span>Assign to Organisers</span>
                            </div>
                            <div className="max-h-32 overflow-y-auto p-2.5 rounded-2xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] space-y-1.5">
                                {customers.length === 0 ? (
                                    <div className="text-xs text-slate-400 italic">No organisers available.</div>
                                ) : (
                                    customers.map(c => {
                                        const isChecked = editSubAdminForm.data.organizer_ids.includes(c.id);
                                        return (
                                            <label key={c.id} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white dark:hover:bg-white/[0.04] cursor-pointer transition text-xs select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const newIds = e.target.checked
                                                            ? [...editSubAdminForm.data.organizer_ids, c.id]
                                                            : editSubAdminForm.data.organizer_ids.filter(id => id !== c.id);
                                                        editSubAdminForm.setData('organizer_ids', newIds);
                                                    }}
                                                    className="rounded text-cyan-600 focus:ring-cyan-500 h-3.5 w-3.5"
                                                />
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{c.name}</span>
                                                {c.company && <span className="text-[10.5px] text-slate-400">({c.company})</span>}
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
                                <Calendar className="w-3.5 h-3.5 text-purple-500" />
                                <span>Assign to Specific Events</span>
                            </div>
                            <div className="max-h-32 overflow-y-auto p-2.5 rounded-2xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] space-y-1.5">
                                {allEvents.length === 0 ? (
                                    <div className="text-xs text-slate-400 italic">No events available.</div>
                                ) : (
                                    allEvents.map(ev => {
                                        const isChecked = editSubAdminForm.data.event_ids.includes(ev.id);
                                        return (
                                            <label key={ev.id} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-white dark:hover:bg-white/[0.04] cursor-pointer transition text-xs select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const newIds = e.target.checked
                                                            ? [...editSubAdminForm.data.event_ids, ev.id]
                                                            : editSubAdminForm.data.event_ids.filter(id => id !== ev.id);
                                                        editSubAdminForm.setData('event_ids', newIds);
                                                    }}
                                                    className="rounded text-purple-600 focus:ring-purple-500 h-3.5 w-3.5"
                                                />
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{ev.title}</span>
                                                <span className="text-[10.5px] text-slate-400">({ev.venue || 'TBA'})</span>
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex justify-end gap-2.5">
                        <SecondaryButton onClick={() => setEditingSubAdmin(null)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton disabled={editSubAdminForm.processing} className="bg-kardovo-navy dark:bg-cyan-600">
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

        </KardovoAppLayout>
    );
}

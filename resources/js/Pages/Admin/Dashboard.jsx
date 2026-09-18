import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Head, useForm, Link, router } from '@inertiajs/react';
import KardovoAppLayout from '@/Layouts/KardovoAppLayout';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ConfirmationModal from '@/Components/ConfirmationModal';
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
    Zap, 
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
    KeyRound,
    TrendingUp
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
        password: "",
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

    const [subAdminClientErrors, setSubAdminClientErrors] = useState({});

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
            name: subAdmin.name || "",
            email: subAdmin.email || "",
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
                router.delete(route("admin.destroySubAdmin", subAdmin.id), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
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
        password: '',
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
        city: '',
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
        gate_label: '',
        customer_id: customers[0]?.id || '',
        password: '',
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
        editCustomerForm.clearErrors();
        const perms = customer.effective_permissions || customer.permissions || DEFAULT_ORGANIZER_PERMS;
        editCustomerForm.setData({
            name: customer.name || '',
            email: customer.email || '',
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
        setConfirmModal({
            show: true,
            title: 'Delete Event?',
            message: `Delete event "${event.title}"? All guests and passes will be removed.`,
            warning: 'This cannot be undone.',
            confirmText: 'Delete',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('events.destroy', event.id), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const handleCreateScanner = (e) => {
        e.preventDefault();
        const errs = {};
        if (!validateRequired(createScannerForm.data.name, 2)) {
            errs.name = 'Name is required.';
        if (!validateEmail(createScannerForm.data.email)) {
            errs.email = 'Valid email is required.';
        }
            errs.phone = 'Valid phone is required.';
        }
        if (!validateRequired(createScannerForm.data.gate_label, 2)) {
        }
        const pwdCheck = validatePassword(createScannerForm.data.password);
        if (!createScannerForm.data.password || !pwdCheck.isStrong) {
        }

        if (Object.keys(errs).length > 0) {
            setScannerClientErrors(errs);
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

    const handleDeleteLog = (log) => {
        const name = log.guest_name || 'Pass';
        setConfirmModal({
            show: true,
            title: 'Delete Scan Log?',
            message: `Delete scan record for "${name}"?`,
            confirmText: 'Delete',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('admin.destroyScanLog', log.id), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
    };

    const handleClearAllLogs = () => {
        setConfirmModal({
            show: true,
            title: 'Clear All Scan Logs?',
            message: `Delete all ${recentScanLogs.length} scan records?`,
            warning: 'This cannot be undone.',
            confirmText: 'Clear All',
            type: 'danger',
            loading: false,
            onConfirm: () => {
                setConfirmModal(prev => ({ ...prev, loading: true }));
                router.delete(route('admin.clearScanLogs'), {
                    preserveScroll: true,
                    onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                });
            }
        });
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-100 hover:text-white bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] rounded-xl shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Delivery Gateways"
                    >
                        <Settings className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Gateways</span>
                    </button>

                    {/* Clean + Create Dropdown */}
                    <div className="relative" ref={actionDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] border border-[#16A34A] rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Create</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${actionDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {actionDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-[#0B2545] text-white rounded-2xl shadow-2xl border border-[#173860] p-1.5 z-50 animate-fadeIn space-y-0.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionDropdownOpen(false);
                                        setCustomerModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left cursor-pointer"
                                >
                                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Customer Account</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setActionDropdownOpen(false);
                                        setCreateScannerModalOpen(true);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left cursor-pointer"
                                >
                                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Gate Staff Scanner</span>
                                </button>
                                {isSuperAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActionDropdownOpen(false);
                                            setSubAdminModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-xl transition text-left cursor-pointer"
                                    >
                                        <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                                        <span>Sub Admin</span>
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
                
                {/* 1. MINIMALISTIC EXECUTIVE HEADER */}
                <div className="pb-1">
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display tracking-tight">
                        Platform Operations Center
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        Centralized governance for organizers, delivery gateways, and gate staff fleet.
                    </p>
                </div>

                
                {/* 2. EXECUTIVE ANALYTICS DASHBOARD */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Platform Activity Chart */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col h-full min-h-[350px]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Platform Throughput</h3>
                                <p className="text-[11px] text-slate-500">WhatsApp vs SMS dispatch volume</p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-bold">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-slate-600 dark:text-slate-400">WhatsApp</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-slate-600 dark:text-slate-400">SMS</span></div>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.traffic_data || []} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorWhatsapp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorSms" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.15} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '11px', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: '#e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="whatsapp" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorWhatsapp)" />
                                    <Area type="monotone" dataKey="sms" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSms)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Quick Stats Mini-Grid */}
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <div className="p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between h-full">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-400 flex items-center justify-center mb-3">
                                    <QrCode className="w-5 h-5" />
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 dark:text-white font-display mb-1 tracking-tight">{stats.total_scans?.toLocaleString() || 0}</h4>
                                <p className="text-xs text-slate-500 font-medium">Total Passes Scanned</p>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{stats.scans_growth || '+0%'} vs last week</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between h-full">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 dark:text-white font-display mb-1 tracking-tight">{stats.total_events || 0}</h4>
                                <p className="text-xs text-slate-500 font-medium">Live Events</p>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{stats.events_growth || '+0%'} vs last week</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between h-full">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 dark:text-white font-display mb-1 tracking-tight">{stats.whatsapp_delivered?.toLocaleString() || 0}</h4>
                                <p className="text-xs text-slate-500 font-medium">WhatsApp Delivered</p>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{stats.whatsapp_growth || '+0%'} vs last week</span>
                            </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-white dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] shadow-xs flex flex-col justify-between h-full">
                            <div>
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <h4 className="text-3xl font-black text-slate-900 dark:text-white font-display mb-1 tracking-tight">{stats.sms_delivered?.toLocaleString() || 0}</h4>
                                <p className="text-xs text-slate-500 font-medium">SMS Delivered</p>
                            </div>
                            <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span>{stats.sms_growth || '+0%'} vs last week</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. LUXURY SEGMENTED NAVIGATION DOCK (Uniform Design System) */}
                <div className="flex overflow-x-auto no-scrollbar gap-1.5 p-1.5 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 sm:gap-2 sm:p-2 rounded-2xl bg-white/90 dark:bg-[#0B1524]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
                    {[
                        ...(isSuperAdmin ? [{ id: 'sub_admins', label: 'Sub Admins', count: subAdmins.length, icon: UserCheck }] : []),
                        { id: 'scanners', label: 'Gate Staff', count: gateStaff.length, icon: Smartphone },
                        { id: 'logs', label: 'Admin Logs', count: recentScanLogs.length, icon: Activity },
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
                                        ? "bg-[#16A34A] text-white shadow-xs"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                                }`}
                            >
                                <div className="flex items-center gap-2 min-w-0">
                                    <IconComponent className="w-4 h-4 flex-shrink-0" />
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

                {/* TAB 0: SUB ADMINS */}
                {isSuperAdmin && activeTab === 'sub_admins' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                                    <UserCheck className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                                        Sub Admins
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Delegated administrators with assigned event and organiser access.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={subAdminSearch}
                                        onChange={(e) => setSubAdminSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 w-full sm:w-48"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSubAdminModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Create Sub Admin</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/90 dark:bg-[#07111D]/90 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                        <th className="py-3 px-5 font-bold text-left">Admin</th>
                                        <th className="py-3 px-4 font-bold text-left">Contact</th>
                                        <th className="py-3 px-4 font-bold text-left">Organisers</th>
                                        <th className="py-3 px-4 font-bold text-left">Events</th>
                                        <th className="py-3 px-4 font-bold text-left">Role</th>
                                        <th className="py-3 px-5 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] font-medium">
                                    {filteredSubAdmins.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                                No sub administrators found.
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

                {/* TAB 1: GATE STAFF */}
                {activeTab === 'scanners' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                                    <Smartphone className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                                        Gate Staff
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Mobile scanner personnel deployed to entrance gates.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={staffSearch}
                                        onChange={(e) => setStaffSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 w-full sm:w-48"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCreateScannerModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Create Gate Staff</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/90 dark:bg-[#07111D]/90 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                        <th className="py-3 px-5 font-bold text-left">Staff Member</th>
                                        <th className="py-3 px-4 font-bold text-left">Gate</th>
                                        <th className="py-3 px-4 font-bold text-left">Organiser</th>
                                        <th className="py-3 px-4 font-bold text-center">Volume</th>
                                        <th className="py-3 px-4 font-bold text-center">Passed / Rejected</th>
                                        <th className="py-3 px-5 font-bold text-right">Actions</th>
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

                {/* TAB 2: ADMIN LOGS */}
                {activeTab === 'logs' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden space-y-0 transition-colors duration-300">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                                    <Activity className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                                        Admin Logs
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Chronological security audit stream of all gate scans.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                                <div className="flex items-center bg-slate-100 dark:bg-white/[0.06] p-0.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/[0.08]">
                                    <button
                                        type="button"
                                        onClick={() => setLogStatusFilter('all')}
                                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                                            logStatusFilter === 'all' 
                                                ? 'bg-[#16A34A] text-white shadow-2xs font-bold' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        All ({recentScanLogs.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLogStatusFilter('granted')}
                                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                                            logStatusFilter === 'granted' 
                                                ? 'bg-[#16A34A] text-white shadow-2xs font-bold' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Admitted
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setLogStatusFilter('rejected')}
                                        className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs ${
                                            logStatusFilter === 'rejected' 
                                                ? 'bg-[#16A34A] text-white shadow-2xs font-bold' 
                                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                    >
                                        Rejected
                                    </button>
                                </div>

                                {recentScanLogs.length > 0 && isSuperAdmin && (
                                    <button
                                        type="button"
                                        onClick={handleClearAllLogs}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/80 dark:border-rose-800/60 transition active:scale-95 cursor-pointer shadow-2xs"
                                        title="Clear all scan logs"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Clear</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto max-h-[550px] overflow-y-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead className="sticky top-0 bg-slate-50/95 dark:bg-[#07111D]/95 backdrop-blur-md z-10">
                                    <tr className="text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-white/[0.08] font-mono tracking-wider">
                                        <th className="py-3 px-5 font-bold text-left">Result</th>
                                        <th className="py-3 px-4 font-bold text-left">Guest / Pass</th>
                                        <th className="py-3 px-4 font-bold text-left">Event</th>
                                        <th className="py-3 px-4 font-bold text-left">Staff &amp; Gate</th>
                                        <th className="py-3 px-5 font-bold text-right">Time</th>
                                        <th className="py-3 px-4 font-bold text-center w-14">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06] font-medium">
                                    {filteredLogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
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
                                                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                        <span className="truncate">{log.gate_label}</span>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-5 align-middle text-right font-mono text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                                                    {log.scanned_at}
                                                </td>
                                                <td className="py-3.5 px-4 align-middle text-center whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteLog(log)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition active:scale-95 cursor-pointer"
                                                        title={`Delete log for ${log.guest_name || 'Pass'}`}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: ORGANISERS */}
                {activeTab === 'customers' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                                    <Users className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                                        Organisers
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Host accounts managing event passes and guest dispatch campaigns.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                <div className="relative flex-1 sm:flex-initial">
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={customerSearch}
                                        onChange={(e) => setCustomerSearch(e.target.value)}
                                        className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 w-full sm:w-48"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCustomerModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-xs transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Create Organiser</span>
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
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
                                                No organisers found.
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

                                                    {/* Permissions Activities */}
                                                    <td className="py-3.5 px-4 align-middle whitespace-nowrap">
                                                        {role === 'admin' || role === 'sub_admin' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 text-[11px] font-medium font-mono border border-slate-200/70 dark:border-white/[0.08]">
                                                                <Shield className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                                                <span>Full Access</span>
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

                {/* TAB 4: EVENT DIRECTORY */}
                {activeTab === 'events' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                                        Events
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Global directory of events across all customer organisers.
                                    </p>
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={eventSearch}
                                    onChange={(e) => setEventSearch(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-[#07111D] border border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500 w-full sm:w-48"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50/70 dark:bg-white/[0.02] text-[10.5px] uppercase font-bold text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08] font-mono tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                                        <th className="py-3 px-4 font-bold text-left">Event</th>
                                        <th className="py-3 px-4 font-bold text-left">Organiser</th>
                                        <th className="py-3 px-4 font-bold text-left">Date &amp; Time</th>
                                        <th className="py-3 px-4 font-bold text-left">Venue</th>
                                        <th className="py-3 px-4 font-bold text-center">Guests</th>
                                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] font-medium">
                                    {filteredEvents.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                                                No events found.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEvents.map((evt) => (
                                            <tr key={evt.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition">
                                                <td className="py-3 px-4 align-middle">
                                                    <div className="font-bold text-slate-900 dark:text-white text-xs">{evt.title}</div>
                                                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider border border-slate-200/70 dark:border-white/[0.08]">
                                                        {evt.event_type}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 align-middle text-slate-700 dark:text-slate-300">
                                                    <div className="font-bold text-slate-900 dark:text-white text-xs">{evt.user?.name || '—'}</div>
                                                    {evt.user?.company && (
                                                        <div className="text-[10px] text-slate-400">{evt.user.company}</div>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 align-middle font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                    <div className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                                                        {new Date(evt.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                    {evt.event_time && <div className="text-[10px] text-slate-400 font-sans">{evt.event_time}</div>}
                                                </td>
                                                <td className="py-3 px-4 align-middle text-slate-700 dark:text-slate-300 max-w-[180px]">
                                                    <div className="flex items-center gap-1 truncate font-medium text-xs">
                                                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                                                        <span className="truncate">{evt.venue}</span>
                                                    </div>
                                                    {evt.city && <div className="text-[10px] text-slate-400 pl-4">{evt.city}</div>}
                                                </td>
                                                <td className="py-3 px-4 align-middle text-center whitespace-nowrap">
                                                    <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/[0.06] border border-slate-200/80 dark:border-white/[0.08] font-mono font-bold text-xs text-slate-800 dark:text-slate-200">
                                                        {evt.guests_count || 0}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 align-middle text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            href={route('events.show', evt.id)}
                                                            className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                            title="Inspect Event"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditEventModal(evt)}
                                                            className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                            title="Edit Event"
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
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                                    <Palette className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                                        Templates
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        Preset card designs and pass artwork library.
                                    </p>
                                </div>
                            </div>

                            <Link
                                href={route('templates.index')}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                            >
                                <Palette className="w-3.5 h-3.5" />
                                <span>Design Studio</span>
                            </Link>
                        </div>

                        {/* Minimalist Table */}
                        <div className="overflow-x-auto overflow-y-auto max-h-[520px] scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-slate-50/70 dark:bg-white/[0.02] text-[10.5px] uppercase font-bold text-slate-400 border-b border-slate-200/80 dark:border-white/[0.08] font-mono tracking-wider">
                                        <th className="py-3 px-4 font-bold text-left">Template</th>
                                        <th className="py-3 px-4 font-bold text-left">Type</th>
                                        <th className="py-3 px-4 font-bold text-left">Scope</th>
                                        <th className="py-3 px-4 font-bold text-left">Headline</th>
                                        <th className="py-3 px-4 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.05] font-medium">
                                    {globalTemplates.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                                                No templates found.
                                            </td>
                                        </tr>
                                    ) : (
                                        globalTemplates.map((tpl) => {
                                            const isCustom = tpl.template_type === 'custom_art' && tpl.image_path;

                                            return (
                                                <tr key={tpl.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition">
                                                    {/* 1. Preview & Title */}
                                                    <td className="py-3 px-4 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            {isCustom ? (
                                                                <div className="w-9 h-12 rounded-lg bg-slate-900 border border-slate-200/80 dark:border-white/[0.1] overflow-hidden flex-shrink-0 relative shadow-2xs">
                                                                    <img src={tpl.image_path} alt={tpl.name} className="w-full h-full object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    className="w-9 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-[8px] text-white font-mono font-bold shadow-2xs border border-slate-200/60 dark:border-white/[0.1]"
                                                                    style={{
                                                                        background: `linear-gradient(135deg, ${tpl.brand_color_from || '#0A182E'} 0%, ${tpl.brand_color_to || '#050D1A'} 100%)`
                                                                    }}
                                                                >
                                                                    PASS
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                                                    {tpl.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* 2. Engine Type */}
                                                    <td className="py-3 px-4 align-middle">
                                                        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-white/[0.08]">
                                                            <span className={`w-1.5 h-1.5 rounded-full ${isCustom ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                            <span>{isCustom ? 'Custom Art' : 'Gradient'}</span>
                                                        </span>
                                                    </td>

                                                    {/* 3. Owner / Scope */}
                                                    <td className="py-3 px-4 align-middle">
                                                        {tpl.user ? (
                                                            <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                                                                {tpl.user.name}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded border border-slate-200/60 dark:border-white/[0.06]">
                                                                Global Platform
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* 4. Card Headline */}
                                                    <td className="py-3 px-4 align-middle">
                                                        <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">
                                                            {tpl.headline || '—'}
                                                        </span>
                                                    </td>

                                                    {/* 5. Actions */}
                                                    <td className="py-3 px-4 align-middle text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <Link
                                                                href={route('templates.index')}
                                                                className="p-1.5 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition cursor-pointer"
                                                                title="Edit in Studio"
                                                            >
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setConfirmModal({
                                                                        show: true,
                                                                        title: 'Delete Template?',
                                                                        message: `Delete template "${tpl.name}"?`,
                                                                        warning: 'Events using it will use the default design.',
                                                                        confirmText: 'Delete',
                                                                        type: 'danger',
                                                                        loading: false,
                                                                        onConfirm: () => {
                                                                            setConfirmModal(prev => ({ ...prev, loading: true }));
                                                                            router.delete(route('templates.destroy', tpl.id), {
                                                                                preserveScroll: true,
                                                                                onFinish: () => setConfirmModal(prev => ({ ...prev, show: false, loading: false })),
                                                                            });
                                                                        }
                                                                    });
                                                                }}
                                                                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                                                                title="Delete Template"
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

                {/* TAB 6: GATEWAYS & INTEGRATIONS */}
                {activeTab === 'gateways' && (
                    <div className="bg-white dark:bg-[#0B1524]/90 rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-card overflow-hidden transition-colors duration-300">
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 flex-shrink-0">
                                    <Server className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white font-display">
                                        Gateways
                                    </h3>
                                    <p className="text-[11px] text-slate-400">
                                        WhatsApp Cloud API and SMS provider delivery settings.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setGatewayModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] rounded-xl shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                            >
                                <Settings className="w-3.5 h-3.5" />
                                <span>Configure Gateways</span>
                            </button>
                        </div>

                        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
                            {/* WhatsApp Gateway Card */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-4">
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                                <Smartphone className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                    {gateways.whatsapp?.provider || 'WhatsApp Cloud API'}
                                                </h4>
                                                <span className="text-[11px] text-slate-400 font-mono truncate block">
                                                    {gateways.whatsapp?.sender_number || '+255 700 000 000'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 inline-flex items-center ${
                                            gateways.whatsapp?.status === 'Disabled' 
                                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                                                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60'
                                        }`}>
                                            {gateways.whatsapp?.status || 'Active'}
                                        </span>
                                    </div>

                                    <div className="bg-white dark:bg-[#0B1524] p-3 rounded-xl border border-slate-200/70 dark:border-white/[0.06] space-y-2 text-xs font-mono">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">Phone Number ID</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate ml-2">{gateways.whatsapp?.phone_number_id || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">WABA ID</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate ml-2">{gateways.whatsapp?.waba_id || '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">API Version</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{gateways.whatsapp?.api_version || 'v20.0'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">Access Token</span>
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Verified</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setGatewayModalOpen(true)}
                                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    <span>Configure WhatsApp</span>
                                </button>
                            </div>

                            {/* SMS Gateway Card */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-4">
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                <MessageSquare className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                    {gateways.sms?.provider || 'SMS Gateway'}
                                                </h4>
                                                <span className="text-[11px] text-slate-400 font-mono truncate block">
                                                    Sender ID: {gateways.sms?.sender_id || 'KARDOVO'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 inline-flex items-center ${
                                            gateways.sms?.status === 'Disabled' 
                                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800/60'
                                        }`}>
                                            {gateways.sms?.status || 'Active'}
                                        </span>
                                    </div>

                                    <div className="bg-white dark:bg-[#0B1524] p-3 rounded-xl border border-slate-200/70 dark:border-white/[0.06] space-y-2 text-xs font-mono">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">Balance</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">{gateways.sms?.balance || '12,450 TZS'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">Sender ID</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{gateways.sms?.sender_id || 'KARDOVO'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">Country Code</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{gateways.sms?.country_code || '+255'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">Endpoint</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{gateways.sms?.api_endpoint || 'NextSMS API'}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setGatewayModalOpen(true)}
                                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    <span>Configure SMS</span>
                                </button>
                            </div>
                            {/* AzamPay Gateway Card */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-[#07111D] border border-slate-200/80 dark:border-white/[0.08] flex flex-col justify-between gap-4">
                                <div className="space-y-3.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                                                    {gateways.azampay?.provider || 'AzamPay'}
                                                </h4>
                                                <span className="text-[11px] text-slate-400 font-mono truncate block">
                                                    App: {gateways.azampay?.app_name || 'Kardovo'}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 inline-flex items-center ${
                                            gateways.azampay?.environment === 'sandbox' 
                                                ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' 
                                                : 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-800/60'
                                        }`}>
                                            {gateways.azampay?.environment === 'sandbox' ? 'Sandbox' : 'Production'}
                                        </span>
                                    </div>

                                    <div className="bg-white dark:bg-[#0B1524] p-3 rounded-xl border border-slate-200/70 dark:border-white/[0.06] space-y-2 text-xs font-mono">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">Environment</span>
                                            <span className="font-bold text-orange-600 dark:text-orange-400 capitalize">{gateways.azampay?.environment || 'Sandbox'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">App Name</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{gateways.azampay?.app_name || 'Kardovo'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">Client ID</span>
                                            <span className="font-bold text-slate-800 dark:text-slate-200 truncate ml-2 max-w-[100px]">{gateways.azampay?.client_id ? '••••••••' : '—'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="text-slate-400">Client Secret</span>
                                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{gateways.azampay?.client_secret ? '••••••••' : '—'}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setGatewayModalOpen(true)}
                                    className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    <span>Configure AzamPay</span>
                                </button>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* Modal 1: Create Customer Account */}
            <Modal show={customerModalOpen} onClose={() => setCustomerModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleCreateCustomer} className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/30">
                                <UserPlus className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                Create Organiser Account
                            </h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCustomerModalOpen(false)}
                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/[0.06] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="space-y-3.5">
                        {/* Profile Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <InputLabel value="Full Name *" />
                                <TextInput
                                    type="text"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="e.g. Neema Mbwana"
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
                                <InputLabel value="Email *" />
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
                                <InputLabel value="Phone" />
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
                                        Active
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
                                        Suspended
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
                        </div>

                        {/* Permissions */}
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
                        <PrimaryButton disabled={customerForm.processing}>
                            Create Account
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

{/* Modal 2: Edit Customer Account & Role Governance */}
            <Modal show={!!editingCustomer} onClose={() => setEditingCustomer(null)} maxWidth="2xl">
                <form onSubmit={handleUpdateCustomer} className="p-6 sm:p-7 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                                <SlidersHorizontal className="w-4 h-4" />
                            </div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                                    Organiser Governance
                                </h3>
                                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                                    {editingCustomer?.role?.toUpperCase()}
                                </span>
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

                    {/* Alert Banner for Validation Failures */}
                    {Object.keys(editCustomerForm.errors).length > 0 && (
                        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-shake">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                            <div>
                                <div className="font-bold">Please check the form for errors:</div>
                                <ul className="list-disc list-inside mt-1 space-y-0.5 font-medium">
                                    {Object.entries(editCustomerForm.errors).map(([key, msg]) => (
                                        <li key={key}><strong className="capitalize">{key.replace(/_/g, ' ')}:</strong> {msg}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
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
                                <InputLabel value="Email Address *" />
                                <TextInput
                                    type="email"
                                    className="mt-1 block w-full text-xs font-bold"
                                    placeholder="name@company.com"
                                    value={editCustomerForm.data.email}
                                    onChange={(e) => {
                                        editCustomerForm.setData('email', e.target.value);
                                        if (editCustomerClientErrors.email) setEditCustomerClientErrors(prev => ({ ...prev, email: undefined }));
                                    }}
                                    hasError={Boolean(editCustomerClientErrors.email || editCustomerForm.errors.email)}
                                    required
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
                                <InputLabel value="Phone Number *" />
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
                                <div>
                                    <InputLabel value="Account Status" className="!mb-0" />
                                    <InputError message={editCustomerForm.errors.status} className="mt-0.5" />
                                </div>
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

                        {/* Permissions */}
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

            {/* Modal: Edit Platform Event (Admin) */}
            <Modal show={!!editingEvent} onClose={() => setEditingEvent(null)} maxWidth="lg">
                <form onSubmit={handleUpdateEvent} className="p-6 sm:p-7 space-y-5">
                    <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
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
                                    className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold px-3 py-2 hover:border-emerald-500/70 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition"
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
                                    className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold px-3 py-2 hover:border-emerald-500/70 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition"
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
                                    placeholder="e.g. Kunduchi Beach Gardens"
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
                                    placeholder="e.g. Dar es Salaam"
                                    value={editEventForm.data.city}
                                    onChange={(e) => editEventForm.setData('city', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <InputLabel value="Invitation Template" />
                                <select
                                    className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold px-3 py-2 hover:border-emerald-500/70 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition"
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
                                    className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs font-bold px-3 py-2 hover:border-emerald-500/70 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition"
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
                                className="mt-1 block w-full rounded-2xl border border-slate-300 dark:border-white/[0.08] bg-white dark:bg-[#08121E] text-slate-900 dark:text-white text-xs p-3 hover:border-emerald-500/70 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition outline-none"
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
                        <PrimaryButton disabled={editEventForm.processing}>
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal 2: Create Gate Staff Account */}
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
                            <InputLabel value="Password *" />
                            <div className="relative mt-1">
                                <TextInput
                                    type="text"
                                    className="block w-full text-xs font-mono font-bold rounded-xl pr-20"
                                    placeholder="Min 8 chars"
                                    value={createScannerForm.data.password}
                                    onChange={(e) => {
                                        createScannerForm.setData('password', e.target.value);
                                        if (scannerClientErrors.password) setScannerClientErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                    hasError={Boolean(scannerClientErrors.password || createScannerForm.errors.password)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const pwd = generateStrongPassword(14);
                                        createScannerForm.setData('password', pwd);
                                        if (scannerClientErrors.password) setScannerClientErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40 transition cursor-pointer"
                                >
                                    <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Generate</span>
                                </button>
                            </div>
                            <InputError message={scannerClientErrors.password || createScannerForm.errors.password} className="mt-1" />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/[0.08] flex justify-end gap-2">
                        <SecondaryButton onClick={() => setCreateScannerModalOpen(false)}>
                            Cancel
                        </SecondaryButton>
                        <button
                            type="submit"
                            disabled={createScannerForm.processing}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {createScannerForm.processing ? 'Creating...' : 'Create Staff'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal 3: Edit Gate Staff Account */}
            <Modal show={!!editingScanner} onClose={() => setEditingScanner(null)} maxWidth="md">
                <form onSubmit={handleUpdateScanner} className="p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <Edit className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                Edit Gate Staff
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
                                onChange={(e) => editScannerForm.setData('name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Email *" />
                            <TextInput
                                type="email"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="name@company.com"
                                value={editScannerForm.data.email}
                                onChange={(e) => editScannerForm.setData('email', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <InputLabel value="Gate *" />
                            <TextInput
                                type="text"
                                className="mt-1 block w-full text-xs font-bold rounded-xl"
                                placeholder="e.g. Gate 1"
                                value={editScannerForm.data.gate_label}
                                onChange={(e) => editScannerForm.setData('gate_label', e.target.value)}
                                required
                            />
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
                                onChange={(e) => editScannerForm.setData('phone', e.target.value)}
                            />
                        </div>

                        <div>
                            <InputLabel value="Reset Password (Optional)" />
                            <TextInput
                                type="password"
                                className="mt-1 block w-full text-xs font-mono font-bold rounded-xl"
                                placeholder="Leave blank to keep current"
                                value={editScannerForm.data.password}
                                onChange={(e) => editScannerForm.setData('password', e.target.value)}
                            />
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

            {/* Modal 4: Configure Messaging Gateways */}
            <GatewayConfigModal 
                show={gatewayModalOpen} 
                onClose={() => setGatewayModalOpen(false)} 
                gateways={gateways} 
            />
        {/* Modal 5: Create Sub Admin */}
            <Modal show={subAdminModalOpen} onClose={() => setSubAdminModalOpen(false)} maxWidth="2xl">
                <form onSubmit={handleCreateSubAdmin} className="p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <UserCheck className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                Create Sub Admin
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
                            <InputLabel value="Password *" />
                            <div className="relative mt-1">
                                <TextInput
                                    type="text"
                                    className="block w-full text-xs font-mono font-bold rounded-xl pr-20"
                                    placeholder="Min 8 chars"
                                    value={createSubAdminForm.data.password}
                                    onChange={(e) => {
                                        createSubAdminForm.setData('password', e.target.value);
                                        if (subAdminClientErrors.password) setSubAdminClientErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                    hasError={Boolean(subAdminClientErrors.password || createSubAdminForm.errors.password)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const pwd = generateStrongPassword(14);
                                        createSubAdminForm.setData('password', pwd);
                                        if (subAdminClientErrors.password) setSubAdminClientErrors(prev => ({ ...prev, password: undefined }));
                                    }}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/40 transition cursor-pointer"
                                >
                                    <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                    <span>Generate</span>
                                </button>
                            </div>
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
                        <button
                            type="submit"
                            disabled={createSubAdminForm.processing}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#16A34A] hover:bg-[#15803D] shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            {createSubAdminForm.processing ? 'Creating...' : 'Create Sub Admin'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal 6: Edit Sub Admin */}
            <Modal show={!!editingSubAdmin} onClose={() => setEditingSubAdmin(null)} maxWidth="2xl">
                <form onSubmit={handleUpdateSubAdmin} className="p-6 bg-white dark:bg-[#0B1524] text-slate-900 dark:text-white rounded-3xl border border-slate-200/90 dark:border-white/[0.08] shadow-2xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/[0.08] pb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                                <Edit className="w-4 h-4" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                                Edit Sub Admin
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

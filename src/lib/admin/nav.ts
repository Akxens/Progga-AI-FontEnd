import {
  Activity,
  ArrowLeftRight,
  Award,
  BarChart2,
  Bell,
  Book,
  BookOpen,
  Bot,
  Building2,
  CheckCheck,
  CheckSquare,
  Clock,
  Coins,
  Cpu,
  CreditCard,
  Database,
  DollarSign,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Gauge,
  GraduationCap,
  Handshake,
  Heart,
  HelpCircle,
  Inbox,
  Landmark,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  LineChart,
  MessageSquare,
  Mic,
  PieChart,
  Radio,
  Receipt,
  RefreshCw,
  Rocket,
  ScrollText,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Swords,
  Tag,
  Target,
  TrendingUp,
  Undo,
  UploadCloud,
  UserCheck,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permissions?: string[];
  exact?: boolean;
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { label: "Executive Dashboard", href: "/admin", icon: LayoutDashboard, permissions: ["dashboard.executive.view"], exact: true },
      { label: "Business Analytics", href: "/admin/analytics/business", icon: TrendingUp, permissions: ["dashboard.business.view"] },
      { label: "Work Queue", href: "/admin/work-queue", icon: Inbox, permissions: ["workqueue.view"] },
    ],
  },
  {
    group: "People",
    items: [
      { label: "Students", href: "/admin/students", icon: Users, permissions: ["students.view"] },
      { label: "Student Analytics", href: "/admin/students/analytics", icon: BarChart2, permissions: ["students.analytics.view"] },
      { label: "Sessions", href: "/admin/sessions", icon: Clock, permissions: ["students.view_sessions"] },
      { label: "Guardians", href: "/admin/guardians", icon: ShieldAlert, permissions: ["guardians.view"] },
      { label: "Teachers", href: "/admin/teachers", icon: GraduationCap, permissions: ["teachers.view"] },
      { label: "Teacher Analytics", href: "/admin/teachers/analytics", icon: LineChart, permissions: ["teachers.analytics.view"] },
      { label: "Teacher Training", href: "/admin/training", icon: BookOpen, permissions: ["training.view"] },
      { label: "Schools", href: "/admin/schools", icon: Building2, permissions: ["schools.view"] },
      { label: "Campus Activation", href: "/admin/activation", icon: Sparkles, permissions: ["activation.view"] },
      {
        label: "Imports",
        href: "/admin/imports",
        icon: UploadCloud,
        permissions: ["students.import", "teachers.import", "schools.import", "questions.import", "imports.approve"],
      },
    ],
  },
  {
    group: "Academics",
    items: [
      { label: "Courses", href: "/admin/courses", icon: Layers, permissions: ["courses.view"] },
      { label: "Curriculum", href: "/admin/curriculum", icon: FileText, permissions: ["curriculum.view"] },
      { label: "Lessons", href: "/admin/lessons", icon: Video, permissions: ["courses.view"] },
      { label: "Live Classes", href: "/admin/live-classes", icon: Radio, permissions: ["liveclasses.view"] },
      { label: "Question Bank", href: "/admin/questions", icon: HelpCircle, permissions: ["questions.view"] },
      { label: "Exams", href: "/admin/exams", icon: Award, permissions: ["exams.view"] },
      {
        label: "Content Review",
        href: "/admin/content-review",
        icon: CheckSquare,
        permissions: ["courses.review", "questions.review", "curriculum.review"],
      },
      { label: "Academic Analytics", href: "/admin/academics/analytics", icon: PieChart, permissions: ["academics.analytics.view"] },
    ],
  },
  {
    group: "Ask Progga",
    items: [
      { label: "AI Overview", href: "/admin/ai", icon: Bot, permissions: ["ai.metrics.view"] },
      { label: "AI Sessions", href: "/admin/ai/sessions", icon: MessageSquare, permissions: ["ai.sessions.view"] },
      { label: "Models & Tokens", href: "/admin/ai/models", icon: Cpu, permissions: ["ai.metrics.view"] },
      { label: "RAG", href: "/admin/ai/rag", icon: Database, permissions: ["ai.metrics.view"] },
      { label: "CAOF", href: "/admin/ai/caof", icon: Filter, permissions: ["ai.metrics.view"] },
      { label: "Answer Disclosure", href: "/admin/ai/disclosure", icon: Eye, permissions: ["ai.disclosure.review"] },
      { label: "Voice", href: "/admin/ai/voice", icon: Mic, permissions: ["ai.metrics.view"] },
      { label: "Quality & Safety", href: "/admin/safety", icon: ShieldCheck, permissions: ["safety.cases.view"] },
    ],
  },
  {
    group: "Finance",
    items: [
      { label: "Subscriptions", href: "/admin/finance/subscriptions", icon: CreditCard, permissions: ["finance.subscriptions.view"] },
      { label: "Plans", href: "/admin/finance/plans", icon: Tag, permissions: ["finance.plans.view"] },
      { label: "Payments", href: "/admin/finance/payments", icon: DollarSign, permissions: ["finance.payments.view"] },
      { label: "Reconciliation", href: "/admin/finance/reconciliation", icon: RefreshCw, permissions: ["finance.payments.reconcile"] },
      { label: "Refunds", href: "/admin/finance/refunds", icon: Undo, permissions: ["finance.refunds.request", "finance.refunds.approve"] },
      { label: "Revenue", href: "/admin/finance/revenue", icon: TrendingUp, permissions: ["finance.revenue.view"] },
      { label: "Expenses", href: "/admin/finance/expenses", icon: Receipt, permissions: ["finance.expenses.view"] },
      { label: "Unit Economics", href: "/admin/finance/unit-economics", icon: Activity, permissions: ["finance.unit_economics.view"] },
      {
        label: "Periods & Ledger",
        href: "/admin/finance/ledger",
        icon: Book,
        permissions: ["finance.periods.close", "finance.ledger.adjust", "audit.view"],
      },
    ],
  },
  {
    group: "CSR",
    items: [
      { label: "Overview", href: "/admin/csr", icon: Heart, permissions: ["csr.overview.view"] },
      { label: "Partners", href: "/admin/csr/partners", icon: Handshake, permissions: ["csr.partners.view"] },
      { label: "Programmes", href: "/admin/csr/programmes", icon: Target, permissions: ["csr.programmes.view"] },
      { label: "Beneficiaries", href: "/admin/csr/beneficiaries", icon: UserCheck, permissions: ["csr.beneficiaries.view"] },
      { label: "Grant Ledger", href: "/admin/csr/ledger", icon: Landmark, permissions: ["csr.ledger.view"] },
      { label: "Allocations", href: "/admin/csr/allocations", icon: Share2, permissions: ["csr.beneficiaries.view"] },
      {
        label: "Inter-Entity",
        href: "/admin/csr/inter-entity",
        icon: ArrowLeftRight,
        permissions: ["csr.interentity.request", "csr.interentity.approve"],
      },
      { label: "Impact", href: "/admin/csr/impact", icon: Award, permissions: ["csr.impact.view"] },
    ],
  },
  {
    group: "Growth & Battle",
    items: [
      { label: "Growth", href: "/admin/growth", icon: Rocket, permissions: ["growth.view"] },
      { label: "Battle", href: "/admin/battle", icon: Swords, permissions: ["battle.view"] },
      { label: "Coins & Rewards", href: "/admin/rewards", icon: Coins, permissions: ["rewards.view"] },
    ],
  },
  {
    group: "Reports & Admin",
    items: [
      { label: "Report Centre", href: "/admin/reports", icon: FileSpreadsheet, permissions: ["reports.view"] },
      { label: "Support", href: "/admin/support", icon: LifeBuoy, permissions: ["support.view"] },
      { label: "Notifications", href: "/admin/notifications", icon: Bell, permissions: ["notifications.view"] },
      { label: "Approvals", href: "/admin/approvals", icon: CheckCheck }, // Visible to all portal workspaces
      { label: "Staff & Roles", href: "/admin/system/users", icon: Users, permissions: ["admin.users.view", "admin.roles.manage"] },
      { label: "Audit Log", href: "/admin/system/audit", icon: ScrollText, permissions: ["audit.view"] },
      { label: "Consent", href: "/admin/system/consent", icon: FileCheck, permissions: ["consent.view"] },
      { label: "Configuration", href: "/admin/system/config", icon: Settings, permissions: ["config.manage", "features.manage"] },
      { label: "System Health", href: "/admin/system/health", icon: Gauge, permissions: ["health.view"] },
    ],
  },
];

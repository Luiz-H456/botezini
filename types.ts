
// --- DOMAIN ENUMS ---
export enum OrderStatus {
  PENDING = 'Pendente',
  IN_PRODUCTION = 'Em Produção',
  COMPLETED = 'Concluído',
  DELIVERED = 'Entregue'
}

export enum ProductionStage {
  WAITING = 'Aguardando Material',
  CUTTING = 'Corte',
  CUSTOMIZATION = 'Personalização',
  SEWING = 'Costura',
  FINISHING = 'Finalização',
  LOGISTICS = 'Transporte'
}

export enum PaymentStatus {
  PAID = 'Pago',
  PARTIAL = 'Parcial',
  PENDING = 'Pendente',
  OVERDUE = 'Atrasado'
}

// --- SECURITY TYPES ---
export type UserRole = 'admin' | 'manager' | 'factory';

export interface UserProfile {
  id: string; // Matches auth.users id
  email: string;
  role: UserRole;
  full_name?: string;
}

// --- CORE ENTITIES ---
export interface DbEntity {
  id: string; 
  user_id?: string; // Ownership tracking
  createdAt?: string; 
  updatedAt?: string; 
}

export interface CompanyProfile {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  website?: string;
  logoUrl?: string; 
  primaryColor?: string;
  
  // Banking Info
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  bankHolder?: string;
  pixKey?: string;
  bankInfo?: string; 

  // Settings & Goals
  defaultTaxRate?: number;
  revenueGoal?: number;
  expenseLimit?: number;
}

export interface Product extends DbEntity {
  name: string;
  description?: string;
  sku?: string;
  category?: string;
  notes?: string;
  priceTier1?: number; 
  priceTier2?: number; 
  priceTier3?: number; 
}

export interface Client extends DbEntity {
  companyName: string;
  category?: string; 
  cnpj?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Supplier extends DbEntity {
  companyName: string;
  category?: string; 
  cnpj?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// --- BUDGET AGGREGATE ---

export interface BudgetCustomization {
  id: string;
  type: 'Embroidery' | 'ScreenPrint' | 'DTF' | 'Other';
  description: string;
  position: string; 
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BudgetExtra {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BudgetItem {
  productId: string; 
  productName: string; 
  model: string; 
  fabric: string; 
  color: string; 
  size: string; 
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget extends DbEntity {
  serialNumber: string; 
  clientId: string; 
  date: string; 
  
  items: BudgetItem[];
  customizations: BudgetCustomization[];
  extras: BudgetExtra[];

  // Financials
  subtotalItems: number;
  subtotalCustomizations: number;
  subtotalExtras: number;
  discount: number;
  totalAmount: number;
  
  // Payment Control
  downPaymentPercent: number; 
  downPaymentValue: number;
  deliveryPaymentValue: number;
  
  validityDays: number;
  deliveryTimeDays?: number; 
  notes: string;
  status: 'Draft' | 'Sent' | 'Approved' | 'Converted';
  
  generatedOrderNumber?: string; 
}

// --- ORDER AGGREGATE ---

export interface OrderItem {
  productId: string; 
  quantity: number;
  size: string; 
  productionStage: ProductionStage;
  fabric?: string;
  color?: string;
}

export interface Order extends DbEntity {
  budgetId: string; 
  budgetSerialNumber?: string;
  orderNumber: string; 
  clientId: string; 
  
  // Top-level stage for Kanban
  productionStage?: ProductionStage;
  
  items: OrderItem[];
  
  customizations?: BudgetCustomization[];
  extras?: BudgetExtra[];

  totalAmount: number;
  amountPaid: number; 
  discount?: number;
  deadline: string; 
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
}

// --- FINANCE AGGREGATE (PHASE 3 ENTERPRISE) ---

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface BankAccount extends DbEntity {
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit_card';
  bankName?: string;
  accountNumber?: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  isActive: boolean;
}

export interface FinancialCategory extends DbEntity {
  name: string;
  type: 'income' | 'expense';
  parentId?: string; // For hierarchy (e.g. Despesas > Administrativas > Aluguel)
  code?: string; // e.g. "2.1.05"
  isDeductible: boolean; // Useful for DRE
}

export interface FinancialSplit {
  name: string; 
  percentage: number;
  amount: number;
}

export interface Transaction extends DbEntity {
  type: TransactionType;
  description: string;
  amount: number;
  
  // Dates
  date: string; // Competency Date (Data de Competência)
  dueDate?: string; // Data de Vencimento
  paymentDate?: string; // Data de Pagamento (Data de Caixa)
  
  // Classification
  categoryId: string; // FK to FinancialCategory
  category?: string; // Legacy/Fallback string
  
  costCenterId?: string;
  accountId?: string; // FK to BankAccount
  
  // Relations
  referenceId?: string; // Order ID, Budget ID, etc.
  clientId?: string;
  supplierId?: string;
  
  payee?: string; 
  splits?: FinancialSplit[]; 
  
  // Status
  isPaid: boolean;
  
  // Recurrence
  isRecurring?: boolean;
  recurrenceId?: string; 
  installmentNumber?: number;
  totalInstallments?: number;
}

// --- CONFIGURATION TYPES ---

export interface CostCenter extends DbEntity {
  // id inherited from DbEntity
  name: string;
  type: 'production' | 'administrative' | 'commercial' | 'financial';
  color: string;
  budgetLimit?: number;
  isActive: boolean;
  categories: string[]; 
  actual?: number; 
  percent?: number;
}

// --- DASHBOARD & REPORTING TYPES ---

export interface DRELine {
  label: string;
  value: number;
  level: number;
  percent?: number;
  isDeduction?: boolean;
  isTotal?: boolean;
  children?: DRELine[];
}

export interface FinancialAlert {
  id: string;
  type: 'critical' | 'warning' | 'success';
  title: string;
  message: string;
  action?: string;
  date?: string;
}

// --- INTELLIGENCE TYPES ---

export interface DailyProjection {
  date: string;
  openingBalance: number;
  inflow: number;
  outflow: number;
  closingBalance: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  isSimulated?: boolean;
}

export interface ClientRiskProfile {
  clientId: string;
  clientName: string;
  score: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  totalOpen: number;
  avgDelayDays: number;
  lastPaymentDate?: string;
  suggestedCreditLimit: number;
}

export interface FinancialHealthSnapshot {
  period: string;
  liquidityRatio: number; // Ativo Circulante / Passivo Circulante
  profitMargin: number; // Lucro Liquido / Receita
  debtRatio: number; // Passivo / Ativo
  cashRunwayDays: number; // Caixa / Despesa Diaria
  breakEvenPoint: number;
}

export interface SimulationAction {
  id: string;
  type: 'delay_receipt' | 'delay_payment' | 'simulate_default' | 'inject_cash';
  amount?: number;
  days?: number;
  description: string;
}

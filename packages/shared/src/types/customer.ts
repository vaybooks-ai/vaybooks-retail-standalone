import { CustomerAddress } from './address';

/**
 * Customer entity with all related information
 */
export interface Customer {
  id: number;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  
  // Contact person
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  
  // Financial information
  creditLimit: number;
  currentBalance: number;
  creditTermsDays: number;
  taxNumber?: string;
  taxExempt: boolean;
  
  // Status and metadata
  isActive: boolean;
  customerType: 'retail' | 'wholesale' | 'distributor';
  notes?: string;
  
  // Master Data References (Plain Values - No Foreign Keys)
  // These reference values from MasterData table but are stored as plain strings
  statusValue?: string;        // References MasterData where dataType='customerStatus'
  paymentTermValue?: string;   // References MasterData where dataType='paymentTerm'
  salesRepValue?: string;      // References MasterData where dataType='salesRep'
  groupValue?: string;         // References MasterData where dataType='customerGroup'
  
  // Relationships
  addresses?: CustomerAddress[];
  customFields?: CustomerCustomField[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;
}

/**
 * Customer custom field for extensibility
 */
export interface CustomerCustomField {
  id: number;
  customerId: number;
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'number' | 'date' | 'select' | 'boolean';
  fieldValue?: string;
  isRequired: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating a new customer
 */
export interface CreateCustomerDTO {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  creditLimit?: number;
  creditTermsDays?: number;
  taxNumber?: string;
  taxExempt?: boolean;
  customerType?: 'retail' | 'wholesale' | 'distributor';
  notes?: string;
  
  // Master Data References (Plain Values)
  statusValue?: string;
  paymentTermValue?: string;
  salesRepValue?: string;
  groupValue?: string;
}

/**
 * DTO for updating a customer
 */
export interface UpdateCustomerDTO extends Partial<CreateCustomerDTO> {
  isActive?: boolean;
  currentBalance?: number;
}

/**
 * Customer summary for list views
 */
export interface CustomerSummary {
  id: number;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  currentBalance: number;
  creditLimit: number;
  isActive: boolean;
  customerType: 'retail' | 'wholesale' | 'distributor';
}

/**
 * Customer detail with all relationships
 */
export interface CustomerDetail extends Customer {
  addresses: CustomerAddress[];
  customFields: CustomerCustomField[];
  totalTransactions?: number;
  lastTransactionDate?: Date;
}

/**
 * Filter options for customer queries
 */
export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  customerType?: 'retail' | 'wholesale' | 'distributor';
  city?: string;
  state?: string;
  country?: string;
  hasBalance?: boolean;
  creditLimitMin?: number;
  creditLimitMax?: number;
  taxExempt?: boolean;
}

/**
 * Customer transaction for statements
 */
export interface CustomerTransaction {
  id: number;
  customerId: number;
  type: 'invoice' | 'payment' | 'credit_note' | 'debit_note';
  referenceNumber: string;
  date: Date;
  amount: number;
  balance: number;
  description?: string;
  createdAt: Date;
}

/**
 * Customer statement for reporting
 */
export interface CustomerStatement {
  customer: Customer;
  transactions: CustomerTransaction[];
  openingBalance: number;
  closingBalance: number;
  periodStart: Date;
  periodEnd: Date;
  totalSales: number;
  totalPayments: number;
  totalCredits: number;
  totalDebits: number;
}

/**
 * Validation rules for customer fields
 */
export const CustomerValidation = {
  code: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[A-Z0-9-]+$/,
    message: 'Code must be 3-20 characters, uppercase letters, numbers, and hyphens only',
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Name must be 2-100 characters',
  },
  email: {
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Invalid email format',
  },
  phone: {
    required: false,
    pattern: /^[\d\s\-\+\(\)]+$/,
    minLength: 10,
    maxLength: 20,
    message: 'Invalid phone number format',
  },
  creditLimit: {
    required: false,
    min: 0,
    max: 999999999.99,
    message: 'Credit limit must be between 0 and 999,999,999.99',
  },
  creditTermsDays: {
    required: false,
    min: 0,
    max: 365,
    message: 'Credit terms must be between 0 and 365 days',
  },
  taxNumber: {
    required: false,
    minLength: 5,
    maxLength: 50,
    message: 'Tax number must be 5-50 characters',
  },
};

/**
 * Validation rules for custom fields
 */
export const CustomFieldValidation = {
  fieldName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: 'Field name must be 2-50 characters, alphanumeric and underscore only',
  },
  fieldLabel: {
    required: true,
    minLength: 2,
    maxLength: 100,
    message: 'Field label must be 2-100 characters',
  },
  fieldType: {
    required: true,
    enum: ['text', 'number', 'date', 'select', 'boolean'],
    message: 'Field type must be one of: text, number, date, select, boolean',
  },
};

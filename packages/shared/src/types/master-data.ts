/**
 * Master Data Types
 * Generic types for flexible master data management
 */

/**
 * Master Data Entity
 * Generic structure for all master data types
 */
export interface MasterData {
  id: number;
  dataType: string;
  value: string;
  label?: string;
  description?: string;
  metadata?: Record<string, any>;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating master data
 */
export interface CreateMasterDataDTO {
  dataType: string;
  value: string;
  label?: string;
  description?: string;
  metadata?: Record<string, any>;
  displayOrder?: number;
}

/**
 * DTO for updating master data
 */
export interface UpdateMasterDataDTO extends Partial<CreateMasterDataDTO> {
  isActive?: boolean;
}

/**
 * Master Data Types Enum
 * Define all available master data types
 */
export enum MasterDataType {
  CUSTOMER_STATUS = 'customerStatus',
  PAYMENT_TERM = 'paymentTerm',
  PAYMENT_METHOD = 'paymentMethod',
  SALES_REP = 'salesRep',
  CUSTOMER_GROUP = 'customerGroup',
  CATEGORY = 'category',
  UNIT_OF_MEASURE = 'unitOfMeasure',
  CURRENCY = 'currency',
  TAX_RATE = 'taxRate',
  WAREHOUSE = 'warehouse',
  DEPARTMENT = 'department',
  COST_CENTER = 'costCenter',
  BANK = 'bank',
  SUPPLIER = 'supplier',
  PRODUCT = 'product',
  BRAND = 'brand',
  MANUFACTURER = 'manufacturer',
  COUNTRY = 'country',
  STATE = 'state',
  // Add more as needed
}

/**
 * Master Data Type Configuration
 * Defines UI rendering and validation for each data type
 */
export interface MasterDataTypeConfig {
  type: MasterDataType | string;
  label: string;
  description: string;
  icon?: string;
  color?: string;
  fields: MasterDataField[];
  validation?: Record<string, any>;
}

/**
 * Master Data Field Configuration
 * Defines how to render each field in the UI
 */
export interface MasterDataField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'color' | 'textarea' | 'email' | 'phone';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

/**
 * Master Data Type Configurations
 * Configuration for rendering and validating each master data type
 */
export const MASTER_DATA_CONFIGS: Record<string, MasterDataTypeConfig> = {
  [MasterDataType.CUSTOMER_STATUS]: {
    type: MasterDataType.CUSTOMER_STATUS,
    label: 'Customer Status',
    description: 'Track customer status (Active, Inactive, Suspended, etc.)',
    icon: 'User',
    color: '#3B82F6',
    fields: [
      {
        name: 'value',
        label: 'Status Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Active, Inactive, Suspended',
        validation: { minLength: 2, maxLength: 50 },
      },
      {
        name: 'color',
        label: 'Color',
        type: 'color',
        required: false,
        validation: { pattern: '^#[0-9A-F]{6}$' },
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
      },
    ],
  },

  [MasterDataType.PAYMENT_TERM]: {
    type: MasterDataType.PAYMENT_TERM,
    label: 'Payment Term',
    description: 'Define credit terms (Net 30, Net 60, COD, etc.)',
    icon: 'Calendar',
    color: '#10B981',
    fields: [
      {
        name: 'value',
        label: 'Term Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Net 30, Net 60, COD',
        validation: { minLength: 2, maxLength: 50 },
      },
      {
        name: 'days',
        label: 'Days',
        type: 'number',
        required: true,
        placeholder: '30',
        validation: { min: 0, max: 365 },
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
      },
    ],
  },

  [MasterDataType.PAYMENT_METHOD]: {
    type: MasterDataType.PAYMENT_METHOD,
    label: 'Payment Method',
    description: 'Payment options (Cash, Check, Bank Transfer, etc.)',
    icon: 'CreditCard',
    color: '#F59E0B',
    fields: [
      {
        name: 'value',
        label: 'Method Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Cash, Check, Bank Transfer',
        validation: { minLength: 2, maxLength: 50 },
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
      },
    ],
  },

  [MasterDataType.SALES_REP]: {
    type: MasterDataType.SALES_REP,
    label: 'Sales Representative',
    description: 'Sales representatives for customer assignment',
    icon: 'Users',
    color: '#8B5CF6',
    fields: [
      {
        name: 'value',
        label: 'Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., John Doe',
        validation: { minLength: 2, maxLength: 100 },
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email',
        required: false,
        placeholder: 'john@example.com',
      },
      {
        name: 'phone',
        label: 'Phone',
        type: 'phone',
        required: false,
        placeholder: '+91 98765 43210',
      },
    ],
  },

  [MasterDataType.CUSTOMER_GROUP]: {
    type: MasterDataType.CUSTOMER_GROUP,
    label: 'Customer Group',
    description: 'Customer segmentation (Retail, Wholesale, VIP, etc.)',
    icon: 'Users',
    color: '#EC4899',
    fields: [
      {
        name: 'value',
        label: 'Group Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Retail, Wholesale, VIP',
        validation: { minLength: 2, maxLength: 50 },
      },
      {
        name: 'discount',
        label: 'Discount (%)',
        type: 'number',
        required: false,
        placeholder: '10',
        validation: { min: 0, max: 100 },
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
      },
    ],
  },

  [MasterDataType.CATEGORY]: {
    type: MasterDataType.CATEGORY,
    label: 'Category',
    description: 'Product/service categories',
    icon: 'Tag',
    color: '#06B6D4',
    fields: [
      {
        name: 'value',
        label: 'Category Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Electronics, Clothing',
        validation: { minLength: 2, maxLength: 50 },
      },
      {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        required: false,
      },
    ],
  },
};

/**
 * Get configuration for a master data type
 */
export function getMasterDataConfig(dataType: string): MasterDataTypeConfig | undefined {
  return MASTER_DATA_CONFIGS[dataType];
}

/**
 * Get all available master data types
 */
export function getAllMasterDataTypes(): MasterDataTypeConfig[] {
  return Object.values(MASTER_DATA_CONFIGS);
}

/**
 * Validation rules for master data
 */
export const MasterDataValidation = {
  dataType: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Data type must be 2-50 characters',
  },
  value: {
    required: true,
    minLength: 1,
    maxLength: 255,
    message: 'Value must be 1-255 characters',
  },
  label: {
    required: false,
    minLength: 1,
    maxLength: 255,
    message: 'Label must be 1-255 characters',
  },
  description: {
    required: false,
    maxLength: 1000,
    message: 'Description must be less than 1000 characters',
  },
};

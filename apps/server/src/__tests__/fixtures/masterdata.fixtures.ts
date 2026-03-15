/**
 * MasterData type definition for fixtures
 */
interface MasterData {
  id: number;
  dataType: string;
  value: string;
  label: string | null;
  description: string | null;
  metadata: string | null;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a MasterData fixture
 */
export function createMasterDataFixture(overrides?: Partial<MasterData>): MasterData {
  return {
    id: 1,
    dataType: 'customerStatus',
    value: 'Active',
    label: 'Active',
    description: 'Customer is active',
    metadata: null,
    isActive: true,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * Customer status options
 */
export const CUSTOMER_STATUS_OPTIONS: MasterData[] = [
  {
    id: 1,
    dataType: 'customerStatus',
    value: 'Active',
    label: 'Active',
    description: 'Customer is active',
    metadata: null,
    isActive: true,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    dataType: 'customerStatus',
    value: 'Inactive',
    label: 'Inactive',
    description: 'Customer is inactive',
    metadata: null,
    isActive: true,
    displayOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    dataType: 'customerStatus',
    value: 'Suspended',
    label: 'Suspended',
    description: 'Customer account is suspended',
    metadata: null,
    isActive: true,
    displayOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Payment term options
 */
export const PAYMENT_TERM_OPTIONS: MasterData[] = [
  {
    id: 4,
    dataType: 'paymentTerm',
    value: 'Net 30',
    label: 'Net 30',
    description: 'Payment due in 30 days',
    metadata: null,
    isActive: true,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    dataType: 'paymentTerm',
    value: 'Net 60',
    label: 'Net 60',
    description: 'Payment due in 60 days',
    metadata: null,
    isActive: true,
    displayOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    dataType: 'paymentTerm',
    value: 'COD',
    label: 'Cash on Delivery',
    description: 'Payment on delivery',
    metadata: null,
    isActive: true,
    displayOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Sales representative options
 */
export const SALES_REP_OPTIONS: MasterData[] = [
  {
    id: 7,
    dataType: 'salesRep',
    value: 'John Smith',
    label: 'John Smith',
    description: 'Sales Representative',
    metadata: null,
    isActive: true,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 8,
    dataType: 'salesRep',
    value: 'Sarah Johnson',
    label: 'Sarah Johnson',
    description: 'Sales Representative',
    metadata: null,
    isActive: true,
    displayOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Customer group options
 */
export const CUSTOMER_GROUP_OPTIONS: MasterData[] = [
  {
    id: 9,
    dataType: 'customerGroup',
    value: 'Premium',
    label: 'Premium',
    description: 'Premium customer group',
    metadata: null,
    isActive: true,
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 10,
    dataType: 'customerGroup',
    value: 'Standard',
    label: 'Standard',
    description: 'Standard customer group',
    metadata: null,
    isActive: true,
    displayOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

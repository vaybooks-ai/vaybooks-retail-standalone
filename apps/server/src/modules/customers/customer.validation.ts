import { ValidationRule } from '../../middleware/validation';

export const createCustomerValidation: ValidationRule[] = [
  {
    field: 'code',
    required: true,
    type: 'string',
    minLength: 3,
    maxLength: 20,
    pattern: /^[A-Za-z0-9-]+$/,
    custom: (value) => {
      if (!/^[A-Za-z0-9-]+$/.test(value)) {
        return 'Code must contain only letters, numbers, and hyphens';
      }
      return true;
    },
  },
  {
    field: 'name',
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100,
  },
  {
    field: 'email',
    required: false,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  {
    field: 'phone',
    required: false,
    type: 'string',
    minLength: 10,
    maxLength: 20,
    pattern: /^[\d\s\-\+\(\)]+$/,
  },
  {
    field: 'mobile',
    required: false,
    type: 'string',
    minLength: 10,
    maxLength: 20,
    pattern: /^[\d\s\-\+\(\)]+$/,
  },
  {
    field: 'creditLimit',
    required: false,
    type: 'number',
    min: 0,
    max: 999999999.99,
  },
  {
    field: 'creditTermsDays',
    required: false,
    type: 'number',
    min: 0,
    max: 365,
  },
  {
    field: 'taxNumber',
    required: false,
    type: 'string',
    minLength: 5,
    maxLength: 50,
  },
  {
    field: 'customerType',
    required: false,
    type: 'string',
    custom: (value) => {
      if (value && !['retail', 'wholesale', 'distributor'].includes(value)) {
        return 'Customer type must be one of: retail, wholesale, distributor';
      }
      return true;
    },
  },
];

export const updateCustomerValidation: ValidationRule[] = [
  {
    field: 'name',
    required: false,
    type: 'string',
    minLength: 2,
    maxLength: 100,
  },
  {
    field: 'email',
    required: false,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  {
    field: 'phone',
    required: false,
    type: 'string',
    minLength: 10,
    maxLength: 20,
    pattern: /^[\d\s\-\+\(\)]+$/,
  },
  {
    field: 'mobile',
    required: false,
    type: 'string',
    minLength: 10,
    maxLength: 20,
    pattern: /^[\d\s\-\+\(\)]+$/,
  },
  {
    field: 'creditLimit',
    required: false,
    type: 'number',
    min: 0,
    max: 999999999.99,
  },
  {
    field: 'creditTermsDays',
    required: false,
    type: 'number',
    min: 0,
    max: 365,
  },
  {
    field: 'taxNumber',
    required: false,
    type: 'string',
    minLength: 5,
    maxLength: 50,
  },
  {
    field: 'isActive',
    required: false,
    type: 'boolean',
  },
  {
    field: 'customerType',
    required: false,
    type: 'string',
    custom: (value) => {
      if (value && !['retail', 'wholesale', 'distributor'].includes(value)) {
        return 'Customer type must be one of: retail, wholesale, distributor';
      }
      return true;
    },
  },
];

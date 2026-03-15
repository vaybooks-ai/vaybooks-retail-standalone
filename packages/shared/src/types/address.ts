/**
 * Address types for customer addresses
 */

export interface CustomerAddress {
  id: number;
  customerId: number;
  type: 'billing' | 'shipping' | 'other';
  label?: string;
  isDefault: boolean;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressDTO {
  type: 'billing' | 'shipping' | 'other';
  label?: string;
  isDefault?: boolean;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface UpdateAddressDTO extends Partial<CreateAddressDTO> {
  isActive?: boolean;
}

export interface AddressValidation {
  addressLine1: {
    required: true;
    minLength: 5;
    maxLength: 100;
    message: string;
  };
  city: {
    required: true;
    minLength: 2;
    maxLength: 50;
    message: string;
  };
  country: {
    required: true;
    minLength: 2;
    maxLength: 50;
    message: string;
  };
  postalCode: {
    required: false;
    pattern: RegExp;
    message: string;
  };
}

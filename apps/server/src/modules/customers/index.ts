/**
 * Customer module exports
 */

export { CustomerRepository } from './customer.repository';
export { CustomerService } from './customer.service';
export { CustomerController } from './customer.controller';
export { createCustomerRoutes } from './customer.routes';
export { AddressRepository } from './address.repository';
export { CustomFieldRepository } from './custom-field.repository';
export { createCustomerValidation, updateCustomerValidation } from './customer.validation';

// Re-export types from shared
export * from '@vaybooks/shared';

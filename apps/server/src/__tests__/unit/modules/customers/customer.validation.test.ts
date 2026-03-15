import {
  createCustomerValidation,
  updateCustomerValidation,
} from '../../../../modules/customers/customer.validation';

describe('Customer Validation Rules', () => {
  describe('createCustomerValidation', () => {
    describe('code field', () => {
      it('should have code as required field', () => {
        const codeRule = createCustomerValidation.find((r) => r.field === 'code');
        expect(codeRule).toBeDefined();
        expect(codeRule?.required).toBe(true);
      });

      it('should enforce code type as string', () => {
        const codeRule = createCustomerValidation.find((r) => r.field === 'code');
        expect(codeRule?.type).toBe('string');
      });

      it('should enforce minimum length of 3', () => {
        const codeRule = createCustomerValidation.find((r) => r.field === 'code');
        expect(codeRule?.minLength).toBe(3);
      });

      it('should enforce maximum length of 20', () => {
        const codeRule = createCustomerValidation.find((r) => r.field === 'code');
        expect(codeRule?.maxLength).toBe(20);
      });

      it('should validate pattern for uppercase letters, numbers, and hyphens', () => {
        const codeRule = createCustomerValidation.find((r) => r.field === 'code');
        expect(codeRule?.pattern).toBeDefined();
        expect(codeRule?.pattern?.test('CUST001')).toBe(true);
        expect(codeRule?.pattern?.test('CUST-001')).toBe(true);
        expect(codeRule?.pattern?.test('cust001')).toBe(false);
        expect(codeRule?.pattern?.test('CUST@001')).toBe(false);
      });

      it('should have custom validation function', () => {
        const codeRule = createCustomerValidation.find((r) => r.field === 'code');
        expect(codeRule?.custom).toBeDefined();
      });

      it('custom validation should accept valid codes', () => {
        const codeRule = createCustomerValidation.find((r) => r.field === 'code');
        expect(codeRule?.custom?.('CUST001')).toBe(true);
        expect(codeRule?.custom?.('ABC-123')).toBe(true);
      });

      it('custom validation should reject invalid codes', () => {
        const codeRule = createCustomerValidation.find((r) => r.field === 'code');
        const result = codeRule?.custom?.('invalid-code');
        expect(result).not.toBe(true);
        expect(typeof result).toBe('string');
      });
    });

    describe('name field', () => {
      it('should have name as required field', () => {
        const nameRule = createCustomerValidation.find((r) => r.field === 'name');
        expect(nameRule?.required).toBe(true);
      });

      it('should enforce name type as string', () => {
        const nameRule = createCustomerValidation.find((r) => r.field === 'name');
        expect(nameRule?.type).toBe('string');
      });

      it('should enforce minimum length of 2', () => {
        const nameRule = createCustomerValidation.find((r) => r.field === 'name');
        expect(nameRule?.minLength).toBe(2);
      });

      it('should enforce maximum length of 100', () => {
        const nameRule = createCustomerValidation.find((r) => r.field === 'name');
        expect(nameRule?.maxLength).toBe(100);
      });
    });

    describe('email field', () => {
      it('should have email as optional field', () => {
        const emailRule = createCustomerValidation.find((r) => r.field === 'email');
        expect(emailRule?.required).toBe(false);
      });

      it('should enforce email type as string', () => {
        const emailRule = createCustomerValidation.find((r) => r.field === 'email');
        expect(emailRule?.type).toBe('string');
      });

      it('should validate email pattern', () => {
        const emailRule = createCustomerValidation.find((r) => r.field === 'email');
        expect(emailRule?.pattern).toBeDefined();
        expect(emailRule?.pattern?.test('test@example.com')).toBe(true);
        expect(emailRule?.pattern?.test('invalid-email')).toBe(false);
        expect(emailRule?.pattern?.test('test@')).toBe(false);
      });
    });

    describe('phone field', () => {
      it('should have phone as optional field', () => {
        const phoneRule = createCustomerValidation.find((r) => r.field === 'phone');
        expect(phoneRule?.required).toBe(false);
      });

      it('should enforce phone type as string', () => {
        const phoneRule = createCustomerValidation.find((r) => r.field === 'phone');
        expect(phoneRule?.type).toBe('string');
      });

      it('should enforce minimum length of 10', () => {
        const phoneRule = createCustomerValidation.find((r) => r.field === 'phone');
        expect(phoneRule?.minLength).toBe(10);
      });

      it('should enforce maximum length of 20', () => {
        const phoneRule = createCustomerValidation.find((r) => r.field === 'phone');
        expect(phoneRule?.maxLength).toBe(20);
      });

      it('should validate phone pattern', () => {
        const phoneRule = createCustomerValidation.find((r) => r.field === 'phone');
        expect(phoneRule?.pattern).toBeDefined();
        expect(phoneRule?.pattern?.test('1234567890')).toBe(true);
        expect(phoneRule?.pattern?.test('123-456-7890')).toBe(true);
        expect(phoneRule?.pattern?.test('+1 (123) 456-7890')).toBe(true);
        expect(phoneRule?.pattern?.test('abc1234567')).toBe(false);
      });
    });

    describe('mobile field', () => {
      it('should have mobile as optional field', () => {
        const mobileRule = createCustomerValidation.find((r) => r.field === 'mobile');
        expect(mobileRule?.required).toBe(false);
      });

      it('should enforce mobile type as string', () => {
        const mobileRule = createCustomerValidation.find((r) => r.field === 'mobile');
        expect(mobileRule?.type).toBe('string');
      });

      it('should enforce minimum length of 10', () => {
        const mobileRule = createCustomerValidation.find((r) => r.field === 'mobile');
        expect(mobileRule?.minLength).toBe(10);
      });

      it('should enforce maximum length of 20', () => {
        const mobileRule = createCustomerValidation.find((r) => r.field === 'mobile');
        expect(mobileRule?.maxLength).toBe(20);
      });

      it('should validate mobile pattern', () => {
        const mobileRule = createCustomerValidation.find((r) => r.field === 'mobile');
        expect(mobileRule?.pattern).toBeDefined();
        expect(mobileRule?.pattern?.test('9876543210')).toBe(true);
        expect(mobileRule?.pattern?.test('+91 98765 43210')).toBe(true);
      });
    });

    describe('creditLimit field', () => {
      it('should have creditLimit as optional field', () => {
        const creditLimitRule = createCustomerValidation.find((r) => r.field === 'creditLimit');
        expect(creditLimitRule?.required).toBe(false);
      });

      it('should enforce creditLimit type as number', () => {
        const creditLimitRule = createCustomerValidation.find((r) => r.field === 'creditLimit');
        expect(creditLimitRule?.type).toBe('number');
      });

      it('should enforce minimum value of 0', () => {
        const creditLimitRule = createCustomerValidation.find((r) => r.field === 'creditLimit');
        expect(creditLimitRule?.min).toBe(0);
      });

      it('should enforce maximum value', () => {
        const creditLimitRule = createCustomerValidation.find((r) => r.field === 'creditLimit');
        expect(creditLimitRule?.max).toBe(999999999.99);
      });
    });

    describe('creditTermsDays field', () => {
      it('should have creditTermsDays as optional field', () => {
        const creditTermsRule = createCustomerValidation.find((r) => r.field === 'creditTermsDays');
        expect(creditTermsRule?.required).toBe(false);
      });

      it('should enforce creditTermsDays type as number', () => {
        const creditTermsRule = createCustomerValidation.find((r) => r.field === 'creditTermsDays');
        expect(creditTermsRule?.type).toBe('number');
      });

      it('should enforce minimum value of 0', () => {
        const creditTermsRule = createCustomerValidation.find((r) => r.field === 'creditTermsDays');
        expect(creditTermsRule?.min).toBe(0);
      });

      it('should enforce maximum value of 365', () => {
        const creditTermsRule = createCustomerValidation.find((r) => r.field === 'creditTermsDays');
        expect(creditTermsRule?.max).toBe(365);
      });
    });

    describe('taxNumber field', () => {
      it('should have taxNumber as optional field', () => {
        const taxNumberRule = createCustomerValidation.find((r) => r.field === 'taxNumber');
        expect(taxNumberRule?.required).toBe(false);
      });

      it('should enforce taxNumber type as string', () => {
        const taxNumberRule = createCustomerValidation.find((r) => r.field === 'taxNumber');
        expect(taxNumberRule?.type).toBe('string');
      });

      it('should enforce minimum length of 5', () => {
        const taxNumberRule = createCustomerValidation.find((r) => r.field === 'taxNumber');
        expect(taxNumberRule?.minLength).toBe(5);
      });

      it('should enforce maximum length of 50', () => {
        const taxNumberRule = createCustomerValidation.find((r) => r.field === 'taxNumber');
        expect(taxNumberRule?.maxLength).toBe(50);
      });
    });

    describe('customerType field', () => {
      it('should have customerType as optional field', () => {
        const customerTypeRule = createCustomerValidation.find((r) => r.field === 'customerType');
        expect(customerTypeRule?.required).toBe(false);
      });

      it('should enforce customerType type as string', () => {
        const customerTypeRule = createCustomerValidation.find((r) => r.field === 'customerType');
        expect(customerTypeRule?.type).toBe('string');
      });

      it('should have custom validation function', () => {
        const customerTypeRule = createCustomerValidation.find((r) => r.field === 'customerType');
        expect(customerTypeRule?.custom).toBeDefined();
      });

      it('custom validation should accept valid types', () => {
        const customerTypeRule = createCustomerValidation.find((r) => r.field === 'customerType');
        expect(customerTypeRule?.custom?.('retail')).toBe(true);
        expect(customerTypeRule?.custom?.('wholesale')).toBe(true);
        expect(customerTypeRule?.custom?.('distributor')).toBe(true);
      });

      it('custom validation should reject invalid types', () => {
        const customerTypeRule = createCustomerValidation.find((r) => r.field === 'customerType');
        const result = customerTypeRule?.custom?.('invalid');
        expect(result).not.toBe(true);
        expect(typeof result).toBe('string');
      });

      it('custom validation should accept undefined for optional field', () => {
        const customerTypeRule = createCustomerValidation.find((r) => r.field === 'customerType');
        expect(customerTypeRule?.custom?.(undefined)).toBe(true);
      });
    });
  });

  describe('updateCustomerValidation', () => {
    describe('name field', () => {
      it('should have name as optional field', () => {
        const nameRule = updateCustomerValidation.find((r) => r.field === 'name');
        expect(nameRule?.required).toBe(false);
      });

      it('should enforce name type as string', () => {
        const nameRule = updateCustomerValidation.find((r) => r.field === 'name');
        expect(nameRule?.type).toBe('string');
      });

      it('should enforce minimum length of 2', () => {
        const nameRule = updateCustomerValidation.find((r) => r.field === 'name');
        expect(nameRule?.minLength).toBe(2);
      });

      it('should enforce maximum length of 100', () => {
        const nameRule = updateCustomerValidation.find((r) => r.field === 'name');
        expect(nameRule?.maxLength).toBe(100);
      });
    });

    describe('email field', () => {
      it('should have email as optional field', () => {
        const emailRule = updateCustomerValidation.find((r) => r.field === 'email');
        expect(emailRule?.required).toBe(false);
      });

      it('should validate email pattern when provided', () => {
        const emailRule = updateCustomerValidation.find((r) => r.field === 'email');
        expect(emailRule?.pattern).toBeDefined();
        expect(emailRule?.pattern?.test('test@example.com')).toBe(true);
        expect(emailRule?.pattern?.test('invalid-email')).toBe(false);
      });
    });

    describe('phone field', () => {
      it('should have phone as optional field', () => {
        const phoneRule = updateCustomerValidation.find((r) => r.field === 'phone');
        expect(phoneRule?.required).toBe(false);
      });

      it('should enforce phone type as string', () => {
        const phoneRule = updateCustomerValidation.find((r) => r.field === 'phone');
        expect(phoneRule?.type).toBe('string');
      });

      it('should enforce minimum length of 10', () => {
        const phoneRule = updateCustomerValidation.find((r) => r.field === 'phone');
        expect(phoneRule?.minLength).toBe(10);
      });

      it('should enforce maximum length of 20', () => {
        const phoneRule = updateCustomerValidation.find((r) => r.field === 'phone');
        expect(phoneRule?.maxLength).toBe(20);
      });
    });

    describe('mobile field', () => {
      it('should have mobile as optional field', () => {
        const mobileRule = updateCustomerValidation.find((r) => r.field === 'mobile');
        expect(mobileRule?.required).toBe(false);
      });

      it('should enforce mobile type as string', () => {
        const mobileRule = updateCustomerValidation.find((r) => r.field === 'mobile');
        expect(mobileRule?.type).toBe('string');
      });

      it('should enforce minimum length of 10', () => {
        const mobileRule = updateCustomerValidation.find((r) => r.field === 'mobile');
        expect(mobileRule?.minLength).toBe(10);
      });

      it('should enforce maximum length of 20', () => {
        const mobileRule = updateCustomerValidation.find((r) => r.field === 'mobile');
        expect(mobileRule?.maxLength).toBe(20);
      });
    });

    describe('creditLimit field', () => {
      it('should have creditLimit as optional field', () => {
        const creditLimitRule = updateCustomerValidation.find((r) => r.field === 'creditLimit');
        expect(creditLimitRule?.required).toBe(false);
      });

      it('should enforce creditLimit type as number', () => {
        const creditLimitRule = updateCustomerValidation.find((r) => r.field === 'creditLimit');
        expect(creditLimitRule?.type).toBe('number');
      });

      it('should enforce minimum value of 0', () => {
        const creditLimitRule = updateCustomerValidation.find((r) => r.field === 'creditLimit');
        expect(creditLimitRule?.min).toBe(0);
      });

      it('should enforce maximum value', () => {
        const creditLimitRule = updateCustomerValidation.find((r) => r.field === 'creditLimit');
        expect(creditLimitRule?.max).toBe(999999999.99);
      });
    });

    describe('creditTermsDays field', () => {
      it('should have creditTermsDays as optional field', () => {
        const creditTermsRule = updateCustomerValidation.find((r) => r.field === 'creditTermsDays');
        expect(creditTermsRule?.required).toBe(false);
      });

      it('should enforce creditTermsDays type as number', () => {
        const creditTermsRule = updateCustomerValidation.find((r) => r.field === 'creditTermsDays');
        expect(creditTermsRule?.type).toBe('number');
      });

      it('should enforce minimum value of 0', () => {
        const creditTermsRule = updateCustomerValidation.find((r) => r.field === 'creditTermsDays');
        expect(creditTermsRule?.min).toBe(0);
      });

      it('should enforce maximum value of 365', () => {
        const creditTermsRule = updateCustomerValidation.find((r) => r.field === 'creditTermsDays');
        expect(creditTermsRule?.max).toBe(365);
      });
    });

    describe('taxNumber field', () => {
      it('should have taxNumber as optional field', () => {
        const taxNumberRule = updateCustomerValidation.find((r) => r.field === 'taxNumber');
        expect(taxNumberRule?.required).toBe(false);
      });

      it('should enforce taxNumber type as string', () => {
        const taxNumberRule = updateCustomerValidation.find((r) => r.field === 'taxNumber');
        expect(taxNumberRule?.type).toBe('string');
      });

      it('should enforce minimum length of 5', () => {
        const taxNumberRule = updateCustomerValidation.find((r) => r.field === 'taxNumber');
        expect(taxNumberRule?.minLength).toBe(5);
      });

      it('should enforce maximum length of 50', () => {
        const taxNumberRule = updateCustomerValidation.find((r) => r.field === 'taxNumber');
        expect(taxNumberRule?.maxLength).toBe(50);
      });
    });

    describe('isActive field', () => {
      it('should have isActive as optional field', () => {
        const isActiveRule = updateCustomerValidation.find((r) => r.field === 'isActive');
        expect(isActiveRule?.required).toBe(false);
      });

      it('should enforce isActive type as boolean', () => {
        const isActiveRule = updateCustomerValidation.find((r) => r.field === 'isActive');
        expect(isActiveRule?.type).toBe('boolean');
      });
    });

    describe('customerType field', () => {
      it('should have customerType as optional field', () => {
        const customerTypeRule = updateCustomerValidation.find((r) => r.field === 'customerType');
        expect(customerTypeRule?.required).toBe(false);
      });

      it('should enforce customerType type as string', () => {
        const customerTypeRule = updateCustomerValidation.find((r) => r.field === 'customerType');
        expect(customerTypeRule?.type).toBe('string');
      });

      it('should have custom validation function', () => {
        const customerTypeRule = updateCustomerValidation.find((r) => r.field === 'customerType');
        expect(customerTypeRule?.custom).toBeDefined();
      });

      it('custom validation should accept valid types', () => {
        const customerTypeRule = updateCustomerValidation.find((r) => r.field === 'customerType');
        expect(customerTypeRule?.custom?.('retail')).toBe(true);
        expect(customerTypeRule?.custom?.('wholesale')).toBe(true);
        expect(customerTypeRule?.custom?.('distributor')).toBe(true);
      });

      it('custom validation should reject invalid types', () => {
        const customerTypeRule = updateCustomerValidation.find((r) => r.field === 'customerType');
        const result = customerTypeRule?.custom?.('invalid');
        expect(result).not.toBe(true);
        expect(typeof result).toBe('string');
      });
    });

    it('should not include code field in update validation', () => {
      const codeRule = updateCustomerValidation.find((r) => r.field === 'code');
      expect(codeRule).toBeUndefined();
    });
  });
});

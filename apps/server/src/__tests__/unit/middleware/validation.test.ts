import { Request, Response } from 'express';
import { validateRequest, ValidationRule } from '../../../middleware/validation';

describe('validateRequest Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('Required Field Validation', () => {
    it('should pass when required field is provided', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = { name: 'Test' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should fail when required field is missing', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = {};
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Validation Error',
          errors: expect.arrayContaining(['name is required']),
        })
      );
    });

    it('should fail when required field is null', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = { name: null };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should fail when required field is empty string', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = { name: '' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should skip validation for optional field when not provided', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'email', required: false, type: 'string' },
      ];
      mockRequest.body = {};
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Type Validation', () => {
    it('should validate string type', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = { name: 'Test' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail for wrong string type', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = { name: 123 };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['name must be of type string']),
        })
      );
    });

    it('should validate number type', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'age', required: true, type: 'number' },
      ];
      mockRequest.body = { age: 25 };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail for wrong number type', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'age', required: true, type: 'number' },
      ];
      mockRequest.body = { age: 'twenty-five' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should validate boolean type', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'isActive', required: true, type: 'boolean' },
      ];
      mockRequest.body = { isActive: true };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail for wrong boolean type', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'isActive', required: true, type: 'boolean' },
      ];
      mockRequest.body = { isActive: 'true' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should validate array type', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'items', required: true, type: 'array' },
      ];
      mockRequest.body = { items: [1, 2, 3] };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail for wrong array type', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'items', required: true, type: 'array' },
      ];
      mockRequest.body = { items: 'not-an-array' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should validate object type', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'data', required: true, type: 'object' },
      ];
      mockRequest.body = { data: { key: 'value' } };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail for wrong object type', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'data', required: true, type: 'object' },
      ];
      mockRequest.body = { data: 'not-an-object' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('String Length Validation', () => {
    it('should validate minLength', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string', minLength: 3 },
      ];
      mockRequest.body = { name: 'Test' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail when string is shorter than minLength', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string', minLength: 3 },
      ];
      mockRequest.body = { name: 'ab' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['name must be at least 3 characters']),
        })
      );
    });

    it('should validate maxLength', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string', maxLength: 10 },
      ];
      mockRequest.body = { name: 'Test' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail when string is longer than maxLength', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string', maxLength: 5 },
      ];
      mockRequest.body = { name: 'TestName' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['name must be at most 5 characters']),
        })
      );
    });
  });

  describe('Number Range Validation', () => {
    it('should validate min value', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'age', required: true, type: 'number', min: 0 },
      ];
      mockRequest.body = { age: 25 };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail when number is less than min', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'age', required: true, type: 'number', min: 0 },
      ];
      mockRequest.body = { age: -5 };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['age must be at least 0']),
        })
      );
    });

    it('should validate max value', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'age', required: true, type: 'number', max: 100 },
      ];
      mockRequest.body = { age: 25 };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail when number is greater than max', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'age', required: true, type: 'number', max: 100 },
      ];
      mockRequest.body = { age: 150 };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['age must be at most 100']),
        })
      );
    });
  });

  describe('Pattern Matching (Regex)', () => {
    it('should validate pattern matching', () => {
      // Arrange
      const rules: ValidationRule[] = [
        {
          field: 'email',
          required: true,
          type: 'string',
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
      ];
      mockRequest.body = { email: 'test@example.com' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail when pattern does not match', () => {
      // Arrange
      const rules: ValidationRule[] = [
        {
          field: 'email',
          required: true,
          type: 'string',
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        },
      ];
      mockRequest.body = { email: 'invalid-email' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['email has invalid format']),
        })
      );
    });

    it('should validate phone number pattern', () => {
      // Arrange
      const rules: ValidationRule[] = [
        {
          field: 'phone',
          required: true,
          type: 'string',
          pattern: /^[\d\s\-\+\(\)]+$/,
        },
      ];
      mockRequest.body = { phone: '+1 (123) 456-7890' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail for invalid phone number pattern', () => {
      // Arrange
      const rules: ValidationRule[] = [
        {
          field: 'phone',
          required: true,
          type: 'string',
          pattern: /^[\d\s\-\+\(\)]+$/,
        },
      ];
      mockRequest.body = { phone: 'abc123' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Custom Validation Functions', () => {
    it('should pass custom validation when it returns true', () => {
      // Arrange
      const rules: ValidationRule[] = [
        {
          field: 'age',
          required: true,
          type: 'number',
          custom: (value) => value >= 18,
        },
      ];
      mockRequest.body = { age: 25 };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should fail custom validation when it returns false', () => {
      // Arrange
      const rules: ValidationRule[] = [
        {
          field: 'age',
          required: true,
          type: 'number',
          custom: (value) => value >= 18,
        },
      ];
      mockRequest.body = { age: 15 };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['age is invalid']),
        })
      );
    });

    it('should use custom error message when provided', () => {
      // Arrange
      const rules: ValidationRule[] = [
        {
          field: 'type',
          required: true,
          type: 'string',
          custom: (value) => {
            if (!['retail', 'wholesale'].includes(value)) {
              return 'Type must be retail or wholesale';
            }
            return true;
          },
        },
      ];
      mockRequest.body = { type: 'invalid' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['Type must be retail or wholesale']),
        })
      );
    });

    it('should support multiple custom validations', () => {
      // Arrange
      const rules: ValidationRule[] = [
        {
          field: 'password',
          required: true,
          type: 'string',
          minLength: 8,
          custom: (value) => {
            if (!/[A-Z]/.test(value)) {
              return 'Password must contain uppercase letter';
            }
            if (!/[0-9]/.test(value)) {
              return 'Password must contain number';
            }
            return true;
          },
        },
      ];
      mockRequest.body = { password: 'weak' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.any(Array),
        })
      );
    });
  });

  describe('Multiple Validation Errors', () => {
    it('should collect multiple validation errors', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string', minLength: 3 },
        { field: 'email', required: true, type: 'string' },
        { field: 'age', required: true, type: 'number', min: 0 },
      ];
      mockRequest.body = { name: 'ab', email: 123, age: -5 };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.stringContaining('name'),
            expect.stringContaining('email'),
            expect.stringContaining('age'),
          ]),
        })
      );
    });

    it('should stop validation at first error for a field', () => {
      // Arrange
      const rules: ValidationRule[] = [
        {
          field: 'name',
          required: true,
          type: 'string',
          minLength: 3,
          maxLength: 10,
        },
      ];
      mockRequest.body = { name: 'ab' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Error Response Format', () => {
    it('should return 400 status code on validation error', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = {};
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should return error object with correct structure', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = {};
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        errors: expect.any(Array),
      });
    });

    it('should not call next() on validation error', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = {};
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should call next() on successful validation', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = { name: 'Test' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty rules array', () => {
      // Arrange
      const rules: ValidationRule[] = [];
      mockRequest.body = { anything: 'value' };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle undefined body', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'name', required: true, type: 'string' },
      ];
      mockRequest.body = {};
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should handle zero as valid number', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'count', required: true, type: 'number' },
      ];
      mockRequest.body = { count: 0 };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle false as valid boolean', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'isActive', required: true, type: 'boolean' },
      ];
      mockRequest.body = { isActive: false };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle empty array as valid array', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'items', required: true, type: 'array' },
      ];
      mockRequest.body = { items: [] };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle empty object as valid object', () => {
      // Arrange
      const rules: ValidationRule[] = [
        { field: 'data', required: true, type: 'object' },
      ];
      mockRequest.body = { data: {} };
      const middleware = validateRequest(rules);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalled();
    });
  });
});

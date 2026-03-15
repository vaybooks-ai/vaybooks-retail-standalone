import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomerController } from './customer.controller';
import { validateRequest } from '../../middleware/validation';
import { createCustomerValidation, updateCustomerValidation } from './customer.validation';

/**
 * Create customer routes
 * @param prisma - Prisma client instance
 * @returns Express Router with customer routes
 */
export function createCustomerRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const controller = new CustomerController(prisma);

  // Specific routes first (before generic :id routes)

  /**
   * GET /api/v1/customers/generate-code
   * Generate next customer code
   */
  router.get('/generate-code', (req, res, next) => controller.generateCode(req, res, next));

  /**
   * GET /api/v1/customers/top
   * Get top customers by credit limit
   */
  router.get('/top', (req, res, next) => controller.getTopCustomers(req, res, next));

  /**
   * GET /api/v1/customers/active
   * Get all active customers
   */
  router.get('/active', (req, res, next) => controller.getActive(req, res, next));

  /**
   * GET /api/v1/customers/balance
   * Get customers with outstanding balance
   */
  router.get('/balance', (req, res, next) => controller.getWithBalance(req, res, next));

  /**
   * GET /api/v1/customers/code/:code
   * Get customer by code
   */
  router.get('/code/:code', (req, res, next) => controller.getByCode(req, res, next));

  /**
   * GET /api/v1/customers/type/:type
   * Get customers by type
   */
  router.get('/type/:type', (req, res, next) => controller.getByType(req, res, next));

  // Generic routes

  /**
   * GET /api/v1/customers
   * List all customers with pagination and filters
   */
  router.get('/', (req, res, next) => controller.list(req, res, next));

  /**
   * POST /api/v1/customers
   * Create new customer
   */
  router.post('/', validateRequest(createCustomerValidation), (req, res, next) =>
    controller.create(req, res, next)
  );

  /**
   * POST /api/v1/customers/bulk-import
   * Bulk import customers
   */
  router.post('/bulk-import', (req, res, next) => controller.bulkImport(req, res, next));

  /**
   * POST /api/v1/customers/bulk-status
   * Bulk update customer status
   */
  router.post('/bulk-status', (req, res, next) => controller.bulkUpdateStatus(req, res, next));

  /**
   * POST /api/v1/customers/check-credit
   * Check if customer can make a purchase based on credit limit
   */
  router.post('/check-credit', (req, res, next) => controller.checkCreditLimit(req, res, next));

  /**
   * GET /api/v1/customers/:id
   * Get customer by ID
   */
  router.get('/:id', (req, res, next) => controller.get(req, res, next));

  /**
   * GET /api/v1/customers/:id/stats
   * Get customer statistics
   */
  router.get('/:id/stats', (req, res, next) => controller.getStats(req, res, next));

  /**
   * POST /api/v1/customers/:id/balance
   * Update customer balance
   */
  router.post('/:id/balance', (req, res, next) => controller.updateBalance(req, res, next));

  /**
   * POST /api/v1/customers/:id/check-unique-code
   * Check if customer code is unique
   */
  router.post('/:id/check-unique-code', (req, res, next) =>
    controller.checkUniqueCode(req, res, next)
  );

  /**
   * POST /api/v1/customers/:id/check-unique-email
   * Check if customer email is unique
   */
  router.post('/:id/check-unique-email', (req, res, next) =>
    controller.checkUniqueEmail(req, res, next)
  );

  /**
   * PUT /api/v1/customers/:id
   * Update customer
   */
  router.put('/:id', validateRequest(updateCustomerValidation), (req, res, next) =>
    controller.update(req, res, next)
  );

  /**
   * DELETE /api/v1/customers/:id
   * Delete (soft delete) customer
   */
  router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

  return router;
}

export default createCustomerRoutes;

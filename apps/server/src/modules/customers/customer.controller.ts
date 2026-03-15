import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CustomerService } from './customer.service';
import { CreateCustomerDTO, UpdateCustomerDTO, CustomerFilters } from '@vaybooks/shared';

/**
 * Customer Controller
 * Handles HTTP requests and responses for customer operations
 */
export class CustomerController {
  private service: CustomerService;

  constructor(prisma: PrismaClient) {
    this.service = new CustomerService(prisma);
  }

  /**
   * GET /api/v1/customers
   * List all customers with optional filtering and pagination
   */
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = req.query.search as string;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;
      const hasBalance = req.query.hasBalance === 'true' ? true : req.query.hasBalance === 'false' ? false : undefined;
      const city = req.query.city as string;
      const state = req.query.state as string;
      const country = req.query.country as string;
      const customerType = req.query.customerType as 'retail' | 'wholesale' | 'distributor';
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc';

      const filters: CustomerFilters = {
        ...(search && { search }),
        ...(isActive !== undefined && { isActive }),
        ...(hasBalance !== undefined && { hasBalance }),
        ...(city && { city }),
        ...(state && { state }),
        ...(country && { country }),
        ...(customerType && { customerType }),
      };

      const result = await this.service.getAllCustomers(filters, {
        page,
        limit,
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        data: result.data,
        total: result.pagination?.total || result.data.length,
        page: result.pagination?.page || page,
        limit: result.pagination?.limit || limit,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/customers/:id
   * Get a single customer by ID
   */
  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const includeDetail = req.query.includeDetail === 'true';

      const customer = includeDetail
        ? await this.service.getCustomerDetail(id)
        : await this.service.getCustomerById(id);

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/customers/code/:code
   * Get a customer by code
   */
  async getByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await this.service.getCustomerByCode(req.params.code as string);

      if (!customer) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        data: customer,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/customers
   * Create a new customer
   */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data: CreateCustomerDTO = req.body;
      const userId = (req as any).user?.id;

      const customer = await this.service.createCustomer(data, userId);

      res.status(201).json({
        success: true,
        data: customer,
        message: 'Customer created successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/customers/:id
   * Update an existing customer
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const data: UpdateCustomerDTO = req.body;
      const userId = (req as any).user?.id;

      const customer = await this.service.updateCustomer(id, data, userId);

      res.json({
        success: true,
        data: customer,
        message: 'Customer updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/customers/:id
   * Delete (soft delete) a customer
   */
  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);

      await this.service.deleteCustomer(id);

      res.json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/customers/generate-code
   * Generate next customer code
   */
  async generateCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const prefix = (req.query.prefix as string) || 'CUST';
      const code = await this.service.generateCustomerCode(prefix);

      res.json({
        success: true,
        data: { code },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/customers/top
   * Get top customers by credit limit
   */
  async getTopCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const customers = await this.service.getTopCustomers(limit);

      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/customers/:id/balance
   * Update customer balance
   */
  async updateBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const { amount } = req.body;

      if (amount === undefined || amount === null) {
        res.status(400).json({
          success: false,
          error: 'Amount is required',
        });
        return;
      }

      const updated = await this.service.updateCustomerBalance(id, amount);

      res.json({
        success: !!updated,
        data: updated,
        message: updated ? 'Balance updated successfully' : 'Failed to update balance',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/customers/bulk-import
   * Bulk import customers
   */
  async bulkImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customers: CreateCustomerDTO[] = req.body.customers;
      const userId = (req as any).user?.id;

      if (!Array.isArray(customers)) {
        res.status(400).json({
          success: false,
          error: 'Invalid data format. Expected array of customers',
        });
        return;
      }

      const result = await this.service.bulkImportCustomers(customers, userId);

      res.json({
        success: true,
        data: result,
        message: `Imported ${result.successCount} customers successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/customers/active
   * Get all active customers
   */
  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const customers = await this.service.getActiveCustomers({
        page,
        limit,
      });

      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/customers/type/:type
   * Get customers by type
   */
  async getByType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const type = req.params.type as 'retail' | 'wholesale' | 'distributor';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!['retail', 'wholesale', 'distributor'].includes(type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid customer type. Must be retail, wholesale, or distributor',
        });
        return;
      }

      const customers = await this.service.getCustomersByType(type, {
        page,
        limit,
      });

      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/customers/balance
   * Get customers with outstanding balance
   */
  async getWithBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const customers = await this.service.getCustomersWithBalance({
        page,
        limit,
      });

      res.json({
        success: true,
        data: customers,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/customers/check-credit
   * Check if customer can make a purchase based on credit limit
   */
  async checkCreditLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { customerId, amount } = req.body;

      if (!customerId || amount === undefined) {
        res.status(400).json({
          success: false,
          error: 'customerId and amount are required',
        });
        return;
      }

      const canPurchase = await this.service.checkCreditLimit(customerId, amount);

      res.json({
        success: true,
        data: { canPurchase },
        message: canPurchase ? 'Customer can make this purchase' : 'Credit limit exceeded',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/customers/:id/stats
   * Get customer statistics
   */
  async getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string);
      const stats = await this.service.getCustomerStats(id);

      if (!stats) {
        res.status(404).json({
          success: false,
          error: 'Customer not found',
        });
        return;
      }

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/customers/bulk-status
   * Bulk update customer status
   */
  async bulkUpdateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { ids, isActive } = req.body;

      if (!Array.isArray(ids) || isActive === undefined) {
        res.status(400).json({
          success: false,
          error: 'ids (array) and isActive (boolean) are required',
        });
        return;
      }

      const count = await this.service.bulkUpdateStatus(ids, isActive);

      res.json({
        success: true,
        data: { updatedCount: count },
        message: `Updated ${count} customers`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/customers/:id/check-unique-code
   * Check if customer code is unique
   */
  async checkUniqueCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { code } = req.body;
      const excludeId = req.params.id ? parseInt(req.params.id) : undefined;

      if (!code) {
        res.status(400).json({
          success: false,
          error: 'Code is required',
        });
        return;
      }

      const isUnique = await this.service.isCodeUnique(code, excludeId);

      res.json({
        success: true,
        data: { isUnique },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/customers/:id/check-unique-email
   * Check if customer email is unique
   */
  async checkUniqueEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const excludeId = req.params.id ? parseInt(req.params.id) : undefined;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email is required',
        });
        return;
      }

      const isUnique = await this.service.isEmailUnique(email, excludeId);

      res.json({
        success: true,
        data: { isUnique },
      });
    } catch (error) {
      next(error);
    }
  }
}

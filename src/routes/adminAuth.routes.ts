import { Router } from 'express';
import { validateBody } from '../middleware/validate.middleware';
import { updateRestaurantUserPartiallyRequestBodySchema } from '../schema/auth.schema';
import { adminAuthController } from '../controllers/adminAuth.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.patch(
  '/admin/update-restaurant-user-role',
  authenticate,
  requireRole('platform_admin'),
  validateBody(updateRestaurantUserPartiallyRequestBodySchema),
  adminAuthController.updateRestaurantUserPartially
);

export const adminAuthRoutes = router;

import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { updateRestaurantUserRole } from '../services/restaurantUser.service';

const updateRestaurantUserPartially = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await updateRestaurantUserRole(req.body);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
);

export const adminAuthController = {
  updateRestaurantUserPartially,
};

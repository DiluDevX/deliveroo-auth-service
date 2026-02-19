import { Request, Response, NextFunction } from 'express';
import { updateRestaurantUserRole } from '../services/restaurantUser.service';
import { HttpStatusCode } from 'axios';
import {
  UpdateRestaurantUserRoleRequestBodyDTO,
  UpdateRestaurantUserRoleResponseBodyDTO,
} from '../dtos/restaurant-user.dto';
import { CommonResponseDTO } from '../dtos/common.dto';

const updateRestaurantUserPartially = async (
  req: Request<
    unknown,
    UpdateRestaurantUserRoleResponseBodyDTO,
    UpdateRestaurantUserRoleRequestBodyDTO
  >,
  res: Response<CommonResponseDTO<UpdateRestaurantUserRoleResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const response = await updateRestaurantUserRole(
      req.body.userId,
      req.body.role,
      req.body.restaurantId
    );
    res.status(HttpStatusCode.Ok).json({
      message: 'Restaurant user role updated successfully',
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

export const adminAuthController = {
  updateRestaurantUserPartially,
};

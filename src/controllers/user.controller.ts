import { Request, Response, NextFunction } from 'express';
import type {
  GetAllUsersResponseBodyDTO,
  GetSingleUserResponseBodyDTO,
  UpdateUserRequestBodyDTO,
  UpdateUserResponseBodyDTO,
  DeleteUserResponseBodyDTO,
  CreateUserRequestBodyDTO,
  CreateUserResponseBodyDTO,
} from '../dtos/user.dto';
import { CommonResponseDTO, IdRequestPathParamsDTO } from '../dtos/common.dto';
import * as usersDatabaseService from '../services/users.database.service';
import { ConflictError, NotFoundError } from '../utils/errors';
import HttpStatusCodes from 'http-status-codes';
import { logger } from '../utils/logger';

export const getAllUsers = async (
  _req: Request, // TODO: add query params for filtering, pagination, etc.
  res: Response<CommonResponseDTO<GetAllUsersResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const users = await usersDatabaseService.findManyWithoutPassword({ deletedAt: null });
    logger.info({ count: users.length }, 'Users retrieved successfully');
    res.status(HttpStatusCodes.OK).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to retrieve users'
    );
    next(error);
  }
};

export const getSingleUser = async (
  req: Request<IdRequestPathParamsDTO, CommonResponseDTO<GetSingleUserResponseBodyDTO>>,
  res: Response<CommonResponseDTO<GetSingleUserResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;

    const foundUser = await usersDatabaseService.findOneWithoutPassword({
      id: userId,
      deletedAt: null,
    });

    logger.info({ userId }, 'User found');

    if (!foundUser) {
      throw new NotFoundError('User not found');
    }

    res.status(HttpStatusCodes.OK).json({
      success: true,
      message: 'User retrieved successfully',
      data: foundUser,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to retrieve user'
    );
    next(error);
  }
};

export const createUser = async (
  req: Request<unknown, CommonResponseDTO<CreateUserResponseBodyDTO>, CreateUserRequestBodyDTO>,
  res: Response<CommonResponseDTO<CreateUserResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const existingUser = await usersDatabaseService.findOneWithoutPassword({
      email: req.body.email,
    });

    if (existingUser && !existingUser.deletedAt) {
      throw new ConflictError('Email is already in use');
    }
    logger.info({ role: 'user' }, 'Creating new user');

    const createdUser = await usersDatabaseService.create({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      password: req.body.password,
    });

    logger.info({ userId: createdUser.id }, 'User created successfully');

    res.status(HttpStatusCodes.CREATED).json({
      success: true,
      message: 'User created successfully',
      data: createdUser,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to create user'
    );
    next(error);
  }
};

export const updateUser = async (
  req: Request<IdRequestPathParamsDTO, UpdateUserResponseBodyDTO, UpdateUserRequestBodyDTO>,
  res: Response<CommonResponseDTO<UpdateUserResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    const user = await usersDatabaseService.updateUserPartially(userId, req.body);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    logger.info({ userId }, 'User updated successfully');

    res.status(HttpStatusCodes.OK).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to update user'
    );
    next(error);
  }
};

export const deleteUser = async (
  req: Request<IdRequestPathParamsDTO, DeleteUserResponseBodyDTO, unknown>,
  res: Response<CommonResponseDTO<DeleteUserResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    await usersDatabaseService.softDeleteUser(userId);
    res.status(HttpStatusCodes.OK).json({
      success: true,
      message: 'User deleted successfully',
    });
    logger.info({ userId }, 'User deleted successfully');
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      'Failed to delete user'
    );
    next(error);
  }
};

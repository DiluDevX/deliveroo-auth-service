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
import { HttpStatusCode } from 'axios';
import { NotFoundError } from '../utils/errors';

export const getAllUsers = async (
  _req: Request, // TODO: add query params for filtering, pagination, etc.
  res: Response<CommonResponseDTO<GetAllUsersResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const users = await usersDatabaseService.findManyWithoutPassword({ deletedAt: null });
    console.log({
      message: 'getAllUsers',
      data: { count: users.length }, // TODO: log more info about pagination, filtering, etc. when implemented
    });
    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    console.log({
      message: 'getAllUsers error',
      data: { error },
    });
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

    console.log({
      message: 'foundUser',
      data: {
        id: foundUser?.id,
      },
    });

    if (!foundUser || foundUser.deletedAt) {
      throw new NotFoundError('User not found');
    }

    res.status(HttpStatusCode.Ok).json({
      success: true,
      message: 'User retrieved successfully',
      data: foundUser,
    });
  } catch (error) {
    console.log({
      message: 'getSingleUser error',
      data: { error },
    });
    next(error);
  }
};

export const createUser = async (
  req: Request<unknown, CommonResponseDTO<CreateUserResponseBodyDTO>, CreateUserRequestBodyDTO>,
  res: Response<CommonResponseDTO<CreateUserResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    console.log({
      message: 'createUser',
      data: {
        email: req.body.email,
        role: req.body.role,
      },
    });

    const createdUser = await usersDatabaseService.create({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phone: req.body.phone,
      role: req.body.role,
      password: req.body.password,
    });

    console.log({
      message: 'createUser',
      data: {
        id: createdUser.id,
      },
    });

    res.status(HttpStatusCode.Created).json({
      success: true,
      message: 'User created successfully',
      data: createdUser,
    });
  } catch (error) {
    console.log({
      message: 'createUser error',
      data: { error },
    });
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
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
    console.log({
      message: 'updateUser',
      data: { userId },
    });
  } catch (error) {
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
    res.status(204).json({ success: true, message: 'User deleted successfully' });
    console.log({
      message: 'deleteUser',
      data: { userId },
    });
  } catch (error) {
    next(error);
  }
};

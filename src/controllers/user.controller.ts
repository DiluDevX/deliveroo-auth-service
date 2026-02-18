import { Request, Response, NextFunction } from 'express';
import type {
  GetAllUsersResponseBodyDTO,
  GetSingleUserRequestParamsDTO,
  GetSingleUserResponseBodyDTO,
  UpdateUserRequestParamsDTO,
  UpdateUserRequestBodyDTO,
  UpdateUserResponseBodyDTO,
  DeleteUserRequestParamsDTO,
  DeleteUserResponseBodyDTO,
  CreateUserRequestBodyDTO,
  CreateUserResponseBodyDTO,
} from '../dtos/user.dto';
import { CommonResponseDTO } from '../dtos/common.dto';
import {
  findUserById,
  getAll,
  updateUserPartially,
  softDeleteUser,
  createUser,
} from '../services/users.database.service';

export const getAllUsers = async (
  _req: Request,
  res: Response<CommonResponseDTO<GetAllUsersResponseBodyDTO>>,
  next: NextFunction
) => {
  try {
    const users = await getAll();
    res.status(200).json({ success: true, message: 'Users retrieved successfully', data: users });
  } catch (error) {
    next(error);
  }
};

export const getSingleUser = async (
  req: Request<GetSingleUserRequestParamsDTO>,
  res: Response<CommonResponseDTO<GetSingleUserResponseBodyDTO>>
) => {
  const userId = req.params.id;
  const user = await findUserById(userId);
  res.status(200).json({ success: true, message: 'User retrieved successfully', data: user });
};

export const CreateUser = async (
  req: Request<unknown, CreateUserResponseBodyDTO, CreateUserRequestBodyDTO>,
  res: Response<CommonResponseDTO<CreateUserResponseBodyDTO>>
) => {
  const user = await createUser(req.body);
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user,
  });
};

export const updateUser = async (
  req: Request<UpdateUserRequestParamsDTO, UpdateUserResponseBodyDTO, UpdateUserRequestBodyDTO>,
  res: Response<CommonResponseDTO<UpdateUserResponseBodyDTO>>
) => {
  const userId = req.params.id;
  const user = await updateUserPartially(userId, req.body);
  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      message: 'User updated successfully',
      user: user,
    },
  });
};

export const deleteUser = async (
  req: Request<DeleteUserRequestParamsDTO, DeleteUserResponseBodyDTO, unknown>,
  res: Response<CommonResponseDTO<DeleteUserResponseBodyDTO>>
) => {
  const userId = req.params.id;
  await softDeleteUser(userId);
  res.status(204).json({ success: true, message: 'User deleted successfully' });
};

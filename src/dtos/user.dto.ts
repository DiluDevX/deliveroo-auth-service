import z from 'zod';
import { createUserRequestBodySchema, updateUserRequestBodySchema } from '../schema/user.schema';
import { User } from '@prisma/client';

export type GetAllUsersResponseBodyDTO = Omit<User, 'password'>[];

export type GetSingleUserResponseBodyDTO = Omit<User, 'password'>;

export type CreateUserRequestBodyDTO = z.infer<typeof createUserRequestBodySchema>;

export type CreateUserResponseBodyDTO = Omit<User, 'password'>;

export type UpdateUserRequestBodyDTO = z.infer<typeof updateUserRequestBodySchema>;

export type UpdateUserResponseBodyDTO = Omit<User, 'password'>;

export type DeleteUserResponseBodyDTO = Omit<User, 'password'>;

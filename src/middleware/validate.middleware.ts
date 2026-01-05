import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Creates a validation middleware for the specified target using a Zod schema.
 */
function createValidator(target: ValidationTarget) {
  return (schema: ZodSchema): RequestHandler => {
    return (req: Request, _res: Response, next: NextFunction): void => {
      try {
        const result = schema.parse(req[target]);
        req[target] = result;
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const errors: Record<string, string[]> = {};

          error.errors.forEach((err) => {
            const path = err.path.join('.');
            if (!errors[path]) {
              errors[path] = [];
            }
            errors[path].push(err.message);
          });

          next(new ValidationError('Validation failed', errors));
          return;
        }
        next(error);
      }
    };
  };
}

/**
 * Validates request body against a Zod schema.
 * @example
 * router.post('/', validateBody(createUserSchema), createUser);
 */
export const validateBody = createValidator('body');

/**
 * Validates query parameters against a Zod schema.
 * @example
 * router.get('/', validateQuery(paginationSchema), listUsers);
 */
export const validateQuery = createValidator('query');

/**
 * Validates route parameters against a Zod schema.
 * @example
 * router.get('/:id', validateParams(idParamSchema), getUser);
 */
export const validateParams = createValidator('params');

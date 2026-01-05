import { Request, Response, NextFunction } from 'express';
import { ExampleService } from '../services/example.service';
import { PaginationQuery, IdParam } from '../schema/common.schema';
import { CreateExampleInput, UpdateExampleInput } from '../schema/example.schema';

const exampleService = new ExampleService();

export class ExampleController {
  async findAll(
    req: Request<unknown, unknown, unknown, PaginationQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const result = await exampleService.findAll({ page, limit, sortBy, sortOrder });

      res.json({
        success: true,
        data: result.data,
        meta: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async findOne(
    req: Request<IdParam>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const example = await exampleService.findById(id);

      res.json({
        success: true,
        data: example,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(
    req: Request<unknown, unknown, CreateExampleInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const example = await exampleService.create(req.body);

      res.status(201).json({
        success: true,
        data: example,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(
    req: Request<IdParam, unknown, UpdateExampleInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const example = await exampleService.update(id, req.body);

      res.json({
        success: true,
        data: example,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(
    req: Request<IdParam>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await exampleService.delete(id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

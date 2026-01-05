import { prisma } from '../config/database';
import { NotFoundError } from '../utils/errors';
import { CreateExampleInput, UpdateExampleInput } from '../schema/example.schema';
import { PaginationQuery } from '../schema/common.schema';

export class ExampleService {
  async findAll(options: PaginationQuery) {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.example.findMany({
        where: { isActive: true },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.example.count({ where: { isActive: true } }),
    ]);

    return { data, total };
  }

  async findById(id: string) {
    const example = await prisma.example.findUnique({
      where: { id },
    });

    if (!example) {
      throw new NotFoundError('Example not found');
    }

    return example;
  }

  async create(input: CreateExampleInput) {
    return prisma.example.create({
      data: input,
    });
  }

  async update(id: string, input: UpdateExampleInput) {
    // Check if exists first
    await this.findById(id);

    return prisma.example.update({
      where: { id },
      data: input,
    });
  }

  async delete(id: string) {
    // Check if exists first
    await this.findById(id);

    // Soft delete
    return prisma.example.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async hardDelete(id: string) {
    await this.findById(id);

    return prisma.example.delete({
      where: { id },
    });
  }
}

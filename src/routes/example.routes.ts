import { Router } from 'express';
import { ExampleController } from '../controllers/example.controller';
import { validateBody, validateParams, validateQuery } from '../middleware/validate.middleware';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { createExampleSchema, updateExampleSchema } from '../schema/example.schema';
import { idParamSchema, paginationSchema } from '../schema/common.schema';

const router = Router();
const controller = new ExampleController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Example:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateExample:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 */

/**
 * @swagger
 * /api/v1/examples:
 *   get:
 *     summary: List all examples
 *     tags: [Examples]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of examples
 */
router.get('/', validateQuery(paginationSchema), controller.findAll);

/**
 * @swagger
 * /api/v1/examples/{id}:
 *   get:
 *     summary: Get example by ID
 *     tags: [Examples]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Example found
 *       404:
 *         description: Example not found
 */
router.get('/:id', validateParams(idParamSchema), controller.findOne);

/**
 * @swagger
 * /api/v1/examples:
 *   post:
 *     summary: Create a new example
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExample'
 *     responses:
 *       201:
 *         description: Example created
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticate,
  validateBody(createExampleSchema),
  controller.create
);

/**
 * @swagger
 * /api/v1/examples/{id}:
 *   patch:
 *     summary: Update an example
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExample'
 *     responses:
 *       200:
 *         description: Example updated
 *       404:
 *         description: Example not found
 */
router.patch(
  '/:id',
  authenticate,
  validateParams(idParamSchema),
  validateBody(updateExampleSchema),
  controller.update
);

/**
 * @swagger
 * /api/v1/examples/{id}:
 *   delete:
 *     summary: Delete an example
 *     tags: [Examples]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Example deleted
 *       404:
 *         description: Example not found
 */
router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  validateParams(idParamSchema),
  controller.delete
);

export { router as exampleRoutes };

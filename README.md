# Microservice Template

A production-ready template for building microservices with Express, Prisma, TypeScript, and AWS deployment.

## Features

- ⚡ **Express.js** - Fast, unopinionated web framework
- 🔷 **TypeScript** - Type safety and better DX
- 🗄️ **Prisma** - Next-generation ORM for PostgreSQL (AWS RDS ready)
- 🔐 **JWT Authentication** - Built-in auth middleware with role-based access
- ✅ **Zod Validation** - Schema validation for requests
- 📝 **Swagger/OpenAPI** - Auto-generated API documentation
- 🐳 **Docker** - Production and development containers
- 🚀 **GitHub Actions** - CI/CD pipeline for AWS ECS deployment
- 📊 **Pino Logging** - Structured JSON logging for production

## Quick Start

### 1. Use this template

Click "Use this template" on GitHub or clone manually:

```bash
git clone https://github.com/YOUR_USERNAME/microservice-template.git my-service
cd my-service
rm -rf .git && git init
```

### 2. Install dependencies

```bash
corepack enable  # Enable Yarn
yarn install
```

### 3. Set up environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 4. Start local database

```bash
docker compose -f docker-compose.dev.yaml up db -d
```

### 5. Run migrations

```bash
yarn prisma:migrate
```

### 6. Start development server

```bash
yarn dev
```

Visit:

- API: <http://localhost:3000>
- Swagger Docs: <http://localhost:3000/api-docs>
- Health Check: <http://localhost:3000/health>

## Project Structure

```text
├── .aws/                    # AWS ECS task definitions
├── .github/workflows/       # CI/CD pipelines
├── prisma/
│   └── schema.prisma        # Database schema
├── src/
│   ├── config/              # Configuration & database setup
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Express middleware
│   ├── routes/              # API route definitions
│   ├── schema/              # Zod validation schemas
│   ├── services/            # Business logic
│   ├── utils/               # Utility functions
│   ├── server.ts            # App entry point
│   └── swagger.ts           # API documentation config
├── Dockerfile               # Production Docker image
├── Dockerfile.dev           # Development Docker image
├── docker-compose.yaml      # Production compose
└── docker-compose.dev.yaml  # Development compose
```

## Scripts

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `yarn dev`             | Start development server with hot reload |
| `yarn build`           | Compile TypeScript to `dist/`            |
| `yarn start`           | Run compiled production build            |
| `yarn lint`            | Run ESLint                               |
| `yarn lint:fix`        | Fix ESLint issues                        |
| `yarn format:fix`      | Format code with Prettier                |
| `yarn typecheck`       | Run TypeScript type checking             |
| `yarn prisma:generate` | Generate Prisma client                   |
| `yarn prisma:migrate`  | Run database migrations                  |
| `yarn prisma:studio`   | Open Prisma Studio GUI                   |

## Customization Checklist

When creating a new service from this template:

- [ ] Update `name` in `package.json`
- [ ] Update API title in `src/swagger.ts`
- [ ] Modify `prisma/schema.prisma` with your models
- [ ] Update `.aws/task-definition.json` with your AWS account details
- [ ] Update `.github/workflows/deploy.yaml` with your ECS/ECR names
- [ ] Add your routes in `src/routes/`
- [ ] Remove example files (`example.*.ts`)

## AWS Deployment

### Prerequisites

1. AWS Account with:

   - ECR repository created
   - ECS cluster and service configured
   - RDS PostgreSQL instance running
   - Secrets stored in AWS Secrets Manager

2. GitHub Secrets configured:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

### RDS Connection

Update your `DATABASE_URL` to point to RDS:

```text
postgresql://username:password@your-rds-endpoint.region.rds.amazonaws.com:5432/dbname?schema=public
```

### Deploy

Push to `main` branch to trigger automatic deployment, or manually trigger via GitHub Actions.

## Middleware

### Authentication

```typescript
import { authenticate, requireRole, optionalAuth } from './middleware/auth.middleware';

// Require valid JWT
router.get('/protected', authenticate, handler);

// Require specific role
router.delete('/admin-only', authenticate, requireRole('ADMIN'), handler);

// Optional - attach user if token provided
router.get('/public', optionalAuth, handler);
```

### Validation

```typescript
import { validateBody, validateParams, validateQuery } from './middleware/validate.middleware';

router.post('/', validateBody(createSchema), handler);
router.get('/:id', validateParams(idSchema), handler);
router.get('/', validateQuery(paginationSchema), handler);
```

## Health Checks

| Endpoint            | Purpose                       |
| ------------------- | ----------------------------- |
| `GET /health`       | Basic health check            |
| `GET /health/ready` | Readiness (includes DB check) |
| `GET /health/live`  | Liveness probe                |

## License

MIT

# Deliveroo Auth Service

A production-ready microservice for authentication, user management, and restaurant user administration. Built with Express, Prisma, TypeScript, and AWS deployment ready.

## Features

- ⚡ **Express.js** - Fast, unopinionated web framework
- 🔷 **TypeScript** - Type safety and better developer experience
- 🗄️ **Prisma** - Next-generation ORM for PostgreSQL (AWS RDS ready)
- 🔐 **JWT Authentication** - Access tokens and refresh token rotation
- 🔑 **API Key Validation** - Secure microservice-to-microservice communication
- ✅ **Zod Validation** - Type-safe schema validation for all requests
- 📧 **Email Service** - Password reset and verification emails via Resend
- 🐳 **Docker** - Production and development containers
- 🚀 **GitHub Actions** - CI/CD pipeline with quality checks and AWS EC2 deployment
- 📊 **Pino Logging** - Structured JSON logging for production
- 🔐 **Security Best Practices** - Bcrypt password hashing, rate limiting, soft deletes

## Features

### Authentication

- User registration and login
- JWT-based access tokens
- Refresh token rotation with invalidation
- Password reset flow with token verification
- Email verification (secure token-based)

### User Management

- User creation and profile management
- Role-based access control (Admin, User, Restaurant User)
- Soft delete support (data retention)
- Partial unique indexes for soft-deleted record reuse

### Restaurant Management

- Restaurant user assignments
- Role-based restaurant access (Employee, Admin, Super Admin, Finance)
- Soft delete support for restaurant relationships

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 12+ (local or AWS RDS)
- Doppler account (for secret management)

### 1. Clone and setup

```bash
git clone https://github.com/DiluDevX/deliveroo-auth-service.git
cd deliveroo-auth-service
npm install
```

### 2. Set up environment

```bash
# Configure Doppler CLI
doppler auth
doppler setup

# Or use .env file
cp .env.example .env.local
# Edit with your database URL and secrets
```

### 3. Start database

```bash
# If using local PostgreSQL
createdb auth_db

# Or use Docker
docker compose -f docker-compose.dev.yaml up -d db
```

### 4. Run migrations

```bash
doppler run -- npx prisma migrate dev
# OR
npm run prisma:migrate:new
```

### 5. Start development server

```bash
npm run dev
```

Visit:

- API: http://localhost:3000
- Health Check: http://localhost:3000/health
- Prisma Studio: `npm run prisma:studio`

## Project Structure

```
deliveroo-auth-service/
├── .github/
│   └── workflows/
│       ├── pr-quality-check.yml    # Lint, format, type check
│       ├── release.yml             # Semantic release
│       └── deploy-ec2.yml          # AWS EC2 deployment
├── prisma/
│   ├── schema.prisma               # Database schema
│   └── migrations/                 # Database migrations (10 total)
├── src/
│   ├── config/                     # Configuration & database setup
│   │   ├── database.ts
│   │   └── environment.ts
│   ├── controllers/                # Route handlers
│   │   ├── auth.controller.ts
│   │   └── user.controller.ts
│   ├── middleware/                 # Express middleware
│   │   ├── api-key.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   ├── request-logger.middleware.ts
│   │   └── validate.middleware.ts
│   ├── routes/                     # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── common.routes.ts
│   ├── schema/                     # Zod validation schemas
│   ├── services/                   # Business logic
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   ├── users.database.service.ts
│   │   └── refresh-token.database.service.ts
│   ├── dtos/                       # Data transfer objects
│   ├── utils/                      # Utility functions
│   │   ├── jwt.ts                  # Token generation & verification
│   │   ├── password.ts             # Password hashing
│   │   ├── errors.ts               # Custom error classes
│   │   ├── logger.ts               # Pino logging setup
│   │   └── html.ts                 # HTML escaping
│   ├── types/                      # TypeScript type definitions
│   ├── templates/                  # Email templates
│   └── server.ts                   # Application entry point
├── Dockerfile                       # Production Docker image
├── docker-entrypoint.sh
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Command                      | Description                                        |
| ---------------------------- | -------------------------------------------------- |
| `npm run dev`                | Start development server with hot reload (nodemon) |
| `npm run build`              | Compile TypeScript to `dist/`                      |
| `npm start:development`      | Start dev environment with Doppler secrets         |
| `npm start:production`       | Start prod environment with Doppler secrets        |
| `npm run lint:check`         | Run ESLint validation                              |
| `npm run lint:fix`           | Fix ESLint issues                                  |
| `npm run format:check`       | Check Prettier formatting                          |
| `npm run format:fix`         | Format code with Prettier                          |
| `npm run types:check`        | Run TypeScript type checking                       |
| `npm run prisma:generate`    | Generate Prisma client                             |
| `npm run prisma:migrate:new` | Create and run new migration                       |
| `npm run prisma:studio`      | Open Prisma Studio GUI                             |
| `npm run release`            | Create semantic release                            |
| `npm run release:dry-run`    | Simulate semantic release                          |

## API Endpoints

### Authentication (`/api/auth`)

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login with email & password
- `POST /auth/logout` - Logout and invalidate refresh token
- `POST /auth/refresh` - Refresh access token
- `POST /auth/forgot-password` - Request password reset email
- `POST /auth/verify-reset-token` - Verify reset token is valid
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/check-email` - Check if email exists

### User Management (`/api/users`)

- `GET /users` - List all users (admin only)
- `GET /users/:id` - Get user profile
- `POST /users` - Create new user (admin only)
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Soft delete user

### Health Checks

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness (includes DB check)
- `GET /health/live` - Liveness probe (Kubernetes)

## Database

### Models

- **User** - Application users with roles (user, platform_admin, restaurant_user)
- **RestaurantUser** - User assignments to restaurants with roles
- **RefreshToken** - Refresh token tracking for logout
- **PasswordResetToken** - Password reset token verification

### Security Features

- Bcrypt password hashing
- JWT token signing with expiration
- Timing-safe token comparison
- Soft deletes (deletedAt) for data retention
- Partial unique indexes to allow email/assignment reuse after soft delete

### Migrations (10 total)

- Initial schema setup
- Auth models and relationships
- Admin roles and restaurant management
- Soft delete support with partial indexes
- Order count tracking
- Restaurant user management

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db

# JWT
JWT_ACCESS_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d
JWT_RESET_PASSWORD_EXPIRES_IN=1h

# Email
RESEND_API_KEY=your-resend-api-key
RESET_PASSWORD_URL=https://example.com/reset-password

# API Security
API_KEY=your-api-key

# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
```

## Deployment

### GitHub Secrets (Required)

- `AWS_ACCESS_KEY_ID` - AWS IAM access key
- `AWS_SECRET_ACCESS_KEY` - AWS IAM secret key
- `EC2_HOST` - EC2 instance IP or domain
- `EC2_USER` - SSH username (ec2-user, ubuntu, etc.)
- `EC2_SSH_KEY` - Private SSH key for EC2
- `DOPPLER_TOKEN` - Doppler API token for production secrets
- `AWS_REGION` - AWS region (e.g., eu-north-1)
- `ECR_REPOSITORY` - ECR repository name

### CI/CD Pipelines

#### PR Quality Check

Runs on pull requests to `main` and `develop`:

- ✅ **lint-check** - ESLint validation (parallel)
- ✅ **format-check** - Prettier code style (parallel)
- ✅ **types-check** - TypeScript compilation (parallel)

#### Release

- 📦 Semantic versioning
- 📝 Changelog generation
- 🏷️ Git tag creation

#### Deploy to EC2

Runs on release publish or manual trigger:

- 🐳 Build and push Docker image to AWS ECR
- 🚀 SSH into EC2 instance
- 📥 Pull latest image from ECR
- 🔄 Deploy container with Doppler secrets
- ✅ Restart with `--restart unless-stopped`

### Deployment Environments

- **Development**: Pre-release tags (dev branch)
- **Production**: Release tags (main branch)

## Security Best Practices

✅ **Authentication**

- JWT tokens with expiration
- Refresh token rotation
- Secure password hashing (bcrypt)
- Timing-safe token comparison

✅ **Input Validation**

- Zod schema validation on all inputs
- HTML escaping for XSS prevention
- Rate limiting on auth endpoints

✅ **Logging & Monitoring**

- Structured JSON logging (Pino)
- No sensitive data logged (emails, passwords, tokens)
- Request/response logging middleware

✅ **Database**

- Soft deletes for data retention
- Partial unique indexes for soft-deleted records
- Connection pooling via Prisma

✅ **Docker**

- Non-root user execution
- Minimal attack surface
- Secret management via Doppler

## License

ISC

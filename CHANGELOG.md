# [1.0.0-beta.6](https://github.com/DiluDevX/deliveroo-auth-service/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2026-02-21)


### Bug Fixes

* install Doppler CLI in the Dockerfile build stage ([702bfe5](https://github.com/DiluDevX/deliveroo-auth-service/commit/702bfe56de7c288fbde1b014653011dbbc2268ed))

# [1.0.0-beta.5](https://github.com/DiluDevX/deliveroo-auth-service/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2026-02-21)


### Bug Fixes

* add DOPPLER_TOKEN as build argument in Dockerfile and CI configuration ([a011d3a](https://github.com/DiluDevX/deliveroo-auth-service/commit/a011d3a745e12554a0159dd9cc39026738aa7b37))

# [1.0.0-beta.4](https://github.com/DiluDevX/deliveroo-auth-service/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2026-02-21)


### Bug Fixes

* add missing DOPPLER_TOKEN environment variable to CI jobs ([f5d8c11](https://github.com/DiluDevX/deliveroo-auth-service/commit/f5d8c1196d881956bc446806ca842445b9cff17b))

# [1.0.0-beta.3](https://github.com/DiluDevX/deliveroo-auth-service/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2026-02-21)


### Bug Fixes

* update Doppler CLI installation command to use sudo ([68b57fa](https://github.com/DiluDevX/deliveroo-auth-service/commit/68b57fa483bc66e6f35e0fcc487d6f065d9c0e02))

# [1.0.0-beta.2](https://github.com/DiluDevX/deliveroo-auth-service/compare/v1.0.0-beta.1...v1.0.0-beta.2) (2026-02-21)


### Features

* add installation step for Doppler CLI in CI workflow ([94839a3](https://github.com/DiluDevX/deliveroo-auth-service/commit/94839a327332bc8862fb550b6345b554f5fa280e))

# 1.0.0-beta.1 (2026-02-21)


### Bug Fixes

* tokens are sent to main api as same site none ([2e9bcf4](https://github.com/DiluDevX/deliveroo-auth-service/commit/2e9bcf4b29dc7e3c8ed4481c1bc5aa5ed88e8be5))


### Features

* add logout functionality and update cookie sameSite attribute to lax ([64f8e86](https://github.com/DiluDevX/deliveroo-auth-service/commit/64f8e863759d5f8f779f9de55a7502e278419b3c))
* add partial user update functionality and corresponding schema validation ([f6af31b](https://github.com/DiluDevX/deliveroo-auth-service/commit/f6af31b13c8ca80bda7ea78c0209bfea7f60c149))
* add refresh token validation and response handling in refreshToken function ([1f8b756](https://github.com/DiluDevX/deliveroo-auth-service/commit/1f8b75680fd757baed226e43be4a1f4c7b153384))
* **auth:** add refresh token generation to refresh endpoint ([13de442](https://github.com/DiluDevX/deliveroo-auth-service/commit/13de44207c394cb9927ced01aed6a13b53035bee))
* **auth:** implement cookie-based authentication with access and refresh tokens ([8d59c62](https://github.com/DiluDevX/deliveroo-auth-service/commit/8d59c6276361d914dac868f1c3465e3793eca5ed))
* **auth:** implement user authentication features including signup, login, password reset, and email verification ([440640a](https://github.com/DiluDevX/deliveroo-auth-service/commit/440640ad4a8a417b298b71326f2984dbbd6eb58f))
* **health:** enhance health check endpoint to include DB status and service version ([f425dab](https://github.com/DiluDevX/deliveroo-auth-service/commit/f425dab550747f24590ce28631e4f0d692bebda6))
* implement admin login functionality and update user roles in the database ([663a4b8](https://github.com/DiluDevX/deliveroo-auth-service/commit/663a4b81b239ce3af9effb8db5eeb1ec123313a1))
* implement restaurant user management with role updates and schema adjustments ([977f411](https://github.com/DiluDevX/deliveroo-auth-service/commit/977f411c78b3d1cd94a5d9cd7a90708ca716b98f))
* **middleware:** add API key authentication middleware ([e63c4f5](https://github.com/DiluDevX/deliveroo-auth-service/commit/e63c4f5d9289895dc559461072c4857d5bd87b59))
* refactor configuration management and remove unused files ([db13d89](https://github.com/DiluDevX/deliveroo-auth-service/commit/db13d8981a37464ecfed517385fd1b23b3e8593d))
* Refactor restaurant user role update service and add email functionality ([1137f56](https://github.com/DiluDevX/deliveroo-auth-service/commit/1137f56e8bff399013089ee945f1339f64882fbc))
* rename microservice and update package.json for deliveroo-auth-service ([3a4d278](https://github.com/DiluDevX/deliveroo-auth-service/commit/3a4d2788300407da0ba2075ca02d7023744cb2fe))
* update Dockerfile for multi-stage builds, enhance entrypoint script, and add semantic release configuration ([d7d302b](https://github.com/DiluDevX/deliveroo-auth-service/commit/d7d302b1b243d635377476bb8e0ba0c68807c5e7))

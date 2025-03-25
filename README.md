<p align="center">
  <a href="https://github.com/kuhree/www-tools">
    <img src="https://via.placeholder.com/72" alt="Logo" width=72 height=72>
  </a>

  <h3 align="center">Kuhree's Web Toolbox</h3>

  <p align="center">
    A collection of privacy-focused web tools for image optimization, username checks, webcam testing, and more.
    <br>
    <a href="https://github.com/kuhree/www-tools/issues/new?template=bug.md">Report bug</a>
    ·
    <a href="https://github.com/kuhree/www-tools/issues/new?template=feature.md&labels=feature">Request feature</a>
  </p>
</p>

<!-- Shields -->
![GitHub repo size](https://img.shields.io/github/repo-size/kuhree/www-tools)
![GitHub contributors](https://img.shields.io/github/contributors/kuhree/www-tools)
![GitHub stars](https://img.shields.io/github/stars/kuhree/www-tools?style=social)
![GitHub forks](https://img.shields.io/github/forks/kuhree/www-tools?style=social)

## Table of contents

- [Quick start](#quick-start)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
    - [Project Structure](#project-structure)
    - [Features](#features)
    - [Deployment](#deployment)
- [Contributing](#contributing)
- [Contact](#contact)
- [License](#license)

## Quick start

To get started with the Kuhree Web Tools:

1. Clone the repository:
   ```bash
   git clone https://github.com/kuhree/www-tools.git
   ```
2. Install dependencies and start the server:
   ```bash
   cd tools
   bun install
   bun run dev
   ```
3. Access tools at `http://localhost:8080` (default port)

## Prerequisites

Before starting:
- [Bun](https://bun.sh) (tested with v1.2.5)

## Installation

```bash
bun install
```

## Usage

After starting the server:
- **Home**: `http://localhost:8080`
- **Tools**: `http://localhost:8080/tools/:tool`
  - Image Optimizer: `http://localhost:8080/tools/images`
  - Username Checker: `http://localhost:8080/tools/usernames`
  - Webcam Tester: `http://localhost:8080/tools/webcams`

### Project Structure

```bash
public/               # Static assets (images, favicons)
src/
├── app.tsx           # Main Hono server configuration
├── modules/          # Individual tool implementations
│   ├── images/       # Image optimization tool
│   ├── usernames/    # Username availability checker
│   ├── webcams/      # Webcam testing tool
│   └── .../          # More coming soon...
├── middlewares/      # Hono middleware (error handling, renderer/layout)
├── utils/            # Environment config, error handling, etc.
└── types.ts          # Shared type definitions
```

### Features

#### Core Architecture
1. **Bun + Hono**: Built on Bun for high performance and Hono for minimal server-side overhead
2. **Client-Side React**: Each module is a self-contained React "app" rendered via Hono's JSX support
3. **SSR + Hydration**: Server-rendered HTML with client-side hydration for fast initial loads
4. **Modular Build System**: Tools are built individually using Bun.build for optimized output
5. **Zero-Config Setup**: Environment variables managed via Zod schema validation
6. **Static Assets**: Static files served directly through Bun's built-in server

#### Key Implementation Details
1. **Dynamic Module Loading**: `/tools/:tool/entry.js` route dynamically builds module bundles in dev mode
2. **Environment Abstraction**: Configuration values exposed through strongly-typed Environment class
3. **Error Handling**: Centralized error handling with typed errors and client-side error boundaries

### Deployment

#### Docker Image

1. **Build Process**:
   - **Multi-stage build** (defined in `Dockerfile`):
     - **Base**: Uses official Bun image (`oven/bun:1`)
     - **Dependencies**: Installs dev and prod dependencies in separate stages
     - **Production**: Copies only required modules and optimized bundles
     - **Final image**: Single static binary with no external dependencies

   ```dockerfile
   # Final stage
   FROM base AS release
   COPY --from=install /temp/prod/node_modules node_modules
   COPY --from=prerelease /usr/src/app/package.json .
   COPY --from=prerelease /usr/src/app/dist .
   USER bun
   EXPOSE 8080/tcp
   ENTRYPOINT [ "bun", "index.js" ]
   ```

2. **Image Tags**:
   - `latest`: Latest production build
   - Semver tags (e.g., `v1.0.0`) from package.json
   - `sha-<short-commit>` for immutable references

3. **Registry**:
   - Pushes to [git.littlevibe.net](https://git.littlevibe.net) container registry
   - Uses `LITTLEVIBE_ACCESS_TOKEN` for authentication

#### Fly.io Configuration (fly.toml)

```toml
app = 'www-tools'
primary_region = 'atl'

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1
```

Key features:
  - Deployed to `atl` (Atlanta) primary region
  - Auto-scaling with minimal resource allocation (1GB RAM, shared CPU)
  - Enforces HTTPS via Fly's global edge network
  - Zero-downtime deployments with Fly's routing

#### CI/CD Workflow

1. **Triggers**:
   - Pushes to `main`
   - Pull requests to `main`
   - Manual runs via Gitea UI

2. **Steps**:
   - **Test Phase**: Runs Biome lint/format checks and tests (if implemented)
     - Uses `@biomejs/biome ci` for comprehensive validation
     - Fails build on any violations
   - **Docker Build**: Produces tagged images using `docker/build-push-action`
   - **Fly Deployment**: Uses `flyctl deploy` with `FLY_API_TOKEN`
   - **Notifications**: Sends status updates via ntfy.sh

3. **Secrets**:
   - `LITTLEVIBE_ACCESS_TOKEN` (Docker registry)
   - `FLY_API_TOKEN` (Fly deployment)
   - `NTFY_API_TOKEN` (Notification service)

## Contributing

1. Fork this repository.
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add new tool'`
4. Push to your fork and create a PR

## Contact

Email: hi@tools.kuhree.com

## License

[MIT License](./LICENSE)


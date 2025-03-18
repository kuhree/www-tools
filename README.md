<p align="center">
  <a href="https://github.com/kuhree/tools">
    <img src="https://via.placeholder.com/72" alt="Logo" width=72 height=72>
  </a>

  <h3 align="center">Kuhree's Web Toolbox</h3>

  <p align="center">
    A collection of privacy-focused web tools for image optimization, username checks, webcam testing, and more.
    <br>
    <a href="https://github.com/kuhree/tools/issues/new?template=bug.md">Report bug</a>
    ·
    <a href="https://github.com/kuhree/tools/issues/new?template=feature.md&labels=feature">Request feature</a>
  </p>
</p>

<!-- Shields -->
![GitHub repo size](https://img.shields.io/github/repo-size/kuhree/tools)
![GitHub contributors](https://img.shields.io/github/contributors/kuhree/tools)
![GitHub stars](https://img.shields.io/github/stars/kuhree/tools?style=social)
![GitHub forks](https://img.shields.io/github/forks/kuhree/tools?style=social)

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
   git clone https://github.com/kuhree/tools.git
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

## Contributing

1. Fork this repository.
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add new tool'`
4. Push to your fork and create a PR

## Contact

Email: hi@tools.kuhree.com

## License

[MIT License](./LICENSE)


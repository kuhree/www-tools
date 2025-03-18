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
- [Contributing](#contributing)
- [Contributors](#contributors)
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
   bun run index.ts
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
- **Tools**:
  - Image Optimizer: `http://localhost:8080/tools/images`
  - Username Checker: `http://localhost:8080/tools/usernames`
  - Webcam Tester: `http://localhost:8080/tools/webcams`

## Contributing

1. Fork this repository.
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add new tool'`
4. Push to your fork and create a PR

## Contributors

Core contributor:
- [Kuhree Team](https://github.com/kuhree) 🛠️

## Contact

Email: hi@tools.kuhree.com

## License

[MIT License](./LICENSE)

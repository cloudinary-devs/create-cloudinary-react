# create-cloudinary-react

[![npm version](https://img.shields.io/npm/v/create-cloudinary-react.svg?style=flat-square)](https://www.npmjs.com/package/create-cloudinary-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**The fastest way to start building with Cloudinary and React.**

Scaffold a modern, production-ready Cloudinary application with React 19, Vite 6, and TypeScript 5. Features interactive setup, automatic environment configuration, and built-in AI coding assistance.

- **Node.js** — use a [current LTS](https://nodejs.org/) release. The generated app lists supported versions under `engines` in its `package.json`.
- A Cloudinary account (free tier available)
  - [Sign up for free](https://cld.media/reactregister)
  - Your cloud name is in your [dashboard](https://console.cloudinary.com/app/home/dashboard)

> **Beta Release** - This is a beta version. We welcome feedback and bug reports!

Part of the [Cloudinary Developers](https://github.com/cloudinary-devs) organization.

![Build with Cloudinary!](https://res.cloudinary.com/cloudinary-creators-community/image/upload/c_thumb,w_200,g_face/v1771434800/Tee-Mascot-Hacktoberfest-cloudicorn_x6zvtf.png)
 
## 📽️ Demo

[![Watch the demo](https://res.cloudinary.com/drir0kpia/video/upload/so_1/reactstarterdemo.jpg)](https://res.cloudinary.com/drir0kpia/video/upload/v1771449633/reactstarterdemo.mp4)


## 🎬 Features

- **🚀 Modern Stack**: React 19 + Vite 6 + TypeScript 5.7
- **📦 Cloudinary SDKs**: Pre-configured `@cloudinary/react`
- **🤖 AI-First**: Auto-generates configuration for Cursor, GitHub Copilot, and Claude
- **🛠️ Best Practices**: ESLint 9 + TypeScript-ESLint, strict type checking
- **⚡ Interactive Setup**: Validates your cloud name and configures `.env` automatically
- **🎨 Typed Components**: Includes a fully typed Upload Widget component
- **🔌 MCP Support**: Built-in Model Context Protocol configuration for advanced AI integrations
  
## 🚀 Quick Start

Use a current **Node.js LTS** release. If installs fail, match the `engines` range in the generated project’s `package.json`.

```bash
npx create-cloudinary-react
```
*(No installation required)*

The CLI will guide you through:
1.  **Project Name**: naming your new folder
2.  **Cloud Name**: entering your [Cloudinary cloud name](https://console.cloudinary.com/app/home/dashboard)
3.  **Upload Preset** (Optional): handling unsigned uploads
4.  **AI Assistant**: generating custom rules for your tool of choice (Cursor, VS Code, etc.)

## ⚙️ Headless Mode

For CI/CD pipelines, scripts, or automated workflows, pass `--headless` along with all options as flags to skip the interactive prompts:

```bash
npx create-cloudinary-react --headless \
  --cloudName your-cloud-name \
  --projectName my-app
```

**All options:**

| Flag | Type | Default | Description |
|---|---|---|---|
| `--cloudName` | string | *(required)* | Your Cloudinary cloud name |
| `--projectName` | string | `my-cloudinary-app` | Output directory name |
| `--hasUploadPreset` | boolean | `false` | Set if you have an unsigned upload preset |
| `--uploadPreset` | string | — | Your unsigned upload preset name (required if `--hasUploadPreset`) |
| `--aiTools` | string (repeatable) | `cursor` | AI tools to configure: `cursor`, `copilot`, `claude`, `generic` |
| `--installDeps` | boolean | `true` | Install dependencies after scaffolding |
| `--startDev` | boolean | `false` | Start the dev server after install |
| `--packageManager` | string | *(auto-detected)* | `npm`, `pnpm`, `yarn`, or `bun` |

> **Note:** Shell variables should be quoted to prevent unexpected expansion: `--cloudName "$CLOUD_NAME"`.

## 🛠️ What's Included

Your new project comes with:

- **`src/`**: specialized for Cloudinary workflows
- **`src/components/UploadWidget.tsx`**: A ready-to-use, typed upload component
- **`.env`**: Pre-filled with your Cloud Name (and Upload Preset if provided)
- **`README.md`**: Custom instructions for your specific project
- **AI Configuration**:
    - `.cursorrules` / `.cursor/mcp.json` (for Cursor)
    - `.github/copilot-instructions.md` (for Copilot)
    - `.claude` / `claude.md` (for Claude)

## 🤖 AI Assistant Support

We believe AI is the future of development. This starter kit doesn't just give you code; it gives your AI context.

During setup, select your AI tool to generate **Context Rules**. These rules teach your AI:
- How to construct Cloudinary transformation URLs correctly
- How to use the `@cloudinary/react` SDK components
- Common pitfalls to avoid (like mixing up import paths)
- How to handle upload widget events

**Supported Tools:**
- ✅ **Cursor** (Rules + MCP)
- ✅ **GitHub Copilot** (Instructions)
- ✅ **Claude** (Project context + MCP)
- ✅ **Generic LLMs** (System prompts provided)

## 📋 Prerequisites

- **Node.js** — LTS recommended; exact ranges for the scaffolded app are in `package.json` → `engines`.
- **Cloudinary Account**: [Sign up for free](https://cloudinary.com/users/register/free) if you haven't already.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request

## ⚙️ Development

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for version management and [semantic-release](https://github.com/semantic-release/semantic-release) for automated releases.

### Release Process

Releases are triggered manually via GitHub Actions workflow. The workflow uses npm trusted publishing (OIDC) for secure package publishing. New versions are published to npm when the workflow runs without dry run.

**Dry run (default):** When you run the workflow, "Dry run only" is checked by default. This runs semantic-release in dry-run mode—**no git push, no tags, no npm publish**. Use this to verify the next version and release notes before doing a real release. To publish for real, run the workflow again and **uncheck** "Dry run only". Each real release creates a GitHub release, updates CHANGELOG, and publishes the new version to npm (when the version changes).

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `chore`: Other changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

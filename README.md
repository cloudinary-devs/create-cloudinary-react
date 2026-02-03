# create-cloudinary-react

> **Beta Release** - This is a beta version. We welcome feedback and bug reports!

Part of the [Cloudinary Developers](https://github.com/cloudinary-devs) organization.

Scaffold a Cloudinary React + Vite + TypeScript project with interactive setup.

## Prerequisites

- Node.js 18+ installed
- A Cloudinary account (free tier available)
  - [Sign up for free](https://cloudinary.com/users/register/free)
  - Your cloud name is in your [dashboard](https://console.cloudinary.com/app/home/dashboard)

## Usage

```bash
npx create-cloudinary-react
```

The CLI will prompt you for:
- Project name
- **Cloudinary cloud name** (found in your [dashboard](https://console.cloudinary.com/app/home/dashboard))
- Unsigned upload preset (optional - required for uploads, but transformations work without it)
- AI coding assistant(s) you're using (Cursor, GitHub Copilot, Claude, etc.)
- Whether to install dependencies
- Whether to start dev server

## Features

- ✅ Interactive setup with validation
- ✅ Pre-configured Cloudinary React SDK
- ✅ TypeScript + Vite + React 19
- ✅ Typed Upload Widget component
- ✅ Environment variables with VITE_ prefix
- ✅ Multi-tool AI assistant support (Cursor, GitHub Copilot, Claude, and more)
- ✅ MCP configuration for Cloudinary integration
- ✅ ESLint + TypeScript configured

## AI Assistant Support

During setup, you'll be asked which AI coding assistant(s) you're using. The CLI will generate the appropriate configuration files:

- ✅ **Cursor** → `.cursorrules` + `.cursor/mcp.json` (if selected)
- ✅ **GitHub Copilot** → `.github/copilot-instructions.md`
- ✅ **Claude Code / Claude Desktop** → `.claude`, `claude.md` + `.cursor/mcp.json` (if selected)
- ✅ **Generic AI tools** → `AI_INSTRUCTIONS.md`, `PROMPT.md`

**MCP Configuration**: The `.cursor/mcp.json` file is automatically generated if you select Cursor or Claude, as it works with both tools.

These rules help AI assistants understand Cloudinary React SDK patterns, common errors, and best practices. The generated app also includes an "AI Prompts" section with ready-to-use suggestions for your AI assistant.

## Development

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


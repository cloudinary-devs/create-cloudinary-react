# create-cloudinary-react-vite

> **Beta Release** - This is a beta version. We welcome feedback and bug reports!

Part of the [Cloudinary Developers](https://github.com/cloudinary-devs) organization.

Scaffold a Cloudinary React + Vite + TypeScript project with interactive setup.

## Usage

```bash
npx create-cloudinary-react-vite
```

The CLI will prompt you for:
- Project name
- Cloudinary cloud name
- Upload preset (optional)
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

This project uses [Conventional Commits](https://www.conventionalcommits.org/) for version management.

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


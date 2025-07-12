# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Environment

This repository uses a standardized development container configuration for team consistency.

### Container Setup
- **Base**: Node.js 20 container with comprehensive development tooling
- **User**: `node` (non-root for security)
- **Workspace**: `/workspace` (mounted from host)
- **Config**: `/home/node/.claude` (persistent across container rebuilds)

### Available Tools
- **Package Managers**: npm, pnpm
- **Node.js Tools**: tsx, ts-node-dev
- **Project Scaffolding**: create-t3-app, create-next-app, create-remix, degit, plop
- **Version Control**: git, gh (GitHub CLI), git-delta
- **Shell**: zsh with powerline10k theme, fzf integration
- **Network**: iptables-based firewall restricting external access

### VSCode Extensions (Auto-installed)
- ESLint + Prettier (auto-format on save)
- GitLens, Git Graph
- TypeScript auto-import and ES7 React snippets
- Tailwind CSS IntelliSense
- Prisma support
- Thunder Client and REST Client for API testing
- SQL Tools for database work

### Network Security
The development environment includes a firewall configuration that:
- Allows access to GitHub, npm registry, Anthropic API
- Blocks most other external network access
- Permits local network communication
- Configured via `/usr/local/bin/init-firewall.sh`

### Environment Variables
- `NODE_OPTIONS`: "--max-old-space-size=4096" (increased memory limit)
- `CLAUDE_CONFIG_DIR`: "/home/node/.claude"
- `DEVCONTAINER`: "true" (indicates container environment)

## Development Workflow

### Common Commands
- `npm run setup` - Install dependencies, format, and lint code
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Check code quality
- `npm run format` - Format code with Prettier
- `npm run docker:up` - Start local services (PostgreSQL, Redis, etc.)
- `npm run docker:down` - Stop local services

### Container Management
1. **Container Rebuild**: Use "Rebuild Container" in VSCode when devcontainer changes
2. **Persistent Data**: Bash history and Claude config are preserved via Docker volumes
3. **Timezone**: Container inherits host timezone via `TZ` environment variable
4. **Permissions**: All workspace files owned by `node` user for consistent permissions
5. **Port Forwarding**: Common development ports (3000, 8080, etc.) auto-forwarded

## Architecture Notes

This repository serves as a development environment template rather than a specific application codebase. The architecture focuses on:

- **Reproducible Environments**: Identical dev setup across team members
- **Security-First**: Network restrictions to prevent data exfiltration
- **Tool Integration**: Pre-configured with modern JS/TS development stack
- **Claude Code Ready**: Optimized for AI-assisted development workflows
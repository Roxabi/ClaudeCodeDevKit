# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Environment

This repository uses a standardized development container configuration for team consistency.

**Configuration Files:**

- **Container setup**: `.devcontainer/devcontainer.json`
- **Development tools**: `.devcontainer/Dockerfile`
- **Network security**: `.devcontainer/init-firewall.sh`
- **Available commands**: `package.json` scripts section

**Key Details:**

- **Base**: Node.js container with comprehensive development tooling
- **User**: `node` (non-root for security)
- **Workspace**: `/workspace` (mounted from host)
- **Config**: `/home/node/.claude` (persistent across container rebuilds)

## Claude Code Guidelines

### File Discovery

- **Always use `ls -la`** instead of LS tool when doing directory listings to include hidden files
- **Always include hidden file patterns** (`.*`, `**/.*`) in searches
- **Remember config files** often start with "." (`.devcontainer`, `.gitignore`, `.env`, etc.)

## Development Workflow

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **development environment template** featuring:
- Standardized devcontainer setup for team consistency
- Comprehensive test suite with Vitest
- Task Master AI integration for project management
- Security-focused configuration with network restrictions
- Pre-configured tooling for TypeScript/JavaScript development

## Development Environment

**Configuration Files:**

- **Container setup**: `.devcontainer/devcontainer.json`
- **Development tools**: `.devcontainer/Dockerfile`
- **Network security**: `.devcontainer/init-firewall.sh`
- **Package management**: `package.json` with comprehensive scripts
- **MCP integration**: `.mcp.json` for Task Master AI tools

**Key Details:**

- **Base**: Node.js 18+ container with development tooling
- **User**: `node` (non-root for security)
- **Workspace**: `/workspace` (mounted from host)
- **Config**: `/home/node/.claude` (persistent across container rebuilds)
- **Testing**: Vitest for unit, integration, and e2e tests
- **Linting**: ESLint with TypeScript support
- **Formatting**: Prettier with automatic formatting on save

## Claude Code Guidelines

### File Discovery

- **Always use `ls -la`** instead of LS tool when doing directory listings to include hidden files
- **Always include hidden file patterns** (`.*`, `**/.*`) in searches
- **Remember config files** often start with "." (`.devcontainer`, `.gitignore`, `.env`, etc.)

### Quality Assurance

Before considering any task complete, run these validation commands:
```bash
npm run lint          # Check code style and quality
npm run type-check    # Verify TypeScript types
npm test             # Run all tests
npm run format:check # Verify code formatting
```

## Development Workflow

### Container Management

1. **Container Rebuild**: Use "Rebuild Container" in VSCode when devcontainer changes
2. **Persistent Data**: Bash history and Claude config are preserved via Docker volumes
3. **Timezone**: Container inherits host timezone via `TZ` environment variable
4. **Permissions**: All workspace files owned by `node` user for consistent permissions
5. **Port Forwarding**: Common development ports (3000, 8080, etc.) auto-forwarded

### Test Suite

This repository includes a comprehensive test suite organized into three categories:

**Test Structure:**
- **Unit Tests**: `tests/unit/` - Test individual components and configurations
- **Integration Tests**: `tests/integration/` - Test component interactions and services
- **E2E Tests**: `tests/e2e/` - End-to-end testing scenarios

**Available Test Commands:**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Test Coverage:**
- Devcontainer configuration validation
- Docker environment setup
- Service availability and connectivity
- Port forwarding functionality
- Development tools integration
- Runtime environment verification

## Task Master AI Integration

This project uses Task Master AI for structured task management and development workflows.

📖 **Complete documentation**: [Task Master MCP Guide](docs/mcp/taskmaster.md)

### Quick Start

```bash
# View next available task
task-master next

# Show task details
task-master show <id>

# Mark task complete
task-master set-status --id=<id> --status=done
```

### MCP Integration

Task Master is available through MCP tools with prefix `mcp__taskmaster-ai__*`. Configure in `.mcp.json` with your API keys.

### Development Notes

- Never manually edit `tasks.json` - use Task Master commands
- Use `/clear` between different tasks to maintain focus
- Reference tasks in commits: `feat: implement auth (task 1.2)`
- Log implementation progress with `task-master update-subtask`

## Architecture Notes

This repository serves as a development environment template rather than a specific application codebase. The architecture focuses on:

- **Reproducible Environments**: Identical dev setup across team members
- **Security-First**: Network restrictions to prevent data exfiltration
- **Tool Integration**: Pre-configured with modern JS/TS development stack
- **Claude Code Ready**: Optimized for AI-assisted development workflows

---

## Available Package Scripts

Essential commands available via `npm run`:

**Development:**
- `npm run dev` - Start development server (placeholder)
- `npm run build` - Build project (placeholder)

**Code Quality:**
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - TypeScript type checking

**Testing:**
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

**Utilities:**
- `npm run clean` - Clean build artifacts
- `npm run setup` - Install, format, and lint
- `npm run docker:up` - Start Docker services
- `npm run ccusage` - Check Claude Code usage

For complete Task Master documentation, commands, workflows, and troubleshooting, see [docs/mcp/taskmaster.md](docs/mcp/taskmaster.md).

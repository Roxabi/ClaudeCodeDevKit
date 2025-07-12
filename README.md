# Development Environment Template

A standardized development container setup for team collaboration using Claude Code and VSCode.

## Quick Start

1. **Prerequisites**
   - [VSCode](https://code.visualstudio.com/) with [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   - [Docker Desktop](https://www.docker.com/products/docker-desktop/)

2. **Setup**

   ```bash
   # Clone this repository
   git clone <your-repo-url>
   cd <your-repo-name>

   # Open in VSCode
   code .

   # When prompted, click "Reopen in Container"
   # Or use Command Palette: "Dev Containers: Reopen in Container"
   ```

3. **Opening Claude Code**

   Once the container is running, you can access Claude Code in several ways:

   ```bash
   # From the terminal inside VSCode
   claude

   # Or use the Command Palette in VSCode
   # Ctrl+Shift+P (Cmd+Shift+P on Mac) -> "Claude Code: Start Session"
   ```

## Features

### ✅ Completed Setup

- **Package.json**: Configured with development scripts and dependencies
- **TypeScript**: Setup with proper compiler options
- **ESLint & Prettier**: Configured for consistent code quality
- **Claude Code Integration**: ccusage monitoring and reporting
- **Development Container**: Full VSCode devcontainer with 35+ extensions
- **Docker Services**: PostgreSQL, Redis, MailHog, MinIO
- **Environment Configuration**: Complete .env.example template
- **Firewall Security**: Network restrictions for secure development

### 🚀 Ready to Use Scripts

- `npm run setup` - Install dependencies, format, and lint
- `npm run format` - Code formatting with Prettier
- `npm run lint` - ESLint code quality checks
- `npm run docker:up/down` - Local services management
- `npm run ccusage` - Claude Code usage monitoring

## What's Included

### Development Tools

- **Node.js (latest)** with npm, pnpm
- **TypeScript** support with tsx, ts-node-dev
- **Project generators**: create-t3-app, create-next-app, create-remix
- **Shell**: zsh with powerline10k theme and fzf integration
- **Git tools**: git, GitHub CLI, git-delta for better diffs

### VSCode Configuration

- **Auto-formatting** with Prettier on save
- **ESLint** integration with auto-fix on save
- **35+ Extensions** including:
  - React/TypeScript development (ES7 snippets, auto-import)
  - Git tools (GitLens, Git Graph)
  - Code quality (Error Lens, TODO Tree)
  - API testing (Thunder Client, REST Client)
  - Database tools (SQL Tools for PostgreSQL)
  - Tailwind CSS IntelliSense
  - Prisma support
  - Claude Code extension
- **Port forwarding** for development servers (3000, 8080, etc.)
- **Persistent volumes** for bash history and Claude config

### Local Services (Docker Compose)

- **PostgreSQL 15** - Main database (port 5432)
- **Redis 7** - Caching and sessions (port 6379)
- **MailHog** - Email testing (SMTP: 1025, Web UI: 8025)
- **MinIO** - S3-compatible storage (API: 9000, Console: 9001)

## Available Scripts

```bash
# Development (placeholder - customize for your project)
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode

# Code Quality (ready to use)
npm run lint         # ESLint code quality checks
npm run lint:fix     # ESLint with auto-fix
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # TypeScript type checking
npm run setup        # Install deps, format, and lint
npm run clean        # Remove build artifacts

# Services (ready to use)
npm run docker:up    # Start PostgreSQL, Redis, MailHog, MinIO
npm run docker:down  # Stop all services
npm run docker:logs  # View service logs

# Claude Code Usage Monitoring (ready to use)
npm run ccusage      # Show usage statistics
npm run ccusage:daily     # Daily usage report
npm run ccusage:session   # Current session usage
```

## Team Development

### Code Style

- **Prettier** for consistent formatting
- **ESLint** for code quality
- **EditorConfig** for editor consistency
- Auto-format on save enabled

### Environment Variables

The project includes a comprehensive `.env.example` with:

- **Application**: NODE_ENV, PORT configuration
- **Database**: PostgreSQL and Redis connection strings
- **Email**: SMTP configuration for MailHog
- **Security**: API keys and secret management
- **Integrations**: GitHub OAuth, Sentry monitoring
- **Feature Flags**: Debug mode and feature toggles

1. Copy `.env.example` to `.env`
2. Fill in your specific values
3. Never commit `.env` files

### Git Workflow

- Use conventional commit messages
- Format and lint before committing
- GitLens extension for enhanced Git integration

## Network Security

The development container includes firewall restrictions that:

- ✅ Allow GitHub, npm registry, Anthropic API
- ❌ Block most other external access
- ✅ Permit local network communication

This ensures secure development while maintaining necessary access.

## Troubleshooting

### Container Issues

```bash
# Rebuild container completely
# Command Palette: "Dev Containers: Rebuild Container"

# Or rebuild without cache
# Command Palette: "Dev Containers: Rebuild Container Without Cache"
```

### Port Conflicts

```bash
# Check what's using a port
lsof -i :3000

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

### Database Connection

```bash
# Check if PostgreSQL is running
npm run docker:up
docker ps

# Connect to database
psql postgresql://devuser:devpass@localhost:5432/devdb
```

### Permission Issues

```bash
# Fix file permissions
sudo chown -R node:node /workspace
```

## Customization

### Adding New Tools

1. **System packages**: Update `.devcontainer/Dockerfile`
2. **Node.js packages**: Add to `package.json` dependencies
3. **VSCode extensions**: Add to `devcontainer.json` extensions array
4. **Services**: Add to `docker-compose.yml`

### Code Style Configuration

Pre-configured and ready to customize:

- **Prettier**: `.prettierrc` with team-friendly defaults
- **ESLint**: Package.json scripts for linting
- **EditorConfig**: `.editorconfig` for consistent editor behavior
- **TypeScript**: Ready for `tsconfig.json` setup

### Team-Specific Settings

1. **VSCode**: Settings in `devcontainer.json` apply to all team members
2. **Code style**: Modify `.prettierrc` for formatting preferences
3. **Scripts**: Add project-specific commands to `package.json`
4. **Services**: Customize `docker-compose.yml` for your stack

## Security Notes

- Never commit secrets or API keys
- Use `.env` files for sensitive configuration
- The firewall blocks unauthorized external access
- All services run with non-root users where possible

## Getting Help

- VSCode Dev Containers: [Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- Claude Code: [Documentation](https://docs.anthropic.com/en/docs/claude-code)
- Docker Compose: [Documentation](https://docs.docker.com/compose/)

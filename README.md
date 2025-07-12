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

3. **First Time Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Install dependencies
   npm run setup
   
   # Start local services (optional)
   npm run docker:up
   ```

## What's Included

### Development Tools
- **Node.js (latest)** with npm, pnpm
- **TypeScript** support with tsx, ts-node-dev
- **Project generators**: create-t3-app, create-next-app, create-remix
- **Shell**: zsh with powerline10k theme and fzf integration
- **Git tools**: git, GitHub CLI, git-delta for better diffs

### VSCode Configuration
- **Auto-formatting** with Prettier on save
- **ESLint** integration with auto-fix
- **Extensions** for React, TypeScript, Tailwind, Prisma, and more
- **Debug configurations** for Node.js, TypeScript, Jest, and Next.js
- **Port forwarding** for common development ports

### Local Services (Docker Compose)
- **PostgreSQL 15** - Main database (port 5432)
- **Redis 7** - Caching and sessions (port 6379)
- **MailHog** - Email testing (SMTP: 1025, Web UI: 8025)
- **MinIO** - S3-compatible storage (API: 9000, Console: 9001)

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run lint:fix     # Lint and auto-fix
npm run format       # Format code with Prettier
npm run type-check   # TypeScript type checking
npm run setup        # Install deps, format, and lint
npm run docker:up    # Start local services
npm run docker:down  # Stop local services
```

## Team Development

### Code Style
- **Prettier** for consistent formatting
- **ESLint** for code quality
- **EditorConfig** for editor consistency
- Auto-format on save enabled

### Environment Variables
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
1. Update `Dockerfile` for system packages
2. Update `package.json` for Node.js packages
3. Update `devcontainer.json` for VSCode extensions

### Modifying Services
1. Edit `docker-compose.yml`
2. Update `.env.example` with new variables
3. Restart services: `npm run docker:down && npm run docker:up`

### Team-Specific Settings
1. Update `.vscode/settings.json` for workspace settings
2. Modify `.prettierrc` and ESLint config for code style
3. Add custom scripts to `package.json`

## Security Notes

- Never commit secrets or API keys
- Use `.env` files for sensitive configuration
- The firewall blocks unauthorized external access
- All services run with non-root users where possible

## Getting Help

- VSCode Dev Containers: [Documentation](https://code.visualstudio.com/docs/devcontainers/containers)
- Claude Code: [Documentation](https://docs.anthropic.com/en/docs/claude-code)
- Docker Compose: [Documentation](https://docs.docker.com/compose/)
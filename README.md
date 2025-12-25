# Setup My Mac

Setup My Mac is an idempotent, terminal-based interactive tool that simplifies the installation and management of apps and utilities on macOS. It provides a user-friendly interface to browse, select, and install various tools (formulae and casks) through Homebrew. The tool automatically checks for existing installations, allows you to navigate through categorized tool lists, and handles both installation and uninstallation of selected packages. It can be run multiple times without side effects since it detects already-installed tools.

## Included Tools

Setup My Mac includes a curated selection of tools across multiple categories:

**Productivity:** Cursor, Visual Studio Code, Neovim, iTerm2, Notion, OrbStack

**Browsers:** Google Chrome, Firefox, Brave Browser

**Communication:** Slack, Discord, Zoom, Microsoft Teams, WhatsApp

**Utilities:** jq, wget, tree, htop

And more! Browse all available tools when you run the TUI.

## Contributing

We welcome contributions! To contribute:

1. **Create an issue** - Open an issue to discuss your proposed changes
2. **Raise a PR** - Once the issue is approved, create a pull request with your changes

To get started:

```bash
bun install
bun run dev
```

Or build a standalone executable:

```bash
bun run build
./setup
```

## Requirements

- macOS
- Bun (https://bun.sh)

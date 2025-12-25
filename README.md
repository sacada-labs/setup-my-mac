![Logo](favicon.svg)

# Setup My Mac

Setup My Mac is an idempotent, terminal-based interactive tool that simplifies the installation and management of development tools on macOS. It provides a user-friendly interface to browse, select, and install various development tools (formulae and casks) through Homebrew. The tool automatically checks for existing installations, allows you to navigate through categorized tool lists, and handles both installation and uninstallation of selected packages. It can be run multiple times without side effects since it detects already-installed tools.

## Included Tools

Setup My Mac includes a curated selection of tools across multiple categories:

**Development Tools:** Cursor, Visual Studio Code, Neovim, iTerm2, Insomnia, OrbStack, Tmux

**Version Managers:** nvm, pyenv, rbenv, rustup, asdf, jenv, gvm

**DevOps:** kubectl, Terraform, AWS CLI, k9s

**Browsers:** Google Chrome, Firefox, Brave Browser

**Communication:** Slack, Discord, Zoom, Microsoft Teams, WhatsApp

**Utilities:** jq, wget, tree, htop

And more! Browse all available tools when you run the TUI.

## Contributing

We welcome contributions! To contribute:

1. **Create an issue** - Open an issue to discuss your proposed changes
2. **Raise a PR** - Once the issue is approved, create a pull request with your changes

To get started with development:

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

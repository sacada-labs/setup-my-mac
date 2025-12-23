# MacBook Setup TUI

A Terminal User Interface (TUI) application to help set up your MacBook from scratch by installing development tools via Homebrew.

## Features

- ✅ Automatically checks for and installs Homebrew if missing
- ✅ Interactive menu to select tools to install
- ✅ Supports both Homebrew formulae and casks
- ✅ Visual distinction between formulae and casks
- ✅ Real-time installation progress
- ✅ Installation summary with success/failure status

## Installation

First, install dependencies:

```bash
bun install
```

## Usage

### Option 1: Run with Bun (Development)

```bash
bun run index
```

or

```bash
bun run index.ts
```

### Option 2: Build Standalone Executable

Build a standalone executable that can be run without Bun:

```bash
bun run build
```

This creates a `setup` executable in the project root. You can then run it directly:

```bash
./setup
```

The executable is self-contained and includes all dependencies, so you can distribute it to other Macs without requiring Bun to be installed.

## How It Works

1. The tool checks if Homebrew is installed. If not, it will install it automatically.
2. You'll see an interactive menu with categorized tools (Development, DevOps, Utilities, Browsers, etc.)
3. Select the tools you want to install using the arrow keys and spacebar
4. Confirm your selection
5. The tool will install each selected package, showing progress for each one
6. A summary is displayed at the end showing which tools were successfully installed

## Tool Types

- **Formulae** (blue label): Command-line tools installed via `brew install`
- **Casks** (yellow label): GUI applications installed via `brew install --cask`

## Default Tools Included

The tool comes with a curated list of common development tools:

- **Development**: Git, Node.js, Python, Go, Rust
- **DevOps**: Docker, kubectl, Terraform
- **Utilities**: wget, curl, jq, tree, htop
- **Editors**: Neovim
- **Version Managers**: nvm, pyenv
- **Communication**: WhatsApp, Slack, Discord
- **Browsers**: Firefox, Google Chrome, Brave Browser
- **Development Tools**: Cursor, Visual Studio Code, iTerm2
- **Productivity**: Notion, Spotify, Zoom

## Requirements

- macOS
- Bun runtime (https://bun.sh)

## License

Private project

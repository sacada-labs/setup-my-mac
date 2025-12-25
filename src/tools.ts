export type ToolType = "formula" | "cask";

export interface Tool {
  name: string;
  package: string;
  type: ToolType;
  category: string;
  description?: string;
}

export const tools: Tool[] = [
  // Formulae - DevOps
  {
    name: "kubectl",
    package: "kubectl",
    type: "formula",
    category: "DevOps",
    description: "Kubernetes command-line tool",
  },
  {
    name: "Terraform",
    package: "terraform",
    type: "formula",
    category: "DevOps",
    description: "Infrastructure as code tool",
  },
  {
    name: "AWS CLI",
    package: "awscli",
    type: "formula",
    category: "DevOps",
    description: "Amazon Web Services command-line interface",
  },
  {
    name: "k9s",
    package: "k9s",
    type: "formula",
    category: "DevOps",
    description: "Kubernetes CLI to manage clusters",
  },

  // Formulae - Utilities
  {
    name: "wget",
    package: "wget",
    type: "formula",
    category: "Utilities",
    description: "File download utility",
  },
  {
    name: "jq",
    package: "jq",
    type: "formula",
    category: "Utilities",
    description: "JSON processor",
  },
  {
    name: "tree",
    package: "tree",
    type: "formula",
    category: "Utilities",
    description: "Directory tree visualizer",
  },
  {
    name: "htop",
    package: "htop",
    type: "formula",
    category: "Utilities",
    description: "Interactive process viewer",
  },

  // Formulae - Version Managers
  {
    name: "nvm",
    package: "nvm",
    type: "formula",
    category: "Version Managers",
    description: "Node Version Manager",
  },
  {
    name: "pyenv",
    package: "pyenv",
    type: "formula",
    category: "Version Managers",
    description: "Python version management",
  },
  {
    name: "rbenv",
    package: "rbenv",
    type: "formula",
    category: "Version Managers",
    description: "Ruby version management",
  },
  {
    name: "rustup",
    package: "rustup-init",
    type: "formula",
    category: "Version Managers",
    description: "Rust toolchain installer and version manager",
  },
  {
    name: "jenv",
    package: "jenv",
    type: "formula",
    category: "Version Managers",
    description: "Java environment manager",
  },
  {
    name: "asdf",
    package: "asdf",
    type: "formula",
    category: "Version Managers",
    description: "Extendable version manager supporting multiple languages",
  },
  {
    name: "gvm",
    package: "gvm",
    type: "formula",
    category: "Version Managers",
    description: "Go version manager",
  },

  // Casks - Communication
  {
    name: "WhatsApp",
    package: "whatsapp",
    type: "cask",
    category: "Communication",
    description: "Messaging application",
  },
  {
    name: "Slack",
    package: "slack",
    type: "cask",
    category: "Communication",
    description: "Team collaboration platform",
  },
  {
    name: "Discord",
    package: "discord",
    type: "cask",
    category: "Communication",
    description: "Voice and text chat",
  },
  {
    name: "Microsoft Teams",
    package: "microsoft-teams",
    type: "cask",
    category: "Communication",
    description: "Team collaboration and video conferencing",
  },
  {
    name: "Zoom",
    package: "zoom",
    type: "cask",
    category: "Communication",
    description: "Video conferencing",
  },

  // Casks - Browsers
  {
    name: "Arc",
    package: "arc",
    type: "cask",
    category: "Browsers",
    description: "Browser designed for productivity",
  },
  {
    name: "Firefox",
    package: "firefox",
    type: "cask",
    category: "Browsers",
    description: "Web browser",
  },
  {
    name: "Google Chrome",
    package: "google-chrome",
    type: "cask",
    category: "Browsers",
    description: "Web browser",
  },
  {
    name: "Brave Browser",
    package: "brave-browser",
    type: "cask",
    category: "Browsers",
    description: "Privacy-focused browser",
  },

  // Formulae - Development Tools
  {
    name: "Neovim",
    package: "neovim",
    type: "formula",
    category: "Development Tools",
    description: "Hyperextensible Vim-based text editor",
  },
  {
    name: "Tmux",
    package: "tmux",
    type: "formula",
    category: "Development Tools",
    description: "Terminal multiplexer",
  },

  // Casks - Development Tools
  {
    name: "Cursor",
    package: "cursor",
    type: "cask",
    category: "Development Tools",
    description: "AI-powered code editor",
  },
  {
    name: "Visual Studio Code",
    package: "visual-studio-code",
    type: "cask",
    category: "Development Tools",
    description: "Code editor",
  },
  {
    name: "IntelliJ IDEA Community",
    package: "intellij-idea-ce",
    type: "cask",
    category: "Development Tools",
    description: "Java IDE - Community Edition",
  },
  {
    name: "iTerm2",
    package: "iterm2",
    type: "cask",
    category: "Development Tools",
    description: "Terminal emulator",
  },
  {
    name: "Insomnia",
    package: "insomnia",
    type: "cask",
    category: "Development Tools",
    description: "API client and design platform",
  },
  {
    name: "OrbStack",
    package: "orbstack",
    type: "cask",
    category: "Development Tools",
    description: "Docker Desktop alternative for macOS",
  },

  // Casks - Misc
  {
    name: "Notion",
    package: "notion",
    type: "cask",
    category: "Misc",
    description: "All-in-one workspace",
  },
  {
    name: "Spotify",
    package: "spotify",
    type: "cask",
    category: "Misc",
    description: "Music streaming service",
  },
  {
    name: "Google Drive",
    package: "google-drive",
    type: "cask",
    category: "Misc",
    description: "Cloud storage and file synchronization",
  },
];

export function getToolsByCategory(): Record<string, Tool[]> {
  const categorized: Record<string, Tool[]> = {};

  for (const tool of tools) {
    const category = tool.category;
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category]?.push(tool);
  }

  return categorized;
}

export function getAllCategories(): string[] {
  return Array.from(new Set(tools.map((t) => t.category))).sort();
}

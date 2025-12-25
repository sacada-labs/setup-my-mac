export type ToolType = "formula" | "cask";

export interface Tool {
  name: string;
  package: string;
  type: ToolType;
  category: string;
  description?: string;
}

export const tools: Tool[] = [
  // Development - All development tools, editors, IDEs, language managers, and dev utilities
  {
    name: "AWS CLI",
    package: "awscli",
    type: "formula",
    category: "Development",
    description: "Amazon Web Services command-line interface",
  },
  {
    name: "Cursor",
    package: "cursor",
    type: "cask",
    category: "Development",
    description: "AI-powered code editor",
  },
  {
    name: "gvm",
    package: "gvm",
    type: "formula",
    category: "Development",
    description: "Go version manager",
  },
  {
    name: "Insomnia",
    package: "insomnia",
    type: "cask",
    category: "Development",
    description: "API client and design platform",
  },
  {
    name: "IntelliJ IDEA Community",
    package: "intellij-idea-ce",
    type: "cask",
    category: "Development",
    description: "Java IDE - Community Edition",
  },
  {
    name: "iTerm2",
    package: "iterm2",
    type: "cask",
    category: "Development",
    description: "Terminal emulator",
  },
  {
    name: "jenv",
    package: "jenv",
    type: "formula",
    category: "Development",
    description: "Java environment manager",
  },
  {
    name: "k9s",
    package: "k9s",
    type: "formula",
    category: "Development",
    description: "Kubernetes CLI to manage clusters",
  },
  {
    name: "kubectl",
    package: "kubectl",
    type: "formula",
    category: "Development",
    description: "Kubernetes command-line tool",
  },
  {
    name: "Neovim",
    package: "neovim",
    type: "formula",
    category: "Development",
    description: "Hyperextensible Vim-based text editor",
  },
  {
    name: "nvm",
    package: "nvm",
    type: "formula",
    category: "Development",
    description: "Node Version Manager",
  },
  {
    name: "OrbStack",
    package: "orbstack",
    type: "cask",
    category: "Development",
    description: "Docker Desktop alternative for macOS",
  },
  {
    name: "rbenv",
    package: "rbenv",
    type: "formula",
    category: "Development",
    description: "Ruby version management",
  },
  {
    name: "rustup",
    package: "rustup-init",
    type: "formula",
    category: "Development",
    description: "Rust toolchain installer and version manager",
  },
  {
    name: "Terraform",
    package: "terraform",
    type: "formula",
    category: "Development",
    description: "Infrastructure as code tool",
  },
  {
    name: "uv",
    package: "uv",
    type: "formula",
    category: "Development",
    description: "Python package installer and resolver",
  },
  {
    name: "Visual Studio Code",
    package: "visual-studio-code",
    type: "cask",
    category: "Development",
    description: "Code editor",
  },

  // Productivity - Communication, browsers, and productivity applications
  {
    name: "Arc",
    package: "arc",
    type: "cask",
    category: "Productivity",
    description: "Browser designed for productivity",
  },
  {
    name: "Brave Browser",
    package: "brave-browser",
    type: "cask",
    category: "Productivity",
    description: "Privacy-focused browser",
  },
  {
    name: "Discord",
    package: "discord",
    type: "cask",
    category: "Productivity",
    description: "Voice and text chat",
  },
  {
    name: "Firefox",
    package: "firefox",
    type: "cask",
    category: "Productivity",
    description: "Web browser",
  },
  {
    name: "Google Chrome",
    package: "google-chrome",
    type: "cask",
    category: "Productivity",
    description: "Web browser",
  },
  {
    name: "Google Drive",
    package: "google-drive",
    type: "cask",
    category: "Productivity",
    description: "Cloud storage and file synchronization",
  },
  {
    name: "Microsoft Teams",
    package: "microsoft-teams",
    type: "cask",
    category: "Productivity",
    description: "Team collaboration and video conferencing",
  },
  {
    name: "Notion",
    package: "notion",
    type: "cask",
    category: "Productivity",
    description: "All-in-one workspace",
  },
  {
    name: "Slack",
    package: "slack",
    type: "cask",
    category: "Productivity",
    description: "Team collaboration platform",
  },
  {
    name: "Spotify",
    package: "spotify",
    type: "cask",
    category: "Productivity",
    description: "Music streaming service",
  },
  {
    name: "WhatsApp",
    package: "whatsapp",
    type: "cask",
    category: "Productivity",
    description: "Messaging application",
  },
  {
    name: "Zoom",
    package: "zoom",
    type: "cask",
    category: "Productivity",
    description: "Video conferencing",
  },

  // System & Utilities - System-level utilities and command-line tools
  {
    name: "htop",
    package: "htop",
    type: "formula",
    category: "System & Utilities",
    description: "Interactive process viewer",
  },
  {
    name: "jq",
    package: "jq",
    type: "formula",
    category: "System & Utilities",
    description: "JSON processor",
  },
  {
    name: "Tmux",
    package: "tmux",
    type: "formula",
    category: "System & Utilities",
    description: "Terminal multiplexer",
  },
  {
    name: "tree",
    package: "tree",
    type: "formula",
    category: "System & Utilities",
    description: "Directory tree visualizer",
  },
  {
    name: "wget",
    package: "wget",
    type: "formula",
    category: "System & Utilities",
    description: "File download utility",
  },
].sort((a, b) => a.name.localeCompare(b.name)) as unknown as Tool[];

export function getToolsByCategory(): Record<string, Tool[]> {
  const categorized: Record<string, Tool[]> = {};

  for (const tool of tools) {
    const category = tool.category;
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category]?.push(tool);
  }

  // Sort tools within each category alphabetically by name
  for (const category in categorized) {
    categorized[category]?.sort((a, b) => a.name.localeCompare(b.name));
  }

  return categorized;
}

export function getAllCategories(): string[] {
  return Array.from(new Set(tools.map((t) => t.category))).sort();
}

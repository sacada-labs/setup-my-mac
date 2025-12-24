#!/usr/bin/env bun

import inquirer from "inquirer";
import kleur from "kleur";
import { type Tool, getAllCategories, getToolsByCategory } from "./src/tools";
import {
  ensureHomebrew,
  isHomebrewInstalled,
  checkHomebrewVersion,
  getInstalledPackages,
} from "./src/brew";
import {
  installTools,
  printInstallationSummary,
  uninstallTools,
  printUninstallationSummary,
} from "./src/installer";
import type { InstallationResult } from "./src/installer";
import { stdin } from "node:process";

function clearScreen(): void {
  // ANSI escape codes: \x1b[2J clears screen, \x1b[H moves cursor to top-left
  process.stdout.write("\x1b[2J\x1b[H");
}

function waitForBackOrEnter(): Promise<boolean> {
  return new Promise((resolve) => {
    // Wait a moment to ensure inquirer has fully released stdin
    // Use setTimeout with a small delay to ensure stdin is ready
    setTimeout(() => {
      // Save current stdin state
      const wasRaw = stdin.isRaw || false;
      const wasPaused = stdin.isPaused();

      // Ensure stdin is in a clean state
      if (stdin.isRaw) {
        stdin.setRawMode(false);
      }
      if (!wasPaused) {
        stdin.pause();
      }

      // Small additional delay to ensure state is settled
      setTimeout(() => {
        // Now set up raw mode for single keystrokes
        stdin.setRawMode(true);
        stdin.resume();
        stdin.setEncoding("utf8");

        const cleanup = () => {
          stdin.setRawMode(wasRaw);
          if (wasPaused) {
            stdin.pause();
          } else {
            stdin.resume();
          }
          stdin.removeListener("data", onData);
        };

        const onData = (key: string) => {
          // Ctrl+C
          if (key === "\u0003") {
            cleanup();
            console.log(kleur.yellow("\nExiting..."));
            process.exit(0);
          }

          // 'b' or 'B' - go back
          if (key === "b" || key === "B") {
            cleanup();
            process.stdout.write("\n");
            resolve(true);
            return;
          }

          // Enter - continue
          if (key === "\r" || key === "\n") {
            cleanup();
            process.stdout.write("\n");
            resolve(false);
            return;
          }
        };

        stdin.on("data", onData);
      }, 50);
    }, 100);
  });
}

function waitForEnterOrQ(): Promise<boolean> {
  return new Promise((resolve) => {
    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = (key: string) => {
      // Ctrl+C
      if (key === "\u0003") {
        stdin.setRawMode(wasRaw);
        stdin.pause();
        stdin.removeListener("data", onData);
        console.log(kleur.yellow("\nExiting..."));
        process.exit(0);
      }

      // 'q' or 'Q'
      if (key === "q" || key === "Q") {
        stdin.setRawMode(wasRaw);
        stdin.pause();
        stdin.removeListener("data", onData);
        console.log(kleur.yellow("\nExiting..."));
        process.exit(0);
      }

      // Enter
      if (key === "\r" || key === "\n") {
        stdin.setRawMode(wasRaw);
        stdin.pause();
        stdin.removeListener("data", onData);
        resolve(true);
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
  // Step 1: Collect all intro information
  const categories = getAllCategories();
  const isInstalled = await isHomebrewInstalled();

  let homebrewStatus: string;
  if (isInstalled) {
    const version = await checkHomebrewVersion();
    homebrewStatus =
      kleur.green("✓ Homebrew is installed") + (version ? kleur.gray(` (version ${version})`) : "");
  } else {
    // Try to install Homebrew
    const brewResult = await ensureHomebrew(false);
    if (!brewResult.success) {
      console.log(kleur.cyan().bold("\n🍺 Setup My Mac\n"));
      console.log(kleur.gray("This tool will help you install development tools via Homebrew.\n"));
      console.log(kleur.red(`✗ Failed to install Homebrew: ${brewResult.error}`));
      console.log(kleur.yellow("\nPlease install Homebrew manually and try again:"));
      console.log(
        kleur.gray(
          '  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
        )
      );
      process.exit(1);
    }
    homebrewStatus = kleur.green("✓ Homebrew installed successfully");
  }

  // Step 2: Display all intro text at once, then prompt to continue
  clearScreen();
  console.log(kleur.cyan().bold("\n🍺 MacBook Setup TUI\n"));
  console.log(kleur.gray("This tool will help you install development tools via Homebrew.\n"));
  console.log(kleur.gray("All tools will be installed using Homebrew (formulae and casks).\n"));
  console.log(homebrewStatus);
  console.log(
    kleur.yellow(
      "\n⚠ Warning: Some tools might require sudo privileges during installation.\n" +
        "   If prompted for a password, you'll see a clear notification and can enter it directly.\n"
    )
  );
  console.log(
    kleur.gray(`You'll be shown ${categories.length} categories. Select tools from each one.\n`)
  );

  // Wait for Enter or 'q' keypress
  process.stdout.write(
    kleur.gray("Press ") +
      kleur.bold("<Enter>") +
      kleur.gray(" to continue or ") +
      kleur.bold("'q'") +
      kleur.gray(" to exit: ")
  );
  await waitForEnterOrQ();

  // Step 2.5: Get installed packages
  console.log(kleur.gray("\nChecking installed packages..."));
  const installedPackages = await getInstalledPackages();

  // Step 3: Go through all categories with back navigation support
  const categorizedTools = getToolsByCategory();
  const categorySelections: Record<string, Tool[]> = {};
  const TOOLS_PER_PAGE = 8;

  let i = 0;
  while (i < categories.length) {
    const category = categories[i];
    if (!category) {
      i++;
      continue;
    }
    const categoryTools = categorizedTools[category] || [];

    if (categoryTools.length === 0) {
      i++;
      continue;
    }

    const categoryNumber = i + 1;
    const totalCategories = categories.length;
    clearScreen();
    console.log(kleur.bold(`\n📦 ${category} (${categoryNumber}/${totalCategories})\n`));

    // Pre-select previously selected tools for this category
    const previousSelections = categorySelections[category] || [];
    const previousSelectedValues = previousSelections.map((t) => t.package);

    const toolChoices = categoryTools.map((tool) => {
      const typeLabel = tool.type === "cask" ? kleur.yellow("[cask]") : kleur.blue("[formula]");
      const description = tool.description ? kleur.dim(` - ${tool.description}`) : "";

      // Check if tool is already installed
      const isInstalled =
        tool.type === "cask"
          ? installedPackages.casks.has(tool.package)
          : installedPackages.formulas.has(tool.package);

      const installedMark = isInstalled ? kleur.green(" ✓") : "";

      // Pre-check if previously selected OR already installed
      const shouldBeChecked = previousSelectedValues.includes(tool.package) || isInstalled;

      return {
        name: `${typeLabel} ${tool.name}${installedMark}${description}`,
        value: tool,
        checked: shouldBeChecked,
      };
    });

    // Set up 'b' key interception for going back (if not on first category)
    let shouldGoBack = false;
    let originalEmit: typeof stdin.emit | null = null;

    if (i > 0) {
      // Wrap stdin.emit to intercept 'b' keypresses before inquirer processes them
      originalEmit = stdin.emit.bind(stdin);
      const boundEmit = originalEmit;
      stdin.emit = function (event: string, ...args: unknown[]) {
        if (event === "data" && args[0]) {
          const key = args[0].toString();
          if (key === "b" || key === "B") {
            shouldGoBack = true;
            // Send Enter to complete the prompt
            return boundEmit.call(this, "data", "\r");
          }
        }
        return boundEmit.call(this, event, ...args);
      };
    }

    let toolAnswer: { selected: Tool[] };
    try {
      toolAnswer = await inquirer.prompt([
        {
          type: "checkbox",
          name: "selected",
          message: `Select tools from ${category} (use arrow keys to navigate, space to select${i > 0 ? ", 'b' to go back" : ""}):`,
          choices: toolChoices,
          pageSize: TOOLS_PER_PAGE,
          loop: false,
        },
      ]);
    } finally {
      // Restore original emit
      if (originalEmit) {
        stdin.emit = originalEmit;
      }
    }

    // Check if user pressed 'b' to go back
    if (shouldGoBack) {
      // Store current selections before going back
      categorySelections[category] = toolAnswer.selected;
      i--;
      continue;
    }

    // Store selections for this category
    categorySelections[category] = toolAnswer.selected;

    // Show progress if not the last category
    if (i < categories.length - 1) {
      console.log(kleur.gray(`\n✓ Completed ${category}. Moving to next category...\n`));
    }

    i++;
  }

  // Collect all selected tools from all categories
  const selectedTools: Tool[] = [];
  for (const category of categories) {
    const tools = categorySelections[category] || [];
    selectedTools.push(...tools);
  }

  if (selectedTools.length === 0) {
    console.log(kleur.yellow("\nNo tools selected. Exiting."));
    process.exit(0);
  }

  // Step 4: Find tools to uninstall and install
  clearScreen();

  // Get all tools from our tool list to check what was originally installed
  const allTools = Object.values(categorizedTools).flat();
  const originallyInstalledTools: Tool[] = [];

  for (const tool of allTools) {
    const isInstalled =
      tool.type === "cask"
        ? installedPackages.casks.has(tool.package)
        : installedPackages.formulas.has(tool.package);

    if (isInstalled) {
      originallyInstalledTools.push(tool);
    }
  }

  // Find tools that were installed but are no longer selected (to uninstall)
  const selectedPackageNames = new Set(selectedTools.map((t) => t.package));
  const toolsToUninstall = originallyInstalledTools.filter(
    (tool) => !selectedPackageNames.has(tool.package)
  );

  // Separate selected tools into already installed vs to install
  const toolsToInstall: Tool[] = [];
  const alreadyInstalled: Tool[] = [];

  for (const tool of selectedTools) {
    const isInstalled =
      tool.type === "cask"
        ? installedPackages.casks.has(tool.package)
        : installedPackages.formulas.has(tool.package);

    if (isInstalled) {
      alreadyInstalled.push(tool);
    } else {
      toolsToInstall.push(tool);
    }
  }

  // Show summary
  if (toolsToUninstall.length > 0) {
    console.log(kleur.red(`\n⚠ To uninstall (${toolsToUninstall.length}):\n`));
    for (const tool of toolsToUninstall) {
      const typeLabel = tool.type === "cask" ? kleur.yellow("[cask]") : kleur.blue("[formula]");
      console.log(`  ${typeLabel} ${tool.name} ${kleur.gray(`(${tool.category})`)}`);
    }
  }

  if (alreadyInstalled.length > 0) {
    console.log(kleur.green(`\n✓ Already installed (${alreadyInstalled.length}):\n`));
    for (const tool of alreadyInstalled) {
      const typeLabel = tool.type === "cask" ? kleur.yellow("[cask]") : kleur.blue("[formula]");
      console.log(`  ${typeLabel} ${tool.name} ${kleur.gray(`(${tool.category})`)}`);
    }
  }

  if (toolsToInstall.length > 0) {
    console.log(kleur.bold(`\nTo install (${toolsToInstall.length}):\n`));
    for (const tool of toolsToInstall) {
      const typeLabel = tool.type === "cask" ? kleur.yellow("[cask]") : kleur.blue("[formula]");
      console.log(`  ${typeLabel} ${tool.name} ${kleur.gray(`(${tool.category})`)}`);
    }
  }

  if (toolsToUninstall.length === 0 && toolsToInstall.length === 0) {
    console.log(kleur.green("\n✓ All selected tools are already installed. Nothing to do."));
  }

  // Step 5: Confirm if there are any changes
  if (toolsToUninstall.length > 0 || toolsToInstall.length > 0) {
    const actionMessage =
      toolsToUninstall.length > 0 && toolsToInstall.length > 0
        ? "Proceed with uninstallation and installation?"
        : toolsToUninstall.length > 0
          ? "Proceed with uninstallation?"
          : "Proceed with installation?";

    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: `\n${actionMessage}`,
        default: true,
      },
    ]);

    if (!confirm.proceed) {
      console.log(kleur.yellow("\nOperation cancelled."));
      process.exit(0);
    }

    // Step 6: Uninstall tools first (if any)
    let uninstallResults: InstallationResult[] = [];
    if (toolsToUninstall.length > 0) {
      clearScreen();
      uninstallResults = await uninstallTools(toolsToUninstall);
      clearScreen();
      printUninstallationSummary(uninstallResults);
    }

    // Step 7: Install selected tools (only those that need installation)
    let installResults: InstallationResult[] = [];
    if (toolsToInstall.length > 0) {
      clearScreen();
      installResults = await installTools(toolsToInstall);
      clearScreen();
      printInstallationSummary(installResults);
    }

    // Exit with appropriate code
    const hasFailures =
      uninstallResults.some((r) => !r.success) || installResults.some((r) => !r.success);
    process.exit(hasFailures ? 1 : 0);
  } else {
    // All tools are already installed, just exit
    process.exit(0);
  }
}

// Run the main function
main().catch((error) => {
  console.error(kleur.red("\n✗ Unexpected error:"), error);
  process.exit(1);
});

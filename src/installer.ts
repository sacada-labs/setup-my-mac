import type { Tool } from "./tools";
import kleur from "kleur";
import ora from "ora";

export interface InstallationResult {
  tool: Tool;
  success: boolean;
  error?: string;
}

export async function installTool(tool: Tool): Promise<InstallationResult> {
  const spinner = ora({
    text: `Installing ${kleur.cyan(tool.name)}...`,
    color: "cyan",
  }).start();

  try {
    const args =
      tool.type === "cask" ? ["install", "--cask", tool.package] : ["install", tool.package];

    let outputBuffer = "";
    let errorBuffer = "";
    let sudoPrompted = false;
    let downloadStarted = false;

    const proc = Bun.spawn(["brew", ...args], {
      stdout: "pipe",
      stderr: "pipe",
      stdin: "inherit", // Allow sudo prompts to be visible on TTY
    });

    // Handle stdout - parse for progress and forward important messages
    const processStdout = async () => {
      for await (const chunk of proc.stdout) {
        const text = new TextDecoder().decode(chunk);
        outputBuffer += text;

        const lines = text.split("\n");
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          // Detect sudo prompts (though these usually go to TTY, not stdout)
          if (
            trimmedLine.toLowerCase().includes("password") ||
            trimmedLine.toLowerCase().includes("sudo") ||
            trimmedLine.toLowerCase().includes("administrator")
          ) {
            if (!sudoPrompted) {
              sudoPrompted = true;
              spinner.stop();
              console.log(
                kleur.yellow(
                  `\n⚠ ${tool.name} requires sudo privileges. Please enter your password when prompted.\n`
                )
              );
            }
          }

          // Detect download start
          if (trimmedLine.includes("==> Downloading") || trimmedLine.includes("Downloading")) {
            if (!downloadStarted) {
              downloadStarted = true;
              spinner.text = kleur.cyan(`Downloading ${tool.name}...`);
            }
            // Show the download line if spinner is stopped
            if (!spinner.isSpinning || sudoPrompted) {
              console.log(trimmedLine);
            }
          }

          // Parse download progress with file size info
          // Example: "==> Downloading https://... 50.0%"
          // Or: "==> Downloading https://... (150MB)"
          const progressMatch = trimmedLine.match(/(\d+\.?\d*)%/);
          const sizeMatch = trimmedLine.match(/\(([\d.]+)\s*(MB|GB|KB)\)/i);

          if (progressMatch && downloadStarted) {
            const percent = progressMatch[1];
            const sizeInfo = sizeMatch ? ` (${sizeMatch[1]} ${sizeMatch[2]})` : "";
            spinner.text = kleur.cyan(`Downloading ${tool.name}... ${percent}%${sizeInfo}`);
          } else if (sizeMatch && downloadStarted && !progressMatch) {
            // Show size info even without percentage
            spinner.text = kleur.cyan(
              `Downloading ${tool.name}... ${sizeMatch[1]} ${sizeMatch[2]}`
            );
          }

          // Show other important brew output (like "==> Installing", "==> Pouring", etc.)
          if (trimmedLine.startsWith("==>") && !trimmedLine.includes("Downloading")) {
            if (spinner.isSpinning && !sudoPrompted) {
              spinner.text = kleur.cyan(trimmedLine.replace("==> ", ""));
            } else {
              console.log(trimmedLine);
            }
          }

          // For large downloads, periodically show progress lines for visibility
          // This helps users see that something is happening during long downloads
          if (
            downloadStarted &&
            trimmedLine.includes("Downloading") &&
            (trimmedLine.includes("%") || trimmedLine.includes("MB") || trimmedLine.includes("GB"))
          ) {
            // Update spinner with the latest progress line
            if (spinner.isSpinning && !sudoPrompted) {
              // Extract just the progress info
              const progressInfo = trimmedLine.match(/(\d+\.?\d*%|[\d.]+\s*(MB|GB|KB))/i);
              if (progressInfo) {
                spinner.text = kleur.cyan(`Downloading ${tool.name}... ${progressInfo[0]}`);
              }
            }
          }
        }
      }
    };

    // Handle stderr - forward errors and detect sudo prompts
    const processStderr = async () => {
      for await (const chunk of proc.stderr) {
        const text = new TextDecoder().decode(chunk);
        errorBuffer += text;

        const lines = text.split("\n");
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          // Detect sudo prompts in stderr
          if (
            trimmedLine.toLowerCase().includes("password") ||
            trimmedLine.toLowerCase().includes("sudo") ||
            trimmedLine.toLowerCase().includes("administrator")
          ) {
            if (!sudoPrompted) {
              sudoPrompted = true;
              spinner.stop();
              console.log(
                kleur.yellow(
                  `\n⚠ ${tool.name} requires sudo privileges. Please enter your password when prompted.\n`
                )
              );
            }
          }

          // Always show stderr (errors, warnings)
          if (!spinner.isSpinning || sudoPrompted) {
            process.stderr.write(chunk);
          }
        }
      }
    };

    // Process both streams concurrently
    await Promise.all([processStdout(), processStderr()]);

    await proc.exited;

    if (proc.exitCode === 0) {
      if (spinner.isSpinning) {
        spinner.succeed(kleur.green(`✓ Installed ${tool.name}`));
      } else {
        // Spinner was stopped (likely for sudo), just print success
        console.log(kleur.green(`\n✓ Installed ${tool.name}`));
      }

      return {
        tool,
        success: true,
      };
    }
    const errorMessage = errorBuffer || outputBuffer || `Exit code ${proc.exitCode}`;
    if (spinner.isSpinning) {
      spinner.fail(kleur.red(`✗ Failed to install ${tool.name}`));
    }
    if (errorMessage) {
      console.error(kleur.red(`\nError details:\n${errorMessage}`));
    }

    return {
      tool,
      success: false,
      error: errorMessage,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    spinner.fail(kleur.red(`✗ Failed to install ${tool.name}: ${errorMessage}`));

    return {
      tool,
      success: false,
      error: errorMessage,
    };
  }
}

export async function installTools(tools: Tool[]): Promise<InstallationResult[]> {
  const results: InstallationResult[] = [];

  console.log(kleur.bold(`\nInstalling ${tools.length} tool(s)...\n`));

  for (const tool of tools) {
    const result = await installTool(tool);
    results.push(result);
  }

  return results;
}

export async function uninstallTool(tool: Tool): Promise<InstallationResult> {
  const spinner = ora({
    text: `Uninstalling ${kleur.cyan(tool.name)}...`,
    color: "cyan",
  }).start();

  try {
    const args =
      tool.type === "cask" ? ["uninstall", "--cask", tool.package] : ["uninstall", tool.package];

    let outputBuffer = "";
    let errorBuffer = "";

    const proc = Bun.spawn(["brew", ...args], {
      stdout: "pipe",
      stderr: "pipe",
      stdin: "inherit",
    });

    // Handle stdout
    const processStdout = async () => {
      for await (const chunk of proc.stdout) {
        const text = new TextDecoder().decode(chunk);
        outputBuffer += text;
      }
    };

    // Handle stderr
    const processStderr = async () => {
      for await (const chunk of proc.stderr) {
        const text = new TextDecoder().decode(chunk);
        errorBuffer += text;
        // Show stderr (errors, warnings)
        if (!spinner.isSpinning) {
          process.stderr.write(chunk);
        }
      }
    };

    // Process both streams concurrently
    await Promise.all([processStdout(), processStderr()]);

    await proc.exited;

    if (proc.exitCode === 0) {
      spinner.succeed(kleur.green(`✓ Uninstalled ${tool.name}`));
      return {
        tool,
        success: true,
      };
    }
    const errorMessage = errorBuffer || outputBuffer || `Exit code ${proc.exitCode}`;
    spinner.fail(kleur.red(`✗ Failed to uninstall ${tool.name}`));
    if (errorMessage) {
      console.error(kleur.red(`\nError details:\n${errorMessage}`));
    }

    return {
      tool,
      success: false,
      error: errorMessage,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    spinner.fail(kleur.red(`✗ Failed to uninstall ${tool.name}: ${errorMessage}`));

    return {
      tool,
      success: false,
      error: errorMessage,
    };
  }
}

export async function uninstallTools(tools: Tool[]): Promise<InstallationResult[]> {
  const results: InstallationResult[] = [];

  console.log(kleur.bold(`\nUninstalling ${tools.length} tool(s)...\n`));

  for (const tool of tools) {
    const result = await uninstallTool(tool);
    results.push(result);
  }

  return results;
}

export function printInstallationSummary(results: InstallationResult[]): void {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n${kleur.bold("=".repeat(50))}`);
  console.log(kleur.bold("Installation Summary"));
  console.log(kleur.bold("=".repeat(50)));

  if (successful.length > 0) {
    console.log(kleur.green(`\n✓ Successfully installed (${successful.length}):`));
    for (const result of successful) {
      const typeLabel =
        result.tool.type === "cask" ? kleur.yellow("[cask]") : kleur.blue("[formula]");
      console.log(`  ${typeLabel} ${result.tool.name}`);
    }
  }

  if (failed.length > 0) {
    console.log(kleur.red(`\n✗ Failed to install (${failed.length}):`));
    for (const result of failed) {
      const typeLabel =
        result.tool.type === "cask" ? kleur.yellow("[cask]") : kleur.blue("[formula]");
      console.log(`  ${typeLabel} ${result.tool.name}`);
      if (result.error) {
        console.log(kleur.gray(`    Error: ${result.error}`));
      }
    }
  }

  console.log(`\n${kleur.bold("=".repeat(50))}\n`);
}

export function printUninstallationSummary(results: InstallationResult[]): void {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(`\n${kleur.bold("=".repeat(50))}`);
  console.log(kleur.bold("Uninstallation Summary"));
  console.log(kleur.bold("=".repeat(50)));

  if (successful.length > 0) {
    console.log(kleur.green(`\n✓ Successfully uninstalled (${successful.length}):`));
    for (const result of successful) {
      const typeLabel =
        result.tool.type === "cask" ? kleur.yellow("[cask]") : kleur.blue("[formula]");
      console.log(`  ${typeLabel} ${result.tool.name}`);
    }
  }

  if (failed.length > 0) {
    console.log(kleur.red(`\n✗ Failed to uninstall (${failed.length}):`));
    for (const result of failed) {
      const typeLabel =
        result.tool.type === "cask" ? kleur.yellow("[cask]") : kleur.blue("[formula]");
      console.log(`  ${typeLabel} ${result.tool.name}`);
      if (result.error) {
        console.log(kleur.gray(`    Error: ${result.error}`));
      }
    }
  }

  console.log(`\n${kleur.bold("=".repeat(50))}\n`);
}

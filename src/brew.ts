import { $ } from "bun";

export async function isHomebrewInstalled(): Promise<boolean> {
	try {
		await $`which brew`.quiet();
		return true;
	} catch {
		return false;
	}
}

export async function checkHomebrewVersion(): Promise<string | null> {
	try {
		const result = await $`brew --version`.text();
		const versionMatch = result.match(/Homebrew\s+([\d.]+)/);

		if (!versionMatch) {
			return null;
		}

		const version = versionMatch[1];

		if (!version) {
			return null;
		}

		return version;
	} catch {
		console.error("Error checking Homebrew version");
	}

	return null;
}

export async function installHomebrew(): Promise<{
	success: boolean;
	error?: string;
}> {
	try {
		console.log("Installing Homebrew...");
		console.log(
			"This may take a few minutes. Please follow the prompts if any appear.",
		);

		const installScript = await fetch(
			"https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh",
		);
		const scriptContent = await installScript.text();

		// Write script to temp file and execute
		const scriptPath = "/tmp/brew-install.sh";
		await Bun.write(scriptPath, scriptContent);

		try {
			// Make script executable
			await $`chmod +x ${scriptPath}`.quiet();

			// Execute installation script
			// Note: This requires user interaction, so we use non-quiet mode
			const proc = Bun.spawn(["/bin/bash", scriptPath], {
				stdout: "inherit",
				stderr: "inherit",
				stdin: "inherit",
			});

			await proc.exited;

			if (proc.exitCode === 0) {
				// Add Homebrew to PATH for current session
				const brewPath =
					process.platform === "darwin" && process.arch === "arm64"
						? "/opt/homebrew/bin"
						: "/usr/local/bin";

				if (!process.env.PATH?.includes(brewPath)) {
					process.env.PATH = `${brewPath}:${process.env.PATH || ""}`;
				}

				return { success: true };
			}
			return {
				success: false,
				error: `Installation script exited with code ${proc.exitCode}`,
			};
		} finally {
			// Clean up temp file
			try {
				await $`rm -f ${scriptPath}`.quiet();
			} catch {
				// Ignore cleanup errors
			}
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

export async function ensureHomebrew(
	silent = false,
): Promise<{ success: boolean; error?: string }> {
	const isInstalled = await isHomebrewInstalled();

	if (isInstalled) {
		if (!silent) {
			const version = await checkHomebrewVersion();
			if (version) {
				console.log(`✓ Homebrew is already installed (version ${version})`);
			} else {
				console.log("✓ Homebrew is already installed");
			}
		}
		return { success: true };
	}

	if (!silent) {
		console.log("Homebrew is not installed. Installing now...");
	}
	return await installHomebrew();
}

/**
 * Get a Set of all installed Homebrew formulas
 */
export async function getInstalledFormulas(): Promise<Set<string>> {
	try {
		const result = await $`brew list`.quiet().text();
		const formulas = result
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0);
		return new Set(formulas);
	} catch {
		return new Set();
	}
}

/**
 * Get a Set of all installed Homebrew casks
 */
export async function getInstalledCasks(): Promise<Set<string>> {
	try {
		const result = await $`brew list --cask`.quiet().text();
		const casks = result
			.split("\n")
			.map((line) => line.trim())
			.filter((line) => line.length > 0);
		return new Set(casks);
	} catch {
		return new Set();
	}
}

/**
 * Get a Set of all installed packages (both formulas and casks)
 */
export async function getInstalledPackages(): Promise<{
	formulas: Set<string>;
	casks: Set<string>;
}> {
	const [formulas, casks] = await Promise.all([
		getInstalledFormulas(),
		getInstalledCasks(),
	]);
	return { formulas, casks };
}

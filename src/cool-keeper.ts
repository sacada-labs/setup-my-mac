interface CoolKeeperConfig {
	url: string;
	appId: string;
	publicKey: string;
	repoUrl: string;
	branch: string;
}

export class CoolKeeper {
	constructor(private config: CoolKeeperConfig) {}

	async report(error: Error | string, context?: Record<string, unknown>) {
		try {
			const errorMessage = typeof error === "string" ? error : error.message;
			const stack = typeof error === "string" ? undefined : error.stack;

			const body = JSON.stringify({
				error: errorMessage,
				stack,
				repoUrl: this.config.repoUrl,
				branch: this.config.branch,
				context,
			});

			const res = await fetch(`${this.config.url}/api/errors`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"x-public-key": this.config.publicKey,
					"x-app-id": this.config.appId,
				},
				body,
			});

			if (!res.ok) {
				console.warn(
					`[cool-keeper] Error reporting failed: ${res.status} ${res.statusText}`,
				);
				return null;
			}

			return await res.json();
		} catch (err) {
			console.warn("[cool-keeper] Failed to report error:", err);
			return null;
		}
	}
}

export const coolKeeper = new CoolKeeper({
	url: "https://cool-keeper.sacadalabs.com",
	appId: "setup-my-mac",
	publicKey: "91e145ba4a27f823dccda2bd46ea968b03a0ee4cb36df49f53e98e6474c44403",
	repoUrl: "https://github.com/sacada-labs/setup-my-mac",
	branch: "main",
});

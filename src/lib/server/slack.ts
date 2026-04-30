import { env } from '$env/dynamic/private';

export async function fetchSlackProfile(slackId: string | null | undefined): Promise<{
	avatar: string | null;
	display_name: string | null;
} | null> {
	if (!slackId) return null;
	const token = env.SLACK_BOT_TOKEN;
	if (!token) return null;
	try {
		const res = await fetch(`https://slack.com/api/users.info?user=${encodeURIComponent(slackId)}`, {
			headers: { Authorization: `Bearer ${token}` }
		});
		if (!res.ok) return null;
		const json = (await res.json()) as {
			ok?: boolean;
			user?: {
				profile?: {
					image_192?: string;
					image_72?: string;
					image_512?: string;
					display_name?: string;
					real_name?: string;
				};
			};
		};
		if (!json.ok || !json.user?.profile) return null;
		const p = json.user.profile;
		return {
			avatar: p.image_192 ?? p.image_72 ?? p.image_512 ?? null,
			display_name: p.display_name || p.real_name || null
		};
	} catch {
		return null;
	}
}

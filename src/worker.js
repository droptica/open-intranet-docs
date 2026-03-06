export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Strip /docs prefix — Astro builds with base:/docs/ for correct links,
		// but files are in dist/ root, so we need to map /docs/* → /*
		if (url.pathname.startsWith('/docs')) {
			url.pathname = url.pathname.replace(/^\/docs/, '') || '/';
		}

		return env.ASSETS.fetch(new Request(url, request));
	},
};

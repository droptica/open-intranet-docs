export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		// Redirect /docs without trailing slash to /docs/
		if (url.pathname === '/docs') {
			url.pathname = '/docs/';
			return Response.redirect(url.toString(), 301);
		}

		// Redirect bare root to /docs/ (for direct domain access e.g. docs.open-intranet.com)
		if (url.pathname === '/') {
			url.pathname = '/docs/';
			return Response.redirect(url.toString(), 302);
		}

		// Strip /docs prefix — Astro builds with base:/docs/ for correct links,
		// but files are in dist/ root, so we need to map /docs/* → /*
		if (url.pathname.startsWith('/docs')) {
			url.pathname = url.pathname.replace(/^\/docs/, '') || '/';
		}

		return env.ASSETS.fetch(new Request(url, request));
	},
};

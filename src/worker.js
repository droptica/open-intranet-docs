export default {
	async fetch(request, env) {
		const url = new URL(request.url);

		if (url.pathname === '/docs') {
			url.pathname = '/docs/';
			return Response.redirect(url.toString(), 301);
		}

		if (url.pathname === '/') {
			url.pathname = '/docs/';
			return Response.redirect(url.toString(), 302);
		}

		if (url.pathname.startsWith('/docs')) {
			url.pathname = url.pathname.replace(/^\/docs/, '') || '/';
		}

		return env.ASSETS.fetch(new Request(url.toString(), request));
	},
};

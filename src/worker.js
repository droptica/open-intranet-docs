/**
 * Map public /docs/* URLs to files in dist/ (built with base:/docs/ but no dist/docs/ folder).
 */
function docsUrlToAssetPath(pathname) {
	let path = pathname.replace(/^\/docs\/?/, '/') || '/';
	if (!path.startsWith('/')) {
		path = `/${path}`;
	}

	const lastSegment = path.split('/').pop() ?? '';
	const hasFileExtension = lastSegment.includes('.');

	if (hasFileExtension) {
		return path;
	}

	if (path.endsWith('/')) {
		return `${path}index.html`;
	}

	return `${path}/index.html`;
}

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

		if (!url.pathname.startsWith('/docs')) {
			return env.ASSETS.fetch(request);
		}

		url.pathname = docsUrlToAssetPath(url.pathname);
		return env.ASSETS.fetch(new Request(url.toString(), request));
	},
};

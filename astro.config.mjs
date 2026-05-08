// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightImageZoom from 'starlight-image-zoom';
import rehypeExternalLinks from 'rehype-external-links';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.open-intranet.com',
	base: '/docs/',
	markdown: {
		rehypePlugins: [
			[
				rehypeExternalLinks,
				{
					target: '_blank',
					rel: ['noopener', 'noreferrer'],
					content: {
						type: 'element',
						tagName: 'span',
						properties: { className: ['external-link-icon'], 'aria-hidden': 'true' },
						children: [{ type: 'text', value: '↗' }],
					},
				},
			],
		],
	},
	integrations: [
		starlight({
			plugins: [starlightImageZoom()],
			title: 'Open Intranet Docs',
			logo: {
				light: './src/assets/logo.svg',
				dark: './src/assets/logo-dark.svg',
				replacesTitle: true,
			},
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/droptica/openintranet' },
			],
			sidebar: [
				{ label: 'Introduction', slug: 'index' },
				{
					label: 'Getting Started',
					items: [
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Configuration', slug: 'getting-started/configuration' },
					],
				},
				{
					label: 'Administration',
					autogenerate: { directory: 'administration' },
				},
				{
					label: 'User Guide',
					autogenerate: { directory: 'user-guide' },
				},
				{
					label: 'Features',
					autogenerate: { directory: 'features' },
				},
				{
					label: 'Development',
					autogenerate: { directory: 'development' },
				},
			],
			components: {
				SiteTitle: './src/components/SiteTitle.astro',
				Footer: './src/components/Footer.astro',
			},
			customCss: ['./src/styles/custom.css'],
			editLink: {
				baseUrl: 'https://github.com/droptica/open-intranet-docs/edit/main/',
			},
			head: [
				// Google tag (gtag.js) — same measurement ID as www.open-intranet.com
				// so the docs are tracked as part of the same property. Consent Mode v2
				// defaults to denied; the cookie banner (rendered by Footer override)
				// updates consent when the user accepts.
				{
					tag: 'script',
					attrs: {
						async: true,
						src: 'https://www.googletagmanager.com/gtag/js?id=G-R1J6JH6350',
					},
				},
				{
					tag: 'script',
					content: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'wait_for_update': 500,
});
gtag('js', new Date());
gtag('config', 'G-R1J6JH6350');
`.trim(),
				},
			],
		}),
	],
});

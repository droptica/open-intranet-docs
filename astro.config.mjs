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
			},
			customCss: ['./src/styles/custom.css'],
			editLink: {
				baseUrl: 'https://github.com/droptica/open-intranet-docs/edit/main/',
			},
		}),
	],
});

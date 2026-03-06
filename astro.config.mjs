// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://www.open-intranet.com',
	base: '/docs/',
	integrations: [
		starlight({
			title: 'Open Intranet Docs',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/droptica/openintranet' },
			],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'getting-started/introduction' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Configuration', slug: 'getting-started/configuration' },
					],
				},
				{
					label: 'Features',
					autogenerate: { directory: 'features' },
				},
				{
					label: 'Administration',
					autogenerate: { directory: 'administration' },
				},
				{
					label: 'Development',
					autogenerate: { directory: 'development' },
				},
			],
			customCss: [],
			editLink: {
				baseUrl: 'https://github.com/droptica/open-intranet-docs/edit/main/',
			},
		}),
	],
});

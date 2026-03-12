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
				label: 'User Guide',
				autogenerate: { directory: 'user-guide' },
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
			components: {
				SiteTitle: './src/components/SiteTitle.astro',
			},
			customCss: [],
			editLink: {
				baseUrl: 'https://github.com/droptica/open-intranet-docs/edit/main/',
			},
		}),
	],
});

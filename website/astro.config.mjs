// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
    site: 'https://MiguelMatos98.github.io',
    base: '/Portfolio',
    output: "static",
  image: {
    domains: ["images.unsplash.com"],
  },
  prefetch: true,
  integrations: [starlight({
      title: 'MATOS',
      customCss: ['./src/styles/global.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
      sidebar: [
          {
                label: 'Projects',
                autogenerate: { directory: 'projects' },
          }
      ],

      components: {
            Header: './src/components/header/AstroStarlightHeader.astro',
            Footer: './src/components/footer/AstroStarlightFooter.astro',
      },
  }), react(), mdx()],

  vite: {
    plugins: [tailwindcss()],
  },
});
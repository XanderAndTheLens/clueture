import adapter from '@sveltejs/adapter-vercel';
import sveltePreprocess from 'svelte-preprocess';

export default {
  kit: {
    adapter: adapter(), // Use Vercel adapter
  },
  preprocess: sveltePreprocess(),
};

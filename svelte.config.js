import path from 'path';
import autoprefixer from 'autoprefixer';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess({
		postcss: {
			plugins: [autoprefixer()]
		}
	}),
	kit: {
		target: '#svelte',
		vite: {
			resolve: {
				alias: {
					$compiler: path.resolve('./src/compiler'),
					$scss: path.resolve('./src/scss')
				}
			}
		}
	},
};

export default config;

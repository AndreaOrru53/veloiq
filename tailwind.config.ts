import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { ink:'#090D12', panel:'#111820', line:'#24313B', lime:'#C7F36B' }, boxShadow:{ glow:'0 0 40px rgba(199,243,107,.10)' } } }, plugins: [] };
export default config;

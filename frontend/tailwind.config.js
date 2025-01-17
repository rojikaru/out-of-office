import flowbite from 'flowbite-react/tailwind'

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.{js,jsx,ts,tsx,html,css}',
        './index.html',
        flowbite.content(),
    ],
    theme: {
        extend: {},
    },
    plugins: [
        flowbite.plugin(),
    ],
}


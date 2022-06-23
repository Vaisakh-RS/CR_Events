/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*html', './*js'],
  theme: {
    extend: {
      fontFamily:{
        roboto:"'Roboto',sans-serif",
        outfit:"'Outfit',sans-serif",
        satoshi: "'satoshi'"
      }
    },
  },
  plugins: [],
}

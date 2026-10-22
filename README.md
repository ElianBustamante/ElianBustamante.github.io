# Elian Bustamante | Desarrollo de software y fotografía de paisaje

Portafolio de Elian Bustamante: proyectos de software (bots, datos y web) y fotografía de paisaje.

## Stack
- React + Vite
- Tailwind CSS v4
- i18next

## Comandos
- `npm run dev`: Inicia el servidor de desarrollo.
- `npm run check`: Corre linter, tests y build.
- `npm run photos`: Procesa las imágenes originales, genera las versiones web y escribe `src/data/photos.json` con los datos técnicos de las fotos (dimensiones, rutas WebP, exif). Crea o completa `src/data/captions.json` (donde se configuran títulos, textos alternativos y opcionalmente correcciones de exif) con entradas vacías para fotos nuevas. Si quedan fotos sin título en español, las lista para completarlas y volver a ejecutar el comando.

## Decisiones

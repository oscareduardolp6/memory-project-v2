# Memory Project v2

Entrenador de memoria: elige N palabras al azar, memorízalas y escríbelas en el mismo orden.
Si inicias sesión con la cuenta del dueño, cada ronda se guarda en Firestore (solo aciertos y fallas, nunca las palabras) y aparece en **Ver progreso**.

En línea: https://oscarlp6.dev/memory-project-v2/

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:5173/
npm test         # lógica del juego (Vitest)
npm run build
```

Sin `.env.local` la app funciona completa y sin backend (el botón de login no aparece). Copia `.env.example` a `.env.local` para usar Firebase en local.

## Firebase

Proyecto `memory-project-3226e` (ver `.firebaserc`): login con Google, `oscarlp6.dev` como dominio autorizado y Firestore en modo producción.

- `VITE_OWNER_UID` es el único usuario cuyas rondas se guardan; el mismo UID está fijo en `firestore.rules`.
- Para publicar cambios en las reglas: `npx firebase-tools deploy --only firestore:rules`, o pégalas en la pestaña Rules de la consola.

La config web de Firebase es pública por diseño; lo que protege tus datos son las reglas.

## Despliegue

Cada push a `main` corre `.github/workflows/deploy-pages.yml`: tests, build con `VITE_BASE=/memory-project-v2/` y publicación en GitHub Pages.
Las variables `VITE_FIREBASE_*` y `VITE_OWNER_UID` vienen de los secrets del repositorio.

## Datos guardados

`users/{uid}/sessions/{id}`: `{ createdAt, wordCount, correct, incorrect, positions: boolean[] }`.
Las rondas en las que usas "Mostrar respuestas" antes de comparar no se guardan.

# Milito Life — monorepo

Monorepo (npm workspaces) con las apps del ecosistema Milito Life, cada una pensada para vivir en su propio subdominio:

| App | Carpeta | Dominio |
|---|---|---|
| Landing | `apps/www` | `militolife.com` (pendiente de diseño) |
| Linktree | `apps/linktree` | `link.militolife.com` |
| Tienda | `apps/shop` | `shop.militolife.com` |
| Admin | `apps/admin` | `admin.militolife.com` |
| App | `apps/app` | `app.militolife.com` (pendiente de definir alcance) |

Código compartido (tipos, cliente Supabase, utils, UI atoms) vive en `packages/shared` (`@diana-mile/shared`).

## Desarrollo

Cada app corre de forma independiente:

```bash
npm run dev:shop       # http://localhost:3000
npm run dev:linktree   # http://localhost:3001 (usar --port si hay conflicto)
npm run dev:admin
npm run dev:app
npm run dev:www
```

Cada app tiene su propio `.env.local` (ver `.env.local.example` en cada carpeta).

## Build

```bash
npm run build   # build de todas las apps (workspaces)
```

## Deploy

Cada app es un proyecto Vercel independiente dentro del mismo repo, con **Root Directory** apuntando a su carpeta (`apps/shop`, `apps/linktree`, etc.) y su propio dominio custom asignado en Settings → Domains.

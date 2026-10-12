# Tate Ammonia

Site du groupe. La nuit tient la première page. On descend ensuite vers la billetterie, la cassette, le vinyle, puis la live session.

Les billets partent vers la billetterie du concert (Shotgun pour La Dame de Canton). Le vinyle et la cassette partent vers les pages PayPal déjà utilisées par le groupe.

## Lancer

```bash
npm install
npm run dev
```

Puis ouvrir l’adresse affichée par Vite.

Le site public est sur https://stephanekari.github.io/ tant qu’il n’y a pas de nom de domaine. Pour en brancher un, l’ajouter dans les réglages GitHub Pages du dépôt.

```bash
npm run build
npm run preview
```

Le dossier `dist/` se dépose tel quel sur Netlify, Cloudflare Pages ou un hébergement statique. Pour un sous-dossier (GitHub Pages), régler `base` dans `vite.config.js`.

## Mettre à jour une date

Dans `index.html`, chaque concert a `data-date="AAAA-MM-JJ"`. Le badge « À venir » ou « Joué » se calcule tout seul. Le bouton rouge « Billets Shotgun » ne doit pointer que vers la vraie page de billetterie.

## Visuels

`public/media/` reprend les visuels déjà publiés par le groupe (portrait, nuit du clip, aluminium, faces du pack, pochette du vinyle, disque, live au Club K7). Pour en remplacer un, garder le même nom de fichier.

## Direction

Voir `DESIGN.md`.

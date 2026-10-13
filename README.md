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

`public/media/` reprend les photos publiées sur Instagram par le groupe, dans leur meilleure taille :

- `cover.jpg` : pochette de Make It Right, première page.
- `stage.jpg` : la salle de la Péniche Antipode, billetterie.
- `scene/` : photos de concert de la galerie.
- `foil.jpg`, `k7-cards.jpg`, `k7-tape.jpg`, `pack-*.jpg` : la cassette et les faces de la cassette 3D.
- `sleeve.jpg`, `vinyl.png` : pochette et disque de Sherwood Green.
- `live.jpg`, `band.jpg` : live au Club K7, portrait du groupe.

Pour remplacer une photo, garder le même nom de fichier. Pour en ajouter une à la galerie, copier un `<li class="shot">` dans `index.html` (`shot-wide` pour une photo en largeur) et pointer son lien vers le post.

## Direction

Voir `DESIGN.md`.

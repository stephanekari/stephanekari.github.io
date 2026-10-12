# Tate Ammonia

Site du groupe. On le balaye, comme une pile de pochettes : nuit, bande, dates, disques, écoute.

Les billets partent vers la billetterie du concert (Shotgun pour La Dame de Canton). Le vinyle et la cassette partent vers les pages PayPal déjà utilisées par le groupe.

## Lancer

```bash
npm install
npm run dev
```

Puis ouvrir l’adresse affichée par Vite.

```bash
npm run build
npm run preview
```

Le dossier `dist/` se dépose tel quel sur Netlify, Cloudflare Pages ou un hébergement statique. Pour un sous-dossier (GitHub Pages), régler `base` dans `vite.config.js`.

## Mettre à jour une date

Dans `index.html`, chaque concert a `data-date="AAAA-MM-JJ"`. Le badge « À venir » ou « Joué » se calcule tout seul. Le bouton rouge « Billets Shotgun » ne doit pointer que vers la vraie page de billetterie.

## Visuels

`public/media/` reprend les visuels déjà publiés par le groupe (portrait, nuit du clip, pochette cassettes, aluminium, vinyle, herbe de la page Sherwood Green). Pour en remplacer un, garder le même nom de fichier.

## Direction

Voir `DESIGN.md`.

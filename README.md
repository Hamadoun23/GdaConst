# GDA Construction

Site vitrine 100 % statique : aucune compilation ni PHP, on modifie les fichiers et on les met en ligne.

## Structure

```
*.html                  Les 6 pages du site
assets/
  css/site.css          Styles propres au site : à modifier ici
  css/theme.css         Thème d'origine, réduit aux règles utilisées
  css/vendor.min.css    Bootstrap, Swiper, icônes (réduits, ne pas modifier)
  js/main.js            Comportements du site, une fonction init* par fonctionnalité
  js/vendor/            Bibliothèques (GSAP, Isotope, Swiper, ne pas modifier)
  fonts/                Polices de texte et icônes
  imgs/                 Icônes et décors du thème
AssetsConst/            Images du site, un dossier par page, au format WebP
```

## Ajouter une photo

1. Exporter en WebP, 1920 px maximum de large, sous 500 Ko.
2. La placer dans le dossier de sa page dans `AssetsConst/`, avec un nom en minuscules sans espaces.
3. Pour une photo de grille, créer aussi une version `-800.webp` et renseigner `srcset`.

## Ajouter une icône

Les polices d'icônes ne contiennent que les glyphes utilisés. Toute nouvelle icône Font Awesome
doit être ajoutée aux fichiers `assets/fonts/fa-*-subset.woff2`.

## État de la refonte

Refonte du code terminée le 04/11/2026. Rien n'a été mis en ligne ni enregistré dans Git.

### Fait

- CSS et JS retirés du HTML : `site.css` et `main.js` remplacent les styles et scripts en ligne.
- CSS réduit d'environ 500 Ko à 80 Ko ; jQuery, Bootstrap JS et les plugins inutilisés supprimés.
- Polices hébergées sur le site, icônes réduites aux 9 glyphes utilisés.
- Images différées et versions 800 px pour les téléphones.
- Écran de chargement raccourci, flou des animations retiré, défilement moins lourd.
- Bugs corrigés : menu mobile bloqué sur l'accueil, minuteurs sans fin au survol de l'équipe,
  animations en panne sur certaines pages, 19 liens cassés vers `project-details.html`.
- Formulaire de contact et `contact.php` retirés : le site ne dépend plus d'aucun serveur PHP.

### Dernier contrôle

- 30 tests fonctionnels sur 30 réussis, aucune erreur console, aucune ressource manquante.
- Styles de tous les éléments comparés à l'ancienne version : seuls restent des écarts
  d'arrondi (0,016 px) et le cadrage du fond de l'écran de chargement sur mobile.

- 5 pages comparées visuellement à l'ancienne version, à 6 positions de défilement, sur
  ordinateur et téléphone : aucune différence visible.

### Vitesse sur téléphone en 3G simulée (médianes)

| Page | Premier affichage | Image principale | Chargement complet | Poids |
|---|---|---|---|---|
| Accueil | 7,9 s → 2,2 s | 22,6 s → 5,8 s | 39,1 s → 10,3 s | 7,35 → 2,51 Mo |
| Réalisations | 10,8 s → 1,9 s | 17,9 s → 5,3 s | 43,8 s → 8,3 s | 8,26 → 1,50 Mo |
| Expertises | 6,9 s → 1,9 s | 17,2 s → 3,3 s | 22,3 s → 7,5 s | 4,17 → 1,37 Mo |
| Contact | 6,3 s → 1,9 s | 10,6 s → 3,8 s | 13,2 s → 6,5 s | 2,43 → 1,17 Mo |
| Portfolio | 6,0 s → 1,7 s | 14,2 s → 5,7 s | 22,0 s → 7,7 s | 4,10 → 1,40 Mo |

Mesures sur serveur local, sans compression : à refaire sur l'hébergement réel.

### Reste à faire

1. Comparer en ligne les deux versions, puis faire pointer `construction.gdamali.net` vers le VPS.
2. Décider du nouveau moyen de contact (remplace le formulaire).

### Points connus, non traités

- Le formulaire de newsletter du pied de page n'envoie rien.
- Liens sociaux à renseigner (`#0`).
- Légendes anciennes inexactes sur Réalisations et villas générées par IA.
- Navigation et pied de page sont dupliqués dans les 6 pages (site sans compilation).

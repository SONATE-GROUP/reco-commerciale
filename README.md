# Reco Commerciale

Outil web qui génère une proposition commerciale à partir d'un **transcript d'appel** ou d'un **email de prospect** collé dans un champ texte — remplace le scénario Make "Génération proposition commerciale" par une application autonome plus simple à faire évoluer.

## Ce que fait l'outil

1. **Génération de la reco** : à partir du texte collé, Claude extrait les variables commerciales (expertises demandées, ciblage, stratégie par canal, KPIs, projections...) — équivalent du module `open-router:createAChatCompletion` (id 3) du scénario Make d'origine.
2. **Audit de la landing page** (si une URL est détectée) : appel à l'API Google PageSpeed Insights (mobile + desktop) puis analyse par Claude pour produire des notes lisibles — équivalent des modules PageSpeed + LLM (id 19/22/21/23).
3. **Analyse concurrentielle** (déclenchée quand une expertise Ads — SEA/SMA/Social Ads/Google Ads — est demandée) : Claude identifie 3 concurrents probables et évalue l'intensité concurrentielle — équivalent du module id 10 du scénario Make.
4. **Rendu final** : une page HTML soignée aux couleurs Sonate (vert sapin / orange / ivoire, police Manrope), exportable en PDF via le bouton "Exporter en PDF" (impression navigateur).

## Différences volontaires avec le scénario Make d'origine

- **Déclenchement manuel** au lieu d'un watch Gmail : tu colles le texte toi-même (email ou transcript), pas besoin de label Gmail dédié.
- **Sortie HTML** au lieu de Google Slides : pas de template Google Slides à maintenir, pas d'OAuth Google Slides/Drive à configurer. Le rendu s'adapte automatiquement au nombre d'expertises détectées (1 à 4), là où le scénario Make dupliquait un template par branche du routeur.
- **Scraping Google Ads (Apify) retiré** : dans le scénario d'origine, les résultats du scraping Apify n'étaient de toute façon pas utilisés dans la présentation finale (seuls les `concurrent_X_nom/analyse` générés par le LLM l'étaient). L'appel Apify a donc été supprimé — il coûtait du temps et de l'argent pour un résultat non exploité. Le nom du concurrent + l'URL Google Ads Transparency + l'analyse restent générés.
- **Un seul appel Anthropic direct** au lieu d'OpenRouter avec fallback multi-modèles : plus simple à opérer, un seul compte à gérer. Le fallback OpenRouter pourra être réintroduit si besoin.

## Mise en route

```bash
npm install
cp .env.example .env.local
# Renseigner ANTHROPIC_API_KEY dans .env.local (obligatoire)
# PAGESPEED_API_KEY est optionnelle (l'audit LP fonctionne sans, avec un quota réduit)
npm run dev
```

Ouvrir http://localhost:3000, coller un transcript ou un email, cliquer sur "Générer la reco".

## Déploiement

Projet Next.js standard, déployable tel quel sur Vercel (ou tout hébergeur Node). Penser à configurer les variables d'environnement du `.env.example` sur la plateforme cible.

## Pistes d'amélioration (à faire évoluer avec Clotilde)

- Réintroduire un export Google Slides optionnel (en plus du HTML) pour les cas où un template éditable est nécessaire.
- Ajouter un mode "brouillon email" pour envoyer directement la reco au prospect.
- Ajouter une bibliothèque de recos générées (historique, avec sauvegarde en base).
- Reconnexion Gmail pour déclencher automatiquement depuis un label, comme dans le scénario Make d'origine.

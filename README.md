# Reco Commerciale

Outil web qui génère une proposition commerciale à partir d'un **transcript d'appel** ou d'un **email de prospect** collé dans un champ texte — remplace le scénario Make "Génération proposition commerciale" par une application autonome plus simple à faire évoluer.

## Guide pas-à-pas (pour une première utilisation)

Aucune notion technique n'est requise pour utiliser l'outil au quotidien — seule la mise en ligne initiale demande de suivre ces étapes une fois.

### 1. Mettre l'outil en ligne (une seule fois)

1. Va sur [vercel.com](https://vercel.com) et connecte-toi avec le compte GitHub Sonate (crée un compte gratuit si besoin).
2. Clique sur **"Add New" → "Project"**.
3. Choisis le repo GitHub `reco-commerciale` et clique sur **Deploy**.
4. Ne touche à AUCUN champ de configuration/variable d'environnement — laisse tout par défaut et clique Deploy. L'outil n'en a pas besoin pour fonctionner : tu configureras ta clé API directement dans l'appli, pas dans Vercel (voir étape 2).
5. Au bout d'une minute, Vercel te donne une URL du type `reco-commerciale.vercel.app`. C'est l'adresse de ton outil, à garder en favori.

### 2. Renseigner ta clé API (une seule fois par navigateur)

1. Ouvre l'URL de ton outil.
2. Clique sur le bouton **"⚙ Réglages"** en haut à droite.
3. Va sur [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys), connecte-toi (ou crée un compte), clique sur **"Create Key"**, copie la clé (elle commence par `sk-ant-...`).
4. Colle-la dans le champ "Clé API Anthropic" de la page Réglages de l'outil, clique **Enregistrer**.
5. Optionnel : une clé Google PageSpeed peut être ajoutée de la même façon pour lever la limite de quota de l'audit de landing page — sans elle, ça fonctionne quand même. Le fournir n'est pas indispensable.

Cette clé reste stockée uniquement dans ton navigateur (jamais dans le code, jamais chez Vercel) — si tu changes d'ordinateur ou de navigateur, il faudra la resaisir.

**Important sur les coûts** : chaque génération de reco consomme du crédit sur ton compte Anthropic (facturé à l'usage, quelques centimes par génération). Pense à ajouter un moyen de paiement sur [console.anthropic.com](https://console.anthropic.com/settings/billing) sinon les appels échoueront.

### 3. Utiliser l'outil au quotidien

1. Ouvre l'URL de l'outil.
2. Colle le transcript d'un appel ou le texte d'un email de prospect dans le grand champ texte.
3. Clique sur **"Générer la reco"** (jusqu'à 1 minute d'attente).
4. La proposition commerciale s'affiche en dessous. Clique sur **"Exporter en PDF"** pour l'imprimer/enregistrer en PDF depuis la fenêtre d'impression du navigateur.

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
- **Clé API saisie dans l'appli** (page Réglages, stockée dans le navigateur) plutôt que configurée en variable d'environnement chez l'hébergeur : pas besoin de toucher au tableau de bord Vercel pour changer de clé.

## Développement local (pour les prochaines évolutions techniques)

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000, cliquer sur Réglages pour renseigner la clé API (comme en production), coller un transcript ou un email, cliquer sur "Générer la reco".

Alternative pour un déploiement où la clé doit être fixée côté serveur plutôt que saisie par chaque utilisateur : copier `.env.example` en `.env.local` et renseigner `ANTHROPIC_API_KEY` — la page Réglages reste prioritaire si une clé y est saisie.

## Pistes d'amélioration (à faire évoluer avec Clotilde)

- Réintroduire un export Google Slides optionnel (en plus du HTML) pour les cas où un template éditable est nécessaire.
- Ajouter un mode "brouillon email" pour envoyer directement la reco au prospect.
- Ajouter une bibliothèque de recos générées (historique, avec sauvegarde en base).
- Reconnexion Gmail pour déclencher automatiquement depuis un label, comme dans le scénario Make d'origine.

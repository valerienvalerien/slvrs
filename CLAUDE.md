# CLAUDE.md — slvrs

## Contexte activité

BPO basé à Antananarivo (Madagascar) ciblant des clients **français**.
Direction expérimentée (ex-structure 1000 collaborateurs) qui repart de zéro
avec une équipe de **10 personnes**.

### Niches cibles (par priorité)
1. **Télésecrétariat médical** (priorité absolue)
2. Support applicatif N1 pour éditeurs SaaS français
3. Helpdesk IT N1 distant

### Séquence de développement (toujours dans cet ordre)
**Prospection → Équipe → Infrastructure**

### Avantage compétitif
- Fuseau horaire compatible avec la France
- Français langue maternelle
- Coût ~40 % inférieur à un prestataire hexagonal

## Marque

**Nom commercial retenu : Salverys** (temporaire mais à utiliser partout pour
l'instant). Remplace les anciens noms **Nesvalo** et **Vinlo**, qui ne doivent
plus apparaître dans aucun livrable, séquence, CRM ou support client.

> Note technique : dans le CRM (`CRM_Salverys.html`), les clés de stockage
> `localStorage` restent préfixées `vinlo_` pour ne pas effacer les données
> déjà saisies. C'est interne et invisible côté client.

## Outils retenus
- **Cold mailing : Emelia** (outil de prospection email retenu)

## Règle d'arbitrage : SaaS-first avant tout code maison

Avant de proposer d'implémenter une fonctionnalité dans le CRM ou dans un
projet, se poser systématiquement :

- **Est-ce qu'un SaaS résout déjà ça mieux et plus vite ?**
- **Le coût de maintenance du code maison vaut-il l'économie sur l'abonnement ?**

Si un outil externe est clairement supérieur : **le dire en premier**, avant de
proposer une implémentation technique. Cela vaut en priorité pour :
- l'**analytics**,
- les **solutions de paiement**,
- la **facturation**,
- le **tracking email**.

Le réflexe par défaut est d'acheter, pas de construire. Le code maison se
justifie seulement quand aucun SaaS ne couvre le besoin, ou quand le coût/la
dépendance du SaaS dépasse clairement le coût de maintenance.

## Style de travail attendu
- Toujours répondre en **français**.
- Être **direct et opérationnel**.
- Partir des niches, canaux et stratégies déjà définis ci-dessus.

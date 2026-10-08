# Accessibilité de ChatGPT Web — dossier de signalement

[Read in English](README.md).

Ce dépôt présente les obstacles rencontrés avec JAWS sous Windows dans chatgpt.com, leurs conséquences, les résultats attendus et les preuves utiles à leur examen par les équipes techniques. Il réunit des retours d’usage, des inspections du code et de la structure accessible, des reproductions et un démonstrateur local.

Les observations concernent une interface réglée en français. Les mécanismes de navigation et de rendu sont distingués des défauts de traduction. Le changement général d’interface est rapporté le 25 septembre 2026 ; les preuves et confirmations datées des 7–8 octobre complètent les investigations antérieures.

L’[original français](Original%20en%20français/INTRODUCTION.md) fait foi ; le dossier [English translation/](English%20translation/INTRODUCTION.md) en fournit une traduction complète. Les annonces françaises, chaînes natives et pièces de preuve restent dans leur langue d’origine ; les traductions explicatives ne sont pas des annonces entendues avec JAWS anglais. Les deux dossiers utilisent les mêmes 22 identifiants et les ressources communes du démonstrateur.

## Ordre de lecture

1. Lire l’[introduction](Original%20en%20français/INTRODUCTION.md) pour le contexte, les conséquences d’usage et la portée du signalement.
2. Parcourir les quatre Points ci-dessous dans l’ordre indiqué. Chaque sous-point commence par **Problème**, **Résultat attendu** et un lien direct vers sa reproduction, puis expose les observations, le mécanisme et l’illustration locale.
3. Pour reproduire un cas, suivre son fichier **reproductions/PROCEDURES.md**. Pour examiner ses preuves, ouvrir les pièces liées dans le rapport ; **reproductions/EXECUTION.md** explique les tests et pages synthétiques.
4. Consulter l’[environnement](Original%20en%20français/ENVIRONNEMENT.md), la [méthode](Original%20en%20français/METHODE.md) et la [portée des preuves et réceptions](Original%20en%20français/PORTEE_ET_RECEPTIONS.md) pour interpréter les conditions, l’attribution et les résultats.

## Index des 22 sous-points

L’ordre regroupe les problèmes par parcours et priorité. Les demandes produit ou d’organisation sont identifiées dans leur sous-point.

### Point 1 — Sélecteur et composition

[Rapport](Original%20en%20fran%C3%A7ais/Point%201%20-%20S%C3%A9lecteur%20et%20composition/RAPPORT.md) · [Procédures du site](Original%20en%20fran%C3%A7ais/Point%201%20-%20S%C3%A9lecteur%20et%20composition/reproductions/PROCEDURES.md) · [Tests et fixtures](Original%20en%20fran%C3%A7ais/Point%201%20-%20S%C3%A9lecteur%20et%20composition/reproductions/EXECUTION.md)

| Cas | Problème ou demande |
|---|---|
| [1A](Original%20en%20fran%C3%A7ais/Point%201%20-%20S%C3%A9lecteur%20et%20composition/RAPPORT.md#1a--le-sélecteur-fermé-ne-permet-pas-didentifier-rapidement-le-choix) | Choix masqué par le nom générique du sélecteur ; niveaux et état du mode rapide incohérents. |
| [1B](Original%20en%20fran%C3%A7ais/Point%201%20-%20S%C3%A9lecteur%20et%20composition/RAPPORT.md#1b--le-menu--ajouter-des-fichiers-et-plus-encore--ferme-sans-activer-loption-voulue) | Menu d’ajout mal rejoint et option parcourue non activée. |
| [1C](Original%20en%20fran%C3%A7ais/Point%201%20-%20S%C3%A9lecteur%20et%20composition/RAPPORT.md#1c--flèche-haut-ajoute-involontairement-un-ancien-prompt-dans-un-champ-vide) | Rappel involontaire d’un prompt par Flèche haut, selon l’usage préalable de la discussion ou du navigateur. |

### Point 2 — Lecture et messages

[Rapport](Original%20en%20fran%C3%A7ais/Point%202%20-%20Lecture%20et%20messages/RAPPORT.md) · [Procédures du site](Original%20en%20fran%C3%A7ais/Point%202%20-%20Lecture%20et%20messages/reproductions/PROCEDURES.md) · [Tests et fixtures](Original%20en%20fran%C3%A7ais/Point%202%20-%20Lecture%20et%20messages/reproductions/EXECUTION.md)

| Cas | Problème ou demande |
|---|---|
| [2A](Original%20en%20fran%C3%A7ais/Point%202%20-%20Lecture%20et%20messages/RAPPORT.md#2a--parcourir-une-longue-conversation-sans-perdre-les-messages) | Ruptures de lecture des longues conversations et tours hors écran non montés. |
| [2B](Original%20en%20fran%C3%A7ais/Point%202%20-%20Lecture%20et%20messages/RAPPORT.md#2b--repérer-la-réponse-et-parcourir-le-raisonnement) | Repère assistant tardif, activité avant les étapes accomplies et légende répétée ; GPT‑5.6 et GPT‑6 Élevé distingués. |
| [2C](Original%20en%20fran%C3%A7ais/Point%202%20-%20Lecture%20et%20messages/RAPPORT.md#2c--sélection-étendue-et-informations-qui-laccompagnent) | Sélection interrompue par les sauts ; inclusion des métadonnées dans la copie comme demande produit distincte. |
| [2D](Original%20en%20fran%C3%A7ais/Point%202%20-%20Lecture%20et%20messages/RAPPORT.md#2d--comprendre-la-réussite-de-copier-et-partager-sans-perdre-sa-position) | Copier/Partager sans confirmation audible fiable ni maintien de position ; disponibilité inégalement exposée. |
| [2E](Original%20en%20fran%C3%A7ais/Point%202%20-%20Lecture%20et%20messages/RAPPORT.md#2e--poignées-inactives-des-champs-de-rédaction) | Poignées invisibles et inactives des champs de rédaction exposées comme boutons. |
| [2F](Original%20en%20fran%C3%A7ais/Point%202%20-%20Lecture%20et%20messages/RAPPORT.md#2f--repère--dernière-réponse--redondant) | Titre « Dernière réponse » redondant : demande de simplification. |
| [2G](Original%20en%20fran%C3%A7ais/Point%202%20-%20Lecture%20et%20messages/RAPPORT.md#2g--références-web-et-contenu-des-aperçus-de-sources) | Références Web annoncées comme boutons de menu ; noms de cartes abrégés et favicon parasite. |

### Point 3 — Navigation et focus

[Rapport](Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/RAPPORT.md) · [Procédures du site](Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/reproductions/PROCEDURES.md) · [Tests et fixtures](Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/reproductions/EXECUTION.md)

| Cas | Problème ou demande |
|---|---|
| [3A](Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/RAPPORT.md#3a--commandes-de-projets-accessibles-par-les-flèches) | Actions et Nouveau chat des projets absents du parcours aux flèches. |
| [3B](Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/RAPPORT.md#3b--réouverture-de-la-barre-et-commande-stable) | Commande de réouverture de la barre masquée inaccessible. |
| [3C](Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/RAPPORT.md#3c--afficher-plus-des-chats-dun-projet) | Afficher plus reprend au début des chats du projet. |
| [3D](Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/RAPPORT.md#3d--retour-après-échap-dans-les-menus-et-panneaux) | Reprise en haut de page après fermeture de menus/panneaux. |
| [3E](Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/RAPPORT.md#3e--explorer--entrée-fermeture-et-propriété-popup) | Entrée/sortie d’Explorer incohérentes avec le parcours JAWS. |
| [3F](Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/RAPPORT.md#3f--annuler-un-partage-ou-une-édition--revenir-au-même-message) | Annulation de partage ou d’édition sans retour au même message. |
| [3G](Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/RAPPORT.md#3g--évaluer-la-réponse--rôle-de-menu-et-reprise-après-échap) | Évaluer la réponse sans fonction de menu sur son bouton et reprise de lecture déplacée. |

### Point 4 — Sémantique et localisation

[Rapport](Original%20en%20fran%C3%A7ais/Point%204%20-%20S%C3%A9mantique%20et%20localisation/RAPPORT.md) · [Procédures du site](Original%20en%20fran%C3%A7ais/Point%204%20-%20S%C3%A9mantique%20et%20localisation/reproductions/PROCEDURES.md) · [Tests et fixtures](Original%20en%20fran%C3%A7ais/Point%204%20-%20S%C3%A9mantique%20et%20localisation/reproductions/EXECUTION.md)

| Cas | Problème ou demande |
|---|---|
| [4A](Original%20en%20fran%C3%A7ais/Point%204%20-%20S%C3%A9mantique%20et%20localisation/RAPPORT.md#4a---sortable--et--draggable--à-la-place-de-rôles-informatifs) | Descriptions sortable/draggable qui masquent les rôles utiles. |
| [4B](Original%20en%20fran%C3%A7ais/Point%204%20-%20S%C3%A9mantique%20et%20localisation/RAPPORT.md#4b---réduit--sur-des-destinations-de-navigation) | État réduit sur les destinations principales et épinglées ; comparaison avec les boutons des paramètres. |
| [4C](Original%20en%20fran%C3%A7ais/Point%204%20-%20S%C3%A9mantique%20et%20localisation/RAPPORT.md#4c--groupes-redondants-autour-des-chats) | Frontières de groupe répétitives autour des chats. |
| [4D](Original%20en%20fran%C3%A7ais/Point%204%20-%20S%C3%A9mantique%20et%20localisation/RAPPORT.md#4d--blocage-au-premier-passage-dans-les-projets-et-les-listes) | Blocage des flèches au premier focus de certaines listes ou au dépliage d’un projet. |
| [4E](Original%20en%20fran%C3%A7ais/Point%204%20-%20S%C3%A9mantique%20et%20localisation/RAPPORT.md#4e---pin-project--et--unpin-project--en-interface-française) | Épinglage des projets non traduit dans la galerie. |

## Preuves et démonstrateur

Les retours JAWS décrivent les annonces et la position de lecture réellement rapportées. Le DOM, l’arbre d’accessibilité et le code établissent les mécanismes mesurés ; les tests synthétiques isolent ceux du contournement. Les rapports distinguent comportement natif, adaptation et attribution d’interopérabilité encore ouverte. Les anciennes pièces conservent leur date et leur version de capture.

Le [démonstrateur 4.1.2](Original%20en%20français/DEMONSTRATEUR.md) illustre des adaptations ciblées sur les commandes natives. Ses [sources](extension/manifest.json), son [archive](distribution/Accessibilite-pour-ChatGPT-web-4.1.2.zip) et ses [empreintes](distribution/empreintes-sources-4.1.2.json) sont fournis. Il sert à comparer les mécanismes ; l’accessibilité durable doit être assurée dans le produit.

## Organisation

- **Original en français/** : original faisant foi, contexte commun et quatre rapports, chacun avec preuves, procédures et tests ciblés.
- **English translation/** : traduction complète du contexte et des rapports, avec les mêmes identifiants ; preuves françaises et reproductions exécutables conservées.
- **extension/** : sources du démonstrateur à charger dans Chrome ou Edge.
- **distribution/** : archive commune du démonstrateur et empreintes SHA‑256.
- **licences/** : textes officiels des licences, communs aux deux langues.

Les conditions de réutilisation figurent dans la [notice de licence française](LICENCE%20%28fr%29.md), liée à sa [traduction anglaise](LICENSE%20%28eng%29.md).

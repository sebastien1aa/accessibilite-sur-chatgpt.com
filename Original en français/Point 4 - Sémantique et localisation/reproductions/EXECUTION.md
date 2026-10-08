# Tests et fixtures — Point 4

Ces pages utilisent des noms et routes synthétiques. Elles ne contactent pas ChatGPT et ne contiennent ni compte ni conversation réelle. Les comparaisons A/B et C/D ont reçu les retours physiques du 4 octobre décrits ci-dessous. Les contrôles DOM de la troisième page vérifient séparément les invariants de l’adaptation.

## Couverture des sous-points

| Cas | Reproduction et preuves | Mécanisme du démonstrateur |
|---|---|---|
| 4A | Procédure sections/chats après Tab ou Actions ; page synthétique des descriptions | [Retrait ciblé des descriptions](../../../extension/sidebar-sortable-accessibility.js) ; contrôles Node/Chromium et réceptions historiques |
| 4B | Procédure des destinations ; relevés natifs DOM/AX et comparaison après adaptation | [Gardes de navigation](../../../extension/ui-accessibility.js), conservation des véritables contrôles de dépliage |
| 4C | Procédure chats ordinaires, épinglés et projets ; structure normalisée et contrôles DOM/Chromium historiques | [Retrait des groupes reconnus](../../../extension/ui-accessibility.js), liens/actions/listes conservés |
| 4D | Procédure premier passage ; comparaisons physiques A/B et C/D | [Listes simples et imbriquées](../../../extension/sidebar-list-accessibility.js), focus natifs et pagination conservés |
| 4E | Procédure galerie/menu latéral ; compteurs avant/après et noms exacts dans le code | [Localisation](../../../extension/project-accessibility.js), callbacks conservés |

Les [preuves datées](../preuves/CONSTATS_ET_PROVENANCE.md) précisent les résultats de chaque cas. Les pages dédiées ci-dessous isolent 4A et 4D ; 4B, 4C et 4E s’examinent avec leurs parcours sur le site et les sources communes. Les validations historiques des mécanismes ne deviennent pas des mesures de parole JAWS.

## Comparer le premier passage dans des listes — 4D

Ouvrir [list-first-focus.html](list-first-focus.html) dans un nouveau document. Depuis le curseur PC virtuel, atteindre le premier lien avec Tab puis essayer Flèche bas. Comparer A puis B, sans cliquer le lien. A possède un parent `role=list` sans tabindex ; B ajoute `tabindex=-1`. Noter le bruit éventuel, la disponibilité du parcours aux flèches et la nécessité d’un retour manuel au curseur PC virtuel. Répéter dans le même document pour distinguer premier passage et répétition ; recharger pour un autre essai indépendant.

Retour historique du 4 octobre : A normal, B reproduit le blocage initial, répétition normale. La trace ne lit ni ne pilote le mode JAWS. Les résultats attendus ne sont pas une garantie pour un autre navigateur ou réglage.

Ouvrir ensuite [list-button-first-focus.html](list-button-first-focus.html) dans un nouveau document. Atteindre le bouton C avec les touches habituelles puis l’activer avec Espace. Comparer D sur son premier passage. Chaque cas utilise le même bouton natif et le même relais de ligne ; seul D a la liste parente `tabindex=-1`. Noter l’ouverture de la liste et le maintien du parcours aux flèches, avec le raccourci bouton de la configuration utilisée.

Retour historique : C normal, D bloque au premier passage, puis répétition normale. Le comportement Alt+Tab de D diffère explicitement de celui du site et doit rester signalé.

## Contrôler les descriptions de rôle — 4A

[sidebar-sortable-accessibility.html](sidebar-sortable-accessibility.html) charge le module partagé via `../../../extension/sidebar-sortable-accessibility.js`. Conserver cette arborescence lors de l’ouverture ou servir le dossier public sur une origine locale. Dans l’installation de production, le manifeste limite son chargement à ChatGPT ; cette page charge explicitement le fichier commun sur des éléments synthétiques. La page n’est pas un installateur.

Le bouton « Exécuter les contrôles DOM » vérifie le retrait ciblé de sortable/draggable, la conservation des rôles, instructions et callbacks, ainsi que la restauration des valeurs natives au changement de langue ou à l’arrêt. Les données de déplacement sont synthétiques ; les routes n’ont pas à être activées. Le résultat est écrit en texte dans la page. Les compteurs historiques de validation figurent dans les preuves ; aucun nouveau résultat n’est attribué à la copie publique.

Cette reproduction vérifie des invariants DOM ; elle ne certifie pas les annonces de JAWS. Pour comparer une parole native à la correction, conserver des pages nouvellement chargées et distinguer version/configuration de JAWS, navigateur, rôle DOM et nom calculé.

Les parcours sur le site pour les cinq sous-points sont réunis dans [PROCEDURES.md](PROCEDURES.md).

Les [observations humaines natives du 7 octobre](../preuves/retour-humain-natif-2026-10-07.json) complètent les preuves historiques sans ajouter de nouvelle exécution des fixtures. Elles distinguent notamment les remplacements de rôle après Tab et après Actions du chat, et la sortie du mode formulaire par Échap ou retour manuel au curseur PC. Ces corrélations ne mesurent pas la cause interne JAWS.

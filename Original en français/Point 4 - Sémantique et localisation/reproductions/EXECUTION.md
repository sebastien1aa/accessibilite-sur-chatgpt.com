# Tests et fixtures — Point 4

Ces pages utilisent des noms et routes synthétiques. Elles ne contactent pas ChatGPT et ne contiennent ni compte ni conversation réelle. Elles sont reprises des exemples historiques ; la copie publique n’a pas encore fait l’objet d’un nouveau test JAWS.

## Comparer le premier passage dans des listes — 4D

Ouvrir [list-first-focus.html](list-first-focus.html) dans un nouveau document. Depuis le curseur PC virtuel, atteindre le premier lien avec Tab puis essayer Flèche bas. Comparer A puis B, sans cliquer le lien. A possède un parent `role=list` sans tabindex ; B ajoute `tabindex=-1`. Noter le bruit éventuel, la disponibilité du parcours aux flèches et la nécessité d’un retour manuel au curseur PC virtuel. Répéter dans le même document pour distinguer premier passage et répétition ; recharger pour un autre essai indépendant.

Retour historique du 4 octobre : A normal, B reproduit le blocage initial, répétition normale. La trace ne lit ni ne pilote le mode JAWS. Les résultats attendus ne sont pas une garantie pour un autre navigateur ou réglage.

Ouvrir ensuite [list-button-first-focus.html](list-button-first-focus.html) dans un nouveau document. Atteindre le bouton C avec les touches habituelles puis l’activer avec Espace. Comparer D sur son premier passage. Chaque cas utilise le même bouton natif et le même relais de ligne ; seul D a la liste parente `tabindex=-1`. Noter l’ouverture de la liste et le maintien du parcours aux flèches. Le raccourci utilisateur historique pour bouton suivant est U, et non B. Ne pas conclure au mode formulaire uniquement sur un son.

Retour historique : C normal, D bloque au premier passage, puis répétition normale. Le comportement Alt+Tab de D diffère explicitement de celui du site et doit rester signalé.

Les journaux de ces pages sont limités à 100 événements et à des identifiants synthétiques. Fermer l’onglet arrête les écouteurs. Pour un arrêt explicite depuis une console technique :

```js
window[Symbol.for('chatgpt-a11y-list-first-focus.fixture')]?.stop();
window[Symbol.for('chatgpt-a11y-list-button-first-focus.fixture')]?.stop();
```

## Contrôler les descriptions de rôle — 4A

[sidebar-sortable-accessibility.html](sidebar-sortable-accessibility.html) charge le module partagé via `../../../extension/sidebar-sortable-accessibility.js`. Conserver cette arborescence lors de l’ouverture ou servir le dossier public sur une origine locale. Dans l’installation de production, le manifeste limite son chargement à ChatGPT ; cette page charge explicitement le fichier commun sur des éléments synthétiques. La page n’est pas un installateur.

Le bouton « Exécuter les contrôles DOM » vérifie le retrait ciblé de sortable/draggable, la conservation des rôles, instructions et callbacks, ainsi que la restauration des valeurs natives au changement de langue ou à l’arrêt. Les données de déplacement sont synthétiques ; les routes n’ont pas à être activées. Le résultat est écrit en texte dans la page. Les compteurs historiques de validation figurent dans les preuves ; aucun nouveau résultat n’est attribué à la copie publique.

Cette reproduction vérifie des invariants DOM ; elle ne certifie pas les annonces de JAWS. Pour comparer une parole native à la correction, conserver des documents frais et distinguer version/configuration de JAWS, navigateur, rôle DOM et nom calculé.

Les parcours sur le site pour les cinq sous-points sont réunis dans [PROCEDURES.md](PROCEDURES.md).

# Tests et fixtures — Point 3

Les [procédures sur le site](PROCEDURES.md) sont séparées des contrôles synthétiques ci-dessous.

## Couverture des sous-points

| Cas | Parcours ou reproduction | Mécanisme du démonstrateur |
|---|---|---|
| 3A | Procédure projets, comparaisons physiques A/B et C/D | [Commandes de projets](../../../extension/project-accessibility.js), [listes](../../../extension/sidebar-list-accessibility.js) |
| 3B | Procédure fermeture/réouverture de la barre | [Commande persistante](../../../extension/ui-accessibility.js) ; constat natif et réception décrits dans les preuves |
| 3C | Procédure Afficher plus sur une liste existante | [Pagination](../../../extension/sidebar-list-accessibility.js) ; 34 contrôles Chromium historiques de pagination/listes |
| 3D | Procédures par famille de menu, page de retour des menus | [Association et retour](../../../extension/sidebar-menu-focus.js) |
| 3E | Procédure Explorer, page de propriété popup | [Entrée Explorer](../../../extension/explorer-accessibility.js) et [retour](../../../extension/sidebar-menu-focus.js) |
| 3F | Procédure partage/édition, page d’actions de messages | [Retour au même message](../../../extension/message-action-focus.js) |
| 3G | Procédure Évaluer, page du menu Évaluer | [Sémantique](../../../extension/evaluation-menu-accessibility.js) et [retour](../../../extension/sidebar-menu-focus.js) |

Chaque cas dispose d’un parcours sur le site et de preuves datées. Les pages synthétiques isolent les mécanismes indiqués ; elles ne reproduisent pas toute l’interface de ChatGPT.

## Pages synthétiques fournies

| Page | Fonction et dépendances | Valeur de preuve |
|---|---|---|
| [Liens A/B](list-first-focus.html) | Autonome, aucune extension chargée. Même lien sous liste sans tabindex puis tabindex=-1. | Comparaison physique reçue le 4 octobre ; parent focalisable suffisant dans cette structure. |
| [Boutons C/D](list-button-first-focus.html) | Autonome, mêmes boutons réduit/étendu et relais ; seule différence parent focalisable. | Comparaison physique reçue le 4 octobre ; retour Alt+Tab divergent du site conservé. |
| [Retours des menus](sidebar-menu-focus.html) | Charge [sidebar-menu-focus.js](../../../extension/sidebar-menu-focus.js). Bouton Exécuter les contrôles de focus. | Vérifie association, retour/annulation DOM ; ne prouve pas le curseur JAWS ni tout le code du site. |
| [Propriété popup Explorer](explorer-popup-hint-release.html) | Charge [sidebar-menu-focus.js](../../../extension/sidebar-menu-focus.js) et [explorer-accessibility.js](../../../extension/explorer-accessibility.js). Bouton Vérifier la propriété. | Contrôle la distribution intégrée et la restauration de propriété ; ne mesure aucun mode JAWS. |
| [Actions de messages](message-action-focus.html) | Charge [message-action-focus.js](../../../extension/message-action-focus.js). Bouton Exécuter les contrôles. | Contrôle retours, tâches tardives et annulations. Le cas historique Réagir est un contrôle d’exclusion ; il ne reproduit pas le contrôle courant Évaluer la réponse. |
| [Menu Évaluer](evaluation-menu.html) | Charge [evaluation-menu-accessibility.js](../../../extension/evaluation-menu-accessibility.js) et [sidebar-menu-focus.js](../../../extension/sidebar-menu-focus.js). Bouton Exécuter les contrôles. | Onze contrôles Chromium réussis en validation 3.7.0 ; propriétés de menu, relation, Échap, retour, ambiguïtés et restauration. |

Les pages sont conservées telles que les fixtures de travail, avec **seuls les chemins vers l’extension ajustés** pour ce dossier. Les résultats automatisés affichés à l’écran sont des contrôles DOM synthétiques. Ils ne sont pas des tickets supplémentaires ni une nouvelle réception.

Le [retour humain natif du 7 octobre](../preuves/retour-humain-natif-2026-10-07.json) actualise les symptômes sur le site, dont Évaluer la réponse. Le [relevé de ce menu](../preuves/3G-evaluation-menu-natif-2026-10-07.json) apporte sa structure et son retour de focus DOM natifs. Les [procédures](PROCEDURES.md) distinguent les familles de menus et leurs nombres d’Échap rapportés.

L’[inspection passive adaptée](../preuves/3G-evaluation-menu-adapte-2026-10-07.json) confirme les propriétés de menu sur neuf boutons existants et `hasPopup=menu` sur le nœud accessible ciblé. Elle complète les contrôles synthétiques par une vérification de structure sur le site, sans mesure de parole JAWS ni nouvelle activation du menu.

### Ouvrir les fixtures

Les deux pages A/B et C/D peuvent être ouvertes directement. Les quatre pages qui chargent ou relisent un module avec fetch doivent être servies en HTTP avec la **racine de ce dépôt autonome** comme racine du serveur, afin que ../../../extension désigne bien l’extension commune. Un serveur de fichiers déjà disponible convient ; par exemple, depuis la racine, si Python est installé :

```text
python -m http.server 8765 --bind 127.0.0.1
```

Ouvrir ensuite, par exemple :

```text
http://127.0.0.1:8765/Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/reproductions/sidebar-menu-focus.html
```

Changer seulement le dernier nom pour les autres pages. Arrêter le serveur par Ctrl+C après utilisation. Ces instructions ne constituent pas un nouveau résultat de test.

Pour une comparaison physique A/B : sur document frais, Tab vers le lien A puis Flèche bas ; comparer le premier passage vers B avec Tab puis Flèche bas, sans activer les liens. Pour C/D : utiliser les flèches/raccourcis habituels vers C puis D, activer avec Espace et relever le premier parcours. Le raccourci bouton dépend de la configuration du lecteur d’écran.

## Menu Évaluer la réponse

[evaluation-menu.html](evaluation-menu.html) reproduit le conteneur SPAN et son bouton natif, puis charge le module de sémantique et le contrôleur de retour. Le bouton Exécuter les contrôles vérifie onze invariants DOM : état/association, Échap natif, retour après BODY, retrait de relations périmées, ambiguïtés, conservation des callbacks et restauration. Aucune évaluation de ChatGPT ni aucun message n’est envoyé par cette page synthétique.

# Tests et fixtures — Point 3

Les [procédures sur le site](PROCEDURES.md) sont séparées des contrôles synthétiques ci-dessous.

## Pages synthétiques fournies

| Page | Fonction et dépendances | Valeur de preuve |
|---|---|---|
| [Liens A/B](list-first-focus.html) | Autonome, aucune extension chargée. Même lien sous liste sans tabindex puis tabindex=-1. | Comparaison physique reçue le 4 octobre ; parent focalisable suffisant dans cette structure. |
| [Boutons C/D](list-button-first-focus.html) | Autonome, mêmes boutons réduit/étendu et relais ; seule différence parent focalisable. | Comparaison physique reçue le 4 octobre ; retour Alt+Tab divergent du site conservé. |
| [Retours des menus](sidebar-menu-focus.html) | Charge [sidebar-menu-focus.js](../../../extension/sidebar-menu-focus.js). Bouton Exécuter les contrôles de focus. | Vérifie association, retour/annulation DOM ; ne prouve pas le curseur JAWS ni tout le code du site. |
| [Propriété popup Explorer](explorer-popup-hint-release.html) | Charge [sidebar-menu-focus.js](../../../extension/sidebar-menu-focus.js) et [explorer-accessibility.js](../../../extension/explorer-accessibility.js). Bouton Vérifier la propriété. | Contrôle la distribution intégrée et la restauration de propriété ; ne mesure aucun mode JAWS. |
| [Actions de messages](message-action-focus.html) | Charge [message-action-focus.js](../../../extension/message-action-focus.js). Bouton Exécuter les contrôles. | Contrôle retours, tâches tardives et annulations. Réagir non traité est un contrôle d’exclusion, pas sa reproduction native. |

Les pages sont conservées telles que les fixtures de travail, avec **seuls les chemins vers l’extension ajustés** pour ce dossier. Les résultats automatisés affichés à l’écran sont des contrôles DOM synthétiques. Ils ne sont pas des tickets supplémentaires ni une nouvelle réception.

### Ouvrir les fixtures

Les deux pages A/B et C/D peuvent être ouvertes directement. Les trois pages qui chargent ou relisent un module avec fetch doivent être servies en HTTP avec la **racine de ce dépôt autonome** comme racine du serveur, afin que ../../../extension désigne bien l’extension commune. Un serveur de fichiers déjà disponible convient ; par exemple, depuis la racine, si Python est installé :

```text
python -m http.server 8765 --bind 127.0.0.1
```

Ouvrir ensuite, par exemple :

```text
http://127.0.0.1:8765/Original%20en%20fran%C3%A7ais/Point%203%20-%20Navigation%20et%20focus/reproductions/sidebar-menu-focus.html
```

Changer seulement le dernier nom pour les autres pages. Arrêter le serveur par Ctrl+C après utilisation. Ces instructions ne constituent pas un nouveau résultat de test.

Pour une nouvelle comparaison physique A/B : sur document frais, Tab vers le lien A puis Flèche bas ; comparer le premier passage vers B avec Tab puis Flèche bas, sans activer les liens. Pour C/D : utiliser les flèches/raccourcis habituels vers C puis D, activer avec Espace et relever le premier parcours. Le raccourci bouton dépend de la configuration du lecteur d’écran ; ne pas imposer une lettre supposée universelle. Les consignes historiques présentes dans les pages renvoient au chat de l’essai initial ; ces instructions locales rendent désormais leur usage autonome.

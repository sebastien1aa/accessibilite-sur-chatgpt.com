# Procédures de reproduction — Point 1

Ces parcours concernent le site natif, extension désactivée. L’[environnement observé](../../ENVIRONNEMENT.md) et les [preuves](../preuves/reception-native-2026-10-07.json) accompagnent le [rapport](../RAPPORT.md). Pour comparer le démonstrateur, reprendre le même parcours après son chargement et l’ouverture d’une nouvelle page.

## 1A — Sélecteur et informations de raisonnement

**Conditions :** interface française ; modes Chat puis Work ; un modèle et un niveau sélectionnés.

1. Parcourir les commandes du composeur aux flèches avec le curseur PC virtuel et atteindre le sélecteur fermé.
2. Comparer son nom accessible avec la légende affichée. Ouvrir avec Espace ou Entrée.
3. Dans Chat, atteindre Puissance avec les flèches haut/bas, puis parcourir les niveaux avec gauche/droite. Comparer les annonces, la langue des niveaux et les légendes.
4. Dans Work, comparer de même les niveaux. Examiner séparément le libellé et l’état coché de la commande de mode rapide, avant et après sa bascule.
5. Sélectionner séparément GPT‑5.6 en mode Chat : parcourir les trois items. Comparer la répétition « Rétablir la sélection par défaut, 2 sur 3. Rétablir la sélection par défaut » avec une annonce unique de commande. Reprendre à un autre niveau de raisonnement.
6. Fermer avec Échap et relire le sélecteur.

**Constat complémentaire GPT‑5.6 :** la commande de rétablissement ajoute un deuxième item, annoncé deux fois dans le retour JAWS du 8 octobre ; le démonstrateur fourni ne traite pas ce doublon. La [preuve](../preuves/1A-gpt56-retablissement-2026-10-08.json) distingue l’inspection et le retour vocal.

**Constat :** le nom fermé reste « Sélectionner le modèle ChatGPT » malgré une légende informative. Le retour JAWS décrit des niveaux anglais en Chat et une ambiguïté « Activer le mode standard coché » lorsque le mode rapide est actif. Les écarts entre légendes et statuts français sont détaillés dans le rapport.

**Résultat attendu :** choix affiché identifiable depuis le bouton fermé ; niveaux localisés et cohérents ; état du mode rapide distinct de l’action proposée.

## 1B — Menu d’ajout

**Conditions :** composeur vide, interface française.

1. Atteindre « Ajouter des fichiers et plus encore » aux flèches et ouvrir avec Espace.
2. Parcourir les options et comparer la position de lecture avec l’éditeur : les options sont rencontrées après celui-ci et deux fins de région principale dans le retour JAWS.
3. Activer une option avec Espace ou Entrée et vérifier si la fonction choisie est effectivement sélectionnée.
4. Rouvrir le menu, comparer le focus d’entrée avec celui de la première ouverture, puis fermer avec Échap.

**Constat :** le focus initial va dans l’éditeur, les ouvertures suivantes laissent la lecture sur le déclencheur ; l’activation d’une option ferme le menu sans l’action voulue et ramène la lecture en haut de page.

**Résultat attendu :** entrée dans un popup utilisable au clavier, activation de l’option parcourue et retour au contexte à sa fermeture.

## 1C — Rappel involontaire de prompts

**Conditions :** distinguer une discussion déjà utilisée d’un nouveau chat. Pour ce dernier, distinguer un navigateur ayant déjà envoyé un prompt créant une discussion d’un navigateur n’ayant jamais effectué cet envoi.

1. Ouvrir une discussion déjà utilisée, vider le composeur, puis placer le focus dans l’éditeur.
2. Appuyer sur Flèche haut sans modificateur, dans le mode où la touche est transmise à l’éditeur.
3. Observer si un ancien prompt remplit le champ.
4. Comparer avec un nouveau chat dans un navigateur ayant déjà servi à envoyer un prompt créant une discussion.
5. Comparer enfin avec un nouveau chat dans un navigateur n’ayant jamais servi à cet envoi.

**Constat :** le remplissage involontaire concerne les discussions déjà utilisées et le nouveau chat après un envoi créant une discussion dans ce navigateur. Le test Opera confirme son absence dans le nouveau chat tant que ce navigateur n’a jamais servi à cet envoi.

**Résultat attendu :** navigation sans modification imprévue du brouillon et accès volontaire, accessible, à l’historique des prompts.

Les [tests et fixtures](EXECUTION.md) isolent les mécanismes du démonstrateur.

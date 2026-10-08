# Procédures de reproduction — Point 3

Ces parcours concernent le site natif, extension désactivée. Le curseur PC virtuel est utilisé pour les flèches ; le mode formulaire est distingué lorsqu’il change l’effet d’Échap. L’[environnement](../../ENVIRONNEMENT.md) et les [observations datées](../preuves/OBSERVATIONS_ET_RECEPTIONS.md) accompagnent le [rapport](../RAPPORT.md). Pour une comparaison avec le démonstrateur ou du premier passage, charger une nouvelle page.

## 3A — Commandes des projets

1. Sur l’accueil avec des projets, parcourir une ligne de projet aux flèches et chercher Actions puis Nouveau chat.
2. Comparer l’accès avec Tab.
3. Ouvrir Actions avec Espace, parcourir le menu puis fermer avec Échap.

**Constat :** Actions et Nouveau chat sont atteints par Tab, mais absents du parcours aux flèches.

**Résultat attendu :** accès aux deux commandes dans le parcours de lecture habituel et activation du menu depuis ce parcours.

Le blocage du premier focus est reproduit séparément en [4D](../../Point%204%20-%20Sémantique%20et%20localisation/reproductions/PROCEDURES.md#4d--premier-passage-dans-une-liste).

## 3B — Réouverture de la barre latérale

1. Fermer la barre avec sa commande.
2. Chercher aux flèches puis avec Tab la commande pour la réouvrir.
3. Vérifier son activation et la continuité du point de navigation. Comparer avec le raccourci natif Ctrl+Maj+S.

**Constat :** la commande de réouverture n’est atteinte par aucun des deux parcours dans le retour JAWS.

**Résultat attendu :** barre réouvrable au clavier et point de navigation conservé lors de sa bascule.

## 3C — Afficher plus des chats d’un projet

**Conditions :** projet dont le nombre de chats produit le bouton « Afficher plus ».

1. Parcourir la fin de la liste et activer « Afficher plus » avec Espace.
2. Après le chargement, utiliser Flèche bas.
3. Comparer le point de reprise avec le premier chat nouvellement chargé ; inspecter séparément le focus DOM pendant et après le retrait du bouton.

**Constat :** reprise au début des chats du projet, au lieu de poursuivre près du premier nouvel élément.

**Résultat attendu :** lecture dans la continuité de la liste au niveau des nouveaux chats.

## 3D — Fermeture des menus et panneaux

1. Atteindre un déclencheur : Profil, Actions d’un chat ou projet, Filtrer, Options de la barre latérale ou un menu de paramètres.
2. Ouvrir avec Espace puis fermer avec Échap. Si le premier appui change le mode de JAWS, distinguer cet effet de la fermeture du panneau.
3. Utiliser Flèche bas et comparer le point de reprise avec le déclencheur.
4. Répéter séparément pour les autres familles de menus.

**Constat :** reprise en haut de page. Dans le retour du 7 octobre, Profil et Actions des chats nécessitent deux Échap, Filtrer et Options de barre un seul. Le focus DOM et le point de lecture JAWS peuvent différer.

**Résultat attendu :** fermeture cohérente et reprise au bouton d’origine.

## 3E — Explorer

1. Après chargement d’une nouvelle page, ouvrir Explorer avec Espace et parcourir les destinations.
2. Fermer avec Échap et essayer Flèche bas.
3. Comparer la présence réelle du panneau, le focus DOM et la reprise de lecture.
4. Dans une autre page nouvellement chargée, comparer l’ouverture par Entrée puis par flèche : conteneur ou première destination focalisée.

**Constat :** entrée ordinaire sur le conteneur, différente de l’ouverture par flèche ; après fermeture, une flèche peut rouvrir réellement le panneau.

**Résultat attendu :** entrée et sortie cohérentes avec le parcours du lecteur d’écran, en conservant l’ouverture volontaire par flèche. `aria-haspopup="dialog"` est valide ; l’adaptation de cette propriété illustre une compatibilité, pas une correction d’ARIA invalide.

## 3F — Annuler un partage ou une édition

1. Ouvrir « Partager » sous une réponse, fermer le panneau avec Échap, puis utiliser Flèche bas.
2. Reprendre ce parcours sur « Partager le prompt » d’un message envoyé.
3. Ouvrir « Modifier le message », puis annuler l’édition. En mode formulaire, distinguer le premier Échap de retour au curseur PC virtuel de l’appui fermant effectivement l’édition.
4. Comparer avec une fermeture lorsque le curseur PC virtuel est déjà actif.

**Constat :** retour en haut de page après fermeture effective ; le bouton d’édition est recréé après fermeture du formulaire.

**Résultat attendu :** reprise au bouton du même message à la fermeture de la surface.

## 3G — Évaluer la réponse

1. Atteindre « Évaluer la réponse » sous une réponse et écouter sa fonction annoncée.
2. Ouvrir avec Espace puis fermer le menu avec Échap.
3. Utiliser Flèche bas et comparer le point de reprise avec le bouton.
4. Inspecter les propriétés `aria-haspopup`, `aria-expanded` et la relation au menu sur le bouton et son parent ; comparer le démonstrateur.

**Constat :** annonce « bouton » au lieu de bouton de menu ; un Échap ferme, puis la lecture reprend en haut de page. Les propriétés natives de menu se trouvent sur le SPAN parent.

**Résultat attendu :** fonction de menu portée par le contrôle activable et reprise au même message.

Les [tests et fixtures](EXECUTION.md) fournissent des comparaisons ciblées.

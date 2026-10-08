# Procédures de reproduction — Point 4

Les parcours concernent le site natif, extension désactivée, dans une interface française avec JAWS. Le [rapport](../RAPPORT.md), les [preuves](../preuves/CONSTATS_ET_PROVENANCE.md) et l’[environnement](../../ENVIRONNEMENT.md) précisent les faits observés. La comparaison du démonstrateur et du premier passage se fait sur une page nouvellement chargée.

## 4A — Descriptions de rôle

1. Parcourir Épinglés, Projets et Récents aux flèches, puis les chats ordinaires et ceux d’un projet déplié.
2. Depuis le passage précédant une ligne de chat, utiliser Tab pour la focaliser, revenir au curseur PC virtuel puis relire la ligne aux flèches.
3. Comparer séparément après ouverture et fermeture d’Actions du chat.
4. Inspecter les rôles, `aria-roledescription` et les instructions de déplacement ; comparer le démonstrateur.

**Constat :** « sortable » et « draggable » prennent la place des rôles utiles dans les annonces, au chargement ou après focus/Actions.

**Résultat attendu :** liens, boutons et sections reconnaissables, avec accès au tri et instructions de déplacement conservés.

## 4B — État des destinations

1. Parcourir les destinations Accueil, Espace, Planifié et Plugins ; comparer « réduit » et « page courante » avec leur action de navigation.
2. Parcourir de même les destinations épinglées depuis Explorer présentes dans le rail, telles que Sites ou Images.
3. Activer une destination et comparer l’état courant avec l’action effectuée.
4. Ouvrir Paramètres depuis Profil ; parcourir ses catégories et comparer le bouton de page courante, tel que Général, avec ceux du rail.
5. Comparer le démonstrateur : les véritables menus Explorer/Profil et les sections dépliables gardent leurs états.

**Constat :** les destinations de navigation sont annoncées réduites. Le bouton de catégorie courant des paramètres porte `aria-current="page"` sans `aria-expanded`.

**Résultat attendu :** navigation et destination courante clairement annoncées ; état réduit/étendu associé à un contrôle qui affiche ou masque effectivement un contenu accessible.

## 4C — Groupes des conversations

1. Parcourir un chat ordinaire, un chat épinglé et un chat de projet déplié.
2. Comparer les arrêts Début/Fin du groupe entourant chaque lien et ses actions.
3. Comparer le démonstrateur : lien, Actions et liste doivent rester disponibles.

**Constat :** deux lignes de groupe supplémentaires par chat, répétées pendant la recherche dans les listes.

**Résultat attendu :** parcours direct des chats et de leurs actions sans frontières de groupes redondantes.

## 4D — Premier passage dans une liste

1. Après chargement d’une nouvelle page, parcourir Récents aux flèches, puis utiliser Tab pour accéder à une ligne.
2. Comparer la disponibilité des flèches, le bruit de mode et la reprise après Échap ou retour manuel au curseur PC virtuel.
3. Dans une autre page nouvellement chargée, activer le dépliage d’un projet avec Espace et comparer le premier passage avec sa répétition.
4. Comparer les [fixtures A/B et C/D](EXECUTION.md), qui isolent `tabindex=-1` sur la liste parente.

**Constat :** bruit et blocage des flèches au premier accès par Tab ou dépliage, puis reprise après sortie du mode formulaire. La focalisabilité du parent reproduit le phénomène dans les deux structures synthétiques.

**Résultat attendu :** navigation aux flèches disponible dès le premier passage, sans sortie manuelle imposée.

## 4E — Localisation de l’épinglage des projets

1. Ouvrir la galerie des projets et parcourir les commandes d’épinglage d’un projet épinglé puis non épinglé.
2. Comparer « Pin project » / « Unpin project » avec la langue de l’interface.
3. Comparer ces noms avec les actions françaises d’épinglage du menu latéral du projet, puis avec le démonstrateur.

**Constat :** les noms de galerie restent anglais, alors que le menu latéral est traduit.

**Résultat attendu :** « Épingler le projet » / « Désépingler le projet » cohérents dans les emplacements proposant cette action. L’accès aux commandes latérales est traité séparément en [3A](../../Point%203%20-%20Navigation%20et%20focus/reproductions/PROCEDURES.md#3a--commandes-des-projets).

Les [tests et fixtures](EXECUTION.md) isolent les mécanismes du démonstrateur.

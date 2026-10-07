# Procédures de reproduction — Point 4

Utiliser une interface française et relever date, système, navigateur, version/mode du lecteur d’écran et état de l’extension. Comparer dans des documents frais distincts. Les gestes ci-dessous permettent de reproduire ou de rechercher un comportement ; ils ne sont pas de nouveaux résultats.

## 4A — Descriptions de rôle

1. Sans extension, parcourir Épinglés, Projets et Récents aux flèches, puis les chats ordinaires et ceux d’un projet déjà déplié.
2. Comparer séparément un premier focus par Tab sur une ligne de conversation.
3. Noter les annonces réellement entendues. Inspecter rôle, nom, aria-roledescription et aria-describedby, en distinguant sortable et draggable du rôle DOM.
4. Comparer avec le démonstrateur : rôle reconnaissable et instructions de déplacement conservées.

## 4B — État des destinations

1. Parcourir Accueil, Espace, Planifié et Plugins sans extension ; relever rôle, nom et état réduit/étendu.
2. Dans un contexte sans brouillon à perdre, activer une destination et vérifier si son action est une navigation ou un dépliage, ainsi que son éventuel état de destination courante.
3. Comparer après adaptation. Un contrôle qui ouvre réellement un panneau doit conserver son état de dépliage.

## 4C — Groupes des conversations

1. Parcourir un chat ordinaire et un chat d’un projet déjà déplié, sans les activer.
2. Relever les arrêts de groupe en distinguant liste, ligne et wrapper de groupe.
3. Comparer après adaptation : le lien et son bouton Actions doivent rester disponibles, sans groupe redondant.

## 4D — Premier passage dans une liste

1. Dans un document frais, comparer lecture aux flèches puis premier accès par Tab à une ligne de Récents.
2. Dans un autre document frais, atteindre puis activer avec Espace le dépliage d’un projet existant ; noter disponibilité des flèches et mode réellement constaté.
3. Distinguer premier passage, répétition dans le même document et retour manuel au curseur PC virtuel. Ne pas déduire le mode d’un simple bruit.
4. Comparer les [fixtures A/B et C/D](EXECUTION.md) qui isolent tabindex=-1 sur la liste parente. Leur résultat ne suffit pas à attribuer exclusivement le symptôme du site à ce mécanisme.

## 4E — Localisation des commandes de projet

1. Relever séparément les noms dans la galerie des projets et dans le menu latéral d’un projet existant.
2. Vérifier les deux états Épingler/Désépingler lorsqu’ils existent déjà ; ne pas modifier un épinglage uniquement pour obtenir un nom.
3. Comparer sans/avec adaptation, en conservant la distinction entre nom accessible et fonctionnement réel de l’action.

Les résultats historiques et la portée de chaque constat figurent dans le [rapport](../RAPPORT.md) et les [preuves](../preuves/CONSTATS_ET_PROVENANCE.md). Les [tests et fixtures](EXECUTION.md) fournissent les comparaisons synthétiques et leurs limites.

# Preuves du Point 3 : provenance, résultats et limites

Ce document est une **synthèse dérivée** des diagnostics et réceptions des 3–5 octobre 2026, du retour humain natif du 7 octobre et de l’inspection du menu Évaluer la réponse. Les pièces historiques conservent leurs observations, dates, versions et limites. Le [JSON du retour du 7 octobre](retour-humain-natif-2026-10-07.json) transcrit le témoignage ; le [relevé 3G](3G-evaluation-menu-natif-2026-10-07.json) documente séparément la structure et le focus DOM. Les [procédures locales](../reproductions/PROCEDURES.md) relient ces constats aux parcours de reproduction.

Les chaînes des JSON ont été examinées avant sélection : libellés connus du produit, structures, clés suivies, compteurs et identifiants synthétiques. Aucun contenu de conversation, nom de projet personnel, chemin Windows nominatif, cookie ou jeton n’y a été sélectionné. Les titres d’onglets conservés désignent des essais synthétiques. Les traces peuvent mentionner une région, une cible ou une propriété sans exposer son contenu.

## 3A — Projets, listes et premier focus

- [Réception initiale des projets, 4 octobre, 0.1.6](3A-reception-projets-2026-10-04.json) : retour direct positif avec nuance sur le parcours demandé aux flèches/raccourcis, accès Actions puis Nouveau chat sans l’activer, menu ouvert avec Espace, présence Page d’accueil du projet puis Échap. Aucun relevé indépendant de chaque geste ou de la parole ; aucun chat créé ou accueil activé par ce retour. Le numéro 0.1.6 est celui réellement testé, avant renumérotation rétroactive.
- [Comparaison physique de liens A/B, 4 octobre](3A-comparaison-liens-2026-10-04.json) : A sans tabindex sur la liste, B avec tabindex=-1. L’utilisateur rapporte A normal, B reproduisant exactement le bruit/blocage au premier passage puis parcours répété normal sans rechargement. Dix-huit événements structurels ; focus sur les liens, pas sur le DIV list dans les passages enregistrés. L’absence de flèche dans la trace ne contredit pas le retour humain et ne permet pas de dater le son. Aucun DnD ni extension dans la fixture.
- [Comparaison physique de boutons C/D, 4 octobre](3A-comparaison-boutons-2026-10-04.json) : mêmes boutons, états et relais de clic, seule différence pertinente tabindex=-1 sur la liste D. C normal, D avec blocage initial/non-répétition rapportés. Le retour Alt+Tab de D diffère du site : cette divergence est conservée. Trente-sept événements, sans lecture du nom ou de l’état interne du mode JAWS.

Les notes natives du 3 octobre ont retrouvé Actions et Nouveau chat accessibles avec Tab, y compris selon le retour extension désactivée. Les boutons et les relations ARIA du menu sont exposés par Chrome. La ligne extérieure interactive et l’imbrication sont des caractéristiques à examiner, pas une preuve de masquage automatique des descendants. Le contrat clavier natif exigeait currentTarget===target ; déplacer seulement rôle/tabindex sur un enfant aurait rompu ce contrat.

Le code public de liste examiné le 4 octobre expose role=list et tabindex=-1 ; ses focus explicites concernent la pagination. Dans Récents, une initialisation de draggable au premier focus est aussi observée ; elle n’est pas une activation du clavier DnD et ne suffit pas à expliquer les projets utilisant une autre branche. Les deux fixtures isolent l’effet du parent focalisable ; la réception globale 3.2.3 accepte ensuite navigation simple/imbriquée et dépliage dans le contexte déclaré.

## 3B — Réouverture et bascule de barre

**Synthèse des constats du 3–4 octobre**, sans trace brute supplémentaire jointe : rail réduit sans commande de réouverture dans le rendu examiné, cycle natif Ctrl+Maj+S vérifié ; commande native devenue inerte à fermeture puis BODY. La préférence d’emplacement après Profil et la correction de l’ancien proxy local instable sont séparées de ces faits. Réception positive de la commande persistante en 3.3.1, 4 octobre.

Le retour natif du 7 octobre reconfirme l’absence d’accès à la commande de réouverture par flèches et par Tab. L’ancien point de doublons a été retiré du signalement.

## 3C — Pagination Afficher plus

**Synthèse de l’inspection native du 4 octobre** : cinq chats avant, six après ; bouton Afficher plus retiré pendant chargement ; focus sur DIV role=list tabindex=-1 pendant et après ; dernier bouton Actions ancien encore connecté/visible. Le callback natif onLoadMore est une fonction avant chargement puis absent quand hasMoreItems=false. Le composant public JVh met en file une microtâche et focalise le bouton du footer disponible ou la liste.

Le mécanisme ciblé est contrôlé dans une fixture Chromium : 34 contrôles de pagination/listes pour l’adaptation 3.3.0, comprenant le retrait du callback à la dernière page. Cela vérifie l’adaptation, pas la décision de JAWS. Réception physique de la pagination en 3.3.1 le 4 octobre.

## 3D — Menus : position virtuelle et focus DOM

**Synthèse des notes et traces passives du 4 octobre**, sans export brut distinct disponible dans cette sélection :

| Parcours | Retour humain | Mesure DOM conservée |
|---|---|---|
| Profil | Après Échap, Flèche bas reprend au sommet. | BODY transitoire ; bouton exact au focus environ 34 ms après Échap, conservé jusqu’à 500 ms. |
| Actions chat récent | Même retour au sommet. | Bouton exact retrouvé environ 35 ms après Échap, encore focalisé jusqu’à 500 ms. |
| Profil répété | Cette fois reprise correcte. | Même retour DOM, environ 68 ms après Échap ; pas de mutation aria-hidden/inert observée ni masquage dans les douze ancêtres examinés. |

Ces délais sont des mesures des essais, pas des seuils indiquant que JAWS est prêt. Le retour DOM n’acquitte pas le curseur virtuel. Après correction de la garde locale data-state=closed et élargissement aux popovers associés, deux essais Profil et un chat récent échouent encore physiquement malgré DOM correct. Un retour unique dans la microtâche du retrait obtient ensuite une réception positive Profil, puis répétée, et est intégré. La 3.3.2 est acceptée pour les autres menus ; Explorer reçoit ensuite le contournement distinct décrit en 3E.

Les contrôles synthétiques joints couvrent association, retour natif déjà correct, retrait et masquage réels, tâches tardives et annulation par intention de l’utilisateur. Ils ne reproduisent pas à eux seuls le flux d’événements accessible Windows/JAWS. Le module existant couvre également Autres actions des messages ; les trois actions 3F ont une association différente.

## 3E — Explorer : entrée et propriété popup

| Pièce du 5 octobre | Ce qu’elle établit | Limite et résultat |
|---|---|---|
| [Entrée alignée sur destination](3E-entree-explorer-2026-10-05.json) | Transfert conteneur → destination ; Échap ferme puis restaure le bouton, Flèche bas rouvre nativement. | Entrée bornée reçue ; souci de sortie encore présent à cette étape. |
| [Retour après lifecycle](3E-sortie-lifecycle-2026-10-05.json) | Panneau retiré, retour au bouton après lifecycle natif, focus encore présent à 250 ms. | Résultat physique inchangé ; variante non intégrée. |
| [Comparaison propriété popup](3E-propriete-popup-2026-10-05.json) | Retrait du panneau, retour exact et propriété popup absente au focus. | Retour humain positif avec nuance ; aucun état interne JAWS mesuré. |
| [Réception intégrée 3.4.0](3E-reception-3.4.0-2026-10-05.json) | Comportement attendu déclaré, également après désépinglage par l’utilisateur. | Réception physique de la distribution intégrée ; les actions d’épinglage/désépinglage sont attribuées au retour humain. |

Comparaison native indépendante : Entrée focalisait DIV dialog tabindex=-1 ; Flèche bas focalisait la première destination Projets. Les douze boutons destination/épinglage avaient les mêmes rôles/tabindex dans les deux ouvertures observées. Le bouton fermé exposait hasPopup=dialog dans l’arbre Chrome ; la propriété est valide pour le panneau dialog. L’adaptation finale de propriété popup est un contournement d’interopérabilité et ne démontre pas une erreur sémantique native.

L’entrée et les flèches natives sont conservées dans la distribution finale reçue. Les répétitions d’un même document ne sont pas comptées comme des essais indépendants.

## 3F — Partage/édition du même message

[Réception 3.6.0 et trace passive du 5 octobre](3F-reception-3.6.0-2026-10-05.json) : déclaration positive des retours après partage d’une réponse, partage du prompt et annulation d’édition. La précision de mode initial est conservée. La trace atteint **60 événements**, son plafond ; elle n’atteste donc pas exhaustivement chaque étape des trois retours.

**Synthèse de l’inspection native** : avant le nouveau module, fermeture effective vers BODY ; partage conserve son bouton, édition retire le formulaire puis recrée le bouton. Les trois retours adaptés ont été vérifiés dans Chrome sans envoi/modification du message ni publication du partage. Onze contrôles synthétiques de fermeture/annulation ont réussi pour l’adaptation 3.6.0. Les trois gestes physiques ont ensuite reçu un retour positif avec cette version le 5 octobre ; cette adaptation est conservée dans le démonstrateur 4.1.0.

Premier Échap en mode formulaire édition : changement vers curseur virtuel, édition encore ouverte. Échap de fermeture : saut natif concerné. Déjà au curseur virtuel : un appui ferme. Aucun événement DOM du premier appui de mode n’est inventé. Ce constat ne détermine pas les mécanismes d’autres menus.

## 3G — Évaluer la réponse : structure native et contournement

**Retour natif direct du 7 octobre** : le contrôle présent est « Évaluer la réponse », annoncé « bouton », bien qu’il ouvre un menu. Un Échap ferme puis renvoie le focus au haut de la page. Aucune relation ARIA ni cause interne n’est mesurée par ce témoignage ; aucune correction nouvelle reçue n’est affirmée.

Le libellé Réagir du signalement du 5 octobre n’est plus trouvé lors des dernières réceptions. Son ancienne mention de deux Échap reste une limite historique et ne décrit pas le contrôle courant. La fixture historique 3F comporte un contrôle d’exclusion Réagir ; il ne reproduit ni le panneau courant ni son annonce.

Le [relevé natif du 7 octobre](3G-evaluation-menu-natif-2026-10-07.json) montre un `BUTTON type=button` nommé Évaluer la réponse, sans `aria-haspopup`, `aria-expanded` ni `aria-controls`. Son parent `SPAN` porte `aria-haspopup=menu`, `aria-expanded=false` à l’état fermé et un identifiant unique. Le menu porte `role=menu`, référence cet identifiant par `aria-labelledby` et contient Bonne réponse/Mauvaise réponse. À la fermeture native par Échap, le focus DOM retrouve le bouton. Le témoignage de reprise au sommet concerne donc un autre niveau : la position du curseur de lecture.

Le module [evaluation-menu-accessibility.js](../../../extension/evaluation-menu-accessibility.js) reprend `aria-haspopup` et l’état ouvert/fermé sur le bouton existant. Il fournit `aria-controls` seulement quand le menu associé et son identifiant sont uniques ; les relations périmées sont retirées, les propriétés étrangères préservées. Le [contrôleur de retour](../../../extension/sidebar-menu-focus.js) vérifie l’identité du tour avant de rendre le focus, afin qu’un nœud recyclé ne désigne pas un autre message.

Validation 3.7.0 déjà exécutée : 35 tests Node du module sémantique, 36 du contrôleur de retour et 11 contrôles Chromium de la [fixture Évaluer](../reproductions/evaluation-menu.html), parmi 478 tests Node réussis au total. Ces contrôles couvrent callbacks natifs, Échap, retour depuis BODY, conservation d’un retour natif déjà correct, ambiguïtés, recyclage et restauration. Ils établissent le mécanisme DOM du contournement sans fournir une mesure de parole ou de curseur JAWS.

L’[inspection passive de la structure adaptée](3G-evaluation-menu-adapte-2026-10-07.json) relève ensuite neuf boutons existants portant `aria-haspopup=menu` et `aria-expanded=false`. Le nœud AX ciblé est un bouton focalisable non ignoré, nommé Évaluer la réponse, avec `hasPopup=menu` et `expanded=false`. Aucune parole n’est enregistrée et aucun menu n’est ouvert pendant ce relevé ; la preuve porte sur la sémantique exposée du bouton fermé.

## Retour humain natif du 7 octobre 2026

Source : réponses détaillées de l’utilisateur aux compléments de réception et précisions ultérieures. Plage **19 h 18–22 h 40**, Europe/Brussels. Le [JSON dérivé](retour-humain-natif-2026-10-07.json) ne conserve que les observations du produit. La version de JAWS 2021 reste inchangée ; l’utilisateur rapporte les mêmes résultats avec Edge/JAWS 2025 d’après son expérience, et lors d’un nouvel essai Opera. Ce sont des retours humains, pas des mesures de l’agent.

| Cas | Observation actuelle rapportée |
|---|---|
| 3A | Actions et Nouveau chat des projets atteints uniquement par Tab, inaccessibles aux flèches/raccourcis. Afficher/masquer les chats et Tab avant/dans Récents provoquent bruit, passage ressenti en mode formulaire et blocage ; Échap ou retour manuel au curseur PC permet la reprise. |
| 3B | Afficher la barre latérale masquée inaccessible aux flèches et à Tab. |
| 3C | Afficher plus renvoie au début des chats du projet. |
| 3D | Profil et Actions des chats demandent deux Échap ; Filtrer et Options de la barre latérale du projet/du chat un seul. Remplacement lien/bouton également observé sur le chat dont Actions vient d’être activé. |
| 3F | Retours au haut de la page après Partager, Actions, Modifier et autres boutons de chat inchangés depuis les ajustements antérieurs. |
| 3G | Évaluer la réponse annoncé bouton, ouvre un menu ; un Échap ferme puis retour au haut de la page. |

Les rapprochements entre mode formulaire, nombre d’Échap et remplacement des rôles sont des corrélations rapportées. Ils ne démontrent ni un même chemin DOM ni une causalité interne JAWS.

## Limites communes de provenance

Les preuves techniques historiques gardent leur date des 3–5 octobre ; le retour humain du 7 octobre actualise les symptômes explicitement reconfirmés sans redater ces mesures. Les réceptions valent pour le contexte déclaré et gardent leur nuance. L’attribution d’une perte native vers BODY est plus étayée sur certains chemins que sur toutes les familles citées. La cause interne des phénomènes virtuels reste ouverte.

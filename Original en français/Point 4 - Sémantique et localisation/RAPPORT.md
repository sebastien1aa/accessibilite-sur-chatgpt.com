# Point 4 — Sémantique et localisation

Ce Point traite de cinq obstacles : descriptions de rôle qui masquent la fonction, état réduit sur les destinations, groupes redondants, blocage des flèches au premier focus et épinglage des projets non traduit. Les mécanismes natifs, l’interopérabilité et les demandes de simplification sont distingués dans chaque sous-point.

Les [conditions et versions](../ENVIRONNEMENT.md) sont communes. Les [procédures du site](reproductions/PROCEDURES.md), les [preuves](preuves/CONSTATS_ET_PROVENANCE.md) et les [tests isolés](reproductions/EXECUTION.md) accompagnent les sous-points. Le démonstrateur fourni est la **4.1.2**.

## 4A — « Sortable » et « draggable » à la place de rôles informatifs

**Problème.** Les annonces « sortable » et « draggable » masquent les rôles utiles des sections, liens et boutons.

**Résultat attendu.** Fonctions reconnaissables, avec accès au tri et instructions de déplacement conservés.

**Reproduction.** [Parcours 4A](reproductions/PROCEDURES.md#4a--descriptions-de-rôle).

Le 7 octobre, l’utilisateur reconfirme « sortable » sur les sections Épinglés, Projets et Récents. Les états de dépliage persistent : il précise notamment **« sortable étendu » pour Projets**, qui affiche ou masque réellement ses chats. Dans les listes imbriquées des projets, il entend sortable à la place de lien/bouton, et **« sortable réduit menu »** sur les boutons d’actions. Après Tab sur une ligne, puis Échap ou retour manuel au curseur PC et reprise aux flèches, **« draggable » remplace également les annonces lien/bouton**, notamment sur le premier chat de Récents quand c'est lui qui a été focalisé par Tab, sinon cela se produit pour les attribus dans le groupe du chat concerné. Ces descriptions techniques anglaises masquent la fonction utile dans le parcours (généralement "bouton" ou "lien").

Le même retour relie ce remplacement au chat dont le bouton Actions vient d’être activé. Il faut donc relever séparément deux déclencheurs observés : accès par Tab et activation d’Actions. Cette corrélation datée n’établit pas que tout changement décrit après Actions relève d’une causalité identique à l’initialisation technique au premier focus.

Le 4 octobre à 01:46:16.351, trois éléments HTML `BUTTON`, de rôle `button`, et cinq parents `DIV` de rôle `listitem` portent nativement `aria-roledescription="sortable"`. Les liens de conversation demeurent de vrais liens. Une inspection ultérieure constate `aria-roledescription="draggable"` sur le parent `listitem` d’un lien focalisé de Récents. Le code natif initialise les métadonnées de déplacement de cette ligne au premier focus.

Il faut distinguer le rôle et sa description : `button`, `link` ou `listitem` n’ont pas disparu du DOM. `aria-roledescription` fournit une autre manière de présenter le rôle aux technologies d’assistance. Sa substitution peut masquer l’information utile dans l’annonce. La [définition WAI-ARIA](https://www.w3.org/TR/wai-aria-1.2/#aria-roledescription) explique ce mécanisme ; elle n’atteste pas à elle seule les paroles de JAWS dans un navigateur donné.

Le contournement retire les valeurs exactes `sortable` dans la portée reconnue et `draggable` sur les conversations reconnues ou leurs parents propriétaires. Il conserve les rôles, liens, commandes, instructions de déplacement `aria-describedby` et callbacks natifs. Il ne désactive pas le tri. Les [sources communes](../../extension/sidebar-sortable-accessibility.js) montrent ce ciblage et sa restauration à l’arrêt.

Les rôles informatifs ont été reçus dans le parcours global du 4 octobre. Le démarrage a ensuite été avancé à `document_start`, avec un retour positif. Le 6 octobre, les trois boutons natifs sans extension portent toujours `sortable` et `tabindex="0"`. Ce dernier attribut ne doit pas être confondu avec le parent `tabindex="-1"` étudié en 4D.

Une solution en amont devrait garder le rôle reconnaissable, localiser les informations de déplacement réellement utiles et vérifier les annonces au focus initial comme après les mises à jour. La correction de la description de rôle ne doit pas supprimer l’accès au tri ni ses instructions.

## 4B — « Réduit » sur des destinations de navigation

**Problème.** Des destinations sont annoncées réduites alors que leur activation navigue ; cet état ne décrit pas la page courante.

**Résultat attendu.** Navigation et page courante clairement annoncées ; états de dépliage attachés au contenu qu’ils contrôlent effectivement.

**Reproduction.** [Parcours 4B](reproductions/PROCEDURES.md#4b--état-des-destinations).

### Observations et code natifs

Le 7 octobre, l’utilisateur confirme « réduit » sur les destinations et « page courante » lorsqu’une destination est active. Le [relevé natif du 8 octobre](preuves/4B-destinations-parametres-2026-10-08.json), dans Edge, retrouve Accueil, Espace, Planifié et Plugins avec aria-expanded=false ; Accueil porte aussi aria-current=page. Le bouton navigue alors que cet état décrit un aperçu secondaire.

Le propriétaire React actuellement identifié ep calcule séparément la page courante et l’aperçu :

~~~js
"aria-current": f.isCurrentDestination ? "page" : void 0,
"aria-expanded": null != q ? H : void 0,
onClick: t => {
  t.defaultPrevented || (e?.onActivate(),
    f.onSelect(void 0, "CHATGPT_SIDEBAR_MENU_ITEM_PLACEMENT_PRIMARY"));
}
~~~

Cet extrait de code natif provient du composant engagé propriétaire de data-sidebar-destination. Le même composant définit `H = null != A && A.area === q && A.productMode === f.peekProductMode` : l’état annoncé dépend de l’aperçu correspondant à une zone et un mode, séparément de `f.isCurrentDestination`. L’identifiant minifié ep est daté ; le diagnostic historique du même mécanisme identifiait oB. L’action onSelect et l’état d’aperçu sont distincts. Le constat porte sur leur compréhension dans ce parcours : un vrai déclencheur de panneau, comme Explorer, doit garder son état de dépliage.

### Destinations épinglées depuis Explorer

Le cas concerne aussi les boutons de **Sites et Images épinglés dans le rail depuis Explorer**, relevés le 5 octobre. Il faut distinguer ces épingles des boutons de destination situés à l’intérieur du panneau Explorer : dans le panneau natif examiné le 8 octobre, les destinations n’ont pas aria-expanded ; le déclencheur Explorer possède légitimement aria-haspopup=dialog et son état ouvert/fermé.

Les quatre destinations principales portent un couple data-sidebar-destination/data-slate-sidebar-peek-area reconnu. Les épingles peuvent porter un identifiant de destination sans cet attribut d’aperçu. Le contournement doit donc reconnaître cette seconde structure, plutôt que dépendre d’une liste de noms Sites/Images. La [preuve](preuves/4B-destinations-parametres-2026-10-08.json) distingue le relevé actuel des destinations principales et les observations datées d’épingles.

### Comparaison avec les paramètres

Dans la page Paramètres native, **Général** est un bouton de catégorie avec aria-current=page **sans aria-expanded**. Les autres catégories examinées ne portent pas non plus cet état. Cette comparaison montre une manière déjà utilisée par le produit pour exposer une destination et sa page courante sans annoncer un dépliage. Elle ne présume ni un composant identique ni un transfert direct de toute la logique des paramètres vers le rail.

### Illustration du contournement et résultat

Dans [ui-accessibility.js](../../extension/ui-accessibility.js), navigationButton vérifie un bouton de destination dans le rail, exclut tout vrai popup ou aria-controls et accepte soit un couple d’aperçu connu, soit une destination sans peek. normalizeRailNavigation retire seulement aria-expanded sur ce périmètre. Les nœuds, callbacks, navigation, aria-current, ordre et affichage sont conservés ; les ajouts/retraits dynamiques sont couverts et les widgets inconnus restent natifs.

Les destinations principales et les épingles Sites/Images ont reçu un retour positif, avec nuance pour ces dernières le 5 octobre. La comparaison DOM actuelle dans Chrome avec adaptation retrouve les quatre états retirés et aria-current conservé ; elle ne redéfinit pas cette réception JAWS. Les vrais dépliages Projets, Épinglés, Récents et les menus Explorer/Profil restent distincts.

## 4C — Groupes redondants autour des chats

**Problème.** Des frontières de groupe ajoutent deux arrêts répétitifs autour de chaque chat et de ses actions.

**Résultat attendu.** Parcours direct des chats et commandes dans leurs listes, sans frontières redondantes.

**Reproduction.** [Parcours 4C](reproductions/PROCEDURES.md#4c--groupes-des-conversations).

Le 7 octobre, l’utilisateur reconfirme les groupes et le parcours décrits dans son signalement initial à l’assistance. Cela concerne les conversations ordinaires, épinglées **et celles d’un projet déplié**. Chaque groupe ajoute deux lignes à parcourir ; le coût se répète lors d’une recherche dans la liste. Transcription initiale autorisée, noms de chats remplacés :

```text
Début du groupe [Nom du chat]
[Nom du chat]
Actions du chat
Épingler le chat
Fin du groupe
Début du groupe [Nom du chat suivant]
[Nom du chat suivant]
```

Le résultat demandé conserve la liste, les liens et leurs actions, sans arrêts Début/Fin du groupe autour de chaque chat. Ce relevé décrit les lignes et libellés utiles ; il n’ajoute pas un rôle prononcé à chaque ligne. Le périmètre du démonstrateur comprend ces trois familles de chats.

Le rendu inspecté comporte une ligne `listitem`, puis un élément `.sidebar-item` de rôle `group`, contenant le lien de conversation et le bouton Actions du chat. Le rôle `group` est réellement natif ; son retrait n’est pas une réparation d’un rôle HTML disparu. Le problème décrit est le coût de répétition et de navigation dans ce parcours. Il ne faut pas en déduire que tous les groupes ARIA sont superflus : un groupe de commandes distinctes, comme ceux du panneau Explorer, n’est pas couvert par ce ciblage.

Le contournement retire seulement le rôle et les références de nom du groupe identifié par sa ligne, un lien de conversation et son bouton d’actions. La liste, la ligne, le lien et le bouton gardent leur identité et leur fonctionnement. Aucun élément n’est déplacé ou cloné. Le [module d’interface](../../extension/ui-accessibility.js) conserve les groupes qui ne correspondent pas à cette structure.

Les contrôles DOM/Chromium historiques couvrent les conversations ordinaires puis les conversations de projets. La réception globale du 4 octobre accepte les parcours proposés, dont les chats ordinaires et de projets ; les constats DOM et les retours de lecture gardent leur provenance. L’actualisation Edge du 6 octobre porte sur les sous-points 4A et 4B.

## 4D — Blocage au premier passage dans les projets et les listes

**Problème.** Au premier accès par Tab ou au dépliage d’un projet, un passage en mode formulaire bloque les flèches dans le retour JAWS.

**Résultat attendu.** Navigation aux flèches disponible dès le premier passage, sans sortie manuelle imposée.

**Reproduction.** [Parcours 4D](reproductions/PROCEDURES.md#4d--premier-passage-dans-une-liste).

Après la réception initiale des contrôles de projet, l’utilisateur rapporte qu’un premier Espace ou Entrée sur un dépliage provoque un bruit évoquant l'activation du mode formulaire et que les flèches cessent de parcourir la page normalement. Le retour au curseur PC virtuel rétablit le parcours ; une répétition dans le même document ne reproduit généralement pas le phénomène. Il précise ensuite que Tab suffit à le déclencher dans un contexte de liste, notamment Récents, avant même l’activation d’un projet. La simple lecture aux flèches n’entraîne pas ce nouveau phénomène.

Le 7 octobre, l’utilisateur reconfirme le passage ressenti en mode formulaire, bruit et blocage lors de l’affichage/masquage des chats d’un projet et après Tab avant ou dans Récents. Échap ou la commande manuelle de retour au curseur PC rétablit les flèches. Ce retour natif actuel s’ajoute aux observations historiques. L’agent n’a pas mesuré l’état interne JAWS ; la corrélation avec ces gestes ne démontre pas la cause de sa décision interne.

Deux comparaisons locales ont cependant permis d’isoler un mécanisme externe :

| Comparaison synthétique | Seule différence pertinente | Retour physique du 4 octobre |
|---|---|---|
| Liens A/B, sans extension ni déplacement | Parent `role="list"` sans tabindex pour A, avec `tabindex="-1"` pour B | A normal ; B reproduit bruit et blocage au premier passage, puis répétition normale sans rechargement. |
| Boutons C/D, même activation et même relais synthétique | Même différence de tabindex sur la liste parente | C normal ; D reproduit bruit et blocage, puis répétition normale. Le retour Alt+Tab de D diffère du site et reste une limite. |

La focalisabilité du parent est causale **dans ces deux reproductions**. Le focus observé reste sur le lien ou le bouton enfant : entendre le contexte de liste ne signifie pas que la liste elle-même a reçu le focus. Ce résultat ne lit pas la décision interne de JAWS et n’établit pas une violation universelle d’ARIA.

Le contournement traite les conteneurs et lignes documentaires reconnus portant exactement `tabindex="-1"` au repos. Il garde les liens et boutons focalisables et préserve les appels de focus natifs nécessaires, notamment pour la pagination. Voir [le module de listes](../../extension/sidebar-list-accessibility.js). La transformation du nom de projet en texte statique et le placement d’un bouton de dépliage distinct sont, séparément, des choix d’organisation demandés ; ils déplacent visuellement le chevron et ne doivent pas être présentés comme une correction invisible imposée à tous.

Les parcours Récents et projets sont reçus ; le complément du 4 octobre couvre aussi les chats imbriqués, avec une réception globale de la navigation ordinaire et du dépliage. La correction des listes simples et imbriquées est reçue ; ces réceptions de l’adaptation et la reconfirmation native du 7 octobre restent des preuves distinctes.

## 4E — « Pin project » et « Unpin project » en interface française

**Problème.** La galerie expose Pin project/Unpin project dans une interface française alors que les actions du menu latéral sont traduites.

**Résultat attendu.** Épingler/Désépingler le projet localisés de façon cohérente.

**Reproduction.** [Parcours 4E](reproductions/PROCEDURES.md#4e--localisation-de-lépinglage-des-projets).

Le 7 octobre, l’utilisateur reconfirme la traduction manquante dans **la galerie des projets**, conformément à son signalement initial : `Pin project` / `Unpin project` sont les libellés ciblés. Dans la barre latérale, l’épinglage se trouve dans **Actions du projet**, menu atteint seulement par Tab et inaccessible aux flèches/raccourcis, comme Nouveau chat. Le défaut de localisation de galerie et le défaut d’accès au menu latéral sont distincts. Le menu latéral était déjà français lors de l’inspection du 3 octobre ; il ne faut pas présenter toutes les commandes de projet comme anglaises.

Le module remplace les noms exacts par « Épingler le projet » et « Désépingler le projet » dans son périmètre français, sans modifier les callbacks. Les contrôles réels ont compté six boutons « Épingler le projet » et aucun `Pin project` après adaptation. Le résultat établit le nom exposé ; les noms et l’activation de chaque action sont des mesures distinctes. Voir [le module de projets](../../extension/project-accessibility.js).

Les noms adaptés sont couverts par la réception d’ensemble. La reconfirmation humaine du 7 octobre actualise le constat natif de galerie du 3 octobre. L’actualisation passive Edge du 6 octobre ne portait pas sur cette galerie. La correction en amont attendue est une localisation cohérente des noms dans tous les emplacements qui proposent la même action.

## Demande aux équipes de ChatGPT

Examiner la sémantique rendue au chargement, au premier focus et après les mises à jour : rôle reconnaissable, informations de déplacement localisées, état réduit/étendu réservé au contrôle correspondant, groupes utiles et noms cohérents entre galerie et barre. Pour le premier passage dans les listes, reproduire les deux comparaisons puis confronter le rendu réel à leurs conditions, sans supposer la cause interne du lecteur d’écran.

L’extension sert de contournement local et de démonstration de modifications ciblées. Les corrections de noms, descriptions et groupes peuvent conserver l’affichage ; le réagencement des contrôles de projet est une préférence distincte avec effet visuel. Le dossier ne démontre ni une correction du service ni une garantie pour tous les lecteurs d’écran.

# Point 4 — Sémantique et localisation de la barre latérale

Ce dossier décrit cinq difficultés distinctes : des descriptions de rôle anglaises qui prennent la place d’un rôle informatif, un état « réduit » sur des commandes de navigation, des groupes répétés autour des chats, un blocage au premier passage dans certaines listes et des commandes de projet non traduites. Leur origine et leur niveau de preuve diffèrent. Une correction locale reçue ne signifie pas que ChatGPT a été corrigé en amont.

Les investigations historiques des 3–5 octobre 2026 relevaient Windows 10 Home 22H2, build 19045.6466, avec Chrome 154.0.8037.93. Les nouveaux retours humains natifs datent du **7 octobre, provisoirement entre 19 h 18 et 21 h 24, Bruxelles** ; fin des essais et éventuelle trace complémentaire restent à consigner. La version de JAWS 2021 utilisée reste inchangée. L’utilisateur indique des résultats identiques avec Edge et JAWS 2025 d’après son expérience, et dans un nouvel essai avec Opera. Ces observations lui sont attribuées, sans les transformer en essais mesurés par l’agent. Voir les [repères d’environnement](../ENVIRONNEMENT.md). Les heures sont celles de Bruxelles, Europe/Brussels, UTC+02:00 à ces dates.

Une actualisation passive, réalisée le **6 octobre 2026 à 23 h 48 dans Edge, sans extension, sur une conversation partagée**, confirme encore les descriptions `sortable` sur trois boutons et l’état réduit de quatre destinations. Ce relevé DOM/arbre d’accessibilité constitue une preuve actuelle de structure ; il n’est pas une nouvelle réception JAWS. Le navigateur indique Edge **154.0.4258.62**, Chromium **154.0.8037.98**.

Les [preuves sélectionnées](preuves/CONSTATS_ET_PROVENANCE.md) distinguent les relevés historiques, les retours utilisateur et cette actualisation. Les [reproductions locales](reproductions/PROCEDURES.md) utilisent uniquement des exemples synthétiques, sans compte ni contenu de conversation.

Les [procédures de reproduction](reproductions/PROCEDURES.md) réunissent les parcours du site ; les [tests et fixtures](reproductions/EXECUTION.md) vérifient séparément les mécanismes synthétiques.

## 4A — « Sortable » et « draggable » à la place de rôles informatifs

Le 7 octobre, l’utilisateur reconfirme « sortable » sur les sections Épinglés, Projets et Récents. Les états de dépliage persistent : il précise notamment **« sortable étendu » pour Projets**, qui affiche ou masque réellement ses chats. Dans les listes imbriquées des projets, il entend sortable à la place de lien/bouton, et **« sortable réduit menu »** sur les boutons d’actions. Après Tab sur une ligne, puis Échap ou retour manuel au curseur PC et reprise aux flèches, **« draggable » remplace également les annonces lien/bouton**, notamment sur le premier chat de Récents. Ces descriptions techniques anglaises masquent la fonction utile dans le parcours.

Le même retour relie ce remplacement au chat dont le bouton Actions vient d’être activé. Il faut donc relever séparément deux déclencheurs observés : accès par Tab et activation d’Actions. Cette corrélation datée n’établit pas que tout changement décrit après Actions relève d’une causalité identique à l’initialisation technique au premier focus.

Le 4 octobre à 01:46:16.351, trois éléments HTML `BUTTON`, de rôle `button`, et cinq parents `DIV` de rôle `listitem` portent nativement `aria-roledescription="sortable"`. Les liens de conversation demeurent de vrais liens. Une inspection ultérieure constate `aria-roledescription="draggable"` sur le parent `listitem` d’un lien focalisé de Récents. Le code natif initialise les métadonnées de déplacement de cette ligne au premier focus.

Il faut distinguer le rôle et sa description : `button`, `link` ou `listitem` n’ont pas disparu du DOM. `aria-roledescription` fournit une autre manière de présenter le rôle aux technologies d’assistance. Sa substitution peut masquer l’information utile dans l’annonce. La [définition WAI-ARIA](https://www.w3.org/TR/wai-aria-1.2/#aria-roledescription) explique ce mécanisme ; elle n’atteste pas à elle seule les paroles de JAWS dans un navigateur donné.

Le contournement retire les valeurs exactes `sortable` dans la portée reconnue et `draggable` sur les conversations reconnues ou leurs parents propriétaires. Il conserve les rôles, liens, commandes, instructions de déplacement `aria-describedby` et callbacks natifs. Il ne désactive pas le tri. Les [sources communes](../../extension/sidebar-sortable-accessibility.js) montrent ce ciblage et sa restauration à l’arrêt.

Les rôles informatifs ont été reçus historiquement dans le parcours global 3.2.3, avec une réserve sur le chargement initial. Le démarrage a ensuite été avancé à `document_start` ; la réception 3.3.1 considère le résultat correct sauf observation contraire, le délai précis d’apparition n’a pas été mesuré. Le 6 octobre, les trois boutons natifs sans extension portent toujours `sortable` et `tabindex="0"`. Ce dernier attribut ne doit pas être confondu avec le parent `tabindex="-1"` étudié en 4D.

Une solution en amont devrait garder le rôle reconnaissable, localiser les informations de déplacement réellement utiles et vérifier les annonces au focus initial comme après les mises à jour. La correction de la description de rôle ne doit pas supprimer l’accès au tri ni ses instructions.

## 4B — « Réduit » sur des destinations de navigation

Le 7 octobre, l’utilisateur confirme les boutons de destinations annoncés **« réduits »**, avec **« page courante »** lorsqu’il se trouve sur la destination correspondante. Accueil, Espace, Planifié et Plugins figuraient déjà dans le relevé historique alors que leur activation navigue. Le code natif du composant observé, identifié `oB`, lie `aria-expanded` à un aperçu secondaire tandis que l’action de sélection navigue. Sur Espace, la navigation rend la destination courante mais laisse `expanded=false`. Aucun contrôle de dépliage de cet aperçu n’a été constaté dans ce rendu. Ces destinations ne doivent pas être confondues avec Projets, Épinglés ou Récents, dont les commandes déplient effectivement des listes.

L’attribut est donc natif ; l’écart observé porte sur ce que l’état décrit par rapport à l’action accessible. Le rapport ne prétend pas que tout bouton de navigation utilisant `aria-expanded` est incorrect : un contrôle qui ouvre effectivement un panneau doit garder son état et ses relations.

Le contournement retire cet état des quatre couples destination/aperçu reconnus. Il couvre également les destinations épinglées présentes ou futures dans le rail lorsqu’elles n’ont pas de vrai popup ou contrôle associé. Il conserve le nœud, la navigation, `aria-current`, les callbacks, l’ordre et l’affichage. Les widgets inconnus restent natifs. Voir les [gardes du module d’interface](../../extension/ui-accessibility.js).

Les destinations déjà adaptées ont été acceptées lors des étapes 3.3.1 et 3.3.2. Le 5 octobre, l’utilisateur a jugé corrigés, avec nuance, les boutons épinglés tels que Sites et Images. Sa demande initiale de déplacer Sites avant Explorer a été retirée : l’emplacement natif après Explorer est jugé cohérent. Ce choix d’organisation n’est pas un défaut à signaler. La réception intégrée 3.4.0 conserve les acquis ; elle ne constitue pas un nouvel essai de chaque épingle ou d’Edge.

Le 6 octobre à 23 h 48, l’arbre d’accessibilité d’Edge sans extension expose encore Accueil, Espace, Planifié et Plugins comme réduits. Aucun essai d’activation ni parole JAWS n’est déduit de ce relevé passif.

## 4C — Groupes redondants autour des chats

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

Le résultat demandé conserve la liste, les liens et leurs actions, sans arrêts Début/Fin du groupe autour de chaque chat. Ce relevé décrit les lignes et libellés utiles ; il n’ajoute pas un rôle prononcé à chaque ligne. La première adaptation ne couvrait que les conversations ordinaires : cette omission locale a ensuite été corrigée.

Le rendu inspecté comporte une ligne `listitem`, puis un élément `.sidebar-item` de rôle `group`, contenant le lien de conversation et le bouton Actions du chat. Le rôle `group` est réellement natif ; son retrait n’est pas une réparation d’un rôle HTML disparu. Le problème décrit est le coût de répétition et de navigation dans ce parcours. Il ne faut pas en déduire que tous les groupes ARIA sont superflus : un groupe de commandes distinctes, comme ceux du panneau Explorer, n’est pas couvert par ce ciblage.

Le contournement retire seulement le rôle et les références de nom du groupe identifié par sa ligne, un lien de conversation et son bouton d’actions. La liste, la ligne, le lien et le bouton gardent leur identité et leur fonctionnement. Aucun élément n’est déplacé ou cloné. Le [module d’interface](../../extension/ui-accessibility.js) conserve les groupes qui ne correspondent pas à cette structure.

Les contrôles DOM/Chromium historiques couvrent les conversations ordinaires puis les conversations de projets. La réception globale 3.2.3 accepte les points sans réserve signalée, dont la navigation ordinaire des listes ; ce retour doit être présenté comme une réception d’ensemble, sans inventer une annonce verbatim pour chaque groupe. La navigation des chats ordinaires et des chats de projet est reçue en 3.2.3. L’actualisation Edge du 6 octobre porte sur les sous-points 4A et 4B.

## 4D — Blocage au premier passage dans les projets et les listes

Après la réception initiale des contrôles de projet, l’utilisateur rapporte qu’un premier Espace ou Entrée sur un dépliage provoque un bruit évoquant le mode formulaire et que les flèches cessent de parcourir la page normalement. Le retour au curseur PC virtuel rétablit le parcours ; une répétition dans le même document ne reproduit généralement pas le phénomène. Il précise ensuite que Tab suffit à le déclencher dans un contexte de liste, notamment Récents, avant même l’activation d’un projet. La simple lecture aux flèches n’entraîne pas ce nouveau phénomène.

Le 7 octobre, l’utilisateur reconfirme le passage ressenti en mode formulaire, bruit et blocage lors de l’affichage/masquage des chats d’un projet et après Tab avant ou dans Récents. Échap ou la commande manuelle de retour au curseur PC rétablit les flèches. Ce retour natif actuel s’ajoute aux observations historiques. L’agent n’a pas mesuré l’état interne JAWS ; la corrélation avec ces gestes ne démontre pas la cause de sa décision interne.

Deux comparaisons locales ont cependant permis d’isoler un mécanisme externe :

| Comparaison synthétique | Seule différence pertinente | Retour physique du 4 octobre |
|---|---|---|
| Liens A/B, sans extension ni déplacement | Parent `role="list"` sans tabindex pour A, avec `tabindex="-1"` pour B | A normal ; B reproduit bruit et blocage au premier passage, puis répétition normale sans rechargement. |
| Boutons C/D, même activation et même relais synthétique | Même différence de tabindex sur la liste parente | C normal ; D reproduit bruit et blocage, puis répétition normale. Le retour Alt+Tab de D diffère du site et reste une limite. |

La focalisabilité du parent est causale **dans ces deux reproductions**. Le focus observé reste sur le lien ou le bouton enfant : entendre le contexte de liste ne signifie pas que la liste elle-même a reçu le focus. Ce résultat ne lit pas la décision interne de JAWS et n’établit pas une violation universelle d’ARIA.

Le contournement traite les conteneurs et lignes documentaires reconnus portant exactement `tabindex="-1"` au repos. Il garde les liens et boutons focalisables et préserve les appels de focus natifs nécessaires, notamment pour la pagination. Voir [le module de listes](../../extension/sidebar-list-accessibility.js). La transformation du nom de projet en texte statique et le placement d’un bouton de dépliage distinct sont, séparément, des choix d’organisation demandés ; ils déplacent visuellement le chevron et ne doivent pas être présentés comme une correction invisible imposée à tous.

La réception 0.1.9 reçoit les parcours Récents et projets mais garde une réserve sur les chats imbriqués. Le complément 3.2.3 couvre ces lignes ; la réception globale suivante accepte la navigation ordinaire et le dépliage. Les réceptions ultérieures conservent ces acquis. La correction des listes simples et imbriquées est reçue ; ces réceptions de l’adaptation et la reconfirmation native du 7 octobre restent des preuves distinctes.

## 4E — « Pin project » et « Unpin project » en interface française

Le 7 octobre, l’utilisateur reconfirme la traduction manquante dans **la galerie des projets**, conformément à son signalement initial : `Pin project` / `Unpin project` sont les libellés ciblés. Dans la barre latérale, l’épinglage se trouve dans **Actions du projet**, menu atteint seulement par Tab et inaccessible aux flèches/raccourcis, comme Nouveau chat. Le défaut de localisation de galerie et le défaut d’accès au menu latéral sont distincts. Le menu latéral était déjà français lors de l’inspection du 3 octobre ; il ne faut pas présenter toutes les commandes de projet comme anglaises.

Le module remplace les noms exacts par « Épingler le projet » et « Désépingler le projet » dans son périmètre français, sans modifier les callbacks. Les contrôles réels ont compté six boutons « Épingler le projet » et aucun `Pin project` après adaptation. **Aucun épinglage n’a été effectué pour ce test** ; le résultat atteste le nom, pas le fonctionnement physique de chacune des deux actions. Voir [le module de projets](../../extension/project-accessibility.js).

Les noms adaptés sont couverts par la réception d’ensemble. La reconfirmation humaine du 7 octobre actualise le constat natif de galerie du 3 octobre. L’actualisation passive Edge du 6 octobre ne portait pas sur cette galerie. La correction en amont attendue est une localisation cohérente des noms dans tous les emplacements qui proposent la même action.

## Demande aux équipes de ChatGPT

Examiner la sémantique rendue au chargement, au premier focus et après les mises à jour : rôle reconnaissable, informations de déplacement localisées, état réduit/étendu réservé au contrôle correspondant, groupes utiles et noms cohérents entre galerie et barre. Pour le premier passage dans les listes, reproduire les deux comparaisons puis confronter le rendu réel à leurs conditions, sans supposer la cause interne du lecteur d’écran.

L’extension sert de contournement local et de démonstration de modifications ciblées. Les corrections de noms, descriptions et groupes peuvent conserver l’affichage ; le réagencement des contrôles de projet est une préférence distincte avec effet visuel. Le dossier ne démontre ni une correction du service ni une garantie pour tous les lecteurs d’écran.

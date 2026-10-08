# Point 3 — Navigation et retour de focus sur chatgpt.com

Ce Point traite de l’accès aux commandes et de la reprise de lecture : actions de projets, barre latérale, Afficher plus, menus et panneaux, Explorer, partage/édition et évaluation d’une réponse. Un focus DOM correct et une reprise correcte du curseur PC virtuel sont deux résultats distincts.

Les [conditions et versions](../ENVIRONNEMENT.md) sont communes. Les [procédures du site](reproductions/PROCEDURES.md), les [observations et réceptions](preuves/OBSERVATIONS_ET_RECEPTIONS.md) et les [tests isolés](reproductions/EXECUTION.md) accompagnent les sous-points. Les adaptations décrites sont conservées dans le démonstrateur **4.1.2**.

## 3A — Commandes de projets accessibles par les flèches

**Problème.** Actions et Nouveau chat d’un projet sont atteints par Tab mais pas par le parcours aux flèches.

**Résultat attendu.** Commandes accessibles et activables depuis la lecture habituelle de la page.

**Reproduction.** [Parcours 3A](reproductions/PROCEDURES.md#3a--commandes-des-projets).

### Observations et structure native

Le retour natif du 7 octobre confirme que **Actions et Nouveau chat d’un projet restent accessibles uniquement par Tab et inaccessibles dans le parcours par flèches ou raccourcis de navigation JAWS**. L’utilisateur confirme que Tab les atteint aussi avec l’extension désactivée. Pour son parcours de lecture habituel, ces commandes apparaissent donc inaccessibles. L’attendu est de les rendre également accessibles par ce parcours sans imposer Tab étant donné que de nombreux utilisateurs naviguent avec les flèches sans nécessairement utiliser Tab.

Le relevé du 3 octobre montre une ligne de projet de rôle button et tabindex=0, contenant un premier DIV avec le nom et le chevron, puis des commandes natives. Actions possède un bouton HTML avec aria-haspopup=menu, non ignoré dans l’arbre accessible. Le menu contient Page d’accueil du projet. Cette commande native a été retrouvée ; sa navigation réelle a été vérifiée séparément dans un onglet de diagnostic.

### Adaptation et réception

[project-accessibility.js](../../extension/project-accessibility.js) sépare le contrôle documentaire des commandes natives et conserve leurs gestionnaires et nœuds ; [sidebar-list-accessibility.js](../../extension/sidebar-list-accessibility.js) traite séparément les structures de listes reconnues. Le 4 octobre, le parcours — flèches/raccourcis vers Actions puis Nouveau chat, ouverture Actions avec Espace, présence de Page d’accueil du projet, fermeture Échap — reçoit une réponse positive avec nuance. Elle n’atteste ni activation de Nouveau chat ni navigation de l’utilisateur vers l’accueil.

L’organisation ultérieure « nom statique, actions natives, bouton distinct Afficher/Masquer les chats du projet » est une **préférence explicitement demandée**, avec déplacement visuel du chevron. Elle ne doit pas devenir une obligation universelle d’organisation. Le parcours des projets et des listes simples/imbriquées est accepté globalement le 4 octobre.

### Difficulté distincte au premier focus

Le blocage des flèches après Tab ou dépliage d’un projet est traité séparément en [4D](../Point%204%20-%20Sémantique%20et%20localisation/RAPPORT.md#4d--blocage-au-premier-passage-dans-les-projets-et-les-listes), avec les comparaisons physiques de listes focalisables. L’accès aux commandes décrit ici et ce changement de mode sont deux obstacles distincts.

## 3B — Réouverture de la barre et commande stable

**Problème.** La barre masquée ne propose pas de commande de réouverture accessible dans les parcours JAWS testés.

**Résultat attendu.** Barre réouvrable au clavier et continuité du point de navigation lors de sa bascule.

**Reproduction.** [Parcours 3B](reproductions/PROCEDURES.md#3b--réouverture-de-la-barre-latérale).

### Constat natif

Le 7 octobre, l’utilisateur confirme que la commande pour afficher la barre masquée est **inaccessible à la fois avec les flèches et avec Tab**, comme pendant les investigations initiales. Dans le rail examiné le 3 octobre, aucune commande disponible ne permettait de la réouvrir. Un cycle réduit → ouvert → réduit a été vérifié avec le raccourci natif Ctrl+Maj+S. Lors des constats du 4 octobre, la commande native change de situation entre barre ouverte et fermée, devient inerte à la fermeture et peut laisser le focus sur BODY.

L’attente fonctionnelle est de pouvoir réouvrir la barre et de conserver un point de navigation après bascule. La place précise d’une commande stable après Profil est un **choix d’organisation secondaire** demandé par l’utilisateur.

### Adaptation et réception

Dans [ui-accessibility.js](../../extension/ui-accessibility.js), une commande persistante relaie les mécanismes natifs. Sa réception est positive le 4 octobre. La commande conserve son identité et relaie l’ouverture/fermeture natives ; son emplacement précis est un choix d’organisation.

## 3C — Afficher plus des chats d’un projet

**Problème.** Afficher plus reprend au début des chats du projet au lieu de poursuivre près des éléments ajoutés.

**Résultat attendu.** Continuer la lecture au niveau du premier nouveau chat.

**Reproduction.** [Parcours 3C](reproductions/PROCEDURES.md#3c--afficher-plus-des-chats-dun-projet).

Le 7 octobre, l’utilisateur reconfirme qu’Afficher plus renvoie le focus au début des chats du projet, au lieu de laisser reprendre la lecture juste avant le premier nouveau chat. Le 4 octobre, il signalait aussi bruit et blocage des flèches. Dans le rendu alors examiné, cinq chats deviennent six ; le bouton est retiré pendant le chargement et le site focalise un DIV role=list tabindex=-1. Ce conteneur reste focalisé après la fin, alors que la dernière commande Actions ancienne est encore connectée et visible.

Le code public observé du composant de liste met en file une microtâche puis choisit le bouton du footer ou la liste. Cette cible native explique le déplacement vers la liste ; elle ne lit pas la décision interne du lecteur d’écran.

[sidebar-list-accessibility.js](../../extension/sidebar-list-accessibility.js) garde un point près du footer puis rejoint le premier nouveau lien, un nouveau bouton de pagination ou la dernière commande précédente selon le résultat. Les changements volontaires de focus/navigation annulent son suivi. Elle conserve l’action native de chargement. **Pagination reçue le 4 octobre.** Résultat attendu en amont : continuer près des nouveaux éléments sans saut au début ni perte du parcours de lecture.

## 3D — Retour après Échap dans les menus et panneaux

**Problème.** La fermeture de menus et panneaux peut faire reprendre la lecture en haut de page ; le nombre d’Échap varie selon la famille et le mode initial.

**Résultat attendu.** Reprendre au déclencheur après fermeture effective, en distinguant changement de mode et fermeture.

**Reproduction.** [Parcours 3D](reproductions/PROCEDURES.md#3d--fermeture-des-menus-et-panneaux).

### Symptôme et familles

Fermer un menu sans choisir d’action ramène le point de lecture JAWS au sommet. Le 7 octobre, l’utilisateur précise que **Profil et les menus Actions des chats nécessitent deux Échap**, tandis qu’un seul ferme **Filtrer, Options de la barre latérale du projet et Options de la barre latérale du chat**. Ces familles doivent rester distinctes : on ne généralise ni le nombre d’appuis ni la cause. Les menus de projets, paramètres et autres panneaux liés à un déclencheur figurent également dans les observations historiques, sans nouveau nombre d’appuis établi pour chacun. L’utilisateur reproduit le problème sans extension ; Chrome constatait notamment BODY après fermeture Profil/chat. Cette observation ciblée ne prouve pas le même chemin DOM pour toutes les familles.

L’utilisateur rapproche les deux Échap du passage inopportun en mode formulaire constaté dans les listes. C’est une corrélation humaine, pas une causalité interne JAWS démontrée. Il observe aussi le remplacement des annonces lien/bouton pour le chat dont il vient d’activer Actions ; ce contexte complète le [Point 4A](../Point%204%20-%20S%C3%A9mantique%20et%20localisation/RAPPORT.md#4a---sortable--et--draggable--à-la-place-de-rôles-informatifs).

### Focus DOM et position virtuelle

Des traces ultérieures donnent un résultat plus précis : le bouton d’origine retrouve le focus DOM et le garde jusqu’à 500 ms, mais JAWS peut reprendre au sommet. Une répétition Profil réussit sans modification. Aucun masque aria-hidden ou inert n’a été trouvé dans ce dernier parcours. La désynchronisation virtuelle reste d’attribution ouverte entre contenu, navigateur et lecteur d’écran ; aucune temporisation ne constitue une mesure de fin de traitement JAWS.

### Illustration du contournement et réception

Le retour dès la microtâche constatant le retrait du panneau obtient une réception positive sur Profil puis sur les menus le 4 octobre. Explorer reçoit ensuite son adaptation distincte, décrite en 3E. [sidebar-menu-focus.js](../../extension/sidebar-menu-focus.js) conserve fermeture Échap, association au bouton précis et intentions de l’utilisateur. L’attendu est de retrouver ce bouton et le point de lecture correspondant, sans déplacement volontaire concurrent annulé.

## 3E — Explorer : entrée, fermeture et propriété popup

**Problème.** Explorer n’a pas la même cible d’entrée selon le geste ; après Échap, une flèche peut rouvrir le panneau au lieu de poursuivre la lecture.

**Résultat attendu.** Entrée et sortie cohérentes, reprise au déclencheur et ouverture volontaire par flèche conservée.

**Reproduction.** [Parcours 3E](reproductions/PROCEDURES.md#3e--explorer).

Explorer est un popover role=dialog non modal avec groupes de destinations et commandes d’épinglage. **aria-haspopup=dialog est valide pour ce panneau**. Les groupes et l’absence de modalité ne sont pas, à eux seuls, une cause de défaut démontrée.

Les observations des 4–5 octobre distinguent l’entrée initiale par activation ordinaire, qui focalise le conteneur, de l’ouverture par flèche, qui focalise une destination. Dans les traces, un premier Échap reçu par le DOM ferme réellement le panneau ; une Flèche bas suivante peut le **rouvrir nativement**. Il ne s’agit pas toujours de deux Échap requis par le site pour une seule fermeture, ni d’un panneau disparu que JAWS continuerait seulement à lire.

[explorer-accessibility.js](../../extension/explorer-accessibility.js) aligne l’entrée ordinaire vers la première destination ; ce parcours est reçu sur une page nouvellement chargée. Le parcours borné au panneau est jugé attendu ; l’ouverture volontaire par flèche reste préservée. Une comparaison physique montre que le seul retour du focus DOM ne suffit pas à assurer la reprise de lecture.

Pour ce déclencheur reconnu, [sidebar-menu-focus.js](../../extension/sidebar-menu-focus.js) retire la propriété popup juste avant son retour de focus, puis la restaure à la prochaine ouverture/interaction pertinente. Rôle button, aria-expanded, callbacks et flèches restent natifs. Cette adaptation reçoit un résultat positif avec nuance ; **sa distribution intégrée est reçue le 5 octobre**, également après désépinglage par l’utilisateur. Cette adaptation de compatibilité ne prouve pas que l’attribut natif valide était erroné ni quelle décision interne JAWS provoquait le phénomène.

## 3F — Annuler un partage ou une édition : revenir au même message

**Problème.** Annuler Partager ou Modifier un message fait reprendre la lecture en haut de page.

**Résultat attendu.** Revenir au bouton du même message après fermeture effective.

**Reproduction.** [Parcours 3F](reproductions/PROCEDURES.md#3f--annuler-un-partage-ou-une-édition).

Le retour natif du 7 octobre reconfirme les remontées au haut de la page après Partager, Actions, Modifier et les autres boutons de chat décrites avant les adaptations locales. Le 5 octobre, après annulation de Partager sous une réponse, Partager le prompt envoyé ou Modifier le message, l’utilisateur retrouvait déjà la lecture au sommet. Avant le nouveau module, la fermeture native était mesurée vers BODY. Les partages de messages ne possèdent pas tous l’association ARIA utilisée pour les menus ; l’édition remplace le bouton par un formulaire intégré puis recrée un bouton.

Le module [message-action-focus.js](../../extension/message-action-focus.js) associe l’activation à une surface nouvellement ouverte et revient au bouton du **même message** après fermeture effective. Le partage reprend le bouton d’origine ; l’édition peut reprendre son unique bouton recréé dans le même objet de message.

**Les trois retours sont reçus le 5 octobre**, avec une réponse positive globale nuancée. Les conditions de ces retours et la portée de la trace complémentaire sont détaillées dans les preuves.

### Édition : distinguer mode et fermeture

Avec le focus dans le champ, JAWS est initialement en mode formulaire. Un premier Échap peut revenir au curseur PC virtuel et laisser l’édition ouverte ; le deuxième ferme. **Le saut natif concerne la fermeture effective.** Si le curseur PC virtuel est déjà actif, un seul Échap ferme l’édition. La transmission DOM du premier appui de changement de mode n’a pas été établie et n’est pas supposée. L’extension ne consomme pas Échap et ne change pas les modes JAWS.

## 3G — Évaluer la réponse : rôle de menu et reprise après Échap

**Problème.** Évaluer la réponse est annoncé comme un simple bouton ; après Échap, la lecture reprend en haut de page.

**Résultat attendu.** Fonction de menu exposée sur le bouton et reprise au même message.

**Reproduction.** [Parcours 3G](reproductions/PROCEDURES.md#3g--évaluer-la-réponse).

Le 7 octobre, l’utilisateur ne trouve plus « Réagir » : le contrôle courant est **« Évaluer la réponse »**, annoncé comme **« bouton »** alors qu’il ouvre un menu. **Un seul Échap ferme ce menu puis la lecture reprend au haut de la page.** L’attendu est d’annoncer sa fonction de menu et de retrouver le contrôle du même message à la fermeture. Le relevé structurel ci-dessous précise la sémantique native ; le démonstrateur fournit une adaptation ciblée.

Le contrôle étudié est « Évaluer la réponse » ; les autres familles de menus gardent leurs observations propres.

Le [relevé natif](preuves/3G-evaluation-menu-natif-2026-10-07.json) confirme que les propriétés de menu `aria-haspopup` et `aria-expanded` sont placées sur un SPAN entourant le bouton ; ce dernier ne les porte pas. Le menu natif contient Bonne réponse et Mauvaise réponse. Dans l’inspection, Échap ferme puis rend le focus DOM au bouton ; le retour utilisateur décrit une reprise du curseur de lecture au sommet. Ces positions sont distinctes. Le [schéma WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) place la sémantique du menu sur le contrôle bouton.

Le module [evaluation-menu-accessibility.js](../../extension/evaluation-menu-accessibility.js) reporte les propriétés natives sur le bouton existant et vérifie sa relation au menu. Il conserve ses enfants et callbacks et ne consomme pas Échap. L’association permet au contrôleur de retour existant d’intervenir, avec garde sur l’identité du message. La [fixture locale](reproductions/evaluation-menu.html) vérifie ces invariants et leur restauration.

La validation du mécanisme comprend 35 tests Node de cette sémantique, 36 du contrôleur de retour et 11 contrôles Chromium de la fixture. Elle couvre notamment les relations ambiguës, les attributs étrangers, la restauration à l’arrêt et le recyclage d’un tour vers un autre message. Ces résultats établissent le fonctionnement DOM du contournement ; ils ne constituent pas une mesure de parole ou de position du curseur JAWS.

Le [relevé passif du bouton adapté](preuves/3G-evaluation-menu-adapte-2026-10-07.json), le 7 octobre, confirme `aria-haspopup=menu` et `aria-expanded=false` sur les neuf boutons Évaluer présents. Le nœud accessible ciblé conserve son nom et expose `hasPopup=menu`, avec son état fermé. Cette inspection confirme la structure adaptée sans mesurer la parole JAWS ni provoquer d’ouverture ou de fermeture du menu.

## Demande d’examen

Examiner les chemins d’ouverture/fermeture et la continuité du point de lecture, en comparant le comportement natif avec les adaptations ciblées. Les reproductions synthétiques permettent d’isoler certaines conditions ; les essais du site doivent aussi vérifier l’ordre des événements accessibles et le parcours réel du lecteur d’écran. Préserver les commandes natives, les ouvertures volontaires par flèches, la pagination et les changements de focus voulus.

L’examen porte sur les obstacles natifs et les mécanismes d’interopérabilité décrits. Les parcours adaptés reçus conservent leur périmètre ; le focus DOM seul n’établit pas la position de lecture JAWS.

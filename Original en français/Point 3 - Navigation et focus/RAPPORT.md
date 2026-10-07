# Point 3 — Navigation et retour de focus sur chatgpt.com

Les heures locales citées dans ce document sont en heure de Bruxelles (Europe/Brussels, UTC+02:00 pour les dates de septembre et début octobre 2026). Les horodatages techniques conservent leur fuseau explicite ; le suffixe ISO `Z` désigne UTC.

Ce groupe rassemble les difficultés de navigation dans les projets, la barre latérale et ses panneaux, puis le retour de lecture après annulation des actions d’un message. L’objectif est de garder l’accès aux commandes natives et de reprendre la lecture à l’endroit quitté, sans détour obligatoire par Tab ni retour au sommet de la page.

**Observations historiques : 3–5 octobre 2026 ; retours humains natifs : 7 octobre 2026, de 19 h 18 à 22 h 40, Bruxelles.** Les mécanismes décrivent les rendus examinés à ces dates.

Le relevé technique du 3 octobre identifie Windows 10 Home 22H2, build 19045.6466, et Chrome 154.0.8037.93. La version de JAWS 2021 utilisée reste inchangée. Le 7 octobre, l’utilisateur indique les mêmes résultats avec Edge et JAWS 2025 d’après son expérience, ainsi que dans un nouvel essai avec Opera. Ces retours lui sont attribués ; ils ne sont pas des essais mesurés par l’agent. Les [repères d’environnement](../ENVIRONNEMENT.md) centralisent cette provenance. La date d’apparition du changement d’interface, le 25 septembre à 23 h 16 à Bruxelles, vient de son récit, pas d’un horodatage de déploiement.

L’[extension locale commune](../../extension), version 4.1.0, conserve les adaptations reçues dans leurs versions historiques respectives, indiquées ci-dessous. Elles ne signifient pas que chatgpt.com a été corrigé par OpenAI. Les validations des parcours adaptés restent acquises ; les procédures sont fournies pour permettre leur examen par les équipes.

## Repères pour lire les preuves

Un retour utilisateur décrit la parole et le parcours effectivement ressentis. Le DOM indique où se trouve le focus et quels éléments existent. L’arbre d’accessibilité de Chrome indique les rôles, noms et propriétés exposés. Les sources publiques expliquent certains chemins natifs. Une fixture synthétique vérifie un mécanisme contrôlé. Aucun de ces niveaux ne remplace les autres : un bouton focalisé dans le DOM peut ne pas correspondre au point de lecture du curseur virtuel JAWS.

Les [preuves expliquées sur place](preuves/OBSERVATIONS_ET_RECEPTIONS.md) distinguent constats natifs, symptômes d’interopérabilité, préférences et erreurs de l’adaptation. Les [reproductions et leurs limites](reproductions/PROCEDURES.md) décrivent les gestes sur le site et les pages synthétiques jointes. Aucune pièce ne contient de conversation, brouillon, projet personnel, cookie ou jeton. Les libellés des commandes du produit et les identifiants fictifs des fixtures sont conservés.

## 3A — Commandes de projets accessibles par les flèches

### Problème et résultat attendu

Le retour natif du 7 octobre confirme que **Actions et Nouveau chat d’un projet restent accessibles uniquement par Tab et inaccessibles dans le parcours par flèches ou raccourcis de navigation JAWS**. L’utilisateur confirme que Tab les atteint aussi avec l’extension désactivée. Pour son parcours de lecture habituel, ces commandes apparaissent donc inaccessibles. L’attendu est de les rendre également accessibles par ce parcours sans imposer Tab.

Le relevé du 3 octobre montre une ligne de projet de rôle button et tabindex=0, contenant un premier DIV avec le nom et le chevron, puis des commandes natives. Actions possède un bouton HTML avec aria-haspopup=menu, non ignoré dans l’arbre accessible. Le menu contient Page d’accueil du projet. Cette commande native a été retrouvée ; sa navigation réelle a été vérifiée séparément dans un onglet de diagnostic. Aucun nouveau chat ou projet n’a été créé pour ces constats.

### Adaptation et réception

La séparation sémantique initiale conserve les commandes, gestionnaires et nœuds natifs. Le 4 octobre, le parcours proposé en 0.1.6 — flèches/raccourcis vers Actions puis Nouveau chat, ouverture Actions avec Espace, présence de Page d’accueil du projet, fermeture Échap — reçoit une réponse positive avec nuance. Elle n’atteste ni activation de Nouveau chat ni navigation de l’utilisateur vers l’accueil.

L’organisation ultérieure « nom statique, actions natives, bouton distinct Afficher/Masquer les chats du projet » est une **préférence explicitement demandée**, avec déplacement visuel du chevron. Elle ne doit pas devenir une obligation universelle d’organisation. Le parcours des projets et des listes simples/imbriquées est accepté globalement en 3.2.3 le 4 octobre.

### Interopérabilité du premier focus

Une difficulté distincte apparaît au premier Tab dans une liste ou lors d’une première activation. Le 7 octobre, l’utilisateur reconfirme le passage ressenti en mode formulaire, avec bruit et blocage des flèches, lors de l’affichage ou du masquage des chats d’un projet et après Tab avant ou dans Récents. Échap ou la commande manuelle de retour au curseur PC rétablit le parcours. La lecture au curseur virtuel seule ne le déclenche pas. Le focus Chrome reste sur un lien ou bouton dans les relevés historiques ; aucun état interne JAWS n’a été mesuré par l’agent et sa décision n’est pas déduite du bruit.

Les comparaisons physiques A/B (liens) et C/D (boutons) du 4 octobre reproduisent le phénomène uniquement lorsque le parent role=list possède tabindex=-1, sans extension ni glissement natif. Cette focalisabilité suffit **dans ces deux structures synthétiques**. Les adaptations de listes puis de lignes imbriquées sont reçues en 3.2.3. Elles n’établissent ni une violation générale d’ARIA ni toutes les décisions internes de JAWS.

## 3B — Réouverture de la barre et commande stable

### Constat natif

Le 7 octobre, l’utilisateur confirme que la commande pour afficher la barre masquée est **inaccessible à la fois avec les flèches et avec Tab**, comme pendant les investigations initiales. Dans le rail examiné le 3 octobre, aucune commande disponible ne permettait de la réouvrir. Un cycle réduit → ouvert → réduit a été vérifié avec le raccourci natif Ctrl+Maj+S. Lors des constats du 4 octobre, la commande native change de situation entre barre ouverte et fermée, devient inerte à la fermeture et peut laisser le focus sur BODY.

L’attente fonctionnelle est de pouvoir réouvrir la barre et de conserver un point de navigation après bascule. La place précise d’une commande stable après Profil est un **choix d’organisation secondaire** demandé par l’utilisateur.

### Adaptation et réception

Une commande persistante relaie les mécanismes natifs. Sa réception est positive en 3.3.1 le 4 octobre. L’ancien proxy local changeait lui aussi de position et d’identité : cette instabilité était une erreur de l’adaptation, distincte de la perte native de focus. L’ancien signalement de doublons au-dessus de la page avait été retiré du périmètre par l’utilisateur ; il ne doit pas être présenté comme toujours actif.

## 3C — Afficher plus des chats d’un projet

Le 7 octobre, l’utilisateur reconfirme qu’Afficher plus renvoie le focus au début des chats du projet, au lieu de laisser reprendre la lecture juste avant le premier nouveau chat. Le 4 octobre, il signalait aussi bruit et blocage des flèches. Dans le rendu alors examiné, cinq chats deviennent six ; le bouton est retiré pendant le chargement et le site focalise un DIV role=list tabindex=-1. Ce conteneur reste focalisé après la fin, alors que la dernière commande Actions ancienne est encore connectée et visible.

Le code public observé du composant de liste met en file une microtâche puis choisit le bouton du footer ou la liste. Cette cible native explique le déplacement vers la liste ; elle ne lit pas la décision interne du lecteur d’écran.

L’adaptation garde un point près du footer puis rejoint le premier nouveau lien, un nouveau bouton de pagination ou la dernière commande précédente selon le résultat. Les changements volontaires de focus/navigation annulent son suivi. Elle ne crée pas de chat et conserve l’action native de chargement. **Pagination reçue le 4 octobre en 3.3.1.** Résultat attendu en amont : continuer près des nouveaux éléments sans saut au début ni perte du parcours de lecture.

## 3D — Retour après Échap dans les menus et panneaux

### Symptôme et familles

Fermer un menu sans choisir d’action ramène le point de lecture JAWS au sommet. Le 7 octobre, l’utilisateur précise que **Profil et les menus Actions des chats nécessitent deux Échap**, tandis qu’un seul ferme **Filtrer, Options de la barre latérale du projet et Options de la barre latérale du chat**. Ces familles doivent rester distinctes : on ne généralise ni le nombre d’appuis ni la cause. Les menus de projets, paramètres et autres panneaux liés à un déclencheur figurent également dans les observations historiques, sans nouveau nombre d’appuis établi pour chacun. L’utilisateur reproduit le problème sans extension ; Chrome constatait notamment BODY après fermeture Profil/chat. Cette observation ciblée ne prouve pas le même chemin DOM pour toutes les familles.

L’utilisateur rapproche les deux Échap du passage inopportun en mode formulaire constaté dans les listes. C’est une corrélation humaine, pas une causalité interne JAWS démontrée. Il observe aussi le remplacement des annonces lien/bouton pour le chat dont il vient d’activer Actions ; ce contexte complète le [Point 4A](../Point%204%20-%20S%C3%A9mantique%20et%20localisation/RAPPORT.md#4a--sortable-et-draggable-à-la-place-de-rôles-informatifs).

### Focus DOM et position virtuelle

Des traces ultérieures donnent un résultat plus précis : le bouton d’origine retrouve le focus DOM et le garde jusqu’à 500 ms, mais JAWS peut reprendre au sommet. Une répétition Profil réussit sans modification. Aucun masque aria-hidden ou inert n’a été trouvé dans ce dernier parcours. La désynchronisation virtuelle reste d’attribution ouverte entre contenu, navigateur et lecteur d’écran ; aucune temporisation ne constitue une mesure de fin de traitement JAWS.

### Erreurs locales puis réception

Les premières adaptations excluaient certains popovers dialog et assimilaient data-state=closed d’un bouton déclencheur à un élément caché. Elles revenaient trop tard ou interrompaient trop tôt leur suivi. Ces erreurs locales sont documentées séparément du défaut natif.

Le retour dès la microtâche constatant le retrait du panneau obtient une réception positive sur Profil puis sur les menus en 3.3.2 le 4 octobre. Explorer reçoit ensuite son adaptation distincte en 3.4.0, décrite en 3E. Le module conserve fermeture Échap, association au bouton précis et intentions de l’utilisateur. L’attendu est de retrouver ce bouton et le point de lecture correspondant, sans déplacement volontaire concurrent annulé.

## 3E — Explorer : entrée, fermeture et propriété popup

Explorer est un popover role=dialog non modal avec groupes de destinations et commandes d’épinglage. **aria-haspopup=dialog est valide pour ce panneau**. Les groupes et l’absence de modalité ne sont pas, à eux seuls, une cause de défaut démontrée.

Les observations des 4–5 octobre distinguent l’entrée initiale par activation ordinaire, qui focalise le conteneur, de l’ouverture par flèche, qui focalise une destination. Dans les traces, un premier Échap reçu par le DOM ferme réellement le panneau ; une Flèche bas suivante peut le **rouvrir nativement**. Il ne s’agit pas toujours de deux Échap requis par le site pour une seule fermeture, ni d’un panneau disparu que JAWS continuerait seulement à lire.

L’alignement de l’entrée ordinaire vers la première destination est reçu sur document frais et intégré en 3.3.3. Le parcours borné au panneau est jugé attendu ; l’ouverture volontaire par flèche reste préservée. Un retour de focus après le lifecycle natif est ensuite exécuté techniquement mais n’améliore pas le symptôme : cette variante est arrêtée et non intégrée.

Une comparaison ciblée retire seulement la propriété popup du déclencheur fermé juste avant son retour de focus, puis la restaure à la prochaine ouverture/interaction pertinente. Rôle button, aria-expanded, callbacks et flèches restent natifs. Le prototype reçoit un résultat positif avec nuance ; **la distribution 3.4.0 est reçue le 5 octobre**, également après désépinglage par l’utilisateur. Cette adaptation de compatibilité ne prouve pas que l’attribut natif valide était erroné ni quelle décision interne JAWS provoquait le phénomène.

## 3F — Annuler un partage ou une édition : revenir au même message

Le retour natif du 7 octobre reconfirme les remontées au haut de la page après Partager, Actions, Modifier et les autres boutons de chat décrites avant les adaptations locales. Le 5 octobre, après annulation de Partager sous une réponse, Partager le prompt envoyé ou Modifier le message, l’utilisateur retrouvait déjà la lecture au sommet. Avant le nouveau module, la fermeture native était mesurée vers BODY. Les partages de messages ne possèdent pas tous l’association ARIA utilisée pour les menus ; l’édition remplace le bouton par un formulaire intégré puis recrée un bouton.

L’adaptation 3.6.0 associe l’activation à une surface nouvellement ouverte et revient au bouton du **même message** après fermeture effective. Le partage reprend le bouton d’origine ; l’édition peut reprendre son unique bouton recréé dans le même objet de message. Aucun message n’est modifié/envoyé et aucun partage n’est publié pour ces essais.

**Les trois retours sont reçus le 5 octobre en 3.6.0**, avec une réponse positive globale nuancée. Les conditions de ces retours et la portée de la trace complémentaire sont détaillées dans les preuves.

### Édition : distinguer mode et fermeture

Avec le focus dans le champ, JAWS est initialement en mode formulaire. Un premier Échap peut revenir au curseur PC virtuel et laisser l’édition ouverte ; le deuxième ferme. **Le saut natif concerne la fermeture effective.** Si le curseur PC virtuel est déjà actif, un seul Échap ferme l’édition. La transmission DOM du premier appui de changement de mode n’a pas été établie et n’est pas supposée. L’extension ne consomme pas Échap et ne change pas les modes JAWS.

## 3G — Évaluer la réponse : rôle de menu et reprise après Échap

Le 7 octobre, l’utilisateur ne trouve plus « Réagir » : le contrôle courant est **« Évaluer la réponse »**, annoncé comme **« bouton »** alors qu’il ouvre un menu. **Un seul Échap ferme ce menu puis la lecture reprend au haut de la page.** L’attendu est d’annoncer sa fonction de menu et de retrouver le contrôle du même message à la fermeture. Le relevé structurel ci-dessous précise la sémantique native ; le démonstrateur fournit une adaptation ciblée.

Le signalement du 5 octobre « Réagir, deux Échap » est conservé comme limite historique d’un ancien libellé, absent lors des dernières réceptions. Il ne décrit pas le contrôle courant. On ne transpose pas les causes possibles de l’édition, d’Explorer ou des menus Actions à Évaluer la réponse.

Le [relevé natif](preuves/3G-evaluation-menu-natif-2026-10-07.json) confirme que les propriétés de menu `aria-haspopup` et `aria-expanded` sont placées sur un SPAN entourant le bouton ; ce dernier ne les porte pas. Le menu natif contient Bonne réponse et Mauvaise réponse. Dans l’inspection, Échap ferme puis rend le focus DOM au bouton ; le retour utilisateur décrit une reprise du curseur de lecture au sommet. Ces positions sont distinctes. Le [schéma WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) place la sémantique du menu sur le contrôle bouton.

Le module [evaluation-menu-accessibility.js](../../extension/evaluation-menu-accessibility.js) reporte les propriétés natives sur le bouton existant et vérifie sa relation au menu. Il conserve ses enfants et callbacks et ne consomme pas Échap. L’association permet au contrôleur de retour existant d’intervenir, avec garde sur l’identité du message. La [fixture locale](reproductions/evaluation-menu.html) vérifie ces invariants et leur restauration sans envoyer d’évaluation.

La validation 3.7.0 comprend 35 tests Node de cette sémantique, 36 du contrôleur de retour et 11 contrôles Chromium de la fixture. Elle couvre notamment les relations ambiguës, les attributs étrangers, la restauration à l’arrêt et le recyclage d’un tour vers un autre message. Ces résultats établissent le fonctionnement DOM du contournement ; ils ne constituent pas une mesure de parole ou de position du curseur JAWS.

Le [relevé passif du bouton adapté](preuves/3G-evaluation-menu-adapte-2026-10-07.json), le 7 octobre, confirme `aria-haspopup=menu` et `aria-expanded=false` sur les neuf boutons Évaluer présents. Le nœud accessible ciblé conserve son nom et expose `hasPopup=menu`, avec son état fermé. Cette inspection confirme la structure adaptée sans mesurer la parole JAWS ni provoquer d’ouverture ou de fermeture du menu.

## Demande d’examen

Examiner les chemins d’ouverture/fermeture et la continuité du point de lecture, en comparant le comportement natif avec les adaptations ciblées. Les reproductions synthétiques permettent d’isoler certaines conditions ; les essais du site doivent aussi vérifier l’ordre des événements accessibles et le parcours réel du lecteur d’écran. Préserver les commandes natives, les ouvertures volontaires par flèches, la pagination et les changements de focus voulus.

Les résultats acquis ne sont pas des mesures universelles. Le rôle annoncé et le retour de focus d’Évaluer la réponse, ainsi que la cause interne de plusieurs phénomènes d’interopérabilité, demandent examen. Toute reproduction ultérieure doit dater son environnement et son résultat sans remplacer rétroactivement les observations historiques.

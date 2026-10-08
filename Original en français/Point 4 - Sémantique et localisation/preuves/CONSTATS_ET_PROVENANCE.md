# Preuves sélectionnées du Point 4

Les heures locales citées dans ce document sont en heure de Bruxelles (Europe/Brussels, UTC+02:00 pour les dates de septembre et début octobre 2026). Les horodatages techniques conservent leur fuseau explicite ; le suffixe ISO `Z` désigne UTC.

Cette pièce est une **synthèse dérivée**, préparée le 6 octobre 2026 puis actualisée le 7 octobre à partir des notes de diagnostic, validations et réceptions historiques, du signalement initial, d’une actualisation passive du 6 octobre et du nouveau retour humain natif. Elle ne remplace pas un journal brut et ne prétend pas être une nouvelle capture. Les pièces privées ne sont pas liées depuis ce livrable. Aucun nom de projet réel, identifiant, chemin personnel, adresse de compte ou lien de conversation n’est conservé.

## 4A — Structures et résultats

Relevé DOM du **4 octobre 2026 à 01:46:16.351, Bruxelles** : trois `BUTTON role=button` et cinq `DIV role=listitem`, parents de liens, portent `aria-roledescription=sortable`. Valeurs dans les props natives et restauration après arrêt du correctif : provenance native établie. Avant/après : huit valeurs puis zéro ; AX des trois sections : rôle button sans description substitutive après correction. Rôles, instructions de déplacement et callbacks conservés. Tests historiques : 179 Node, dont 11 sur les descriptions ; 15 contrôles Chromium de descriptions à cette étape.

Inspection ultérieure : le lien actif de Récents reste `A` ; son parent `listitem` porte `aria-roledescription=draggable` et `aria-describedby`. Le code natif ajoute les métadonnées de déplacement au premier focus de la ligne. Repères historiques du bundle public, **offsets UTF-16, pas octets** : `hA`, état initial 5191253, capture de focus 5191697 ; `px` 5151889 ; attributs de `useDraggable` 58206. Ces identifiants minifiés décrivent le bundle alors inspecté et ne sont pas des API stables.

Extrait structurel normalisé, noms et identifiants réels omis ; **ce n’est pas une copie littérale du code React** :

```html
<button role="button" tabindex="0" aria-roledescription="sortable">Section</button>
<div role="listitem" aria-roledescription="draggable" aria-describedby="instructions">
  <a href="/c/exemple-synthetique">Conversation synthétique</a>
</div>
```

L’extrait essentiel du contournement est consultable dans [la source commune](../../../extension/sidebar-sortable-accessibility.js) : la fonction `suppressedValue` reconnaît exactement `sortable`, ou `draggable` lorsque `chatRole` confirme une conversation. Ce code est celui de l’extension, **pas un extrait natif du site**.

Au jalon 3.2.3 : 227 tests Node, dont 18 sur les descriptions ; 26 contrôles Chromium de descriptions et huit contrôles conjoints. La réception globale accepte les rôles informatifs. En 3.3.0, les scripts automatiques passent à `document_start` ; le retour 3.3.1 est positif. Aucun délai précis de mise à disposition des annonces n’est mesuré.

## 4B — État d’aperçu et navigation

Diagnostic du 4 octobre, version 3.3.0 : le composant public `oB` lie l’état expanded à l’aperçu secondaire ; sa sélection navigue. Après passage à Espace, destination courante vraie, expanded=false. Aucun contrôle d’expansion de cet aperçu constaté dans ce rendu. Le fragment original intégral du composant n’est pas joint ; ce mécanisme est une paraphrase technique du diagnostic conservé, **pas une citation de code native inventée**.

Le [module d’interface commun](../../../extension/ui-accessibility.js) conserve les quatre couples démontrés et laisse un widget inconnu intact. Depuis 3.3.3, les épingles reconnues sans vrai contrôle/popup associé sont couvertes dynamiquement. Aucun épinglage par l’agent ; ordre et affichage natifs conservés. Les états des destinations déjà adaptées sont reçus historiquement ; les boutons épinglés sont acceptés avec nuance le 5 octobre. La réception intégrée 3.4.0 conserve ces acquis sans nouvel essai exhaustif.

## 4C — Groupes de chats

Diagnostic du 3 octobre : groupes supplémentaires sur les lignes natives de chats ordinaires. Retour ultérieur : même difficulté dans les projets, initialement omise par l’adaptation. La fixture d’interface V2 couvre ensuite ces chats parmi 16 contrôles Chromium. La réception globale 3.2.3 accepte les points sans réserve et le parcours ordinaire, sans enregistrement verbatim distinct d’une annonce pour chaque type de ligne.

Structure normalisée, avec route synthétique ; **ceci illustre les attributs relevés, pas la totalité du DOM privé** :

```html
<div role="listitem">
  <div class="sidebar-item" role="group">
    <a href="/g/projet-synthetique/c/chat-synthetique">Conversation synthétique</a>
    <button aria-label="Actions du chat"></button>
  </div>
</div>
```

Le contournement `flattenChatGroups` vérifie la ligne, le rôle natif group, un lien de conversation et le bouton Actions avant de retirer rôle et références de nom du seul wrapper. Il conserve le lien, le bouton et la liste. Voir [la source commune](../../../extension/ui-accessibility.js).

## 4D — Reproductions physiques et bornes

Le 4 octobre, version JAWS 2021 déclarée : A normal, B reproduit exactement le bruit et le blocage au premier passage ; répétition sans recharge normale. Différence : parent de liste `tabindex=-1` uniquement dans B. Aucun code de déplacement ni extension dans cette reproduction. La trace de 18 événements reçoit le focus sur les liens, pas sur la liste ; elle ne date pas le son et ne contient pas d’événement de flèche. Le retour utilisateur et la trace ne doivent pas être confondus.

Comparaison C/D : C normal ; D bruit et blocage initiaux, répétition normale. Différence pertinente identique sur le parent ; mêmes boutons HTML, gardes et relais synthétiques. Trace passive : 37 entrées, flèches reçues au DOM sur button-d. Le retour Alt+Tab de D reproduit un blocage que l’utilisateur distingue du site. Aucun mode interne mesuré. Les [deux pages locales](../reproductions/PROCEDURES.md) sont des copies d’exemples synthétiques historiques et non une capture du compte.

Le parent focalisable est causal dans ces structures. Le symptôme initial du projet sur le site ne dispose pas d’une attribution exclusive ni d’une décision interne JAWS connue. L’adaptation 0.1.9 reçoit les parcours simples ; le complément 3.2.3 cible aussi les chats imbriqués, avec une réception globale de la navigation ordinaire. Le module [sidebar-list-accessibility.js](../../../extension/sidebar-list-accessibility.js) conserve les focus directs et la pagination natifs en traitant les tabindex des structures reconnues au repos.

## 4E — Localisation

Le 3 octobre, galerie : présence native de `Pin project`, menu latéral déjà français. Après correction 0.1.4 : six boutons français, zéro bouton anglais ; zéro action d’épinglage exécutée. La traduction de `Unpin project` est présente dans le code, mais le compteur précédent ne constitue pas une réception physique exhaustive de ce pendant.

Extrait littéral du **code de l’extension**, fonction de localisation du module projet ; il ne doit pas être présenté comme code natif OpenAI :

```js
const translation = label === "Pin project" ? "Épingler le projet" : label === "Unpin project" ? "Désépingler le projet" : null;
```

Source : [project-accessibility.js](../../../extension/project-accessibility.js). Réception d’ensemble historique ; les observations humaines actuelles sont documentées séparément ci-dessous.

## Actualisation passive du 6 octobre

**23 h 48, Europe/Brussels, UTC+02:00.** Relevé réalisé dans Edge, sans extension, conversation partagée. Trois éléments `BUTTON`, rôle `button`, `aria-roledescription=sortable`, `tabindex=0`. Accueil, Espace, Planifié et Plugins exposés comme reduced/collapsed dans l’arbre d’accessibilité. Le rendu comprend aussi un h4 « Dernière réponse », traité dans un autre point du dossier.

Ce résumé ne conserve ni URL ni identifiant de discussion. Le relevé haute entropie indique Edge 154.0.4258.62 et Chromium 154.0.8037.98. Aucun clic, aucune parole JAWS ni nouvel essai de groupes, projets ou galerie n’est établi par ces observations. Elles actualisent seulement 4A et 4B.

## Retour humain natif du 7 octobre

Source directe : réponses détaillées de l’utilisateur aux compléments de réception, et précisions ultérieures. Le [JSON dérivé](retour-humain-natif-2026-10-07.json) reprend uniquement les faits utiles du produit ; ce n’est pas une trace DOM ni un enregistrement audio. Plage **19 h 18–22 h 40**, Bruxelles, fin déclarée par l’utilisateur. La version de JAWS 2021 reste inchangée. L’utilisateur rapporte les mêmes résultats d’après son expérience Edge/JAWS 2025 et dans un nouvel essai Opera ; aucune mesure physique de l’agent ne leur est substituée.

- **4A :** sortable persiste sur Épinglés, Projets et Récents ; « sortable étendu » pour Projets, « sortable réduit menu » pour les actions imbriquées, et substitution de lien/bouton dans les chats des projets. Après Tab sur le premier chat de Récents, sortie du mode formulaire puis retour aux flèches, draggable remplace les annonces lien/bouton. L’utilisateur corrèle aussi le remplacement à l’activation d’Actions du chat. Le code historique d’initialisation au premier focus et cette corrélation actuelle restent distincts.
- **4B :** les destinations restent annoncées « réduites », avec « page courante » sur la destination active. Les commandes Projets/Épinglés/Récents déplient réellement leurs listes ; leur état expanded n’est pas assimilé au défaut des destinations de navigation.
- **4C :** groupes reconfirmés tels que décrits dans le signalement initial. Transcription autorisée et anonymisée : Début du groupe [Nom du chat] ; [Nom du chat] ; Actions du chat ; Épingler le chat ; Fin du groupe ; puis le groupe suivant. Deux lignes supplémentaires s’ajoutent par groupe. Aucun rôle prononcé non fourni n’est inventé.
- **4D :** afficher/masquer les chats d’un projet et Tab avant ou dans Récents provoquent le bruit, le passage ressenti en mode formulaire et le blocage des flèches ; Échap ou retour manuel au curseur PC permet la reprise. Corrélation humaine ; cause interne JAWS non mesurée.
- **4E :** traduction manquante toujours observée dans la galerie pour les libellés d’épinglage. Le menu Actions du projet dans la barre latérale, où se trouve l’épinglage, reste atteint seulement par Tab, tout comme Nouveau chat. Le menu latéral déjà français n’est pas présenté comme un cas Pin/Unpin anglais.

Le signalement initial à l’assistance est une source textuelle autorisée pour le passage sur les groupes, reconfirmé le 7 octobre. Seul ce parcours est repris ; les coordonnées personnelles et informations de compte de cette source ne sont pas intégrées au livrable. Les preuves DOM/AX et fixtures historiques gardent leurs dates, compteurs et limites.

## 4F — Navigation Web, nom de carte et dialogue

Les observations utiles proviennent du retour JAWS sur les références (« Bouton de menu réduit dialogue »), du retour du 8 octobre sur le seul « Ouvrir [nom du lien hypertexte] » dans la carte, et des inspections DOM/AX et activations réversibles du 8 octobre 2026, heure de Bruxelles (Europe/Brussels, UTC+02:00). La [preuve de contenu et nom](2026-10-08-contenu-apercu-sources.json) distingue avant/après sans texte privé de conversation.

La [preuve native de structure et navigation](2026-10-08-sources-natives.json) relève un SPAN popover-trigger de rôle bouton ; Entrée/Espace appelle son activation. Une citation simple ouvre `https://codex-reset.com/radar/`, une regroupée une page de `www.sotwe.com`, tout en ouvrant leurs aperçus. La présence d’une commande `openUrl` dans la passerelle GenUI est un repère de code ; les destinations sont établies par l’activation observée, pas déduites d’une favicon. Aucun contrôle de sécurité de destination n’est franchi.

La carte native est un BUTTON pressable avec `aria-label="Open [source]"`. Les descendants textuels source, titre et texte sont présents en DOM et comme StaticText non ignorés dans l’AX. Le dialogue non modal n’a pas de nom dans cet exemple. Le nom explicite de carte abrège le contenu présenté comme nom du contrôle. Le focus du déclencheur ouvre l’aperçu sans navigation ; Tab atteint la carte ; Échap ferme et retrouve la référence. Ce panneau interactif n’est pas qualifié de tooltip non focusable.

Dans l’illustration 4.1.1, le [module ciblé](../../../extension/source-links-accessibility.js) conserve les hôtes et callbacks, expose les contrôles de navigation comme liens, retire le nom abrégé des cartes reconnues non vides et nomme les panneaux de sources dépourvus de nom natif. Le nom calculé du lien devient « Codex Reset Codex Radar: Reset, Limits & Service Signals Total lines: 277 », celui du dialogue « Aperçu des sources : Codex Reset ». Les informations de l’exemple ne sont pas traduites artificiellement ni enrichies avec un article absent de la carte. Les contrôles historiques du contenu des cartes (douze tests Node et treize scénarios Chromium, 172 vérifications répétées, zéro échec) contrôlent gardes, activation, identité et restauration ; la nouvelle parole JAWS adaptée reste distincte de ces résultats techniques.

La reproduction sur le site et l’attendu figurent dans [PROCEDURES.md](../reproductions/PROCEDURES.md#4f--références-et-aperçus-de-sources), les contrôles synthétiques dans [EXECUTION.md](../reproductions/EXECUTION.md#contrôler-les-références-et-cartes-de-sources--4f).

La [preuve de favicon du 8 octobre](2026-10-08-favicons-controles.json) distingue le contenu visible du nom de fichier d’image parasite. Alt vide sur la favicon reconnue exclut ce graphique décoratif ; les alternatives significatives et les autres images sont conservées. Dix-huit tests Node et neuf états Chromium stabilisés passent. Le texte Total lines: 277 reste le contenu visible fourni par le site.

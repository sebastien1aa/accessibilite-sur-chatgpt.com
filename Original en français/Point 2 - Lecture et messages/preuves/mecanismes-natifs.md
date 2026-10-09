# Sources et mécanismes natifs — Point 2

Les heures locales citées dans ce document sont en heure de Bruxelles (Europe/Brussels, UTC+02:00 pour les dates de septembre et début octobre 2026). Les horodatages techniques conservent leur fuseau explicite ; le suffixe ISO `Z` désigne UTC.

Cette pièce donne les racines techniques des constats. Elle distingue le code public du site inspecté, les propriétés réellement rendues, les essais de l’adaptation et la réception humaine. Elle ne remplace pas le code du site par le comportement du module correctif comme preuve d’un défaut natif.

Les identifiants minifiés et noms d’assets sont des repères historiques. Ils peuvent changer et ne sont pas nécessairement uniques dans un même bundle. Une recherche par nom seule ne suffit pas : vérifier le contrat et la branche décrits. Aucun dump de bundle ni contenu de conversation n’est joint.

## 2A — Deux générations de virtualisation

| Génération et source publique inspectée | Contrat/rendu observé | Vérification possible |
| --- | --- | --- |
| Ancienne, relevé du 17 septembre : asset `8b34dbc2-ebqp55m3e77tmmob.js`, fonction `z$n` ; asset `conversation-small-j1kh59k03k5v196u.js`, fonction `fGa` exportée sous `$l` | `z$n` conditionne les enfants des conteneurs `data-turn-id-container` à l’intersection et aux modes de rendu forcé. `fGa` crée un IntersectionObserver avec `rootMargin: "1000px 0px 1000px 0px"`, seuil 0,01. Des descendants sont réellement retirés et remplacés par des emplacements vides ; le seul CSS ne restaure pas ces nœuds. | Comparer les descendants des conteneurs en haut/bas. Distinguer l’observateur de table des prompts, dont la marge est `-49% 0px -49% 0px` : il n’est pas la cible du correctif. |
| Nouvelle, relevé du 30 septembre : asset `97193.e58693f09d.js`, module `iBd` | Liste sous `.thread-scroll-container`, `data-chatgpt-conversation-selection-target`, lignes `data-turn-key`. Le composant reçoit `retainedTurnKeys`, `synchronousMeasurementTurnKey`, `getPendingRestoreScrollDistanceFromBottomPx`, `RowComponent`. Sa plage dépend du défilement ; les clés retenues conservent les tours hors plage dans le rendu React. | Sur le composant effectivement monté, vérifier ces quatre propriétés ensemble. Le relevé historique compte cinq lignes montées pour 126 entrées ; l’essai réversible de clés retenues rend les 126 et conserve leur identité après défilement. |

Le [relevé du 7 octobre](2A-virtualisation-2026-10-07.json) retrouve le même contrat dans l’asset `672590.d8b5b4b48a.js`, module `if6`. Il borne le rendu natif examiné à 6 lignes montées pour 17 entrées disponibles, puis le contournement technique à 27/27. La réception du parcours montant/descendant est transmise séparément par l’utilisateur.

Les assets servent à retrouver un chargement historique ; ils ne sont pas codés en dur comme garantie de compatibilité. Les [tests modernes](../reproductions/keep-modern-turns.test.cjs) exercent le contrat synthétique et ses gardes ; la [fixture moderne](../reproductions/modern-browser.html) vérifie la conservation et l’identité des nœuds dans un navigateur. Les [tests anciens](../reproductions/keep-turns.test.cjs) et la [fixture ancienne](../reproductions/browser.html) vérifient l’isolation des observateurs et la stabilité des 80 messages synthétiques. Ces fixtures prouvent le mécanisme local, pas une nouvelle inspection du site ni la parole JAWS.

Fonctions correspondantes de l’adaptation : `matches` et `ContinuousTurns` dans [keep-modern-turns.js](../../../extension/keep-modern-turns.js). Le contrat n’est appliqué qu’à des entrées de la même conversation et le hook d’export est restauré après découverte/expiration. Le code historique [keep-turns.js](../../../extension/keep-turns.js) garde les autres observateurs natifs.

## 2B — Repères, état natif et branche des 43 cartes

Le snapshot public du 3 octobre pour l’état de raisonnement est [385910.71a81f043e.js](https://chatgpt.com/cdn/assets/385910.71a81f043e.js). L’empreinte SHA-256 relevée est `389E8668E39CD03B070D49E54CCC2063936B982FF5B657E53A5B5A59F14132DF`. La comparaison locale du snapshot conservé pour l’investigation confirme cette empreinte ; le bundle n’est pas distribué ici. Les offsets suivants sont des **caractères UTF-16**, pas des octets.

| Repère précis | Fait de code public/rendu |
| --- | --- |
| Module `rM5`, fonction `p`, offset 11442962 | Le renderer choisit le message fourni, sinon `thinkingShimmer.default` (« Thinking » dans le défaut anglais). Cela établit la provenance native du libellé générique traduit ; l’extension ne crée pas une action plus précise. |
| Shimmer, offset 11441741 | Texte utile dans `.cadencedShimmerHighlight-VcX29h`, copie visuelle `.cadencedShimmerSweep-ICUAVH` masquée par `aria-hidden`. |
| Module `ZA`, fonction `z`, offset 6385886 | La projection peut fournir un titre de raisonnement ou une activité sans titre. Cela ne justifie pas de rendre un texte non affiché comme nouvelle étape accessible. |
| Inspection des propriétaires engagés du tour actif, 3 octobre 23:45:58.833 Bruxelles | `completed=false`, `hasFinalAssistantStarted=false`, activité précise absente ; le header `dK` utilise le renderer sans message. |

**Titre « ChatGPT a dit » de GPT‑5.6.** Le titre n’apparaît qu’après la fin de la réflexion et demeure alors normalement présent une fois la réponse intégrée au chat, avec GPT‑5.6 Sol. Les captures DOM/AX documentent son absence pendant la réflexion et sa présence ensuite. Le titre « ChatGPT a dit » est présent dès le début avec GPT‑6 ; son absence n’est pas un défaut retenu pour ce modèle. La légende finale sert au nom du bouton par référence et reste aussi exposée séparément. Cela établit une double exposition dans le rendu inspecté, sans garantir chaque instant de transition. Les fonctions `labelReference`, `groupParts`, `updateTurn` et `repairControl` de [reasoning-accessibility.js](../../../extension/reasoning-accessibility.js) traitent ces relations ; les [tests correspondants](../reproductions/reasoning-accessibility.test.cjs) en vérifient les invariants sur des doubles synthétiques.

**GPT‑5.6 et GPT‑6 en raisonnement Élevé.** La première [comparaison native](2B-titre-raisonnement-gpt6-gpt56-2026-10-07.json) établit la présence du titre « ChatGPT a dit » avec GPT‑5.6 Sol seulement après la fin de la réflexion, puis son maintien une fois la réponse intégrée au chat. Pour GPT‑6, les preuves principales sont désormais le [tour terminé](2026-10-07-contrat-raisonnement-gpt6.json), les [régions et repères successifs](2026-10-08-regions-raisonnement.json) et l’[extrait de trace actif puis terminé](2B-generations-terminees-gpt6-2026-10-08.json). Le niveau Élevé est une précision de l’utilisateur. Le titre initial est présent avec GPT‑6. Le retour JAWS situe l’activité courante avant les détails accomplis dans les deux modèles. Le module fourni distingue ces contrats pour traiter le titre absent pendant la réflexion de GPT‑5.6 Sol et l’ordre de lecture de l’activité dans les deux rendus.

**Contrat régional GPT-6, complément du 7 octobre vers 23 h 20, heure de Bruxelles.** La [structure native inspectée](2026-10-07-contrat-raisonnement-gpt6.json) expose un bouton direct, un nom par référence et une légende SPAN hors du bouton, séparément accessible. Son propriétaire engagé fournit `region`, `completed`, `reasoningRecap`, `activeSummary`, `canExpand`, `hasStandaloneItems` et `hideHeader`. Les propriétés `summary` et `shouldAnimateInitialCollapse` du contrat GPT-5.6 ne sont pas présentes dans ce groupe. Extrait réduit du code natif, noms minifiés conservés, sans contenu de conversation :

```text
region:d, completed:u, reasoningRecap:g, activeSummary:m,
canExpand:p, hasStandaloneItems:f, hideHeader:b, children:_
// Choix de l’ouverture ; suffix représente ici la branche de région.
C = g?.type === keep_inline ||
    (x ?? (w?.visibility === visible ? w.default_expanded : !u || suffix === d.kind));
disclosure: p ? {expanded:C, onToggle:()=>I(!C)} : undefined;
summary: k ?? (u ? Previous activity : m);
```

Il s’agit d’un extrait structurel de logique, pas d’un programme autonome : les constantes et libellés proviennent du contexte du composant. Le booléen `completed` local choisit l’activité et l’ouverture du groupe. La phase globale de la réponse ne suffit donc pas pour rendre sa fin. Le retour JAWS complémentaire situe le statut courant avant les détails déjà réalisés et décrit une seconde ligne sans rôle reproduisant l’activité ou « Réfléchi pendant [durée] ». L’exposition séparée de la légende référencée soutient ce doublon observé ; elle ne constitue pas un enregistrement vocal.

Le [module du démonstrateur 4.1.2](../../../extension/reasoning-accessibility.js) reconnaît les deux signatures, conserve les commandes d’outil indépendantes, ajoute le statut courant en fin des détails ouverts et retire seulement la seconde lecture de la légende. Les noms et durée natifs sont restaurés à la fin ; les corps et callbacks sont conservés. [60 tests Node](../reproductions/reasoning-accessibility.test.cjs) et [15 contrôles Chromium régionaux](2026-10-08-regions-raisonnement.json) vérifient les mécanismes sans se substituer à la réception JAWS de cette adaptation. La [fixture locale](../reproductions/reasoning-regions.html) est synthétique et n’exécute aucun message.

Le [complément du 8 octobre](2026-10-08-regions-raisonnement.json) conserve l’ordre des repères et groupes sans enregistrer leurs contenus. La signature régionale locale est traitée dès l’activité initiale, avant qu’un item reasoning soit nécessairement disponible. Le contexte reste une liste d’activités engagée et bornée, avec indicateurs booléens ; les commandes d’outil imbriquées ne deviennent pas des groupes principaux.

**43 cartes Python : branche native inspectée.** Le type natif vérifié est `chatgpt-python-execution`. La fonction montante inspectée `dU`, avec `streamingParentRegion` absent, sépare les items d’analyse, rend le reste via `dK`, puis rend les cartes par `o8` comme sœurs dans un Fragment. Elles sont ainsi hors du repli principal. Ce cas relève de cette branche effectivement montée, et non d’une autre branche préfixe de `dK`.

Ces noms proviennent de l’inspection des fonctions publiques **effectivement montées** et de leurs contrats ; aucun offset de `dU/dK` n’est revendiqué dans le snapshot ci-dessus. Des homonymes y existent dans d’autres composants. Pour réexaminer, relier le propriétaire rendu aux types/phase/région et au sibling réel plutôt que retenir la première occurrence d’un nom minifié.

La vérification réelle compte les 43 mêmes nœuds avant/après repli et ouverture d’ensemble, puis ouvre un bouton natif « Analysé » par Espace. L’examen d’autres raisonnements chargés ne trouve pas de commande de dépliage individuelle sur leur texte ordinaire ; il ne démontre pas une suppression générale historique de détails. Fonctions d’adaptation : `rendererProps`, `eligibleRenderer`, `inspectContext`, `toolWrapper`, `findGroup`, `hideTool`, `showTool` dans [analysis-details-accessibility.js](../../../extension/analysis-details-accessibility.js) ; [tests](../reproductions/analysis-details-accessibility.test.cjs).

Réception du 4 octobre : acquis sans réserve acceptés, regroupement des analyses reçu pour le cas examiné avec difficulté explicite de reproduire de nouveaux cas. Les captures échantillonnées et les contrôles de nœuds ne valent pas réception de tous les tours futurs.

## 2C — Styles natifs de sélection

Dans le rendu inspecté le 4 octobre : `.thread-scroll-container`, tours `[data-turn-key]`, titres utilisateurs `h4.sr-only.select-none` portant « Vous avez dit : », dates visibles `time[datetime]` sous `div[role="separator"]`. Le style calculé des titres utilisateurs et des dates est `user-select: none`. Cette exclusion est un fait CSS natif distinct du retrait de descendants par virtualisation. Les titres « ChatGPT a dit » locaux sont déjà sélectionnables ; leurs doublons natifs masqués ne doivent pas entrer une deuxième fois dans la copie.

La [fixture de sélection](../reproductions/page-selection.html) reproduit des métadonnées synthétiques avec ces exclusions, puis vérifie la sélection, le focus, les éditeurs, le texte replié et la réversibilité de l’adaptation [page-selection.js](../../../extension/page-selection.js) / [reasoning-selection.css](../../../extension/reasoning-selection.css). Les exemples de code visibles de la [fixture historique de réflexion](../reproductions/reasoning-selection.html) restent du contenu synthétique explicitement affiché.

La [comparaison Edge native du 6 octobre](selection-native-2026-10-06.json) est indépendante : sélection manuelle de deux paragraphes, copie correspondante après normalisation des espaces, sans adaptation. Elle interdit de conclure à une impossibilité générale de sélection native ; elle ne valide ni sélection globale massive ni gestes JAWS Windows.

Le [retour natif du 7 octobre](reception-native-2026-10-07.json) confirme la sélection fonctionnelle hors sauts de position. Le problème d’accessibilité de stabilité est rattaché à 2A. L’inclusion des locuteurs, durées et horodatages absents de la copie native est conservée comme demande produit ; leur exclusion seule n’est pas qualifiée de défaut d’accessibilité démontré.

## 2D — Code public de copie, états natifs et notifications

### Partager

La [trace native du 5 octobre](2026-10-05-partage-copie-natif.json) préserve l’ordre causal du rendu observé : clic à 131 ms, attribut HTML disabled à 148 ms, sortie du focus vers BODY à 154 ms, réactivation à 1615 ms, notification à 1620 ms. Le même bouton reste connecté et ne récupère pas le focus.

La notification est `LI[data-sonner-toast]`, dans `OL[data-sonner-toaster]`. Sa région externe porte déjà `aria-live=polite`, `aria-relevant="additions text"`, `aria-atomic=false`. Le texte natif comprend les deux phrases de partage. Il serait donc faux de présenter le site comme ne possédant aucune région dynamique. Son silence selon le retour JAWS ne révèle pas à lui seul sa cause interne.

### Copier

Le helper public inspecté `TqJ` utilise `navigator.clipboard.write` / `writeText` et `ClipboardItem` ; le chemin examiné retourne false et affiche une erreur en cas d’échec. Aucun `execCommand`, champ temporaire focalisé, transaction Selection ou appel explicite au focus n’a été trouvé dans ce helper. Les callbacks utilisateur relèvent de l’analytics/feedback ; le modèle prépare du HTML sur un clone détaché. L’identification d’asset/offset de ce helper n’est pas conservée dans les pièces : son bundle ne peut donc pas être attribué à celui du 3 octobre. Le callback du bouton rendu identifie le helper concerné ; cet identifiant historique ne s’étend pas aux autres assets.

La [mesure native de disponibilité](2026-10-05-copie-disponibilite-native.json), modules locaux de feedback arrêtés pour cette comparaison, relève le bouton de réponse connecté et focalisé : `aria-busy=true` et `aria-disabled=true` pendant l’écriture, puis callback React rendu absent environ deux secondes après réussite. Le `onclick` DOM demeure et l’AX expose encore un bouton focalisable/non ignoré au succès. **L’absence du callback React ne prouve donc pas l’absence du bouton pour JAWS.** Une mesure ultérieure corrige la première interprétation des messages envoyés : leur callback rendu disparaît lui aussi pendant environ 1,5 s, mais leur indisponibilité n’est pas exposée par les mêmes états ARIA natifs.

Différence SVG inspectée : Partager contient un texte persistant et une icône `aria-hidden=true` ; les Copier contiennent une image SVG sans nom, accessible puis remplacée. Dans un relevé, le bouton AX 1286 garde son identité, son enfant image 1287 est remplacé par 4910. Ce changement est constaté, mais ne prouve pas que JAWS y ancre son curseur.

**Les retours physiques réfutent des causes suffisantes proposées.** Stabiliser le nom (nom constant) puis masquer le SVG décoratif (icône décorative) laisse le symptôme inchangé. Ces deltas ne peuvent donc pas être présentés comme explication complète. Le traitement ciblé de busy (état occupé) obtient le maintien du bouton réponse et l’absence de saut, avec confirmation encore mal cadencée ; 500 ms après réussite (confirmation différée) sont reçus pour les deux familles ; indisponibilité du bouton envoyé pendant sa suspension (indisponibilité exposée) reçue ensuite. Les [constats datés](constats-2026-10-03-05.json) séparent ces réceptions.

Les fonctions `protect`, `protectCopyName`, `maintainCopyIcons`, `onClick`, `inspect`, `announce` de [feedback-actions.js](../../../extension/feedback-actions.js) correspondent aux gardes locales. Les [tests Node](../reproductions/feedback-actions.test.cjs) et la [fixture](../reproductions/feedback-actions.html) exercent les confirmations, disponibilités, focus et annulations synthétiques. Le site expose le nom « Copié » ; « Message copié » est une annonce ajoutée localement sur réussite, à la différence des phrases de partage réellement natives.

Les deux JSON natifs copiés ici sont les relevés historiques d’origine, avec uniquement noms de commandes, attributs, temps relatifs, styles et booléens. Ils ne contiennent pas de corps de messages ou de texte du presse-papiers. Les mouvements ultérieurs de fenêtre/document ne sont pas automatiquement imputés à la copie.

Le 7 octobre, l’utilisateur reçoit à nouveau les défauts natifs sans changement : copie silencieuse et saut vers Partager pour les réponses ; partage global silencieux avec retour au haut de page. Ces parcours confirment les défauts natifs ; les réceptions adaptées antérieures restent acquises.

## 2E — Writing Blocks

L’inspection du 4 octobre relève quatre BUTTON directement sous BODY : `type=button`, `contenteditable=false`, `data-writing-block-table-grab-handle=row/column`, classes `writing-block-table-grab-handle` et suffixe correspondant. Texte unique « ⋮⋮ », sans nom descriptif. Style calculé `opacity=0`, `pointer-events=none` ; malgré cette inactivité visuelle/souris, boutons encore exposés.

Le code public des gestionnaires inspectés ouvre les menus d’ajout de ligne au-dessus/au-dessous ou suppression, et d’ajout de colonne à gauche/à droite ou suppression, pour la ligne/colonne de tableau ciblée. La référence d’asset/module de ces gestionnaires n’a pas été conservée. Le nom et la signature DOM permettent de retrouver les contrôles, puis relier leur callback natif au menu réellement rendu, sans modifier le document.

Fonctions locales `handle`, `inactive`, `update`, `restore` dans [writing-block-accessibility.js](../../../extension/writing-block-accessibility.js). La [fixture existante](../reproductions/writing-block-accessibility.html) vérifie les quatre contrôles synthétiques, leur exclusion quand inactifs, leur retour quand activés, les callbacks conservés et l’édition/Copier. Elle ne démontre pas le bon étiquetage de tout menu de tableau actif. Le retrait des poignées inactives est reçu le 4 octobre ; leur absence de nom natif descriptif demeure un fait distinct.

Le 7 octobre, le défaut natif est reçu comme inchangé : demande de rédaction réutilisable/copiable, attente de la fin complète de génération, puis parcours au bas de page. Cette réception ne constitue pas un nouveau compte DOM des quatre poignées.

## 2F — Dernière réponse

La racine est un relevé DOM/AX : `h4.sr-only`, texte exact « Dernière réponse », hors du message. C’est cette exposition qui ajoute un arrêt de titre ; aucun algorithme natif de navigation particulier n’est attribué à ce seul élément. La fonction `hideLastResponseHeading` de [ui-accessibility.js](../../../extension/ui-accessibility.js) cible le repère exact et conserve les titres dans les messages. La reproduction humaine et son acceptation globale sont dans [les procédures](../reproductions/PROCEDURES.md) et [les constats](constats-2026-10-03-05.json). Il s’agit d’une simplification demandée, pas d’une preuve universelle qu’un tel titre est invalide.

La présence native de ce titre est confirmée par l’utilisateur le 7 octobre.

## 2G — Navigation Web, nom de carte et dialogue

Les observations utiles proviennent du retour JAWS sur les références (« Bouton de menu réduit dialogue »), du retour du 8 octobre sur le seul « Ouvrir [nom du lien hypertexte] » dans la carte, et des inspections DOM/AX et activations réversibles du 8 octobre 2026, heure de Bruxelles (Europe/Brussels, UTC+02:00). La [preuve de contenu et nom](2026-10-08-contenu-apercu-sources.json) distingue avant/après sans texte privé de conversation.

La [preuve native de structure et navigation](2026-10-08-sources-natives.json) relève un SPAN popover-trigger de rôle bouton ; Entrée/Espace appelle son activation. Une citation simple ouvre `https://codex-reset.com/radar/`, une regroupée une page de `www.sotwe.com`, tout en ouvrant leurs aperçus. Le gestionnaire clavier et le dispatcher de callbacks sont conservés dans cette pièce ; les destinations sont établies par l’activation observée, pas déduites d’une favicon.

La carte native est un BUTTON pressable avec `aria-label="Open [source]"`. Les descendants textuels source, titre et texte sont présents en DOM et comme StaticText non ignorés dans l’AX. Le dialogue non modal n’a pas de nom dans cet exemple. Le nom explicite de carte abrège le contenu présenté comme nom du contrôle. Le focus du déclencheur ouvre l’aperçu sans navigation ; Tab atteint la carte ; Échap ferme et retrouve la référence. Ce panneau interactif n’est pas qualifié de tooltip non focusable.

Dans l’illustration 4.1.2, le [module ciblé](../../../extension/source-links-accessibility.js) conserve les hôtes et callbacks, expose les contrôles de navigation comme liens, retire le nom abrégé des cartes reconnues non vides et nomme les panneaux de sources dépourvus de nom natif. Le nom calculé du lien devient « Codex Reset Codex Radar: Reset, Limits & Service Signals Total lines: 277 », celui du dialogue « Aperçu des sources : Codex Reset ». Les informations de l’exemple ne sont pas traduites artificiellement ni enrichies avec un article absent de la carte. Les contrôles historiques du contenu des cartes (douze tests Node et treize scénarios Chromium, 172 vérifications répétées, zéro échec) contrôlent gardes, activation, identité et restauration ; la nouvelle parole JAWS adaptée reste distincte de ces résultats techniques.

La reproduction sur le site et l’attendu figurent dans [PROCEDURES.md](../reproductions/PROCEDURES.md#2g--références-et-aperçus-de-sources), les contrôles synthétiques dans [EXECUTION.md](../reproductions/EXECUTION.md#contrôler-les-références-et-cartes-de-sources--2g).

La [preuve de favicon du 8 octobre](2026-10-08-favicons-controles.json) distingue le contenu visible du nom de fichier d’image parasite. Alt vide sur la favicon reconnue exclut ce graphique décoratif ; les alternatives significatives et les autres images sont conservées. Dix-huit tests Node et neuf états Chromium stabilisés passent. Le texte Total lines: 277 reste le contenu visible fourni par le site.

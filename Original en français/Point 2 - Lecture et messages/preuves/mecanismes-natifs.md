# Sources et mécanismes natifs — Point 2

Les heures locales citées dans ce document sont en heure de Bruxelles (Europe/Brussels, UTC+02:00 pour les dates de septembre et début octobre 2026). Les horodatages techniques conservent leur fuseau explicite ; le suffixe ISO `Z` désigne UTC.

Cette pièce donne les racines techniques des constats. Elle distingue le code public du site inspecté, les propriétés réellement rendues, les essais de l’adaptation et la réception humaine. Elle ne remplace pas le code du site par le comportement du module correctif comme preuve d’un défaut natif.

Les identifiants minifiés et noms d’assets sont des repères historiques. Ils peuvent changer et ne sont pas nécessairement uniques dans un même bundle. Une recherche par nom seule ne suffit pas : vérifier le contrat et la branche décrits. Aucun dump de bundle ni contenu de conversation n’est joint.

## 2A — Deux générations de virtualisation

| Génération et source publique inspectée | Contrat/rendu observé | Vérification possible |
| --- | --- | --- |
| Ancienne, relevé du 17 septembre : asset `8b34dbc2-ebqp55m3e77tmmob.js`, fonction `z$n` ; asset `conversation-small-j1kh59k03k5v196u.js`, fonction `fGa` exportée sous `$l` | `z$n` conditionne les enfants des conteneurs `data-turn-id-container` à l’intersection et aux modes de rendu forcé. `fGa` crée un IntersectionObserver avec `rootMargin: "1000px 0px 1000px 0px"`, seuil 0,01. Des descendants sont réellement retirés et remplacés par des emplacements vides ; le seul CSS ne restaure pas ces nœuds. | Comparer les descendants des conteneurs en haut/bas. Distinguer l’observateur de table des prompts, dont la marge est `-49% 0px -49% 0px` : il n’est pas la cible du correctif. |
| Nouvelle, relevé du 30 septembre : asset `97193.e58693f09d.js`, module `iBd` | Liste sous `.thread-scroll-container`, `data-chatgpt-conversation-selection-target`, lignes `data-turn-key`. Le composant reçoit `retainedTurnKeys`, `synchronousMeasurementTurnKey`, `getPendingRestoreScrollDistanceFromBottomPx`, `RowComponent`. Sa plage dépend du défilement ; les clés retenues conservent les tours hors plage dans le rendu React. | Sur le composant effectivement monté, vérifier ces quatre propriétés ensemble. Le relevé historique compte cinq lignes montées pour 126 entrées ; l’essai réversible de clés retenues rend les 126 et conserve leur identité après défilement. |

Le [relevé du 7 octobre](2A-virtualisation-2026-10-07.json) retrouve le même contrat dans l’asset `672590.d8b5b4b48a.js`, module `if6`. Il borne le rendu natif examiné à 6 lignes montées pour 17 entrées disponibles, puis le contournement technique à 27/27. La réception du parcours montant/descendant en 3.6.2 est transmise séparément par l’utilisateur.

Les assets servent à retrouver un chargement historique ; ils ne sont pas codés en dur comme garantie de compatibilité. Les [tests modernes](../reproductions/keep-modern-turns.test.cjs) exercent le contrat synthétique et ses gardes ; la [fixture moderne](../reproductions/modern-browser.html) vérifie la conservation et l’identité des nœuds dans un navigateur. Les [tests anciens](../reproductions/keep-turns.test.cjs) et la [fixture ancienne](../reproductions/browser.html) vérifient l’isolation des observateurs et la stabilité des 80 messages synthétiques. Ces fixtures prouvent le mécanisme local, pas une nouvelle inspection du site ni la parole JAWS.

Fonctions correspondantes de l’adaptation : `matches` et `ContinuousTurns` dans [keep-modern-turns.js](../../../extension/keep-modern-turns.js). Le contrat n’est appliqué qu’à des entrées de la même conversation et le hook d’export est restauré après découverte/expiration. Le code historique [keep-turns.js](../../../extension/keep-turns.js) garde les autres observateurs natifs.

## 2B — Repères, état natif et branche des 43 cartes

Le snapshot public du 3 octobre pour l’état de raisonnement est [385910.71a81f043e.js](https://chatgpt.com/cdn/assets/385910.71a81f043e.js). L’empreinte SHA-256 relevée est `389E8668E39CD03B070D49E54CCC2063936B982FF5B657E53A5B5A59F14132DF`. La comparaison locale du snapshot conservé pour l’investigation confirme cette empreinte ; le bundle n’est pas distribué ici. Les offsets suivants sont des **caractères UTF-16**, pas des octets.

| Repère précis | Fait de code public/rendu |
| --- | --- |
| Module `rM5`, fonction `p`, offset 11442962 | Le renderer choisit le message fourni, sinon `thinkingShimmer.default` (« Thinking » dans le défaut anglais). Cela établit la provenance native du libellé générique traduit ; l’extension ne crée pas une action plus précise. |
| Shimmer, offset 11441741 | Texte utile dans `.cadencedShimmerHighlight-VcX29h`, copie visuelle `.cadencedShimmerSweep-ICUAVH` masquée par `aria-hidden`. |
| Module `ZA`, fonction `z`, offset 6385886 | La projection peut fournir un titre de raisonnement ou une activité sans titre. Cela ne justifie pas de rendre un texte non affiché comme nouvelle étape accessible. |
| Inspection des propriétaires engagés du tour actif, 3 octobre 23:45:58.833 Bruxelles | `completed=false`, `hasFinalAssistantStarted=false`, activité précise absente ; le header `dK` utilise le renderer sans message. Aucun corps de message ou raisonnement n’a été persisté. |

**Repère assistant.** Les captures DOM/AX identifient son absence pendant une partie de la génération puis son arrivée tardive. La légende finale sert au nom du bouton par référence et reste aussi exposée séparément. Cela établit une double exposition dans le rendu inspecté, sans garantir chaque instant de transition. Les fonctions `labelReference`, `groupParts`, `updateTurn` et `repairControl` de [reasoning-accessibility.js](../../../extension/reasoning-accessibility.js) traitent ces relations ; les [tests correspondants](../reproductions/reasoning-accessibility.test.cjs) en vérifient les invariants sur des doubles synthétiques.

**Actualisation du 7 octobre, tests terminés à 22 h 40.** La [chronologie comparative GPT-6/GPT-5.6](2B-titre-raisonnement-gpt6-gpt56-2026-10-07.json) confirme l’absence de titre assistant pendant la réflexion GPT-5.6 et son arrivée après l’état terminé. La séquence GPT-6 interrompue expose un titre pendant une activité intermédiaire, puis le retire après l’arrêt ; elle ne démontre pas une correction native générale. Dans les deux modèles, le retour JAWS situe l’état courant au-dessus du repère assistant ; l’en-tête d’activité précède le titre dans les états DOM où celui-ci existe. Les détails déjà effectués après le titre sont reçus dans le bon ordre. Le repère précoce et l’adaptation de l’ordre courant sont conservés.

**43 cartes Python : branche native inspectée.** Le type natif vérifié est `chatgpt-python-execution`. La fonction montante inspectée `dU`, avec `streamingParentRegion` absent, sépare les items d’analyse, rend le reste via `dK`, puis rend les cartes par `o8` comme sœurs dans un Fragment. Elles sont ainsi hors du repli principal. Ce cas relève de cette branche effectivement montée, et non d’une autre branche préfixe de `dK`.

Ces noms proviennent de l’inspection des fonctions publiques **effectivement montées** et de leurs contrats ; aucun offset de `dU/dK` n’est revendiqué dans le snapshot ci-dessus. Des homonymes y existent dans d’autres composants. Pour réexaminer, relier le propriétaire rendu aux types/phase/région et au sibling réel plutôt que retenir la première occurrence d’un nom minifié.

La vérification réelle compte les 43 mêmes nœuds avant/après repli et ouverture d’ensemble, puis ouvre un bouton natif « Analysé » par Espace. L’examen d’autres raisonnements chargés ne trouve pas de commande de dépliage individuelle sur leur texte ordinaire ; il ne démontre pas une suppression générale historique de détails. Fonctions d’adaptation : `rendererProps`, `eligibleRenderer`, `inspectContext`, `toolWrapper`, `findGroup`, `hideTool`, `showTool` dans [analysis-details-accessibility.js](../../../extension/analysis-details-accessibility.js) ; [tests](../reproductions/analysis-details-accessibility.test.cjs).

Réception du 4 octobre : acquis sans réserve acceptés, regroupement des analyses reçu pour le cas examiné avec difficulté explicite de reproduire de nouveaux cas. Les captures échantillonnées et les contrôles de nœuds ne valent pas réception de tous les tours futurs.

## 2C — Styles natifs de sélection

Dans le rendu inspecté le 4 octobre : `.thread-scroll-container`, tours `[data-turn-key]`, titres utilisateurs `h4.sr-only.select-none` portant « Vous avez dit : », dates visibles `time[datetime]` sous `div[role="separator"]`. Le style calculé des titres utilisateurs et des dates est `user-select: none`. Cette exclusion est un fait CSS natif distinct du retrait de descendants par virtualisation. Les repères assistant locaux sont déjà sélectionnables ; leurs doublons natifs masqués ne doivent pas entrer une deuxième fois dans la copie.

La [fixture de sélection](../reproductions/page-selection.html) reproduit des métadonnées synthétiques avec ces exclusions, puis vérifie la sélection, le focus, les éditeurs, le texte replié et la réversibilité de l’adaptation [page-selection.js](../../../extension/page-selection.js) / [reasoning-selection.css](../../../extension/reasoning-selection.css). Les exemples de code visibles de la [fixture historique de réflexion](../reproductions/reasoning-selection.html) restent du contenu synthétique explicitement affiché.

La [comparaison Edge native du 6 octobre](selection-native-2026-10-06.json) est indépendante : sélection manuelle de deux paragraphes, copie correspondante après normalisation des espaces, sans adaptation. Elle interdit de conclure à une impossibilité générale de sélection native ; elle ne valide ni sélection globale massive ni gestes JAWS Windows.

Le [retour natif du 7 octobre](reception-native-2026-10-07.json) confirme la sélection fonctionnelle hors sauts de position. Le problème d’accessibilité de stabilité est rattaché à 2A. L’inclusion des locuteurs, durées et horodatages absents de la copie native est conservée comme demande produit ; leur exclusion seule n’est pas qualifiée de défaut d’accessibilité démontré.

## 2D — Code public de copie, états natifs et notifications

### Partager

La [trace native du 5 octobre](2026-10-05-partage-copie-natif.json) préserve l’ordre causal du rendu observé : clic à 131 ms, attribut HTML disabled à 148 ms, sortie du focus vers BODY à 154 ms, réactivation à 1615 ms, notification à 1620 ms. Le même bouton reste connecté et ne récupère pas le focus.

La notification est `LI[data-sonner-toast]`, dans `OL[data-sonner-toaster]`. Sa région externe porte déjà `aria-live=polite`, `aria-relevant="additions text"`, `aria-atomic=false`. Le texte natif comprend les deux phrases de partage. Il serait donc faux de présenter le site comme ne possédant aucune région dynamique. Son silence selon le retour JAWS ne révèle pas à lui seul sa cause interne.

### Copier

Le helper public inspecté `TqJ` utilise `navigator.clipboard.write` / `writeText` et `ClipboardItem` ; le chemin examiné retourne false et affiche une erreur en cas d’échec. Aucun `execCommand`, champ temporaire focalisé, transaction Selection ou appel explicite au focus n’a été trouvé dans ce helper. Les callbacks utilisateur relèvent de l’analytics/feedback ; le modèle prépare du HTML sur un clone détaché. L’identification d’asset/offset de ce helper n’est pas conservée dans les pièces : ne pas lui attribuer par défaut le bundle du 3 octobre. Une réinspection doit repartir du callback public du bouton rendu et du helper réellement appelé.

La [mesure native de disponibilité](2026-10-05-copie-disponibilite-native.json), modules locaux de feedback arrêtés pour cette comparaison, relève le bouton de réponse connecté et focalisé : `aria-busy=true` et `aria-disabled=true` pendant l’écriture, puis callback React rendu absent environ deux secondes après réussite. Le `onclick` DOM demeure et l’AX expose encore un bouton focalisable/non ignoré au succès. **L’absence du callback React ne prouve donc pas l’absence du bouton pour JAWS.** Une mesure ultérieure corrige la première interprétation des messages envoyés : leur callback rendu disparaît lui aussi pendant environ 1,5 s, mais leur indisponibilité n’est pas exposée par les mêmes états ARIA natifs.

Différence SVG inspectée : Partager contient un texte persistant et une icône `aria-hidden=true` ; les Copier contiennent une image SVG sans nom, accessible puis remplacée. Dans un relevé, le bouton AX 1286 garde son identité, son enfant image 1287 est remplacé par 4910. Ce changement est constaté, mais ne prouve pas que JAWS y ancre son curseur.

**Les retours physiques réfutent des causes suffisantes proposées.** Stabiliser le nom (3.5.2) puis masquer le SVG décoratif (3.5.3) laisse le symptôme inchangé. Ces deltas ne peuvent donc pas être présentés comme explication complète. Le traitement ciblé de busy (3.5.4) obtient le maintien du bouton réponse et l’absence de saut, avec confirmation encore mal cadencée ; 500 ms après réussite (3.5.5) sont reçus pour les deux familles ; indisponibilité du bouton envoyé pendant sa suspension (3.5.6) reçue ensuite. Les [constats datés](constats-2026-10-03-05.json) séparent ces réceptions.

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

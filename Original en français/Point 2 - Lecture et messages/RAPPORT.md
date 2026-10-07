# Point 2 — Lecture, sélection et commandes des messages

Ce dossier décrit les constats établis les 3–5 octobre 2026, complétés par une observation ciblée de sélection native le 6 octobre, puis un contrôle de virtualisation et une réception du contournement le 7 octobre. Il regroupe des difficultés de lecture et d’utilisation des messages sur l’interface française de chatgpt.com. Les corrections décrites appartiennent à une extension locale ; elles ne signifient pas que le site a été corrigé par OpenAI.

Le contexte de réception principal est Windows 10, Chrome et JAWS 2021, selon les déclarations de l’utilisateur et les relevés historiques. Le relevé du 3 octobre identifie Windows 10 Home 22H2, build 19045.6466, et Chrome 154.0.8037.93. Les comparaisons anciennes avec Edge ou JAWS 2025 ne constituent pas une réception complète des adaptations présentées ici. Les observations DOM, l’arbre d’accessibilité du navigateur, les copies de session navigateur et la parole/navigation JAWS restent des preuves distinctes.

Les [reproductions](reproductions/PROCEDURES.md) permettent de vérifier chaque sous-point indépendamment, sans utiliser une conversation privée. Les [constats structurés](preuves/constats-2026-10-03-05.json) reprennent uniquement dates, mécanismes, résultats et limites. Les [sources et mécanismes natifs](preuves/mecanismes-natifs.md) donnent les contrats, branches et signatures observés ; les [tests et fixtures ciblés](reproductions/EXECUTION.md) vérifient séparément l’adaptation. La [sélection native du 6 octobre](preuves/selection-native-2026-10-06.json) dispose d’une preuve séparée.

## 2A — Parcourir une longue conversation sans perdre les messages

**Difficulté signalée.** Dans une longue conversation, les messages éloignés de la zone visible peuvent disparaître du document rendu. Un parcours de lecteur d’écran ou une sélection qui traverse ces messages peut alors perdre son contenu ou sa position. Garder une hauteur vide à la place d’un message ne rend pas son texte disponible au curseur virtuel.

**Mécanisme observé.** La génération d’interface inspectée utilise un virtualiseur qui calcule la plage de tours à rendre selon le défilement. Un relevé technique historique du 30 septembre comptait 126 entrées de conversation, dont cinq montées initialement. Le paramètre interne `retainedTurnKeys` permettait de conserver les entrées hors plage : l’essai de ce paramètre rendait les 126 entrées avec leurs nœuds maintenus après défilement dans les deux sens. Ce relevé décrit ce chargement précis ; il ne compte pas toutes les conversations et ne récupère pas des messages absents du serveur.

**Adaptation locale.** [keep-modern-turns.js](../../extension/keep-modern-turns.js) conserve les tours déjà disponibles au moyen de ce contrat de rendu, sans cloner leurs nœuds. [keep-turns.js](../../extension/keep-turns.js) couvre séparément l’ancienne génération reposant sur les intersections. L’extension ne neutralise pas tous les observateurs de la page et ne substitue pas de messages de remplacement.

**Complément du 7 octobre.** Le composant natif conserve le contrat de rétention décrit ci-dessus. Dans la vue visible examinée sans maintien local appliqué, 6 lignes sont montées pour 17 entrées disponibles. Le contournement rend ensuite 27 entrées/27 lignes dans l’essai technique, avec les sept nœuds initiaux toujours connectés au retour au bas. L’utilisateur reçoit positivement le parcours montant et descendant avec la version 3.6.2 : « d'après mon test, c'est OK. » La [preuve datée](preuves/2A-virtualisation-2026-10-07.json) précise les conditions et distingue les comptes DOM de la réception. Ces résultats soutiennent le mécanisme déjà signalé ; ils ne constituent pas un nouveau défaut natif.

**Réception et limite.** Deux retours historiques sont conservés avec leur date : le 17 septembre à 21 h 39 min 32 s Bruxelles, « d’après mes tests, la navigation et la sélection dans la page fonctionnent » ; le 30 septembre à 20 h 53 min 56 s, « Je confirme qu’à priori, l’ajustement semble fonctionner ». Le parcours des conversations proposé dans la réception globale du 4 octobre est ensuite accepté pour les points sans réserve. Cela conserve l’acquis de lecture et de stabilité dans l’usage rapporté. La présence DOM et l’identité des nœuds sont vérifiées techniquement ; elles ne suffisent pas à garantir une sélection intégrale exacte dans le presse-papiers Windows. Les réserves historiques de copie massive demeurent et le contrat interne du site peut évoluer.

**Résultat souhaité côté produit.** Permettre une lecture continue et une sélection étendue des tours chargés avec un lecteur d’écran, même quand le rendu visuel optimise les messages hors écran. Vérifier le parcours montant, descendant et les changements de conversation sans déduire l’accès au texte de la seule hauteur de ses emplacements.

## 2B — Repérer la réponse et parcourir le raisonnement

Trois comportements doivent être séparés.

1. **Repère de locuteur précoce.** Le titre « ChatGPT a dit » est absent pendant une partie de la génération dans les rendus inspectés, puis arrive plus tard. L’utilisateur demande de pouvoir identifier le nouveau tour dès son début. [reasoning-accessibility.js](../../extension/reasoning-accessibility.js) ajoute ce repère près de l’ancre native et masque seulement son doublon exact lorsque le repère natif arrive. Il ne crée pas de contenu de réponse.
2. **État actif et fin du raisonnement.** Pendant la génération, un nom de commande constant évite les changements d’annonce répétés ; dans les détails ouverts, une ligne reprend l’état effectivement rendu par le site. À la fin, le nom et la durée natifs redeviennent ceux de la commande, sans seconde exposition identique de la légende. Le texte générique « Réflexion en cours » provient de la valeur native lorsque le rendu ne fournit pas d’activité plus précise ; l’extension recopie ce texte. Il ne faut pas inventer une étape ni extraire une action qui n’est pas rendue.
3. **Cartes d’analyse autonomes.** Un exemple inspecté comportait 43 cartes Python natives, sœurs du groupe de raisonnement, qui restaient indépendantes de son repli. [analysis-details-accessibility.js](../../extension/analysis-details-accessibility.js) ajoute une commande d’ensemble liée au repli principal, sans déplacer ni cloner les cartes. L’ouverture d’ensemble révèle leurs boutons natifs ; Espace sur une commande « Analysé » ouvre son contenu existant. Aucun code des cartes n’a été exécuté pour cette vérification.

**Preuves.** Les captures du 3 octobre sont échantillonnées : une première fenêtre compte 78 trames, dont 73 avec action active ; une seconde compte 138 trames du nouveau tour, dont 32 avec nom fixe sans conflit de référence. Une inspection de fin relève une légende terminée, l’absence de commande Arrêter et aucun nom actif restant. Ces relevés ne sont pas une observation continue de chaque transition ni une capture de la parole JAWS.

Les examens des 3–4 octobre confirment l’exposition/masquage des 43 mêmes cartes et un dépliage clavier réel. D’autres raisonnements inspectés présentent du texte ordinaire, sans commande de dépliage individuel : l’absence d’un bouton dans ces rendus ne prouve pas la suppression générale d’une fonction historique. L’adaptation n’ajoute pas de faux boutons sur chaque paragraphe.

**Réception.** Le 4 octobre, les points sans réserve de la validation globale sont acceptés. L’utilisateur accepte aussi le regroupement des analyses sauf observation contraire, en précisant que reproduire de nouveaux cas est difficile et que le cas examiné semblait fonctionner. Cette limite de reproductibilité demeure : le regroupement est une organisation locale reçue dans le cas observé, pas une obligation universelle démontrée pour tout raisonnement.

## 2C — Sélection étendue et informations qui l’accompagnent

**Besoin d’accessibilité.** L’utilisateur doit pouvoir établir une sélection qui traverse plusieurs messages avec ses commandes habituelles, puis retrouver le contenu voulu dans la copie. Dans le retour du 4 octobre, la sélection des éléments de discussion fonctionne avec réserve ; les dates/heures affichées et « Vous avez dit » manquent, tandis que « ChatGPT a dit » est déjà copié. La demande porte aussi sur le texte utile ailleurs dans la page.

**Constats techniques.** Dans le rendu inspecté, les titres de locuteur utilisateur et les dates visibles portent `user-select: none`. Ce mécanisme est distinct de la virtualisation du point 2A. [page-selection.js](../../extension/page-selection.js) et [reasoning-selection.css](../../extension/reasoning-selection.css) rendent sélectionnable le texte ciblé, y compris les deux locuteurs et les dates affichées, sans dévoiler les panneaux repliés ni modifier les éditeurs. Les dates ne sont ni recalculées ni ajoutées.

Une petite sélection synthétique dans Chrome comprend les deux locuteurs, une date/heure et le texte de navigation, sans doublon. La copie de session navigateur conserve ces éléments. Le 4 octobre, cette petite sélection/copie est ensuite reçue dans les points acceptés de la version 3.3.1. Cela ne prouve pas une copie intégrale de toute longue conversation sous Windows/JAWS.

**Comparaison native du 6 octobre 2026, 23 h 48 à Bruxelles.** Dans Edge, sans l’extension selon la déclaration utilisateur et sans marqueur de l’adaptation relevé, l’interface est en `fr-FR`. Une sélection à la souris de deux paragraphes d’une réponse produit 607 caractères ; Ctrl+C fournit 606 caractères dans le canal de session navigateur. L’égalité exacte est fausse, mais l’égalité après normalisation des espaces est vraie. Edge indique 154.0.4258.62 et Chromium 154.0.8037.98.

**Ce que cette comparaison établit.** Une sélection native manuelle multiparagraphe et une copie correspondante existent dans le rendu testé sans l’extension. Il serait donc inexact d’affirmer que toute sélection native est impossible. La mesure ne valide ni les gestes du curseur JAWS sous Windows, ni une sélection globale massive, ni la présence de toutes les métadonnées demandées. Elle ne révèle pas une politique voulue d’OpenAI concernant la sélection : elle borne le problème au parcours accessible et à l’étendue effectivement vérifiés.

**Résultat souhaité.** Vérifier ensemble la stabilité des tours chargés, la sélection par les commandes de technologie d’assistance et la présence des informations de locuteur/date déjà exposées. Distinguer le texte rendu, la sélection, les formats copiés et le presse-papiers réellement relu.

## 2D — Comprendre la réussite de Copier et Partager sans perdre sa position

### Partager la conversation

L’utilisateur rapporte une absence d’annonce après activation et un retour au sommet. Les deux phrases de confirmation étaient présentes dans la notification native inspectée le 5 octobre : « Le lien public a été copié. » et « Toute personne disposant du lien peut consulter cette conversation. » Le bouton est temporairement désactivé nativement ; le focus DOM tombe sur `BODY`, puis n’est pas rendu au bouton.

Le premier retour différé de l’extension était insuffisant : l’utilisateur subissait encore le saut initial avant le rappel. La variante conservant le bouton focalisable durant l’attente, avec indisponibilité exposée et seconde activation empêchée, est reçue le 5 octobre : le bouton semble fonctionner comme attendu. [feedback-actions.js](../../extension/feedback-actions.js) reprend les phrases natives après confirmation et conserve la position. Le maintien du focus DOM et la réception JAWS ont été contrôlés séparément.

### Copier un message

Le site donne au bouton le nom temporaire « Copié » après réussite. Aucune notification séparée native « Message copié » n’a été trouvée dans le chemin inspecté. **L’annonce séparée « Message copié » est ajoutée par l’extension**, sur le signal de réussite natif ; elle n’est pas présentée comme la révélation d’une phrase native cachée.

Pour les réponses, l’utilisateur constatait que Copier devenait absent de son parcours JAWS pendant une à deux secondes et que la lecture atteignait directement Partager. Pour les messages envoyés, JAWS répétait « Copier le message », parfois au détriment de la confirmation. Les traces DOM gardaient pourtant le bouton connecté et focalisé : elles n’expliquent pas à elles seules la position du curseur JAWS.

Le site expose `aria-busy` et `aria-disabled` durant l’attente des copies de réponse, contrairement aux messages envoyés. Après réussite, le callback rendu est temporairement retiré dans les deux familles : environ deux secondes pour les réponses et une seconde et demie pour les messages envoyés. Les essais isolés de nom stable puis d’icône décorative n’ont pas suffi à résoudre les symptômes physiques.

Le traitement ciblé de l’état occupé sur les réponses conserve leur indisponibilité réelle et rend le bouton à nouveau parcourable dans la réception du 5 octobre, sans saut de lecture. Le délai de confirmation de **500 ms après réussite native** est reçu pour les deux familles. L’indisponibilité des messages envoyés est ensuite exposée localement pendant la suspension réelle de leur action, sans désactivation HTML qui ferait perdre le focus ; cette indication et son retour normal sont aussi reçus.

**Attribution.** L’absence de confirmation audible, l’absence transitoire de Copier dans le parcours rapporté et l’indisponibilité fonctionnelle non exposée sont des faits distincts. La notification ajoutée et le délai choisi sont des adaptations locales ; le traitement de l’état occupé est une compatibilité reçue dans la combinaison testée, sans preuve d’un défaut interne de JAWS.

## 2E — Poignées inactives des champs de rédaction

L’utilisateur rencontre quatre boutons sans étiquette descriptive à la fin du document, par paires, lorsqu’un champ copiable/modifiable est présent. Ils correspondent aux poignées de ligne/colonne de tableaux des Writing Blocks. Dans le relevé du 4 octobre, leur seul texte est « ⋮⋮ » ; ils sont visuellement invisibles (`opacity: 0`) et inutilisables à la souris (`pointer-events: none`), mais restent accessibles comme boutons.

Deux problèmes sont à distinguer : exposition de contrôles actuellement inactifs et absence de nom informatif. Le code natif leur associe des menus d’ajout/suppression de lignes ou colonnes lorsqu’un tableau est ciblé.

[writing-block-accessibility.js](../../extension/writing-block-accessibility.js) exclut uniquement ces poignées lorsqu’elles sont invisibles et inactives. Les nœuds, champs, commandes Copier et callbacks sont conservés. Une poignée réellement activée/visible retrouve son état natif ; l’adaptation n’étiquette pas artificiellement les commandes actives.

Seize contrôles Chromium vérifient notamment le passage de quatre boutons accessibles à zéro, leur omission par Tab, l’édition/copie intactes et la réversibilité. Le retrait des poignées inactives et le maintien du champ/Copier sont reçus dans le retour du 4 octobre à 21 h 15. Aucun test de parole exhaustive ni de tous les tableaux actifs n’en est déduit.

## 2F — Repère « Dernière réponse » redondant

Un titre `h4` « Dernière réponse », placé hors du message, ajoute un arrêt de navigation que l’utilisateur souhaite supprimer tout en gardant les titres des messages. [ui-accessibility.js](../../extension/ui-accessibility.js) exclut uniquement ce repère exact du parcours et du focus ; les titres utiles du contenu sont conservés.

Le retrait figure dans les points sans réserve acceptés lors de la réception globale du 4 octobre. Il s’agit d’une simplification de navigation demandée ; la seule présence d’un titre supplémentaire ne démontre pas, à elle seule, une violation universelle de conception.

## Portée du signalement

Ces cas précis peuvent servir de vérifications pour les futures interfaces : continuité de lecture, nom/stabilité des commandes, disponibilité fonctionnelle, mise à jour des annonces et exposition des contrôles inactifs. Ils ne valident pas tous les comptes, navigateurs, lecteurs d’écran ou rendus futurs.

Les parcours adaptés restent validés aux dates indiquées. La navigation montante et descendante est également reçue en 3.6.2 le 7 octobre. Aucun nouvel essai adapté n’est demandé en l’absence de régression ; l’actualité des défauts natifs se vérifie séparément.

Les constats décrivent les rendus examinés aux dates indiquées. Une reproduction ultérieure doit relever son propre environnement et peut modifier les conclusions. Aucun corps de conversation, identifiant, nom de projet, adresse personnelle, contenu de presse-papiers ni URL de conversation privée n’est requis par les pièces locales.

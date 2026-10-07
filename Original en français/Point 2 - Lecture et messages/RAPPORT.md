# Point 2 — Lecture, sélection et commandes des messages

Les heures locales citées dans ce document sont en heure de Bruxelles (Europe/Brussels, UTC+02:00 pour les dates de septembre et début octobre 2026). Les horodatages techniques conservent leur fuseau explicite ; le suffixe ISO `Z` désigne UTC.

Ce dossier décrit les constats établis les 3–5 octobre 2026, complétés par une observation ciblée de sélection native le 6 octobre, puis un contrôle de virtualisation et une réception du contournement le 7 octobre. Une nouvelle réception du site natif, dans Chrome extension désactivée selon le protocole, commence le **7 octobre à 19 h 18** et se termine à **22 h 40**, Europe/Brussels. Les [retours reçus](preuves/reception-native-2026-10-07.json) précisent les parcours ci-dessous. Les corrections locales ne signifient pas que le site a été corrigé par OpenAI ; les essais comparatifs du raisonnement avec GPT-6 puis GPT-5.6 confirment le besoin de conserver le repère précoce et l’ordre de lecture adapté.

Le contexte de réception principal est Windows 10, Chrome et JAWS 2021 inchangé, selon les déclarations de l’utilisateur et les relevés. Les versions exactes et leur provenance figurent dans [l’environnement commun](../ENVIRONNEMENT.md). L’utilisateur déclare les mêmes résultats dans Opera après une vérification récente, ainsi que dans Edge et avec JAWS 2025 d’après son expérience. Les observations DOM, l’arbre d’accessibilité du navigateur, les copies de session navigateur et la parole/navigation JAWS restent distincts. Les transcriptions privilégient les libellés utiles ; un rôle non cité n’est pas nécessairement absent de la parole.

Les [reproductions](reproductions/PROCEDURES.md) permettent de vérifier chaque sous-point indépendamment, sans utiliser une conversation privée. Les [constats structurés](preuves/constats-2026-10-03-05.json) reprennent uniquement dates, mécanismes, résultats et limites. Les [sources et mécanismes natifs](preuves/mecanismes-natifs.md) donnent les contrats, branches et signatures observés ; les [tests et fixtures ciblés](reproductions/EXECUTION.md) vérifient séparément l’adaptation. La [sélection native du 6 octobre](preuves/selection-native-2026-10-06.json) dispose d’une preuve séparée.

## 2A — Parcourir une longue conversation sans perdre les messages

**Difficulté signalée et reçue le 7 octobre.** La lecture aux flèches d’une longue conversation produit des sauts en remontant comme en redescendant, notamment lors d’un parcours du bas vers le haut. Aucun seuil de longueur précis n’est revendiqué. Les messages éloignés de la zone visible peuvent disparaître du document rendu ; le parcours et une sélection qui les traverse perdent alors leur position ou leur contenu. Garder une hauteur vide à la place d’un message ne rend pas son texte disponible au curseur virtuel.

**Mécanisme observé.** La génération d’interface inspectée utilise un virtualiseur qui calcule la plage de tours à rendre selon le défilement. Un relevé technique historique du 30 septembre comptait 126 entrées de conversation, dont cinq montées initialement. Le paramètre interne `retainedTurnKeys` permettait de conserver les entrées hors plage : l’essai de ce paramètre rendait les 126 entrées avec leurs nœuds maintenus après défilement dans les deux sens. Ce relevé décrit ce chargement précis ; il ne compte pas toutes les conversations et ne récupère pas des messages absents du serveur.

**Adaptation locale.** [keep-modern-turns.js](../../extension/keep-modern-turns.js) conserve les tours déjà disponibles au moyen de ce contrat de rendu, sans cloner leurs nœuds. [keep-turns.js](../../extension/keep-turns.js) couvre séparément l’ancienne génération reposant sur les intersections. L’extension ne neutralise pas tous les observateurs de la page et ne substitue pas de messages de remplacement.

**Complément du 7 octobre.** Le composant natif conserve le contrat de rétention décrit ci-dessus. Dans la vue visible examinée sans maintien local appliqué, 6 lignes sont montées pour 17 entrées disponibles. Le contournement rend ensuite 27 entrées/27 lignes dans l’essai technique, avec les sept nœuds initiaux toujours connectés au retour au bas. L’utilisateur reçoit positivement le parcours montant et descendant avec la version 3.6.2 : « d'après mon test, c'est OK. » La [preuve datée](preuves/2A-virtualisation-2026-10-07.json) précise les conditions et distingue les comptes DOM de la réception. Ces résultats soutiennent le mécanisme déjà signalé ; ils ne constituent pas un nouveau défaut natif.

**Réception et limite.** Deux retours historiques sont conservés avec leur date : le 17 septembre à 21 h 39 min 32 s Bruxelles, « d’après mes tests, la navigation et la sélection dans la page fonctionnent » ; le 30 septembre à 20 h 53 min 56 s, « Je confirme qu’à priori, l’ajustement semble fonctionner ». Le parcours des conversations proposé dans la réception globale du 4 octobre est ensuite accepté pour les points sans réserve. Le 7 octobre ajoute la réception du parcours montant et descendant en 3.6.2. Cela établit l’acquis de lecture et de stabilité dans l’usage rapporté. La présence DOM et l’identité des nœuds sont vérifiées techniquement ; elles ne constituent pas une comparaison exacte entre toute une longue conversation et son contenu copié dans le presse-papiers Windows. Le contrat interne du site peut évoluer.

**Résultat souhaité côté produit.** Permettre une lecture continue et une sélection étendue des tours chargés avec un lecteur d’écran, même quand le rendu visuel optimise les messages hors écran. Vérifier le parcours montant, descendant et les changements de conversation sans déduire l’accès au texte de la seule hauteur de ses emplacements.

## 2B — Repérer la réponse et parcourir le raisonnement

Trois comportements doivent être séparés.

1. **Repère de locuteur précoce.** Le 7 octobre, deux générations natives sont comparées : GPT-6, interrompue par l’utilisateur, puis GPT-5.6 menée à son terme. Avec GPT-5.6, « ChatGPT a dit » reste absent pendant la réflexion et apparaît après sa fin. Dans la séquence GPT-6 interrompue, un titre assistant apparaît pendant une activité intermédiaire puis disparaît après l’arrêt. L’utilisateur décrit une structure de commentaires intermédiaires avec titres ; elle ne constitue pas une correction générale du repère de locuteur. [reasoning-accessibility.js](../../extension/reasoning-accessibility.js) conserve donc son repère précoce près de l’ancre native et le traitement de son doublon exact. La [chronologie comparative](preuves/2B-titre-raisonnement-gpt6-gpt56-2026-10-07.json) distingue mesures DOM et retour JAWS.
2. **État actif et fin du raisonnement.** Dans les deux modèles, l’utilisateur confirme que l’état courant est au-dessus du repère assistant dans le parcours JAWS, au lieu de suivre le repère dans la continuité naturelle de lecture. Quand le titre existe, la trace relève également l’en-tête d’activité avant celui-ci. Les détails déjà réalisés restent après le titre dans le bon ordre, selon son retour. L’adaptation de l’état actif dans les détails et du nom constant de la commande est maintenue ; à la fin, le nom et la durée natifs redeviennent ceux de la commande sans seconde exposition identique. L’absence de repère au début de la réflexion et l’ordre du statut courant sont deux barrières distinctes à la lecture au clavier.
3. **Cartes d’analyse autonomes.** Un exemple inspecté comportait 43 cartes Python natives, sœurs du groupe de raisonnement, qui restaient indépendantes de son repli. [analysis-details-accessibility.js](../../extension/analysis-details-accessibility.js) ajoute une commande d’ensemble liée au repli principal, sans déplacer ni cloner les cartes. L’ouverture d’ensemble révèle leurs boutons natifs ; Espace sur une commande « Analysé » ouvre son contenu existant.

**Preuves.** Les captures du 3 octobre sont échantillonnées : une première fenêtre compte 78 trames, dont 73 avec action active ; une seconde compte 138 trames du nouveau tour, dont 32 avec nom fixe sans conflit de référence. Une inspection de fin relève une légende terminée, l’absence de commande Arrêter et aucun nom actif restant. Ces relevés ne sont pas une observation continue de chaque transition ni une capture de la parole JAWS.

Les examens des 3–4 octobre confirment l’exposition/masquage des 43 mêmes cartes et un dépliage clavier réel. D’autres raisonnements inspectés présentent du texte ordinaire, sans commande de dépliage individuel : l’absence d’un bouton dans ces rendus ne prouve pas la suppression générale d’une fonction historique. L’adaptation n’ajoute pas de faux boutons sur chaque paragraphe.

**Réception.** Le 4 octobre, les points sans réserve de la validation globale sont acceptés. L’utilisateur accepte aussi le regroupement des analyses sauf observation contraire, en précisant que reproduire de nouveaux cas est difficile et que le cas examiné semblait fonctionner. Cette limite de reproductibilité demeure : le regroupement est une organisation locale reçue dans le cas observé, pas une obligation universelle démontrée pour tout raisonnement.

## 2C — Sélection étendue et informations qui l’accompagnent

**Distinction reçue le 7 octobre.** La sélection native fonctionne tant qu’un saut de position ne l’interrompt pas. Le défaut d’accessibilité concerne ces sauts, le maintien des messages dans le document, la lecture au clavier et la copie de longues portions. L’utilisateur constate séparément que la copie native n’inclut ni **« Vous avez dit »**, ni **« ChatGPT a dit »**, ni la durée de réflexion, ni les dates/heures. Leur inclusion reste une **demande produit**, utile pour reconnaître le locuteur et les horodatages, et non un défaut d’accessibilité établi en soi. Le retour historique du 4 octobre où « ChatGPT a dit » était copié concerne le parcours adapté et conserve son contexte.

**Constats techniques.** Dans le rendu inspecté, les titres de locuteur utilisateur et les dates visibles portent `user-select: none`. Ce mécanisme est distinct de la virtualisation du point 2A. [page-selection.js](../../extension/page-selection.js) et [reasoning-selection.css](../../extension/reasoning-selection.css) rendent sélectionnable le texte ciblé, y compris les deux locuteurs et les dates affichées, sans dévoiler les panneaux repliés ni modifier les éditeurs. Les dates ne sont ni recalculées ni ajoutées.

Une petite sélection synthétique dans Chrome comprend les deux locuteurs, une date/heure et le texte de navigation, sans doublon. La copie de session navigateur conserve ces éléments. Le 4 octobre, cette petite sélection/copie est ensuite reçue dans les points acceptés de la version 3.3.1. Cela ne prouve pas une copie intégrale de toute longue conversation sous Windows/JAWS.

**Comparaison native du 6 octobre 2026, 23 h 48 à Bruxelles.** Dans Edge, sans l’extension selon la déclaration utilisateur et sans marqueur de l’adaptation relevé, l’interface est en `fr-FR`. Une sélection à la souris de deux paragraphes d’une réponse produit 607 caractères ; Ctrl+C fournit 606 caractères dans le canal de session navigateur. L’égalité exacte est fausse, mais l’égalité après normalisation des espaces est vraie. Edge indique 154.0.4258.62 et Chromium 154.0.8037.98.

**Ce que cette comparaison établit.** Une sélection native manuelle multiparagraphe et une copie correspondante existent dans le rendu testé sans l’extension. Il serait donc inexact d’affirmer que toute sélection native est impossible. La mesure ne valide ni les gestes du curseur JAWS sous Windows, ni une sélection globale massive, ni la présence de toutes les métadonnées demandées. Elle ne révèle pas une politique voulue d’OpenAI concernant la sélection : elle borne le problème au parcours accessible et à l’étendue effectivement vérifiés.

**Résultat souhaité.** Assurer la stabilité des tours et de la sélection par les commandes de technologie d’assistance. Examiner séparément la demande d’inclure les locuteurs, durées et horodatages déjà exposés dans la copie. Distinguer texte rendu, sélection, formats copiés et presse-papiers relu, sans transformer une exclusion produit de métadonnées en défaut d’accessibilité par hypothèse.

## 2D — Comprendre la réussite de Copier et Partager sans perdre sa position

### Partager la conversation

Le 7 octobre, l’utilisateur revérifie et confirme le défaut natif inchangé : **Partager la discussion renvoie au haut de la page, sans annonce de confirmation JAWS**. Les deux phrases de confirmation étaient présentes dans la notification native inspectée le 5 octobre : « Le lien public a été copié. » et « Toute personne disposant du lien peut consulter cette conversation. » Le bouton est temporairement désactivé nativement ; le focus DOM tombe sur `BODY`, puis n’est pas rendu au bouton.

Le premier retour différé de l’extension était insuffisant : l’utilisateur subissait encore le saut initial avant le rappel. La variante conservant le bouton focalisable durant l’attente, avec indisponibilité exposée et seconde activation empêchée, est reçue le 5 octobre : le bouton semble fonctionner comme attendu. [feedback-actions.js](../../extension/feedback-actions.js) reprend les phrases natives après confirmation et conserve la position. Le maintien du focus DOM et la réception JAWS ont été contrôlés séparément.

### Copier un message

Le site donne au bouton le nom temporaire « Copié » après réussite. Aucune notification séparée native « Message copié » n’a été trouvée dans le chemin inspecté. **L’annonce séparée « Message copié » est ajoutée par l’extension**, sur le signal de réussite natif ; elle n’est pas présentée comme la révélation d’une phrase native cachée.

Le 7 octobre, le défaut natif est de nouveau reçu : **pas d’annonce de copie et saut vers « Partager » pour les réponses**. Le retour historique décrivait Copier absent du parcours JAWS pendant une à deux secondes. Pour les messages envoyés, JAWS répétait « Copier le message », parfois au détriment de la confirmation. Les traces DOM gardaient pourtant le bouton connecté et focalisé : elles n’expliquent pas à elles seules la position du curseur JAWS. Les réceptions adaptées du 5 octobre restent acquises.

Le site expose `aria-busy` et `aria-disabled` durant l’attente des copies de réponse, contrairement aux messages envoyés. Après réussite, le callback rendu est temporairement retiré dans les deux familles : environ deux secondes pour les réponses et une seconde et demie pour les messages envoyés. Les essais isolés de nom stable puis d’icône décorative n’ont pas suffi à résoudre les symptômes physiques.

Le traitement ciblé de l’état occupé sur les réponses conserve leur indisponibilité réelle et rend le bouton à nouveau parcourable dans la réception du 5 octobre, sans saut de lecture. Le délai de confirmation de **500 ms après réussite native** est reçu pour les deux familles. L’indisponibilité des messages envoyés est ensuite exposée localement pendant la suspension réelle de leur action, sans désactivation HTML qui ferait perdre le focus ; cette indication et son retour normal sont aussi reçus.

**Attribution.** L’absence de confirmation audible, l’absence transitoire de Copier dans le parcours rapporté et l’indisponibilité fonctionnelle non exposée sont des faits distincts. La notification ajoutée et le délai choisi sont des adaptations locales ; le traitement de l’état occupé est une compatibilité reçue dans la combinaison testée, sans preuve d’un défaut interne de JAWS.

## 2E — Poignées inactives des champs de rédaction

Le 7 octobre, l’utilisateur confirme le problème natif inchangé des Writing Blocks. Sa reproduction est de demander un texte réutilisable et copiable, attendre la fin complète de la génération, puis aller tout au bas de la page : les boutons inutiles y restent présents, sans commande explicitement compréhensible. Le relevé historique compte quatre boutons par paires, correspondant aux poignées de ligne/colonne de tableaux. Leur seul texte est « ⋮⋮ » ; visuellement invisibles (`opacity: 0`) et inutilisables à la souris (`pointer-events: none`), ils restent accessibles comme boutons. La réception récente ne prétend pas recompter techniquement ces nœuds.

Deux problèmes sont à distinguer : exposition de contrôles actuellement inactifs et absence de nom informatif. Le code natif leur associe des menus d’ajout/suppression de lignes ou colonnes lorsqu’un tableau est ciblé.

[writing-block-accessibility.js](../../extension/writing-block-accessibility.js) exclut uniquement ces poignées lorsqu’elles sont invisibles et inactives. Les nœuds, champs, commandes Copier et callbacks sont conservés. Une poignée réellement activée/visible retrouve son état natif ; l’adaptation n’étiquette pas artificiellement les commandes actives.

Seize contrôles Chromium vérifient notamment le passage de quatre boutons accessibles à zéro, leur omission par Tab, l’édition/copie intactes et la réversibilité. Le retrait des poignées inactives et le maintien du champ/Copier sont reçus dans le retour du 4 octobre à 21 h 15. Aucun test de parole exhaustive ni de tous les tableaux actifs n’en est déduit.

## 2F — Repère « Dernière réponse » redondant

Le 7 octobre, l’utilisateur confirme la présence native persistante de **« Dernière réponse »**. Ce titre `h4`, placé hors du message, ajoute un arrêt de navigation qu’il souhaite supprimer tout en gardant les titres des messages. [ui-accessibility.js](../../extension/ui-accessibility.js) exclut uniquement ce repère exact du parcours et du focus ; les titres utiles du contenu sont conservés.

Le retrait figure dans les points sans réserve acceptés lors de la réception globale du 4 octobre. Il s’agit d’une simplification de navigation demandée ; la seule présence d’un titre supplémentaire ne démontre pas, à elle seule, une violation universelle de conception.

## Portée du signalement

Ces cas précis peuvent servir de vérifications pour les futures interfaces : continuité de lecture, nom/stabilité des commandes, disponibilité fonctionnelle, mise à jour des annonces et exposition des contrôles inactifs. Ils ne valident pas tous les comptes, navigateurs, lecteurs d’écran ou rendus futurs.

Les parcours adaptés restent validés aux dates indiquées. La navigation montante et descendante est également reçue en 3.6.2 le 7 octobre. Les retours natifs du 7 octobre confirment les obstacles de lecture longue, copie, partage et Writing Blocks, ainsi que la présence de Dernière réponse. La comparaison GPT-6/GPT-5.6 établit les comportements du titre et de l’état courant décrits en 2B ; les adaptations correspondantes sont maintenues.

Les constats décrivent les rendus examinés aux dates indiquées. Une reproduction ultérieure doit relever son propre environnement et peut modifier les conclusions. Aucun corps de conversation, identifiant, nom de projet, adresse personnelle, contenu de presse-papiers ni URL de conversation privée n’est requis par les pièces locales.

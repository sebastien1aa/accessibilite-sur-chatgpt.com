# Point 2 — Lecture, sélection et commandes des messages

Ce Point traite de la lecture et des commandes des messages : continuité des longues conversations, repères du raisonnement, sélection, confirmations de copie/partage, champs générés, titres et références Web. Les demandes d’organisation et d’inclusion des métadonnées sont distinguées des obstacles d’accessibilité.

Les [conditions et versions](../ENVIRONNEMENT.md) sont communes. Les [procédures du site](reproductions/PROCEDURES.md), les [preuves natives et retours JAWS](preuves/reception-native-2026-10-07.json), les [mécanismes natifs](preuves/mecanismes-natifs.md) et les [tests isolés](reproductions/EXECUTION.md) accompagnent les sous-points. Le démonstrateur fourni est la **4.1.2** ; les preuves gardent leur date et distinguent résultats DOM/AX et retours JAWS.

## 2A — Parcourir une longue conversation sans perdre les messages

**Problème.** Des sauts de lecture et des tours non montés interrompent le parcours aux flèches d’une longue conversation.

**Résultat attendu.** Lire et sélectionner les tours chargés continûment, même hors de la zone visible.

**Reproduction.** [Parcours 2A](reproductions/PROCEDURES.md#2a--lecture-longue).

**Difficulté signalée et reçue le 7 octobre.** La lecture aux flèches d’une longue conversation produit des sauts en remontant comme en redescendant, notamment lors d’un parcours du bas vers le haut. Aucun seuil de longueur précis n’est revendiqué. Les messages éloignés de la zone visible peuvent disparaître du document rendu ; le parcours et une sélection qui les traverse perdent alors leur position ou leur contenu. Garder une hauteur vide à la place d’un message ne rend pas son texte disponible au curseur PC virtuel.

**Mécanisme observé.** La génération d’interface inspectée utilise un virtualiseur qui calcule la plage de tours à rendre selon le défilement. Un relevé technique historique du 30 septembre comptait 126 entrées de conversation, dont cinq montées initialement. Le paramètre interne `retainedTurnKeys` permettait de conserver les entrées hors plage : l’essai de ce paramètre rendait les 126 entrées avec leurs nœuds maintenus après défilement dans les deux sens. Ce relevé décrit ce chargement précis ; il ne compte pas toutes les conversations et ne récupère pas des messages absents du serveur.

**Adaptation locale.** [keep-modern-turns.js](../../extension/keep-modern-turns.js) conserve les tours déjà disponibles au moyen de ce contrat de rendu, sans cloner leurs nœuds. [keep-turns.js](../../extension/keep-turns.js) couvre séparément l’ancienne génération reposant sur les intersections. L’extension ne neutralise pas tous les observateurs de la page et ne substitue pas de messages de remplacement.

**Complément du 7 octobre.** Le composant natif conserve le contrat de rétention décrit ci-dessus. Dans la vue visible examinée sans maintien local appliqué, 6 lignes sont montées pour 17 entrées disponibles. Le contournement rend ensuite 27 entrées/27 lignes dans l’essai technique, avec les sept nœuds initiaux toujours connectés au retour au bas. L’utilisateur reçoit positivement le parcours montant et descendant avec l’adaptation alors testée : « d'après mon test, c'est OK. » La [preuve datée](preuves/2A-virtualisation-2026-10-07.json) précise les conditions et distingue les comptes DOM de la réception. Ces résultats soutiennent le mécanisme déjà signalé ; ils ne constituent pas un défaut natif supplémentaire.

**Réception et limite.** Deux retours historiques sont conservés avec leur date : le 17 septembre à 21 h 39 min 32 s Bruxelles, « d’après mes tests, la navigation et la sélection dans la page fonctionnent » ; le 30 septembre à 20 h 53 min 56 s, « Je confirme qu’à priori, l’ajustement semble fonctionner ». Le parcours des conversations proposé dans la réception globale du 4 octobre est ensuite accepté pour les points sans réserve. Le 7 octobre ajoute la réception du parcours montant et descendant. Cela établit l’acquis de lecture et de stabilité dans l’usage rapporté. La présence DOM et l’identité des nœuds sont vérifiées techniquement ; elles ne constituent pas une comparaison exacte entre toute une longue conversation et son contenu copié dans le presse-papiers Windows. Le contrat interne du site peut évoluer.

**Résultat souhaité côté produit.** Permettre une lecture continue et une sélection étendue des tours chargés avec un lecteur d’écran, même quand le rendu visuel optimise les messages hors écran. Vérifier le parcours montant, descendant et les changements de conversation sans déduire l’accès au texte de la seule hauteur de ses emplacements.

## 2B — Repérer la réponse et parcourir le raisonnement

**Problème.** Avec GPT‑5.6, le titre « ChatGPT a dit » manque au début de la réflexion. Avec GPT‑6, le titre « ChatGPT a dit » est présent dès le début de la réflexion. Dans les deux modèles, l’activité courante précède les détails accomplis et sa légende peut être lue deux fois.

**Résultat attendu.** Titre « ChatGPT a dit » dès le début avec GPT‑5.6 et titre natif conservé avec GPT‑6 ; étapes accomplies puis activité courante dans les deux modèles, commande explicite et durée finale sans doublon.

**Reproduction.** [Parcours 2B](reproductions/PROCEDURES.md#2b--repères-et-ordre-du-raisonnement).

### Observations natives : deux rendus de raisonnement

**GPT‑5.6 Sol.** Le titre « ChatGPT a dit » n’apparaît qu’après la fin de la réflexion et demeure alors normalement présent une fois la réponse intégrée au chat. La comparaison native du 7 octobre documente cette distinction entre réflexion en cours et réponse intégrée. L’activité en cours est située au-dessus du repère dans le parcours JAWS ; les détails accomplis suivent le repère dans le bon ordre.

**GPT‑6 en raisonnement Élevé.** Le titre « ChatGPT a dit » est présent dès le début de la réflexion. Les générations menées à leur terme présentent aussi plusieurs commentaires intermédiaires avec des titres « ChatGPT a dit ». Le problème demeure l’ordre de lecture : l’activité courante reste avant les étapes accomplies pour JAWS. Le niveau Élevé est précisé par l’utilisateur ; les compteurs et phases sont des observations structurelles distinctes.

Les preuves principales sont le [contrat d’un tour terminé du 7 octobre](preuves/2026-10-07-contrat-raisonnement-gpt6.json), les [régions et titres observés le 8 octobre](preuves/2026-10-08-regions-raisonnement.json) et l’[extrait de trace actif puis terminé](preuves/2B-generations-terminees-gpt6-2026-10-08.json). Les propriétés natives donnent completed=true et une réponse finale commencée ; la trace montre aussi une région passer d’activité à achèvement. La première [comparaison GPT‑6/GPT‑5.6](preuves/2B-titre-raisonnement-gpt6-gpt56-2026-10-07.json) conserve uniquement sa portée historique, notamment la chronologie GPT‑5.6.

**Légende et commande.** L’activité ou « Réfléchi pendant [durée] » est annoncée par le bouton puis répétée sur la ligne suivante sans rôle particulier, selon le retour JAWS. Ce doublon exact est distinct des titres légitimes de commentaires. Pendant l’activité, « bouton réduit/étendu » seul ne dit pas clairement Afficher/Masquer les détails.

**Cartes autonomes.** L’exemple documenté comporte 43 cartes Python natives, sœurs du groupe de raisonnement et indépendantes de son repli. Leur présence multiplie les arrêts de lecture. Ce rendu spécifique est distingué des détails textuels ordinaires et des régions GPT‑6.

### Mesures et réception

**Mesures historiques.** Les captures du 3 octobre sont échantillonnées : une première fenêtre compte 78 trames, dont 73 avec action active ; une seconde compte 138 trames du nouveau tour, dont 32 avec nom fixe sans conflit de référence. Une inspection de fin relève une légende terminée, l’absence de commande Arrêter et aucun nom actif restant. Ces relevés ne sont pas une observation continue de chaque transition ni une capture de la parole JAWS.

Les examens des 3–4 octobre confirment l’exposition/masquage des 43 mêmes cartes et un dépliage clavier réel. D’autres raisonnements inspectés présentent du texte ordinaire, sans commande de dépliage individuel : l’absence d’un bouton dans ces rendus ne prouve pas la suppression générale d’une fonction historique. L’adaptation n’ajoute pas de faux boutons sur chaque paragraphe.

**Réception.** Le 4 octobre, les points sans réserve de la validation globale sont acceptés. L’utilisateur accepte aussi le regroupement des analyses sauf observation contraire, en précisant que reproduire de nouveaux cas est difficile et que le cas examiné semblait fonctionner. Cette limite de reproductibilité demeure : le regroupement est une organisation locale reçue dans le cas observé, pas une obligation universelle démontrée pour tout raisonnement.


**Provenance du complément.** Le retour JAWS du 7 octobre vers 23 h 20, heure de Bruxelles (Europe/Brussels, UTC+02:00), précise l’ordre de l’activité et la répétition décrits dans les observations natives ci-dessus. Les titres de commentaires distincts restent hors de ce doublon.

### Code natif et illustration du contournement

**Deux contrats natifs.** Le groupe GPT-5.6 inspecté expose notamment `summary`, `shouldAnimateInitialCollapse` et, pendant l’activité, `defaultExpanded`. Le composant régional GPT-6 expose `region`, `completed`, `reasoningRecap`, `activeSummary`, `canExpand`, `hasStandaloneItems` et `hideHeader`. Le [complément structurel du 8 octobre](preuves/2026-10-08-regions-raisonnement.json) retrouve des titres « ChatGPT a dit » successifs dans les commentaires intermédiaires. Ces titres distincts ne sont pas assimilés au doublon de la légende d’activité ou de durée. Les régions `prefix` et `suffix` possèdent leur propre phase : un commentaire assistant déjà commencé ailleurs dans le tour ne signifie pas que leur activité est terminée. La légende référencée par le bouton reste un élément séparément exposé dans le rendu inspecté. Voir [le contrat natif et son extrait de code](preuves/2026-10-07-contrat-raisonnement-gpt6.json) et [l’analyse des mécanismes](preuves/mecanismes-natifs.md#2b--repères-état-natif-et-branche-des-43-cartes).

**Illustration dans le démonstrateur 4.1.2.** [analysis-details-accessibility.js](../../extension/analysis-details-accessibility.js) fournit une commande d’ensemble pour les cartes autonomes reconnues, en conservant leurs boutons « Analysé » et leur contenu. Le [module de raisonnement](../../extension/reasoning-accessibility.js) distingue ces contrats et suit la phase locale du groupe reconnu. Il reconnaît aussi la région dès ses activités initiales, sans exiger qu’un premier item de type reasoning soit déjà présent. Un groupe direct dont les propriétés arrivent tardivement est réexaminé à une mutation de ses descendants, sans lire leur corps. Il place un résumé du statut courant à la fin des détails ouverts, donne un nom d’action explicite pendant la réflexion, puis rend au bouton son nom et sa durée natifs après achèvement. La légende répétée demeure visible mais est exclue de sa seconde lecture séparée. Le défaut de titre initial concerne GPT‑5.6 ; le titre natif initial de GPT‑6 est conservé. Le placement de l’activité en cours après les étapes accomplies concerne les deux rendus. Les corps de réflexion, éléments et callbacks natifs sont conservés. Cette démonstration illustre une continuité accessible sans imposer une implémentation aux équipes. Les [60 tests du module](reproductions/reasoning-accessibility.test.cjs) et [15 contrôles Chromium régionaux](preuves/2026-10-08-regions-raisonnement.json) vérifient les mécanismes ; le [retour utilisateur du 8 octobre](../Point%201%20-%20Sélecteur%20et%20composition/preuves/2026-10-08-reception-adaptee.json) reçoit positivement le parcours régional adapté demandé. Les retours natifs et les contrôles techniques conservent leur provenance. La [confirmation de la 4.1.2](../Point%201%20-%20Sélecteur%20et%20composition/preuves/2026-10-08-confirmation-4.1.2.json) maintient cet acquis et reçoit le préfixe final.

## 2C — Sélection étendue et informations qui l’accompagnent

**Problème.** Un saut de lecture interrompt la sélection étendue ; certaines métadonnées visibles sont séparément absentes de la copie.

**Résultat attendu.** Sélection accessible stable ; examen distinct de l’inclusion des locuteurs, durées et horodatages comme demande produit.

**Reproduction.** [Parcours 2C](reproductions/PROCEDURES.md#2c--sélection-et-copie-de-plusieurs-messages).

**Distinction reçue le 7 octobre.** La sélection native fonctionne tant qu’un saut de position ne l’interrompt pas. Le défaut d’accessibilité concerne ces sauts, le maintien des messages dans le document, la lecture au clavier et la copie de longues portions. L’utilisateur constate séparément que la copie native n’inclut ni **« Vous avez dit »**, ni **« ChatGPT a dit »**, ni la durée de réflexion, ni les dates/heures. Leur inclusion reste une **demande produit**, utile pour reconnaître le locuteur et les horodatages, et non un défaut d’accessibilité établi en soi. Le retour historique du 4 octobre où « ChatGPT a dit » était copié concerne le parcours adapté et conserve son contexte.

**Constats techniques.** Dans le rendu inspecté, les titres de locuteur utilisateur et les dates visibles portent `user-select: none`. Ce mécanisme est distinct de la virtualisation du point 2A. [page-selection.js](../../extension/page-selection.js) et [reasoning-selection.css](../../extension/reasoning-selection.css) rendent sélectionnable le texte ciblé, y compris les deux locuteurs et les dates affichées, sans dévoiler les panneaux repliés ni modifier les éditeurs. Les dates ne sont ni recalculées ni ajoutées.

Une petite sélection synthétique dans Chrome comprend les deux locuteurs, une date/heure et le texte de navigation, sans doublon. La copie de session navigateur conserve ces éléments. Le 4 octobre, cette petite sélection/copie est ensuite reçue dans les points acceptés de l’adaptation alors testée. Cela ne prouve pas une copie intégrale de toute longue conversation sous Windows/JAWS.

**Comparaison native du 6 octobre 2026, 23 h 48 à Bruxelles.** Dans Edge, sans l’extension selon la déclaration utilisateur et sans marqueur de l’adaptation relevé, l’interface est en `fr-FR`. Une sélection à la souris de deux paragraphes d’une réponse produit 607 caractères ; Ctrl+C fournit 606 caractères dans le canal de session navigateur. L’égalité exacte est fausse, mais l’égalité après normalisation des espaces est vraie. Edge indique 154.0.4258.62 et Chromium 154.0.8037.98.

**Ce que cette comparaison établit.** Une sélection native manuelle multiparagraphe et une copie correspondante existent dans le rendu testé sans l’extension. Il serait donc inexact d’affirmer que toute sélection native est impossible. La mesure ne valide ni les gestes du curseur JAWS sous Windows, ni une sélection globale massive, ni la présence de toutes les métadonnées demandées. Elle ne révèle pas une politique voulue d’OpenAI concernant la sélection : elle borne le problème au parcours accessible et à l’étendue effectivement vérifiés.

**Résultat souhaité.** Assurer la stabilité des tours et de la sélection par les commandes de technologie d’assistance. Examiner séparément la demande d’inclure les locuteurs, durées et horodatages déjà exposés dans la copie. Distinguer texte rendu, sélection, formats copiés et presse-papiers relu, sans transformer une exclusion produit de métadonnées en défaut d’accessibilité par hypothèse.

## 2D — Comprendre la réussite de Copier et Partager sans perdre sa position

**Problème.** Copier et Partager ne donnent pas de confirmation audible fiable et peuvent déplacer la lecture ; l’indisponibilité des commandes est inégalement exposée.

**Résultat attendu.** Confirmation après réussite, position conservée et indisponibilité compréhensible pendant l’attente.

**Reproduction.** [Parcours 2D](reproductions/PROCEDURES.md#2d--copier-et-partager).

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

**Problème.** Des poignées invisibles et inactives de Writing Blocks restent parcourables comme boutons sans nom informatif.

**Résultat attendu.** Exclure les contrôles inactifs du parcours tout en conservant les commandes actives et nommées.

**Reproduction.** [Parcours 2E](reproductions/PROCEDURES.md#2e--poignées-des-champs-de-rédaction).

Le 7 octobre, l’utilisateur confirme le problème natif inchangé des Writing Blocks. Sa reproduction est de demander un texte réutilisable et copiable, attendre la fin complète de la génération, puis aller tout au bas de la page : les boutons inutiles y restent présents, sans commande explicitement compréhensible. Le relevé historique compte quatre boutons par paires, correspondant aux poignées de ligne/colonne de tableaux. Leur seul texte est « ⋮⋮ » ; visuellement invisibles (`opacity: 0`) et inutilisables à la souris (`pointer-events: none`), ils restent accessibles comme boutons. La réception récente ne prétend pas recompter techniquement ces nœuds.

Deux problèmes sont à distinguer : exposition de contrôles actuellement inactifs et absence de nom informatif. Le code natif leur associe des menus d’ajout/suppression de lignes ou colonnes lorsqu’un tableau est ciblé.

[writing-block-accessibility.js](../../extension/writing-block-accessibility.js) exclut uniquement ces poignées lorsqu’elles sont invisibles et inactives. Les nœuds, champs, commandes Copier et callbacks sont conservés. Une poignée réellement activée/visible retrouve son état natif ; l’adaptation n’étiquette pas artificiellement les commandes actives.

Seize contrôles Chromium vérifient notamment le passage de quatre boutons accessibles à zéro, leur omission par Tab, l’édition/copie intactes et la réversibilité. Le retrait des poignées inactives et le maintien du champ/Copier sont reçus dans le retour du 4 octobre à 21 h 15. Aucun test de parole exhaustive ni de tous les tableaux actifs n’en est déduit.

## 2F — Repère « Dernière réponse » redondant

**Problème.** Le titre « Dernière réponse » ajoute un arrêt redondant dans le parcours des titres.

**Résultat attendu.** Conserver les repères utiles sans cet arrêt supplémentaire ; demande de simplification de navigation.

**Reproduction.** [Parcours 2F](reproductions/PROCEDURES.md#2f--titre--dernière-réponse-).

Le 7 octobre, l’utilisateur confirme la présence native persistante de **« Dernière réponse »**. Ce titre `h4`, placé hors du message, ajoute un arrêt de navigation qu’il souhaite supprimer tout en gardant les titres des messages. [ui-accessibility.js](../../extension/ui-accessibility.js) exclut uniquement ce repère exact du parcours et du focus ; les titres utiles du contenu sont conservés.

Le retrait figure dans les points sans réserve acceptés lors de la réception globale du 4 octobre. Il s’agit d’une simplification de navigation demandée ; la seule présence d’un titre supplémentaire ne démontre pas, à elle seule, une violation universelle de conception.

## 2G — Références Web et contenu des aperçus de sources

**Problème.** Les références de navigation Web sont annoncées comme boutons de menu ; leurs cartes masquent les informations disponibles derrière un nom abrégé et une favicon parasite.

**Résultat attendu.** Liens identifiables, aperçu nommé et contenu disponible lisible sans adresse d’image parasite.

**Reproduction.** [Parcours 2G](reproductions/PROCEDURES.md#2g--références-et-aperçus-de-sources).

### Observations et mécanisme natifs

**Difficultés observées.** Dans des réponses GPT-6, JAWS annonce les références **« Bouton de menu réduit dialogue »**, alors que leur activation ouvre une page Internet. L’[inspection native du 8 octobre 2026](preuves/2026-10-08-sources-natives.json), heure de Bruxelles (Europe/Brussels, UTC+02:00), confirme un `span` de composant `popover-trigger`, de rôle bouton, avec `tabindex="0"`, `aria-haspopup="dialog"` et `aria-expanded`, sans `href`. Les références regroupées ajoutent un compteur au nom de source. Une activation native simple ouvre une page de `codex-reset.com` ; une référence regroupée ouvre une page de `www.sotwe.com`. Ces activations ouvrent également un aperçu contenant respectivement une et deux cartes. La navigation Web est ainsi l’action observée, avec un aperçu secondaire, mais le rôle exposé empêche de retrouver la référence comme lien.

**Contenu et nom de la carte.** Le panneau est un dialogue non modal ajouté par portail à la fin du document ; il contient des cartes interactives et n’est pas un simple tooltip. Le focus sur la référence ouvre l’aperçu sans navigation. Dans le rendu examiné, Tab entre dans sa carte et Échap ferme le panneau en rendant le focus à la référence. Chaque carte utilise un bouton `pressable` nommé `Open [source]`, même dans l’interface française. Le titre et le texte disponible sont pourtant présents dans le DOM et dans des nœuds StaticText non ignorés de l’arbre d’accessibilité. Le `aria-label` abrège le nom du contrôle à la source au lieu de son contenu. Le nom abrégé du contrôle masque ainsi ses informations disponibles dans le parcours décrit.

Extrait structurel natif réduit ; identifiants et contenu privés omis :

```html
<span data-d-component="popover-trigger" role="button" tabindex="0"
      aria-haspopup="dialog" aria-expanded="false">…source…</span>
<div role="dialog" id="…">
  <button data-d-component="pressable" type="button"
          aria-label="Open [source]">…source, titre et texte…</button>
</div>
```

Le gestionnaire natif de clavier transforme Entrée/Espace en activation du contrôle. Le composant d’aperçu fournit les propriétés de bouton/dialogue, tandis que l’action configurée ouvre la destination. Les [liens WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/link/) représentent cette navigation ; les [règles de nommage](https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/) expliquent la priorité du nom explicite sur le contenu d’un lien ou bouton. Le [schéma tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) distingue les informations sans commande focusable des panneaux interactifs non modaux.

Le [W3C explique le texte alternatif vide des images décoratives](https://www.w3.org/WAI/tutorials/images/decorative/) : une image accompagnant un lien textuel sans information supplémentaire doit pouvoir être ignorée ; sans attribut alt, certains lecteurs annoncent son nom de fichier. Cette règle rejoint l’adresse de favicon effectivement rapportée par JAWS.

### Illustration dans le démonstrateur 4.1.2

**Illustration ciblée.** Dans la 4.1.2, [source-links-accessibility.js](../../extension/source-links-accessibility.js) expose les références et leurs cartes comme liens sur les hôtes existants, en conservant les callbacks, clavier et aperçu. Pour les cartes reconnues non vides, il retire le nom abrégé : le nom accessible provient du contenu visible existant. Un dialogue de sources sans nom natif reçoit « Aperçu des sources : [source] » ; un nom natif existant est préservé. La garde exige notamment la citation inline avec badge/favicon et callbacks natifs, le dialogue relié par `aria-controls` avec ID unique, et l’absence de commande interactive imbriquée. Une favicon sans alternative significative dans une référence ou carte reconnue reçoit alt vide : son adresse ne doit pas être annoncée et l’image n’apporte pas d’information supplémentaire au nom voisin. Les alternatives natives significatives, miniatures et écritures étrangères sont préservées. Les autres boutons et panneaux sont exclus. Les attributs sont restaurés à l’arrêt, au changement de langue hors français ou si le contrat cesse de correspondre. Aucun titre, extrait ou corps d’article n’est inventé, copié ou déplacé.

### Mesures, chronologie utile et résultat reçu

**Première restitution du nom.** Après une première adaptation du rôle et du préfixe, le retour JAWS est « Ouvrir [nom du lien hypertexte] » seul en bas du parcours. Ce retour intermédiaire ne décrit pas la restitution actuelle ; il établit que des informations présentes dans le DOM/AX ne devenaient pas utilement lisibles par cette seule adaptation.

**Étape intermédiaire : favicon et présentation.** Le [retour JAWS et la structure de l’image](preuves/2026-10-08-retour-jaws-apercu-4.1.0.json) relèvent « lien graphique » et « S2/favicons », puis des textes accolés et une répétition de la source. La favicon est une image sans attribut `alt` ; le rôle presentation de son parent ne lui donne pas un texte alternatif vide. Son adresse ne fait pas partie du texte visible de la carte. La vérification visuelle montre trois lignes : source, titre et « Total lines: 277 ». Cette dernière métadonnée est réellement présentée par le site. Les sauts de ligne du texte copié et l’annonce d’un seul contrôle lien sont deux présentations différentes ; la disposition visuelle ne garantit pas une lecture ligne par ligne. L’aperçu doit fournir son contenu sans adresse d’image parasite ni répétition trompeuse.

La [preuve du nom et du contenu](preuves/2026-10-08-contenu-apercu-sources.json) relève après adaptation le lien **« Codex Reset Codex Radar: Reset, Limits & Service Signals Total lines: 277 »** et le dialogue **« Aperçu des sources : Codex Reset »**. Le texte « Total lines: 277 » est ce que fournit cette carte ; il ne s’agit pas du texte intégral de l’article. Entrée conserve la destination Web et Échap le retour au déclencheur. [Dix-huit tests Node et la fixture de sources](reproductions/EXECUTION.md#contrôler-les-références-et-cartes-de-sources--2g) couvrent les gardes et la restauration ; [neuf états Chromium stabilisés](preuves/2026-10-08-favicons-controles.json) réussissent sans échec. Les noms calculés et invariants techniques sont distingués des retours JAWS.

**Réception actuelle.** Le [retour utilisateur du 8 octobre](../Point%201%20-%20Sélecteur%20et%20composition/preuves/2026-10-08-reception-adaptee.json) reçoit positivement les parcours ciblés de sélecteur, d’aperçu et de raisonnement en 4.1.1 ; le [préfixe final est confirmé en 4.1.2](../Point%201%20-%20Sélecteur%20et%20composition/preuves/2026-10-08-confirmation-4.1.2.json). Les anciennes captures gardent leur résultat au moment où elles ont été produites.

**Résultat attendu.** Une référence de navigation doit être identifiable comme lien, avec un aperçu secondaire accessible et nommé. La carte doit permettre de lire les informations disponibles sans les remplacer par un seul nom abrégé, dans une présentation cohérente avec la langue d’interface. Un lien HTML doté de sa destination apporterait aussi les fonctions ordinaires du navigateur ; ce démonstrateur ARIA conserve la navigation implémentée sans inventer de `href` ni imposer une solution aux équipes.

## Portée du signalement

Ces cas précis peuvent servir de vérifications pour les futures interfaces : continuité de lecture, nom/stabilité des commandes, disponibilité fonctionnelle, mise à jour des annonces, exposition des contrôles inactifs et lecture des références avec leurs aperçus accessibles. Ils ne valident pas tous les comptes, navigateurs, lecteurs d’écran ou rendus futurs.

Les parcours adaptés restent validés aux dates indiquées. La navigation montante et descendante est également reçue le 7 octobre. Les retours natifs du 7 octobre confirment les obstacles de lecture longue, copie, partage et Writing Blocks, ainsi que la présence de Dernière réponse. La comparaison GPT-6/GPT-5.6 établit les comportements du titre et de l’état courant décrits en 2B ; les adaptations correspondantes sont maintenues.

Les constats et mesures décrivent les rendus examinés aux dates indiquées. Les contrats internes peuvent évoluer.

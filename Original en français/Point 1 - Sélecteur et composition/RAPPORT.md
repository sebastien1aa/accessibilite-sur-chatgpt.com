# Point 1 — Sélecteur et composition

Le premier ensemble concerne les commandes utilisées avant l’envoi : reconnaître le modèle et son niveau, choisir une fonction, puis rédiger un prompt sans ajout involontaire. L’interface étudiée est française, avec JAWS sous Windows. L’ordre suit le parcours de composition : **sélecteur et traduction ensemble**, menu d’ajout, historique des prompts.

Les constats initiaux sont rapportés après le changement général observé le **25 septembre 2026 à 23:16, heure de Bruxelles (Europe/Brussels, UTC+02:00)**. Les investigations techniques des 3–4 octobre et la réception de l’adaptation du 4 octobre sont conservées. Le site natif a ensuite été revérifié par l’utilisateur dans Chrome, extension désactivée, avec JAWS 2021 inchangé : réception commencée le **7 octobre à 19 h 18**, fin des tests à **22 h 40**, Europe/Brussels. Les [retours reçus](preuves/reception-native-2026-10-07.json) complètent les constats historiques ; les procédures restent disponibles pour leur reproduction par un tiers.

L’utilisateur déclare des résultats identiques dans Opera lors d’une vérification récente, ainsi que dans Edge et avec JAWS 2025 d’après son expérience. Ces confirmations d’usage complètent les mesures du produit. Les versions et leur provenance figurent dans [l’environnement commun](../ENVIRONNEMENT.md). Les transcriptions privilégient les libellés utiles : l’absence d’un rôle dans une citation ne prouve pas que JAWS ne l’a pas annoncé.

Les [procédures de reproduction](reproductions/PROCEDURES.md) réunissent les parcours du site ; les [tests et fixtures](reproductions/EXECUTION.md) vérifient séparément les mécanismes synthétiques.

## 1A — Le sélecteur fermé ne permet pas d’identifier rapidement le choix

### Obstacle et conséquence

Le 7 octobre, JAWS annonce toujours **« Sélectionner le modèle ChatGPT »**, sans le choix courant, après fermeture par Échap et quel que soit le niveau sélectionné, dans Chat comme dans Work. Espace ou Entrée ouvre le sélecteur. Dans Chat, les flèches haut/bas parcourent « Sélectionner le modèle. 1 sur 2 », puis « Puissance. 2 sur 2. Arrow left arrow right ». Sur Puissance, gauche/droite annonce successivement **« Instant », « Medium », « High », « Extra high », « Pro »** : ces annonces reçues sont anglaises dans une interface française. Elles sont distinctes du relevé DOM/AX français décrit plus bas.

Dans Work, le parcours reçu comporte « Sélectionner le modèle. 1 sur 4 », puis, mode rapide désactivé, « Activer le mode rapide non coché. 2 sur 4 ». Mode rapide activé, JAWS annonce **« Activer le mode standard coché. 2 sur 4 »** : le libellé désigne une action future tandis que « coché » peut faire comprendre que le mode standard est déjà actif. « Rétablir la sélection par défaut. 3 sur 4 » est aussi annoncé. Les niveaux Work sont français ; leur orthographe native est donnée ci-dessous. L’ambiguïté de l’état du mode rapide est une observation produit reçue, sans nouveau correctif local revendiqué.

Ce défaut gêne la vérification du réglage avant une tâche : le bouton devrait fournir immédiatement le choix courant lors du parcours aux flèches. L’utilisateur indique que l’application Windows expose davantage d’information dans Work/Codex, mais rencontre un problème comparable en Chat. Cette comparaison est un retour d’usage, pas une preuve de cause commune entre surfaces.

### Reproduction et résultat attendu

1. Ouvrir chatgpt.com en français, avec un choix de modèle/niveau déjà effectué et l’extension désactivée.
2. En curseur PC virtuel, parcourir les commandes du composeur aux flèches ; rejoindre le sélecteur fermé.
3. Écouter si son nom fournit le choix courant. Ouvrir par Espace ou Entrée, rejoindre Puissance avec haut/bas, puis utiliser gauche/droite pour comparer les annonces de niveau, la langue et les légendes affichées.
4. Fermer par Échap ; comparer l’information exposée par le bouton fermé. Dans Work, relever aussi le libellé et l’état coché du mode rapide, sans les confondre avec l’action proposée.

**Attendu :** nom utile du sélecteur fermé, comprenant le modèle et le niveau réellement choisis lorsqu’ils font partie de l’information proposée par le produit ; niveaux annoncés dans la langue de l’interface, avec légendes et statuts cohérents ; distinction claire entre l’état actuel du mode rapide et l’action proposée pour le changer. Le dossier ne demande pas de révéler un identifiant interne non destiné à l’utilisateur.

### Preuve et adaptation

Le contrôle natif identifié porte `data-codex-intelligence-trigger` et la cible de navigation `reasoning`. Le nom générique couvre l’information de sa légende. L’adaptation lit la sélection native de façon bornée et vérifie sa cohérence ; elle conserve un nom de modèle seulement quand celui-ci est exposé par le contrôle. Pour les modes Chat où seul un préréglage d’effort est présenté, elle ne substitue pas un modèle interne supposé.

La [réception native dans Edge sans extension du 8 octobre à 01 h 55](preuves/2026-10-08-selecteur-reception-edge.json), heure de Bruxelles (UTC+02:00), confirme « Sélectionner le modèle ChatGPT » quel que soit le modèle, notamment GPT-6 ou GPT-5.6 Sol. La légende visible de GPT-6 est seulement « Élevée » dans le rendu inspecté ; son nom n’y est pas affiché. Le démonstrateur 4.1.2 expose « Raisonnement : Élevée » et conserve un modèle seulement lorsqu’il figure déjà dans la légende visible. Il n’ajoute pas une identité cachée. Le nom générique natif, qui n’annonce même pas le niveau visible, reste le défaut signalé. Le [retour « c’est OK » sur la 4.1.2](preuves/2026-10-08-confirmation-4.1.2.json) confirme le préfixe Raisonnement et la conservation des informations visibles.

Module : [model-accessibility.js](../../extension/model-accessibility.js), fonctions `selectedModel`, `exposedLabel` et `update`. La [preuve synthétisée](preuves/constats-et-receptions.json) distingue le signalement, la mesure et la réception. Les [tests reproductibles](reproductions/EXECUTION.md) couvrent notamment les choix contradictoires, la langue, la préservation des réglages et l’arrivée tardive du contrôle.

### Traduction des niveaux, dans le même sous-point

Le code public examiné le 3 octobre calcule `sliderLabel` à partir de la sélection et l’utilise avant un repli traduit. Une valeur anglaise peut donc gagner sur le texte localisé. Cette piste de localisation reste liée à cette observation datée. La [note technique](preuves/mecanismes-natifs.md) donne les modules, l’asset, les offsets et les limites. L’adaptation conserve les libellés français natifs et les autres informations.

Le [relevé natif du 7 octobre](preuves/1A-libelles-natifs-2026-10-07.json), réalisé dans Chrome sur une page `fr-FR` avec le module d’adaptation du sélecteur inactif, expose en Chat les statuts « Instantané », « Moyenne », « Élevée », « Très élevé » et « Pro » ; les légendes concordent sauf la dernière, relevée « 6Pro ». Dans Work, pour GPT-6.1 Sol, les légendes sont **« Minimal », « Moyen », « Élevé », « Très élevé », « Max », « Ultra »**, tandis que les statuts accessibles sont **« Minimal », « Moyenne », « Élevée », « Très élevé », « Maximum », « Ultra »**. Le rapport reprend cette orthographe native : les formes féminines écrites dans la transcription utilisateur ne démontrent pas un écart audible, notamment pour Minimal/Minimale ou Élevé/Élevée.

Le signalement relève l’hétérogénéité des formes entre niveaux et l’écart entre légende affichée et statut accessible dans Work. Il distingue aussi le relevé français DOM/AX des annonces anglaises reçues en Chat, sans supposer leur cause ni qu’ils correspondent au même instant de rendu. Le démonstrateur conserve le statut français natif ; son alignement ne constitue pas une correction native du site et n’efface pas ces observations produit. Aucun grief grammatical ne repose sur la seule transcription phonétique.

Le sélecteur français fait partie des points acceptés globalement le 4 octobre. Cela reçoit le parcours décrit, sans valider toute combinaison de modèle, langue, mode, compte ou lecteur d’écran.

## 1B — Le menu « Ajouter des fichiers et plus encore » ferme sans activer l’option voulue

### Obstacle et annonces rapportées

La réception native du 7 octobre confirme **« Ajouter des fichiers et plus encore, bouton réduit »**. À la première activation, le focus va dans le champ d’édition du prompt ; aux ouvertures suivantes, le curseur reste sur le bouton. Aucune annonce d’ouverture n’est reçue dans les deux cas. Après une tentative d’activation d’une option par Espace ou Entrée, le premier comportement se reproduit. Sans Échap pour fermer, relire le déclencheur donne **« bouton étendu »**.

Toute la page reste parcourable aux flèches au lieu de borner ce parcours aux options. Le contenu du popup est lu après l’éditeur et **deux « Fin de région principale »**. L’ordre reçu est : texte « Ajouter » ; « Ajouter des photos et fichiers Importer depuis l’ordinateur », annoncé **« bouton actuel »** sans sélection volontaire ; « Ajouter les fichiers d’un espace Parcourez et recherchez vos fichiers » ; « Travailler dans un projet Démarrez un chat dans un projet » ; « Recherche approfondie Obtenir un rapport détaillé » ; texte « Plugins » ; boutons « Créer une image Transformez vos idées en images », « Recherche sur le Web Trouvez des infos en temps réel », « Dessiner Dessiner et joindre une image », « GitHub Triage PRs, issues, CI, and publish flows », puis d’autres options et texte simple **« Type to search plugins »**. L’omission d’un rôle dans cette transcription ne suffit pas à conclure à son absence.

Quelle que soit l’option essayée par l’utilisateur, Espace ou Entrée ferme le menu, **renvoie le focus au haut de la page** et n’active pas la fonction voulue. Le rôle attendu doit correspondre à un composant de menu utilisable ; l’absence de rôle sur la racine est, séparément, un constat DOM historique.

L’impact concerne des fonctions essentielles : pièces jointes, bibliothèque, recherche et autres options. Le déplacement visuel d’un popup ne garantit pas que le lecteur d’écran y soit conduit ni que l’option parcourue soit celle activée.

### Reproduction

1. Sur une page fraîche française, composeur vide, rejoindre Ajouter des fichiers et plus encore avec le curseur virtuel.
2. Appuyer sur Espace. Relever l’absence ou la présence d’annonce, le focus initial, puis la position lors d’une deuxième ouverture. Relire l’état réduit/étendu du déclencheur.
3. Descendre aux flèches après l’éditeur et les deux fins de région principale ; relever l’ordre des options, « bouton actuel » et le texte de recherche de plugins.
4. Activer une option qui ne transmet pas de données par Espace ou Entrée. Relever activation effective, fermeture et destination du focus. Ne pas envoyer le message.
5. Après cette tentative, rouvrir pour comparer le focus avec la première ouverture ; fermer par Échap et retirer uniquement une éventuelle sélection de test.

**Attendu :** déclencheur et popup cohérents, accès clavier aux items disponibles, activation fiable de l’item focalisé et retour au contexte à la fermeture. Le choix précis des rôles dépend du composant retenu par le produit, mais il doit être utilisable avec le lecteur d’écran.

### Cause native examinée

Trois faits ont été reliés au rendu réel du 3 octobre :

- La racine du popup n’avait pas de rôle de menu et le focus restait dans l’éditeur ProseMirror.
- Le plugin natif de suggestions ferme par une transaction `dismiss` quand l’éditeur perd le focus ; sa garde de maintien ne couvrait pas ce transfert vers les boutons d’ajout.
- Un écouteur clavier en capture sur `window` choisit l’action selon un index surligné, qui peut différer du bouton effectivement focalisé.

La note de [mécanismes et localisation du code](preuves/mecanismes-natifs.md) relie ces chemins aux modules `tfV`, `UPl.k` et `VCs.a`. Une sonde minimale a permis à **Entrée** de sélectionner réellement Recherche approfondie dans Chrome ; la sélection a ensuite été retirée sans envoi. Cela démontre cette activation précise, pas l’ensemble des actions de fichiers et plugins.

Le `aria-current=true` natif observé sur Ajouter des photos et fichiers explique l’information d’item « actuel » ; il n’est pas un état de surlignage ajouté par l’extension. Son retrait local est ciblé et réversible.

### Démonstrateur et réception

[add-menu-accessibility.js](../../extension/add-menu-accessibility.js) conserve les boutons et leur `.click()` natif. Il donne une sémantique de menu au popup identifié, focalise le premier item disponible, garde la transition de focus concernée ouverte et active l’item réellement focalisé. Les flèches, Début/Fin, Échap et Tab sont limités à ce menu. Les compositions IME, modificateurs et contrôles imbriqués restent protégés.

Le menu utilisable est accepté dans la réception globale 3.2.3 du 4 octobre. Les succès des menus après Échap ont ensuite été reçus séparément ; le Point 3 décrit ces retours. Aucun essai exhaustif de toutes les commandes d’ajout n’est revendiqué.

## 1C — Flèche haut ajoute involontairement un ancien prompt dans un champ vide

### Obstacle et risque d’erreur

Quand le focus est dans le composeur vide, Flèche haut peut y rappeler un ancien prompt. L’utilisateur dépend des flèches pour parcourir et quitter les champs ; il peut donc amorcer une nouvelle rédaction sur un contenu qu’il ne souhaitait pas réutiliser. Si ce remplissage n’est pas remarqué, le message envoyé contient des éléments non voulus.

La réception du 7 octobre confirme le rappel dans les discussions existantes et nouvelles, y compris dans **Opera, navigateur où l’utilisateur n’avait pas encore envoyé de prompt pour créer une discussion**. Le compte possédait déjà un historique. Ce retour précise la portée : un envoi préalable depuis ce navigateur n’est pas une précondition exigible ; le dossier ne reste pas limité à l’historique de la conversation ouverte. Il s’agit d’une déclaration humaine, sans nouvelle mesure de stockage ou de synchronisation dans Opera.

Ce problème a un effet d’accessibilité et de fiabilité de rédaction. Le choix de bloquer le rappel dans l’extension est un contournement ; cela ne réduit pas l’obstacle à une simple préférence esthétique.

### Reproduction et attendu

1. Utiliser un compte ayant déjà un historique de prompts ; ne pas imposer un premier envoi depuis le navigateur de test.
2. Ouvrir une discussion existante, puis une nouvelle discussion sans brouillon à préserver ; relever séparément si ce navigateur a déjà servi à créer un chat.
3. Avec le composeur réellement vide et focalisé, appuyer une fois sur Flèche haut non modifiée, dans le mode où cette touche atteint le champ.
4. Vérifier si le texte d’un prompt antérieur remplit l’éditeur. Ne rien envoyer ; noter la distinction avec un menu de suggestions déjà ouvert.

**Attendu :** navigation aux flèches utilisable sans modification imprévue du brouillon, et accès explicite, accessible et volontaire à l’historique lorsqu’il est proposé. Un menu dédié est une piste, pas une implémentation imposée.

### Preuve, protection et limite

Le rappel natif a été constaté techniquement avec récupération d’un ancien texte de **163 caractères**, sans conservation de son contenu dans la pièce. Le module [prompt-history-accessibility.js](../../extension/prompt-history-accessibility.js) intercepte uniquement Flèche haut non modifiée dans un éditeur français focalisé, réellement vide, sans sélection étendue ni contrôle/mention ou menu actif. Il ne modifie pas le texte et ne bloque pas le comportement par défaut du navigateur ; il empêche ce chemin natif de rappel d’être appelé.

Une première protection était installée trop tard, à `document_idle`. Cette fenêtre était une limite de l’adaptation, corrigée par une garde dès `document_start`, et non un second défaut imputé au site. L’utilisateur a ensuite reçu la protection dès le début du chargement, puis l’a conservée dans la réception globale du 4 octobre.

**Limite actuelle : l’extension ne fournit aucun autre accès à l’historique des prompts.** Ce besoin reste ouvert. Les tests vérifient notamment le champ contenant des espaces, le contenu riche, les menus, les modificateurs, IME, langue et démarrage sans racine. Ils ne prouvent pas à eux seuls la navigation physique JAWS.

## Portée de ce premier signalement

Les trois sous-points sont liés à la composition mais n’ont pas nécessairement une même cause. Les réceptions natives du 7 octobre confirment les obstacles pour les parcours décrits. L’analyse du code, le DOM et les retours Chrome, Opera, Edge et JAWS 2025 gardent leur provenance propre ; ils ne couvrent pas tous les rendus futurs. La [pièce historique](preuves/constats-et-receptions.json) et la [réception récente](preuves/reception-native-2026-10-07.json) conservent cette séparation.

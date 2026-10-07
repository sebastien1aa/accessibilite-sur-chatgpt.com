# Point 1 — Sélecteur et composition

Le premier ensemble concerne les commandes utilisées avant l’envoi : reconnaître le modèle et son niveau, choisir une fonction, puis rédiger un prompt sans ajout involontaire. L’interface étudiée est française, avec JAWS sous Windows. L’ordre suit le parcours de composition : **sélecteur et traduction ensemble**, menu d’ajout, historique des prompts.

Les constats initiaux sont rapportés après le changement général observé le **25 septembre 2026 à 23:16 Bruxelles**. Les investigations techniques de ce dossier datent des 3–4 octobre ; le parcours adapté a été accepté dans la réception globale du 4 octobre, sous les limites précisées ci-dessous. Les gestes suivants sont des procédures de reproduction, pas des essais humains déclarés refaits.

Les [procédures de reproduction](reproductions/PROCEDURES.md) réunissent les parcours du site ; les [tests et fixtures](reproductions/EXECUTION.md) vérifient séparément les mécanismes synthétiques.

## 1A — Le sélecteur fermé ne permet pas d’identifier rapidement le choix

### Obstacle et conséquence

Dans le premier signalement, JAWS annonce **« Sélectionner le modèle ChatGPT »**, sans le modèle ni le niveau de raisonnement sélectionné. L’utilisateur décrit ce problème dans Chat et Work sur le Web. Il doit ouvrir le menu, rejoindre « Puissance », puis utiliser les flèches gauche/droite pour écouter le niveau. Le modèle sélectionné reste difficile à déterminer dans le parcours décrit.

Ce défaut gêne la vérification du réglage avant une tâche : le bouton devrait fournir immédiatement le choix courant lors du parcours aux flèches. L’utilisateur indique que l’application Windows expose davantage d’information dans Work/Codex, mais rencontre un problème comparable en Chat. Cette comparaison est un retour d’usage, pas une preuve de cause commune entre surfaces.

### Reproduction et résultat attendu

1. Ouvrir chatgpt.com en français, avec un choix de modèle/niveau déjà effectué et l’extension désactivée.
2. En curseur PC virtuel, parcourir les commandes du composeur aux flèches ; rejoindre le sélecteur fermé.
3. Écouter si son nom fournit le choix courant. Ouvrir par Espace, rejoindre Puissance, puis utiliser gauche/droite pour comparer l’information disponible dans le menu.
4. Fermer le menu sans changer de réglage ; comparer l’information exposée par le bouton fermé.

**Attendu :** nom utile du sélecteur fermé, comprenant le modèle et le niveau réellement choisis lorsqu’ils font partie de l’information proposée par le produit. Le dossier ne demande pas de révéler un identifiant interne non destiné à l’utilisateur.

### Preuve et adaptation

Le contrôle natif identifié porte `data-codex-intelligence-trigger` et la cible de navigation `reasoning`. Le nom générique couvre l’information de sa légende. L’adaptation lit la sélection native de façon bornée et vérifie sa cohérence ; elle conserve un nom de modèle seulement quand celui-ci est exposé par le contrôle. Pour les modes Chat où seul un préréglage d’effort est présenté, elle ne substitue pas un modèle interne supposé.

Le nom accessible mesuré dans l’arbre d’accessibilité de Chrome après adaptation était notamment **« Niveau de raisonnement : 6 Pro »**, sans répétition de Pro. Cette valeur est un nom AX mesuré. Le libellé préfixé **« Niveau de raisonnement »** est un choix explicitement demandé pour le démonstrateur. Le problème produit reste le défaut d’information sur le choix, sans imposer cette formulation exacte à OpenAI.

Module : [model-accessibility.js](../../extension/model-accessibility.js), fonctions `selectedModel`, `exposedLabel` et `update`. La [preuve synthétisée](preuves/constats-et-receptions.json) distingue le signalement, la mesure et la réception. Les [tests reproductibles](reproductions/EXECUTION.md) couvrent notamment les choix contradictoires, la langue, la préservation des réglages et l’arrivée tardive du contrôle.

### Traduction des niveaux, dans le même sous-point

Le code public examiné le 3 octobre calcule `sliderLabel` à partir de la sélection et l’utilise avant un repli traduit. Une valeur anglaise peut donc gagner sur le texte localisé. La [note technique](preuves/mecanismes-natifs.md) donne les modules, l’asset, les offsets et les limites. L’adaptation traduit les valeurs connues : Instantané, Moyen, Élevé, Très élevé, et conserve les autres informations.

L’utilisateur avait d’abord corrélé l’anglais à l’activation de l’extension. Il a ensuite également constaté l’anglais extension désactivée ; le lien causal avec le mécanisme de rétention n’est pas établi. De même, le retour du français avait précédé son rechargement, ce qui interdit de l’attribuer simplement à ce rechargement. La correction « Moyenne » → « Moyen » correspond à la forme demandée pour le niveau.

Le sélecteur français fait partie des points acceptés globalement le 4 octobre. Cela reçoit le parcours décrit, sans valider toute combinaison de modèle, langue, mode, compte ou lecteur d’écran.

## 1B — Le menu « Ajouter des fichiers et plus encore » ferme sans activer l’option voulue

### Obstacle et annonces rapportées

Le premier signalement rapporte **« bouton réduit »**, puis **« bouton étendu »**, sans transfert naturel vers les options après Espace. Celles-ci apparaissent plus loin dans l’ordre du curseur virtuel, après le composeur et ses autres commandes. Un ajout récemment utilisé est annoncé **« bouton actuel »**. L’utilisateur décrit enfin une fermeture lors de l’activation clavier, sans sélection de la fonctionnalité visée.

L’impact concerne des fonctions essentielles : pièces jointes, bibliothèque, recherche et autres options. Le déplacement visuel d’un popup ne garantit pas que le lecteur d’écran y soit conduit ni que l’option parcourue soit celle activée.

### Reproduction

1. Sur une page fraîche française, composeur vide, rejoindre Ajouter des fichiers et plus encore avec le curseur virtuel.
2. Appuyer sur Espace. Vérifier la position de lecture et le focus à l’ouverture.
3. Parcourir une option qui ne transmet pas de données, telle qu’une fonction de recherche, puis l’activer par Espace ou Entrée.
4. Constater si cette option est effectivement sélectionnée dans le composeur ou si seul le popup se ferme. Ne pas envoyer le message.
5. Comparer aussi le rôle du déclencheur et l’annonce de l’item de fichier récemment utilisé, puis fermer et retirer uniquement la sélection de test.

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

La précision finale du premier signalement élargit le scénario aux nouvelles discussions : après avoir envoyé au moins un prompt de création depuis le même compte, le rappel peut se produire aussi sur une nouvelle discussion. Le dossier ne reste pas limité à l’historique de la conversation actuellement ouverte.

Ce problème a un effet d’accessibilité et de fiabilité de rédaction. Le choix de bloquer le rappel dans l’extension est un contournement ; cela ne réduit pas l’obstacle à une simple préférence esthétique.

### Reproduction et attendu

1. Disposer d’au moins un prompt déjà envoyé depuis le compte dans le contexte décrit.
2. Ouvrir une discussion existante, puis éventuellement une nouvelle discussion, sans brouillon à préserver.
3. Avec le composeur réellement vide et focalisé, appuyer une fois sur Flèche haut non modifiée, dans le mode où cette touche atteint le champ.
4. Vérifier si le texte d’un prompt antérieur remplit l’éditeur. Ne rien envoyer ; noter la distinction avec un menu de suggestions déjà ouvert.

**Attendu :** navigation aux flèches utilisable sans modification imprévue du brouillon, et accès explicite, accessible et volontaire à l’historique lorsqu’il est proposé. Un menu dédié est une piste, pas une implémentation imposée.

### Preuve, protection et limite

Le rappel natif a été constaté techniquement avec récupération d’un ancien texte de **163 caractères**, sans conservation de son contenu dans la pièce. Le module [prompt-history-accessibility.js](../../extension/prompt-history-accessibility.js) intercepte uniquement Flèche haut non modifiée dans un éditeur français focalisé, réellement vide, sans sélection étendue ni contrôle/mention ou menu actif. Il ne modifie pas le texte et ne bloque pas le comportement par défaut du navigateur ; il empêche ce chemin natif de rappel d’être appelé.

Une première protection était installée trop tard, à `document_idle`. Cette fenêtre était une limite de l’adaptation, corrigée par une garde dès `document_start`, et non un second défaut imputé au site. L’utilisateur a ensuite reçu la protection dès le début du chargement, puis l’a conservée dans la réception globale du 4 octobre.

**Limite actuelle : l’extension ne fournit aucun autre accès à l’historique des prompts.** Ce besoin reste ouvert. Les tests vérifient notamment le champ contenant des espaces, le contenu riche, les menus, les modificateurs, IME, langue et démarrage sans racine. Ils ne prouvent pas à eux seuls la navigation physique JAWS.

## Portée de ce premier signalement

Les trois sous-points sont liés à la composition mais n’ont pas nécessairement une même cause. L’analyse du code et du DOM donne des pistes ciblées de correction ; elle ne permet pas d’exclure chaque configuration de navigateur ou lecteur d’écran. Les retours 2021/2025 du premier signalement ne constituent pas des réceptions de toutes les nouvelles adaptations. La [pièce de constats](preuves/constats-et-receptions.json) conserve cette séparation.


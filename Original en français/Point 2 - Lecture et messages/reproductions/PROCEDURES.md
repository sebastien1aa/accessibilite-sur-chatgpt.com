# Procédures de reproduction — Point 2

Utiliser une conversation de test sans donnée privée, dans l’interface française. Relever date, système, versions du navigateur et du lecteur d’écran, mode de navigation, extension active ou absente. Comparer le site natif et l’adaptation dans des essais séparés. Ne pas déduire la parole JAWS du seul focus DOM. Ces procédures sont destinées à la reproduction par un tiers. Les [retours natifs du 7 octobre, 19 h 18–22 h 40, heure de Bruxelles (Europe/Brussels, UTC+02:00)](../preuves/reception-native-2026-10-07.json) et [l’environnement commun](../../ENVIRONNEMENT.md) conservent les conditions et leur provenance.

Pour comparer des variantes touchant au mode ou au curseur JAWS, partir d’un document frais pour chacune. Espace est l’activation habituelle de l’utilisateur ; dans sa configuration française, U atteint le bouton suivant.

## 2A — Lecture longue

1. Ouvrir une longue conversation déjà chargée et repérer deux tours éloignés.
2. Parcourir les messages aux flèches avec le curseur virtuel du bas vers le haut, puis en redescendant.
3. Relever toute omission, rupture, saut ou perte de la position de lecture.
4. Séparément, inspecter si les descendants des tours hors écran demeurent rendus ; distinguer emplacements vides, texte effectivement présent et identité des nœuds.
5. Refaire le parcours avec l’adaptation. Ne pas envoyer de message uniquement pour cet essai.

Attendu : les tours disponibles restent lisibles dans les deux sens. Le 7 octobre, les sauts natifs dans les deux sens sont reçus ; aucun seuil précis n’est requis pour décrire cette observation. Une copie exacte de grande taille exige une preuve distincte.

## 2B — Raisonnement

1. Lors d’une génération habituelle autorisée, repérer le début du tour assistant par les titres.
2. Relever si « ChatGPT a dit » est présent dès le début de la réflexion, puis pendant les commentaires intermédiaires et la réponse finale. Noter le modèle : GPT-5.6 et GPT-6 peuvent présenter des structures différentes. Dans la comparaison du 7 octobre, GPT-5.6 n’expose ce titre qu’après la réflexion ; le premier essai GPT-6 a été interrompu, sans conclusion sur sa réponse achevée.
3. Ouvrir les détails du raisonnement, si proposés ; parcourir aux flèches depuis le repère assistant. Comparer la position de l’état courant et celle des détails déjà réalisés. Dans les deux modèles du test du 7 octobre, l’état courant est au-dessus pour JAWS tandis que les détails réalisés suivent le titre dans le bon ordre. Attendu : repère de locuteur avant le début de la réflexion, état courant ensuite dans la continuité de lecture. Relever le nom de commande et l’état rendu sans inventer une étape non exposée.
4. À la fin, relever le nom/durée de la commande et une éventuelle seconde exposition identique dans le parcours. Comparer avec l’adaptation : le nom constant pendant la réflexion doit céder au nom et à la durée natifs à la fin, sans doublon exact.
5. Dans un tour existant qui présente réellement des cartes d’analyse autonomes, replier le raisonnement puis parcourir la suite. Relever si les cartes restent exposées indépendamment du repli principal. Avec l’adaptation, ouvrir la commande d’ensemble, puis une commande native « Analysé » avec Espace ; vérifier que le détail existant s’ouvre et que le repli d’ensemble masque les cartes sans les supprimer.

Attendu : repère de locuteur dès le début de la réflexion, puis état courant dans la continuité de lecture ; détails déjà réalisés accessibles après le repère ; commande finale avec son nom et sa durée sans doublon exact. Pour les cartes autonomes, une commande d’ensemble accessible permet de maîtriser leur exposition tout en conservant les commandes natives de détail. Le cas des 43 cartes est un exemple observé, pas une condition à fabriquer en lançant de nouvelles analyses.

## 2C — Sélection accessible et sélection native

1. Depuis un message, établir une petite sélection traversant plusieurs messages avec les commandes habituelles du lecteur d’écran.
2. Copier, puis coller dans un éditeur local choisi par l’utilisateur.
3. Comparer le contenu attendu et la stabilité de la sélection. Relever séparément l’absence éventuelle des locuteurs, de la durée de réflexion et des dates/heures affichées ; ne pas conserver le texte privé dans une pièce de preuve.
4. Inspecter séparément les règles `user-select` des métadonnées et la stabilité des tours sélectionnés.
5. Pour la comparaison visuelle native, sélectionner à la souris deux paragraphes d’une réponse et copier par Ctrl+C ; relever longueurs et égalités, sans exporter leur contenu.

Le 7 octobre, l’utilisateur reçoit la sélection comme fonctionnelle tant qu’un saut ne l’interrompt pas. La stabilité nécessaire à la lecture et à la copie étendue est le problème d’accessibilité ; inclure les locuteurs, durées et horodatages est une demande produit séparée. Le contrôle Edge du 6 octobre établit une possibilité native sur une petite sélection sans remplacer la réception JAWS ni une preuve de copie globale exacte. Une divergence d’espaces doit être distinguée d’un contenu manquant.

## 2D — Partager global et Copier

Partager produit un lien public : cet essai doit utiliser une conversation prévue pour être partagée et une autorisation explicite. Une inspection passive de textes et d’attributs n’autorise pas la création d’un lien.

1. Sur cette conversation autorisée, activer Partager avec Espace et attendre son résultat.
2. Relever la confirmation, l’état indisponible et la position de lecture, y compris un saut temporaire au sommet.
3. Dans un autre parcours, activer Copier sous une réponse et relever immédiatement sa présence dans la navigation, son indisponibilité et la confirmation.
4. Répéter pour Copier le message sous un message envoyé.
5. Vérifier que les boutons redeviennent disponibles et que la confirmation ne prétend pas une réussite en cas d’échec.

Réception native du 7 octobre : aucune annonce, saut vers Partager après copie d’une réponse et retour au haut de page après Partager la conversation. Attendu : confirmation audible après réussite, position préservée, bouton parcourable et indisponibilité signalée pendant la suspension réelle de son action. L’adaptation reçue ajoute « Message copié » ; les deux phrases du partage sont natives.

## 2E — Champ de rédaction

1. Utiliser une génération autorisée d’un texte réutilisable et copiable, ou ouvrir un exemple existant de Writing Block copiable/modifiable.
2. Attendre la fin complète de la génération puis aller tout au bas de la page, comme dans la réception utilisateur du 7 octobre.
3. Relever les boutons sans commande descriptivement compréhensible et, séparément, leur visibilité/activité effective et leur parcours par Tab.
4. Avec l’adaptation, vérifier que seules les poignées inactives disparaissent et que le champ/Copier demeurent utilisables. La réception du 7 octobre confirme le défaut natif inchangé.

Attendu : aucun contrôle inactif invisible inutile dans le parcours ; des commandes réellement actives doivent rester disponibles et correctement nommées.

## 2F — Titres

1. Parcourir les titres d’une conversation existante.
2. Relever la position de « Dernière réponse » par rapport au message et aux titres utiles.
3. Inspecter séparément le `h4.sr-only` exact « Dernière réponse » hors du message ; distinguer ce repère des titres placés dans le contenu.
4. Avec l’adaptation, vérifier le retrait de ce seul repère, sans suppression des titres du contenu. Le contrôle structurel consiste à vérifier le ciblage exact de `hideLastResponseHeading` dans [ui-accessibility.js](../../../extension/ui-accessibility.js), puis le parcours humain décrit ici.

La présence native de Dernière réponse est reçue le 7 octobre. Le retrait reçoit une préférence de simplification ; il ne démontre pas une invalidité générale de toute navigation comportant ce titre.

Les [tests et fixtures](EXECUTION.md) complètent ces parcours sans remplacer une réception JAWS.

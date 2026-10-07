# Procédures de reproduction — Point 2

Utiliser une conversation de test sans donnée privée, dans l’interface française. Relever date, système, versions du navigateur et du lecteur d’écran, mode de navigation, extension active ou absente. Comparer le site natif et l’adaptation dans des essais séparés. Ne pas déduire la parole JAWS du seul focus DOM.

Les essais de mode/curseur doivent partir d’un document frais, sans cumuler des variantes ni préactiver leur commande. Les actions ordinaires qui ne laissent aucun mode perturbé peuvent partager le même document. Espace est l’activation habituelle de l’utilisateur ; dans sa configuration française, U atteint le bouton suivant.

## 2A — Lecture longue

1. Ouvrir une longue conversation déjà chargée et repérer deux tours éloignés.
2. Parcourir les messages avec le curseur virtuel en descendant puis en remontant.
3. Relever toute omission, rupture, saut ou perte de la position de lecture.
4. Séparément, inspecter si les descendants des tours hors écran demeurent rendus ; distinguer emplacements vides, texte effectivement présent et identité des nœuds.
5. Refaire le parcours avec l’adaptation. Ne pas envoyer de message uniquement pour cet essai.

Attendu : les tours disponibles restent lisibles dans les deux sens. Une copie exacte de grande taille exige une preuve distincte.

## 2B — Raisonnement

1. Lors d’une génération habituelle autorisée, repérer le début du tour assistant par les titres.
2. Relever la disponibilité du repère « ChatGPT a dit » avant la réponse finale.
3. Ouvrir les détails du raisonnement, si proposés ; relever le nom de commande et l’état courant rendu, sans interpréter le texte interne comme une étape non exposée.
4. À la fin, relever le nom/durée de la commande et une éventuelle seconde annonce identique.
5. Dans un tour existant qui présente réellement des cartes d’analyse, replier le raisonnement puis parcourir les cartes ; ouvrir l’ensemble puis une commande « Analysé » avec Espace.

Attendu : repère précoce, état lisible, commande finale cohérente et détails natifs accessibles. Le cas des 43 cartes est un exemple observé, pas une condition à fabriquer en lançant de nouvelles analyses.

## 2C — Sélection accessible et sélection native

1. Depuis un message, établir une petite sélection traversant plusieurs messages avec les commandes habituelles du lecteur d’écran.
2. Copier, puis coller dans un éditeur local choisi par l’utilisateur.
3. Comparer la portion attendue, les deux locuteurs et les dates/heures réellement affichées. Ne pas conserver le texte privé dans une pièce de preuve.
4. Inspecter séparément les règles `user-select` des métadonnées et la stabilité des tours sélectionnés.
5. Pour la comparaison visuelle native, sélectionner à la souris deux paragraphes d’une réponse et copier par Ctrl+C ; relever longueurs et égalités, sans exporter leur contenu.

Le contrôle Edge du 6 octobre établit cette dernière possibilité native sur une petite sélection. Il ne remplace ni l’étape JAWS, ni une sélection globale massive. Une divergence d’espaces doit être distinguée d’un contenu manquant.

## 2D — Partager global et Copier

Partager produit un lien public : cet essai doit utiliser une conversation prévue pour être partagée et une autorisation explicite. Une inspection passive de textes et d’attributs n’autorise pas la création d’un lien.

1. Sur cette conversation autorisée, activer Partager avec Espace et attendre son résultat.
2. Relever la confirmation, l’état indisponible et la position de lecture, y compris un saut temporaire au sommet.
3. Dans un autre parcours, activer Copier sous une réponse et relever immédiatement sa présence dans la navigation, son indisponibilité et la confirmation.
4. Répéter pour Copier le message sous un message envoyé.
5. Vérifier que les boutons redeviennent disponibles et que la confirmation ne prétend pas une réussite en cas d’échec.

Attendu avec l’adaptation reçue : position préservée, bouton parcourable, indisponibilité signalée quand l’action est suspendue, « Message copié » après réussite. Cette dernière phrase est un ajout local ; les deux phrases du partage sont natives.

## 2E — Champ de rédaction

1. Ouvrir un exemple existant de Writing Block copiable/modifiable.
2. Parcourir la fin du document par boutons puis par Tab.
3. Relever les poignées sans nom descriptif et leur visibilité/activité effective.
4. Avec l’adaptation, vérifier que seules les poignées inactives disparaissent du parcours et que le champ/Copier demeurent utilisables.

Attendu : aucun contrôle inactif invisible inutile dans le parcours ; des commandes réellement actives doivent rester disponibles et correctement nommées.

## 2F — Titres

1. Parcourir les titres d’une conversation existante.
2. Relever la position de « Dernière réponse » par rapport au message et aux titres utiles.
3. Avec l’adaptation, vérifier le retrait de ce seul repère, sans suppression des titres du contenu.

Ce contrôle reçoit une préférence de simplification ; il ne démontre pas une invalidité générale de toute navigation comportant ce titre.

Les [tests et fixtures](EXECUTION.md) complètent ces parcours sans remplacer une réception JAWS.

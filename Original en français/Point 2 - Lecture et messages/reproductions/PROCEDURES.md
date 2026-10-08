# Procédures de reproduction — Point 2

Les parcours concernent le site natif, extension désactivée, avec JAWS et son curseur PC virtuel pour la lecture aux flèches. Le [rapport](../RAPPORT.md) distingue les observations, le code et les résultats adaptés ; l’[environnement](../../ENVIRONNEMENT.md) définit les conditions observées. La comparaison du démonstrateur se fait après chargement d’une nouvelle page.

## 2A — Lecture longue

1. Ouvrir une longue conversation.
2. Lire les messages aux flèches du bas vers le haut, puis en redescendant.
3. Observer les ruptures de lecture, pertes de position et messages qui deviennent indisponibles.
4. Dans l’inspection du rendu, comparer le texte des tours chargés et celui des tours montés hors de la zone visible.

**Constat :** sauts de position dans les deux sens ; certains tours disponibles ne sont pas montés par le virtualiseur.

**Résultat attendu :** lecture continue des tours chargés dans les deux sens, y compris hors de la zone visible.

## 2B — Repères et ordre du raisonnement

**Conditions :** GPT‑6 en raisonnement **Élevé**, puis comparaison séparée avec GPT‑5.6 au même niveau ; détails de raisonnement ouverts lorsqu’ils sont proposés.

1. Envoyer un message qui déclenche un raisonnement et parcourir le début de la réponse pendant la génération.
2. Vérifier si « ChatGPT a dit » permet d’identifier le locuteur dès le début de la réflexion, puis observer les titres des commentaires intermédiaires et de la réponse finale.
3. Dans les détails ouverts, parcourir les étapes déjà effectuées et l’activité en cours. Comparer leur ordre avec celui du repère assistant. Continuer lors des nouveaux commentaires intermédiaires.
4. Laisser la génération se terminer. Relire le bouton du raisonnement, puis utiliser Flèche bas pour chercher une seconde ligne reprenant exactement son activité ou « Réfléchi pendant [durée] ».
5. Dans une réponse présentant des cartes d’analyse autonomes, replier le raisonnement principal et parcourir les cartes ; comparer leur exposition avec l’état replié.

**Constat :** GPT‑5.6 n’expose le repère de locuteur qu’après la réflexion. GPT‑6 peut produire plusieurs commentaires avec titres, sans garantir ce repère au début. L’activité courante précède les détails accomplis dans le parcours JAWS ; la légende d’activité ou de durée peut être exposée deux fois. Les cartes autonomes de l’exemple documenté restent indépendantes du repli principal.

**Résultat attendu :** repère assistant dès le début, détails accomplis puis activité courante dans la continuité de lecture, commande Afficher/Masquer explicite pendant l’activité, durée finale sans doublon. Les cartes autonomes doivent pouvoir être parcourues et repliées de façon cohérente en conservant leurs commandes natives.

## 2C — Sélection et copie de plusieurs messages

1. Sélectionner un passage traversant plusieurs messages avec Maj+Flèches ou Maj+Page précédente/Page suivante.
2. Copier avec Ctrl+C et coller dans un éditeur de texte.
3. Comparer la continuité de la sélection et du contenu copié. Examiner séparément les locuteurs, durées et horodatages.
4. Pour la comparaison native à la souris, sélectionner deux paragraphes d’une réponse puis copier de la même façon.

**Constat :** la sélection fonctionne tant qu’un saut de lecture ne l’interrompt pas. Certaines métadonnées affichées sont exclues du texte copié.

**Résultat attendu :** stabilité de la sélection accessible et de la copie étendue. L’inclusion des métadonnées reste une demande produit distincte.

## 2D — Copier et Partager

1. Dans une conversation, activer « Partager » et attendre la confirmation de création/copie du lien public.
2. Vérifier l’annonce de réussite, l’état indisponible pendant l’attente et la reprise de lecture.
3. Dans un parcours séparé, activer « Copier » sous une réponse, puis « Copier le message » sous un message envoyé.
4. Vérifier pour chacun la confirmation, sa présence dans le parcours pendant l’attente et son retour à l’état disponible.

**Constat :** aucune confirmation JAWS reçue ; retour en haut de page après Partager et vers Partager après copie d’une réponse. Les annonces et indisponibilités des deux familles de copie diffèrent.

**Résultat attendu :** confirmation audible après réussite, maintien du point de lecture et état indisponible compréhensible pendant la suspension réelle de l’action.

## 2E — Poignées des champs de rédaction

1. Demander un texte réutilisable qui produit un Writing Block copiable/modifiable, ou ouvrir un exemple existant.
2. Attendre la fin de la génération puis parcourir le bas de la page.
3. Comparer les boutons « ⋮⋮ » rencontrés avec leur visibilité et leur activité réelle ; comparer aussi le parcours Tab.
4. Dans le démonstrateur, comparer l’accès au champ, à Copier et aux seules poignées devenues actives.

**Constat :** des poignées invisibles et inactives restent exposées comme boutons sans nom explicite.

**Résultat attendu :** parcours dépourvu de contrôles inactifs invisibles ; commandes actives disponibles et correctement nommées.

## 2F — Titre « Dernière réponse »

1. Parcourir les titres d’une conversation.
2. Comparer « Dernière réponse » avec les repères de locuteur et les titres du message.
3. Inspecter le `h4.sr-only` exact placé hors du message ; comparer avec le démonstrateur.

**Constat :** arrêt supplémentaire redondant dans le parcours des titres.

**Résultat attendu :** navigation plus directe entre repères utiles, en préservant les titres du contenu. Cette simplification est une demande d’organisation.

## 2G — Références et aperçus de sources

**Conditions :** réponse GPT‑6 présentant des citations avec ce rendu ; référence simple puis regroupée si disponible.

1. Parcourir la référence aux flèches et comparer avec la navigation par liens du lecteur d’écran.
2. Activer avec Espace ou Entrée, vérifier la navigation Web, puis revenir à la conversation.
3. Donner le focus clavier à la référence pour ouvrir l’aperçu ; utiliser Tab pour entrer dans sa carte.
4. Comparer le nom « Open [source] » avec la source, le titre et les informations visibles de la carte. Parcourir aussi le panneau ajouté en fin de document.
5. Fermer avec Échap et vérifier le retour à la référence.
6. Avec le démonstrateur, comparer le rôle lien, le nom du panneau et le nom de la carte issu de son contenu, ainsi que la lecture de la favicon décorative.

**Constat :** référence annoncée « Bouton de menu réduit dialogue » malgré la navigation Web ; carte réduite au nom de source et adresse de favicon parasite.

**Résultat attendu :** références identifiables comme liens ; aperçu nommé dont les informations disponibles sont lisibles sans nom abrégé ni adresse d’image parasite.

Les [tests et fixtures](EXECUTION.md) complètent ces parcours par des mécanismes isolés.

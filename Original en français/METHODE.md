# Méthode et limites des preuves

Les heures locales citées dans ce document sont en heure de Bruxelles (Europe/Brussels, UTC+02:00 pour les dates de septembre et début octobre 2026). Les horodatages techniques conservent leur fuseau explicite ; le suffixe ISO `Z` désigne UTC.

La documentation originale est française et fait foi. Le dossier décrit chatgpt.com, étudié sous Windows avec JAWS et une interface réglée en français. Les [versions actuelles et confirmations](ENVIRONNEMENT.md) accompagnent les retours reçus du 7 octobre. Chaque ensemble introduit ses pièces sur place afin de rester lisible sans consulter un historique de développement.

## Terminologie de navigation

Le dossier emploie **curseur PC virtuel** pour la lecture Web de JAWS, correspondant au [Virtual PC Cursor décrit par Freedom Scientific](https://support.freedomscientific.com/teachers/lessons/4.2.3_VirtualPCCursor.htm). « Curseur PC » ou « PC virtuel » restent les formulations des retours utilisateur lorsque pertinentes. Sa position de lecture est distincte du focus DOM, qui peut rester sur un contrôle pendant ce parcours.

## Lire une preuve

| Type de preuve | Ce qu’elle établit | Ce qu’elle ne suffit pas à établir |
|---|---|---|
| Annonce JAWS rapportée exactement | Formulation réellement entendue et transmise par l’utilisateur dans le contexte indiqué | Annonce identique dans tous les environnements |
| Comportement décrit par l’utilisateur | Gestes, obstacle, conséquence et réception ; une paraphrase peut convenir | Mécanisme interne du lecteur d’écran |
| DOM et événements réels | Nœuds, attributs, actions, sélection et focus dans l’onglet observé | Position du curseur PC virtuel ou parole JAWS |
| Arbre d’accessibilité | Rôle et nom calculé, état, exposition ou exclusion par Chromium | Restitution vocale effectivement reçue |
| Code public chargé | Contrat et chemin de rendu examinés, avec contexte et conditions | Activation de toutes les branches pour tous les comptes |
| Fixture synthétique | Mécanisme isolé, gardes et comparaison contrôlée | Reproduction intégrale de ChatGPT ou réception humaine |
| Réception physique de fixture | Effet déclaré des conditions comparées hors du site | Une cause unique de tous les symptômes du site |
| Réception de l’extension | Résultat accepté dans le parcours décrit et la version indiquée | Correction du produit natif ou réception exhaustive des autres parcours |

Les résultats techniques et les retours humains sont reliés, sans être interchangeables. Les transcriptions de l’utilisateur sélectionnent les informations pertinentes ; l’omission d’un rôle ou d’un état dans une citation abrégée ne signifie pas que JAWS ne l’annonce pas. Une phrase « JAWS annonce… » repose sur un retour réel correspondant. Sinon, le dossier précise « nom exposé dans l’arbre d’accessibilité » ou décrit généralement le comportement. Les nombreuses cartes d’analyse sont décrites par leur effet sur la lecture ; une transcription artificielle de dizaines d’annonces n’apporterait pas de preuve.

Chaque sous-point présente d’abord le problème et le résultat attendu, puis les observations et gestes de reproduction, le mécanisme natif et son attribution, enfin l’illustration par le démonstrateur et les résultats obtenus. Une correction historique ne prouve pas qu’elle reconnaît un nouveau rendu. Une fonction disponible seulement sous conditions doit être testée dans ces conditions avant de comparer accès visuel et accès au lecteur d’écran.

## Attribution

Un attribut natif, un retrait de nœuds ou un callback du code public peuvent établir un mécanisme du site. Une désynchronisation de JAWS malgré un focus DOM correct conserve une attribution d’interopérabilité ouverte. `aria-haspopup="dialog"` valide ne devient pas invalide parce qu’une adaptation temporaire améliore Explorer. Un parent focalisable dans une fixture peut provoquer le symptôme observé sans démontrer une violation universelle d’ARIA.

Une mauvaise garde, un nom appliqué au mauvais moment ou un proxy instable introduits par l’extension sont des erreurs locales. Elles ne sont pas ajoutées au signalement concernant ChatGPT. Les premières hypothèses rejetées ne doivent pas rester décrites comme causes établies.

Les preuves structurelles motivent un examen du produit avant des recommandations génériques de nettoyage du cache ou du profil. Elles ne prétendent pas exclure expérimentalement chaque configuration pour chaque problème. Les comparaisons sans extension, leurs modalités et leurs limites figurent dans les dossiers concernés.

## Dates et versions

Les constats initiaux de septembre et des 3–6 octobre sont complétés par la réinvestigation utilisateur du 7 octobre, de 19 h 18 à 22 h 40. Les annonces et symptômes reconfirmés portent cette nouvelle date ; les mesures antérieures ne sont pas artificiellement redatées. La date d’apparition générale du 25 septembre à 23:16 Bruxelles vient du récit utilisateur. Les numéros historiques dans les pièces de réception identifient le logiciel effectivement testé. Les sources et tests exécutables fournis ici sont ceux du démonstrateur 4.1.2 ; aucune archive antérieure n’est requise pour les reproductions.

Une réception générale sans réserve porte sur les points effectivement proposés. Une validation ultérieure peut lever une attente historique sans transformer rétroactivement son ancien test en réussite. Les réserves de reproductibilité, acceptations nuancées et essais négatifs restent visibles lorsqu’ils changent l’interprétation.

Une reproduction ultérieure doit porter sa propre date et son environnement. Un résultat historique ou non reproduit et une attribution ouverte gardent leur qualification. Une date de rédaction n’est pas une date de reproduction.

## Pièces et démonstrateur

Les pièces copiées conservent leur provenance et leur version. Les fichiers dérivés indiquent qu’ils synthétisent des preuves, plutôt que de se présenter comme de nouvelles captures brutes. Les corps de discussions, coordonnées personnelles, noms de projets, chemins de profil, identifiants privés, cookies et jetons ne sont pas inclus. Les reproductions utilisent des contenus synthétiques.

L’extension 4.1.2 est une copie du démonstrateur de travail, pas une proposition de patch prêt à intégrer. Elle conserve les nœuds et actions natifs autant que le mécanisme le permet. Les contrats internes peuvent changer. Elle n’est pas une solution pérenne de l’accessibilité de ChatGPT : cette accessibilité doit être assurée dans le produit.

Les fonctions complètes du démonstrateur incluent des choix personnels hors du signalement. Les références de chaque sous-point indiquent le module pertinent. Les procédures du raisonnement et des Writing Blocks utilisent une génération de texte choisie par le testeur ; les autres constats structurels peuvent être examinés directement dans le code et les pièces du Point concerné.

## Contrôle des pièces distribuées — 8 octobre 2026

Les neuf fichiers de tests Node joints dans les Points 1 et 2 passent **243 tests, zéro échec**. Les pages de fixtures isolent les mécanismes annoncés, avec leurs procédures et résultats documentés dans chaque Point. Les liens et dépendances locaux, JSON et syntaxes de scripts ont été contrôlés. Les **25 fichiers** de l’extension correspondent exactement à l’archive 4.1.2 jointe et à ses empreintes de sources, dont l’empreinte SHA-256 accompagne le ZIP dans `distribution/`.

La cohérence du démonstrateur est vérifiée par identité des sources et des empreintes. Les constats natifs reposent sur les retours utilisateur des 7 et 8 octobre et sur les mesures DOM, d’accessibilité et de code liées dans chaque Point ; les mesures antérieures gardent leur date.

# Accessibilité de ChatGPT Web : dossier de signalement

Ce dossier décrit des barrières rencontrées dans **l’interface de chatgpt.com**, avec JAWS sous Windows : choix du modèle, composition, lecture des longues discussions, navigation dans les projets, gestion du focus et informations annoncées. Ces difficultés ont des conséquences concrètes : fonctions difficiles ou impossibles à activer, perte répétée de la position de lecture, contenu ajouté involontairement au brouillon et informations importantes impossibles à identifier rapidement. Bien que les observations aient été faites depuis l'interface du site réglée en français, les investigations portent ici sur les fonctionnalités et le code du site ; les problèmes et étapes de reproduction restent donc valables quelle que soit la langue de l'interface, exception faite des problèmes de traduction en français observés.

Le travail représente **un nombre important d'heures de tests personnels et d’investigation technique avec Codex**. L’objectif est sa transmission aux équipes responsables de l’accessibilité et de l’interface ChatGPT pour examen et, si possible, suivi. Il peut aussi servir à prévenir les mêmes mécanismes de régression dans de futures interfaces.

**Réinvestigation native du 7 octobre 2026, de 19 h 18 à 22 h 40**, complétant les preuves de septembre et des 3–6 octobre. Elle comprend la comparaison du raisonnement avec GPT-6 puis GPT-5.6 ; le Point 2B en décrit les résultats. Les observations complémentaires de raisonnement se poursuivent vers **23 h 20**, heure de Bruxelles, puis les réceptions des cartes et régions GPT-6 le **8 octobre**. La réception humaine du site natif, dans Edge sans extension pour le nom du sélecteur, date du **8 octobre à 01 h 55, heure de Bruxelles (UTC+02:00)**. Chaque preuve garde sa date et sa provenance.

## Lire les quatre ensembles

L’ordre correspond à l’impact et aux priorités de l’utilisateur. Chaque dossier contient son rapport détaillé et les preuves ou reproductions nécessaires à sa lecture. Les sous-points ont des identifiants stables et peuvent être examinés séparément.

1. [Sélecteur et composition](Point%201%20-%20Sélecteur%20et%20composition/RAPPORT.md) : modèle et niveau de raisonnement, traduction de ce niveau, menu d’ajout, rappel involontaire de prompts.
2. [Lecture et messages](Point%202%20-%20Lecture%20et%20messages/RAPPORT.md) : conversations longues, raisonnement, sélection, copie et partage, champs générés et repères.
3. [Navigation et focus](Point%203%20-%20Navigation%20et%20focus/RAPPORT.md) : actions des projets, barre latérale, pagination, fermetures de menus et panneaux, cas Explorer, menu Évaluer la réponse.
4. [Sémantique et localisation](Point%204%20-%20Sémantique%20et%20localisation/RAPPORT.md) : descriptions de rôles, états de destinations, groupes redondants, premier passage dans un mode bloquant et commandes de projets en anglais.

La [méthode](METHODE.md) explique les niveaux de preuve. L’[extension complète](../extension/manifest.json), version **4.1.2**, est le démonstrateur commun ; ses [instructions de chargement](DEMONSTRATEUR.md) permettent de comparer le comportement sans et avec adaptation.

## Chronologie et environnement

Le changement général d’interface a été constaté **le 25 septembre 2026 à 23 h 16, heure de Bruxelles**, alors que quelques heures auparavant l’ancien affichage était encore présent. Il s’agit du récit de l’utilisateur, pas d’un horodatage technique de déploiement. La difficulté de virtualisation des longues conversations avait déjà été examinée à partir du **17 septembre** ; elle a ensuite été réexaminée après le changement de rendu.

Les [versions actuelles, les scripts JAWS et les confirmations utilisateur](ENVIRONNEMENT.md) sont réunies dans le document d’environnement : Chrome 154.0.8037.98, Edge 154.0.4258.62, Opera 136.0.6008.80, JAWS 2021.2107.12.400 et 2025.2503.39.400. Les confirmations sur les navigateurs et versions de JAWS indiqués sont précisées dans chaque Point ; Opera sert notamment de cas témoin pour le nouveau chat sans envoi préalable. Les sources du démonstrateur et les preuves instrumentées sont présentées séparément.

Les horaires humains locaux cités dans le dossier sont en **heure de Bruxelles (Europe/Brussels, UTC+02:00)** pour septembre et début octobre 2026. Les horodatages techniques des preuves gardent leur fuseau explicite : les valeurs ISO suffixées par `Z` sont en UTC, celles avec un décalage conservent ce décalage. Une date sans heure signifie que seule cette précision est attestée.

## Portée et origine du travail

Les observations d’usage et les réceptions physiques proviennent de l’utilisateur. Les inspections du DOM, de l’arbre d’accessibilité et du code public, les tests et l’extension ont été effectués avec Codex, principalement avec **GPT-6.1 Sol**, sous sa direction. Cette provenance explique la répartition du travail ; elle ne donne pas au modèle valeur de preuve. L’utilisateur peut préciser son parcours et ses annonces, mais ne doit pas être supposé pouvoir répondre personnellement de mémoire à chaque détail de React ou de Chromium.

Plusieurs difficultés ont aussi été rencontrées ou décrites dans l’application Windows réunissant ChatGPT et Codex. Les preuves techniques de ce dossier concernent le **Web**. Il est souhaitable que les équipes examinent les comportements équivalents dans l’application Windows, sans présumer qu’ils partagent exactement le même code ou la même cause.

Les captures purement visuelles ne suffisent généralement pas à montrer ces problèmes. Le dossier privilégie les gestes, les retours JAWS disponibles, les noms et rôles exposés, les traces de focus et les mécanismes vérifiables. Aucun enregistrement audio ou vidéo n’est fourni spontanément ; une demande ciblée pourra être examinée selon sa nécessité et sa faisabilité.

## Ce qui est retenu et ce qui ne l’est pas

Les quatre ensembles distinguent mécanisme natif observé, difficulté d’interopérabilité, demande d’organisation et limite de l’adaptation. Le succès d’un contournement ne signifie pas que le site a été corrigé et ne suffit pas à attribuer sa cause à OpenAI.

Dans les discussions déjà utilisées, ou un nouveau chat après un envoi créant une discussion depuis ce navigateur, la réinsertion de prompts avec Flèche haut reste une barrière de navigation et un risque d’envoi involontaire ; la limite de l’extension est l’absence d’accès alternatif à cet historique. Le regroupement des analyses et l’emplacement stable de la barre sont décrits avec leur composante d’organisation. Le contrôle actuellement présent est « Évaluer la réponse » : son rôle de menu et la reprise de lecture à sa fermeture sont examinés au Point 3G.


La sélection manuelle et la copie fonctionnent hors sauts de lecture, conformément au retour natif du 7 octobre. Les sauts dans les longues discussions interrompent la continuité de lecture et de sélection. L’ajout des locuteurs, durées de réflexion et horodatages au texte copié est distingué comme demande produit au Point 2C.

Les autres préférences de l’extension — retrait du lien Accueil sur l’accueil, ajout rapide de projet en Liste unique, arrangement exact d’une ligne de projet — ne sont pas transformées en défauts universels.

## Portée des résultats

Les mécanismes décrivent les rendus examinés. Les preuves datées permettent de distinguer les rendus observés et les évolutions du produit ; une attribution ouverte conserve sa qualification. Les noms calculés dans l’arbre d’accessibilité ne sont jamais présentés comme une parole entendue.

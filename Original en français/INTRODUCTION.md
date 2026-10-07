# Accessibilité de ChatGPT Web : dossier de signalement

Ce dossier décrit des barrières rencontrées dans **l’interface française de chatgpt.com**, avec JAWS sous Windows : choix du modèle, composition, lecture des longues discussions, navigation dans les projets, gestion du focus et informations annoncées. Ces difficultés ont des conséquences concrètes : fonctions difficiles à activer, perte répétée de la position de lecture, contenu ajouté involontairement au brouillon et informations importantes impossibles à identifier rapidement.

Le travail représente **plusieurs heures de tests personnels et d’investigation technique avec Codex**. L’objectif est sa transmission aux équipes responsables de l’accessibilité et de l’interface ChatGPT pour examen et, si possible, suivi. Il peut aussi servir à prévenir les mêmes mécanismes de régression dans de futures interfaces.

**Observations historiques de septembre et des 3–5 octobre 2026, complétées par des inspections ciblées les 6 et 7 octobre.** Chaque preuve garde sa date et sa version testée. La date de rédaction ne constitue pas une nouvelle reproduction du problème dans le produit.

## Lire les quatre ensembles

L’ordre correspond à l’impact et aux priorités de l’utilisateur. Chaque dossier contient son rapport détaillé et les preuves ou reproductions nécessaires à sa lecture. Les sous-points ont des identifiants stables et peuvent être examinés séparément.

1. [Sélecteur et composition](Point%201%20-%20Sélecteur%20et%20composition/RAPPORT.md) : modèle et niveau de raisonnement, traduction de ce niveau, menu d’ajout, rappel involontaire de prompts.
2. [Lecture et messages](Point%202%20-%20Lecture%20et%20messages/RAPPORT.md) : conversations longues, raisonnement, sélection, copie et partage, champs générés et repères.
3. [Navigation et focus](Point%203%20-%20Navigation%20et%20focus/RAPPORT.md) : actions des projets, barre latérale, pagination, fermetures de menus et panneaux, cas Explorer, signalement Réagir.
4. [Sémantique et localisation](Point%204%20-%20Sémantique%20et%20localisation/RAPPORT.md) : descriptions de rôles, états de destinations, groupes redondants, premier passage dans un mode bloquant et commandes de projets en anglais.

La [méthode](METHODE.md) explique les niveaux de preuve. L’[extension complète](../extension/manifest.json), version **3.6.3**, est le démonstrateur commun ; ses [instructions de chargement](DEMONSTRATEUR.md) permettent de comparer le comportement sans et avec adaptation.

## Chronologie et environnement

Le changement général d’interface a été constaté **le 25 septembre 2026 à 23 h 16, heure de Bruxelles**, alors que quelques heures auparavant l’ancien affichage était encore présent. Il s’agit du récit de l’utilisateur, pas d’un horodatage technique de déploiement. La difficulté de virtualisation des longues conversations avait déjà été examinée à partir du **17 septembre** ; elle a ensuite été réexaminée après le changement de rendu.

| Élément | Contexte attesté | Limite |
|---|---|---|
| Langue | Interface du site en français ; annonces et adaptation étudiées dans cette configuration | Ne décrit pas toutes les langues |
| Windows | Relevé du 3 octobre : Windows 10 Home 22H2, build 19045.6466 | Valeur historique, propre au contexte relevé |
| Chrome | Relevé du 3 octobre à 22:28:10 Bruxelles : 154.0.8037.93 | Ne date pas rétroactivement les essais de septembre |
| JAWS | Usage principal de JAWS 2021 déclaré ; JAWS 2025 cité dans le premier signalement et même blocage initial confirmé lors d’un bref essai | Aucune réception exhaustive des adaptations sur les deux versions |
| Edge | Comparaison initiale déclarée ; inspection ciblée sans extension le 6 octobre : Edge 154.0.4258.62, Chromium 154.0.8037.98 | Inspection DOM/AX et sélection manuelle, pas réception JAWS complète |
| Extension | Sources 3.6.3 jointes ; parcours de longue conversation reçu le 7 octobre, adaptations des autres réceptions historiques conservées | Réception ciblée déclarée par l’utilisateur ; comptes DOM et parole JAWS distincts, sans nouvelle réception exhaustive de tous les parcours en 3.6.2 |

Tous les horaires sont exprimés en **Europe/Brussels** ; en septembre et début octobre 2026, UTC+02:00. Une date sans heure signifie que seule cette précision est attestée.

## Portée et origine du travail

Les observations d’usage et les réceptions physiques proviennent de l’utilisateur. Les inspections du DOM, de l’arbre d’accessibilité et du code public, les tests et l’extension ont été effectués avec Codex, principalement avec **GPT-6.1 Sol**, sous sa direction. Cette provenance explique la répartition du travail ; elle ne donne pas au modèle valeur de preuve. L’utilisateur peut préciser son parcours et ses annonces, mais ne doit pas être supposé pouvoir répondre personnellement de mémoire à chaque détail de React ou de Chromium.

Plusieurs difficultés ont aussi été rencontrées ou décrites dans l’application Windows réunissant ChatGPT et Codex. Les preuves techniques de ce dossier concernent le **Web**. Il est souhaitable que les équipes examinent les comportements équivalents dans l’application Windows, sans présumer qu’ils partagent exactement le même code ou la même cause.

Les captures purement visuelles ne suffisent généralement pas à montrer ces problèmes. Le dossier privilégie les gestes, les retours JAWS disponibles, les noms et rôles exposés, les traces de focus et les mécanismes vérifiables. Aucun enregistrement audio ou vidéo n’est fourni spontanément ; une demande ciblée pourra être examinée selon sa faisabilité.

## Ce qui est retenu et ce qui ne l’est pas

Les quatre ensembles distinguent mécanisme natif observé, difficulté d’interopérabilité, demande d’organisation et limite de l’adaptation. Le succès d’un contournement ne signifie pas que le site a été corrigé et ne suffit pas à attribuer sa cause à OpenAI.

La réinsertion de prompts avec Flèche haut reste une barrière de navigation et un risque d’envoi involontaire ; la limite de l’extension est l’absence d’accès alternatif à cet historique. Le regroupement des analyses et l’emplacement stable de la barre sont décrits avec leur composante d’organisation. Réagir est conservé comme **constaté, non investigué et non traité**.


La sélection manuelle de plusieurs paragraphes et leur copie ont été constatées sans l’extension dans Edge le 6 octobre. Le point 2 examine donc les barrières de sélection étendue tout en gardant distinctes sélection de petits extraits, copie massive, canal de presse-papiers du navigateur et résultat physique Windows/JAWS. L’intention générale du produit ne se déduit pas de cet essai.

Les autres préférences de l’extension — retrait du lien Accueil sur l’accueil, ajout rapide de projet en Liste unique, arrangement exact d’une ligne de projet — ne sont pas transformées en défauts universels. L’ancien signalement des doublons au-dessus de la page a été retiré par l’utilisateur ; le lien « Retour à l’application » n’a pas été retrouvé dans les paramètres examinés. Ni compteur de quota absent ni détails de raisonnement inexistants ne sont inventés.

## Portée des résultats

Les mécanismes décrivent les rendus examinés. Une reproduction ultérieure doit relever son environnement et son résultat ; un comportement disparu devient historique et une attribution ouverte conserve sa qualification. Les noms calculés dans l’arbre d’accessibilité ne sont jamais présentés comme une parole entendue.

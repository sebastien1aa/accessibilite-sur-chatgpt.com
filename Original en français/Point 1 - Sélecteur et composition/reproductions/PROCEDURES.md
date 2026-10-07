# Procédures de reproduction — Point 1

Relever la date, le navigateur, Windows, la version et le mode du lecteur d’écran, la langue française et l’état de l’extension. Comparer le site natif et le démonstrateur dans des documents frais distincts. Ces procédures permettent à un tiers de reproduire les comportements. Les [retours natifs reçus le 7 octobre, de 19 h 18 à 22 h 40, heure de Bruxelles (Europe/Brussels, UTC+02:00)](../preuves/reception-native-2026-10-07.json) et [l’environnement commun](../../ENVIRONNEMENT.md) donnent les conditions et leur provenance. Aucun envoi de message n’est nécessaire pour ces essais.

## 1A — Le sélecteur fermé ne permet pas d’identifier rapidement le choix

1. Ouvrir chatgpt.com en français, avec un choix de modèle/niveau déjà effectué et l’extension désactivée.
2. En curseur PC virtuel, parcourir les commandes du composeur aux flèches ; rejoindre le sélecteur fermé.
3. Écouter si son nom fournit le choix courant. Ouvrir par Espace ou Entrée ; dans Chat, parcourir haut/bas « Sélectionner le modèle. 1 sur 2 » et « Puissance. 2 sur 2. Arrow left arrow right », puis gauche/droite pour les niveaux.
4. Comparer les annonces reçues en Chat (« Instant », « Medium », « High », « Extra high », « Pro »), les légendes et les statuts exposés ; ne pas déduire la parole des seules valeurs DOM/AX.
5. Dans Work, relever « Activer le mode rapide non coché » lorsque désactivé et « Activer le mode standard coché » lorsqu’activé, puis « Rétablir la sélection par défaut ». Comparer l’action annoncée et l’état courant ; relever aussi les différences entre légendes et statuts des niveaux.
6. Fermer par Échap et relire le sélecteur : la réception native donne toujours « Sélectionner le modèle ChatGPT » dans les deux modes.

**Attendu :** nom utile du sélecteur fermé, comprenant le modèle et le niveau réellement choisis lorsqu’ils font partie de l’information proposée par le produit ; niveaux annoncés dans la langue de l’interface, avec légendes et statuts cohérents ; distinction claire entre l’état actuel du mode rapide et l’action proposée pour le changer. Le dossier ne demande pas de révéler un identifiant interne non destiné à l’utilisateur.

## 1B — Le menu « Ajouter des fichiers et plus encore » ferme sans activer l’option voulue

1. Sur une page fraîche française, composeur vide, rejoindre Ajouter des fichiers et plus encore avec le curseur virtuel.
2. Appuyer sur Espace ; relever l’annonce et le focus. La réception native donne le champ de prompt à la première ouverture, le bouton aux suivantes et aucune annonce d’ouverture. Relire le déclencheur : sans fermeture par Échap, il est annoncé étendu.
3. Descendre aux flèches après l’éditeur et les deux « Fin de région principale ». Relever l’ordre Ajouter, fichiers depuis l’ordinateur, fichiers d’un espace, projet, recherche approfondie, Plugins, puis les fonctions et « Type to search plugins ». L’option de fichiers est reçue « bouton actuel » sans sélection volontaire.
4. Activer une option qui ne transmet pas de données par Espace ou Entrée ; comparer activation effective, fermeture et destination du focus. Le retour reçu donne fermeture sans activation et retour au haut de la page. Ne pas envoyer le message.
5. Rouvrir après la tentative : le focus initial dans le champ se reproduit selon l’utilisateur. Fermer par Échap et retirer uniquement une éventuelle sélection de test.

**Attendu :** déclencheur et popup cohérents, accès clavier aux items disponibles, activation fiable de l’item focalisé et retour au contexte à la fermeture. Le choix précis des rôles dépend du composant retenu par le produit, mais il doit être utilisable avec le lecteur d’écran.

## 1C — Flèche haut ajoute involontairement un ancien prompt dans un champ vide

1. Utiliser un compte avec historique de prompts, sans exiger un envoi préalable depuis le navigateur de test.
2. Ouvrir une discussion existante, puis une nouvelle discussion, sans brouillon à préserver. Relever si le navigateur a déjà servi à créer une discussion : le retour Opera confirme le phénomène même sans cet usage antérieur.
3. Avec le composeur réellement vide et focalisé, appuyer une fois sur Flèche haut non modifiée, dans le mode où cette touche atteint le champ.
4. Vérifier si le texte d’un prompt antérieur remplit l’éditeur. Ne rien envoyer ; noter la distinction avec un menu de suggestions déjà ouvert.

**Attendu :** navigation aux flèches utilisable sans modification imprévue du brouillon, et accès explicite, accessible et volontaire à l’historique lorsqu’il est proposé. Un menu dédié est une piste, pas une implémentation imposée.

Les noms calculés et rôles mesurés ne constituent pas une transcription de la parole JAWS. Pour 1C, l’adaptation bloque le rappel involontaire mais ne fournit aucun accès alternatif à l’historique.

Les [contrôles synthétiques](EXECUTION.md) vérifient séparément les mécanismes du démonstrateur.

# Charger et examiner le démonstrateur 3.6.2

Le dossier [extension](../extension/manifest.json) contient la version complète de travail, copiée sans modification fonctionnelle. Elle est compatible avec le format Manifest V3 utilisé par Chrome et Edge. Elle cible uniquement `https://chatgpt.com/*` et ne nécessite ni dépendance embarquée, ni service worker, ni permission de lecture du presse-papiers.

## Comparaison dans un navigateur

1. Préserver les brouillons et utiliser un onglet de diagnostic. Relever navigateur, lecteur d’écran, langue, mode et date. Commencer extension désactivée, sur une page fraîche, avec les conditions du sous-point examiné.
2. Dans la page native des extensions de Chrome ou Edge, activer le mode développeur si nécessaire, choisir « Charger l’extension non empaquetée », puis sélectionner le dossier `extension` de ce dépôt.
3. Vérifier le nom **Accessibilité pour ChatGPT web** et la version **3.6.2**. Éviter de cumuler deux exemplaires du démonstrateur ou une injection expérimentale et la version complète.
4. Ouvrir une nouvelle page ChatGPT en français et refaire le parcours indiqué. Les modules de conservation et plusieurs adaptations doivent être présents dès le démarrage : charger l’extension après l’ouverture du document ne remplace pas une page fraîche.
5. Désactiver l’exemplaire de diagnostic et rouvrir une page fraîche pour une comparaison native. Restaurer les réglages initiaux et fermer les onglets de test sans brouillon utile.

La version 3.6.2 conserve les adaptations validées par l’utilisateur aux dates indiquées dans les rapports. Le parcours montant et descendant d’une longue conversation est également validé le 7 octobre en 3.6.2. Les procédures permettent aux équipes de comparer le site et le démonstrateur ; elles ne remettent pas en attente les validations déjà acquises.

Les gestes de lecture et de réception sont décrits dans chaque rapport. Espace correspond à l’usage habituel de l’utilisateur pour activer un bouton. Tab atteint parfois des commandes que le parcours aux flèches expose mal ; cette réussite ne remplace pas la comparaison du curseur virtuel.

## Reproductions et contrôles automatisés

Chaque Point conserve ses propres fichiers utiles sous `reproductions/`, accompagnés de leur mode d’exécution et de leurs limites. Les tests Node utilisent les modules de l’extension commune ; les pages HTML synthétiques évaluent uniquement les mécanismes annoncés. Un test automatisé réussi ne vaut pas réception JAWS.

L’archive livrée et les empreintes des fichiers sont conservées sous `distribution/`. Les sources restent accessibles pour examiner le contournement sans l’installer.

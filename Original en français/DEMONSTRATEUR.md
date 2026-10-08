# Charger et examiner le démonstrateur 4.1.2

Le dossier [extension](../extension/manifest.json) contient la version complète du démonstrateur 4.1.2. Elle est compatible avec le format Manifest V3 utilisé par Chrome et Edge. Elle cible uniquement `https://chatgpt.com/*` et ne nécessite ni dépendance embarquée, ni service worker, ni permission de lecture du presse-papiers.

## Comparaison dans un navigateur

1. Commencer extension désactivée, dans une page nouvellement chargée, avec les conditions du sous-point examiné.
2. Dans la page native des extensions de Chrome ou Edge, activer le mode développeur si nécessaire, choisir « Charger l’extension non empaquetée », puis sélectionner le dossier `extension` de ce dépôt.
3. Vérifier le nom **Accessibilité pour ChatGPT web** et la version **4.1.2**. Éviter de cumuler deux exemplaires du démonstrateur ou une injection expérimentale et la version complète.
4. Ouvrir une nouvelle page ChatGPT en français et refaire le parcours indiqué. Les modules de conservation et plusieurs adaptations doivent être présents dès le démarrage : charger l’extension après l’ouverture du document ne remplace pas une page nouvellement chargée.
5. Désactiver le démonstrateur et ouvrir une nouvelle page pour retrouver le rendu natif.

La version 4.1.2 conserve les adaptations validées par l’utilisateur aux dates indiquées dans les rapports. Le parcours montant et descendant d’une longue conversation est reçu le 7 octobre ; la preuve garde le numéro effectivement testé. Les procédures permettent aux équipes de comparer le site et le démonstrateur, en conservant les acquis documentés pour chaque parcours.

Les gestes de reproduction figurent dans chaque Point. Espace active les boutons dans les parcours décrits. Tab atteint parfois des commandes que le parcours aux flèches expose mal ; cette réussite ne remplace pas la comparaison du curseur PC virtuel.

## Reproductions et contrôles automatisés

Chaque Point conserve ses propres fichiers utiles sous `reproductions/`, accompagnés de leur mode d’exécution et de leurs limites. Les tests Node utilisent les modules de l’extension commune ; les pages HTML synthétiques évaluent uniquement les mécanismes annoncés. Un test automatisé réussi ne vaut pas réception JAWS.

L’archive livrée et les empreintes des fichiers sont conservées sous `distribution/`. Les sources restent accessibles pour examiner le contournement sans l’installer.

# Mécanismes natifs examinés le 3 octobre

Cette note est une synthèse dérivée des inspections du code public et du DOM. Elle n’est pas une nouvelle capture brute ni une réception JAWS. Les noms minifiés changent avec les versions.

Source publique inspectée : `https://chatgpt.com/cdn/assets/385910.71a81f043e.js`. SHA-256 de la copie alors examinée : `389E8668E39CD03B070D49E54CCC2063936B982FF5B657E53A5B5A59F14132DF`. Les offsets indiquent des **caractères UTF-16**, pas des octets. Le gros bundle n’est pas embarqué ; le mécanisme utile est décrit ici.

| Sous-point | Module et localisation historiques | Mécanisme constaté |
|---|---|---|
| 1A, traduction | `fZ0`, ligne 405, offset 6627793 | La légende de sélection est déterminée par `selectedLabel ?? title` |
| 1A, traduction | `e47.O`, ligne 432, offset 8639966 | `sliderLabel` est pris avant le repli qui appelle la traduction |
| 1B, fermeture | `tfV`, ligne 433, offset 8840139 | Plugin composer-suggestion-ui : blur de l’éditeur envoie dismiss ; exception identifiée pour emoji, pas pour les boutons d’ajout |
| 1B, clavier | `UPl.k`, ligne 430, offset 8429557 | Navigation créée avec captureWindowKeydown=true |
| 1B, activation | `VCs.a`, ligne 947, offsets 15136200–15137604 | Écouteur keydown sur window en capture ; action choisie par index surligné |

Le popup réel a été identifié depuis `data-mention-section-id=chatgpt-actions` et `data-mention-list-scroll-area`. Ses boutons portaient `data-list-navigation-item=true`. Le focus initial restait dans `.ProseMirror[role=textbox]`. Ces faits relient le code public au rendu examiné et justifient une correction ciblée, plutôt qu’une interception globale de tous les menus.

Pour 1C, la preuve est un rappel de 163 caractères dans l’éditeur avant protection et un éditeur restant vide après protection. Le contenu rappelé n’est pas conservé. La garde locale correspond au keymap natif ProseMirror, chargé avant le gestionnaire de bouillonnement de l’éditeur. Cette information ne prétend pas connaître l’intention générale du produit ni le mode interne de JAWS.

Les mesures post-adaptation et la réception globale du 4 octobre sont distinctes des constats natifs du 3. Les tests annexés exercent l’adaptation sur des structures synthétiques et gardent leurs mêmes nœuds et callbacks.

Le [relevé du 7 octobre](1A-libelles-natifs-2026-10-07.json) complète la localisation historique de 1A : Chrome, page `fr-FR`, module du sélecteur inactif. En Chat, les statuts sont « Instantané », « Moyenne », « Élevée », « Très élevé », « Pro » ; la dernière légende a été relevée « 6Pro ». Dans Work pour GPT-6.1 Sol, les légendes « Minimal », « Moyen », « Élevé », « Très élevé », « Max », « Ultra » correspondent aux statuts accessibles « Minimal », « Moyenne », « Élevée », « Très élevé », « Maximum », « Ultra ». Ces valeurs natives donnent l’orthographe de référence, sans déduire un écart audible des formes phonétiquement équivalentes écrites par l’utilisateur. L’adaptation conserve le statut accessible français.

La [réception humaine du 7 octobre](reception-native-2026-10-07.json) reçoit séparément les annonces anglaises en Chat, les niveaux français en Work, l’écart légende/statut et l’ambiguïté « Activer le mode standard coché » lorsque le mode rapide est actif. Ce dernier point est une observation d’état, sans nouveau traitement d’extension. Les noms DOM/AX français ne remplacent pas la parole reçue et ne démontrent pas son mécanisme interne. Les retours de focus et d’activation du menu d’ajout ainsi que le rappel de prompt dans un navigateur n’ayant jamais créé de chat sont aussi reçus ; aucune nouvelle cause technique Opera ou JAWS n’en est déduite.

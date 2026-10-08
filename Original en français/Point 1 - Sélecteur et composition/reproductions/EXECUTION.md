# Tests des adaptations de composition

Les trois fichiers `.test.cjs` de ce dossier sont copiés des tests du démonstrateur, sans changement de leur logique. Ils utilisent uniquement les modules standard de Node et lisent l’extension commune depuis la racine du dépôt.

Depuis cette racine, avec Node disponible :

```powershell
node --test "Original en français/Point 1 - Sélecteur et composition/reproductions/model-accessibility.test.cjs" "Original en français/Point 1 - Sélecteur et composition/reproductions/add-menu-accessibility.test.cjs" "Original en français/Point 1 - Sélecteur et composition/reproductions/prompt-history-accessibility.test.cjs"
```

| Sous-point | Contrôle synthétique | Preuve du site et reproduction |
| --- | --- | --- |
| 1A — Sélecteur et langue | [model-accessibility.test.cjs](model-accessibility.test.cjs) : choix de nom, cohérence de sélection, langue, préservation des réglages et attributs restaurés. | [Libellés natifs](../preuves/1A-libelles-natifs-2026-10-07.json), [réception du 7 octobre](../preuves/reception-native-2026-10-07.json) et [procédure 1A](PROCEDURES.md#1a--sélecteur-et-informations-de-raisonnement), y compris l’état du mode rapide. |
| 1B — Menu d’ajout | [add-menu-accessibility.test.cjs](add-menu-accessibility.test.cjs) : éléments indisponibles, navigation, activation unique, contrôles imbriqués et restauration. | [Mécanismes natifs](../preuves/mecanismes-natifs.md), [réception du 7 octobre](../preuves/reception-native-2026-10-07.json) et [procédure 1B](PROCEDURES.md#1b--menu-dajout). |
| 1C — Historique involontaire | [prompt-history-accessibility.test.cjs](prompt-history-accessibility.test.cjs) : éditeur vide, gardes de menus/sélection/langue et démarrage précoce. | [Constats historiques](../preuves/constats-et-receptions.json), [réception du 7 octobre](../preuves/reception-native-2026-10-07.json) et [procédure 1C](PROCEDURES.md#1c--rappel-involontaire-de-prompts). |

Le DOM est simulé : ces tests ne reproduisent ni toute l’interface ChatGPT, ni la parole, ni le curseur PC virtuel de JAWS. Le cas du mode rapide de 1A est un constat produit reçu ; aucun traitement local ni test de correction de cette ambiguïté n’est revendiqué.

Le [contrôle historique du 8 octobre en 4.1.1](../preuves/2026-10-08-selecteur-reception-edge.json) conserve 22 tests réussis et le nom adapté « Modèle ChatGPT : Élevée », antérieur au préfixe final.

Les [22 tests du sélecteur actuellement fournis en 4.1.2](model-accessibility.test.cjs) couvrent le préfixe Raisonnement, l’absence d’ajout d’un modèle non visible, les formes natives, les choix ambigus et la restauration. La [confirmation humaine de la 4.1.2](../preuves/2026-10-08-confirmation-4.1.2.json) reçoit le préfixe final « Raisonnement : » et la conservation des informations natives.

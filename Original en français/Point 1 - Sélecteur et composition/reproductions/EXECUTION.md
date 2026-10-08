# Tests des adaptations de composition

Les trois fichiers `.test.cjs` de ce dossier sont copiés des tests du démonstrateur, sans changement de leur logique. Ils utilisent uniquement les modules standard de Node et lisent l’extension commune depuis la racine du dépôt.

Depuis cette racine, avec Node disponible :

```powershell
node --test "Original en français/Point 1 - Sélecteur et composition/reproductions/model-accessibility.test.cjs" "Original en français/Point 1 - Sélecteur et composition/reproductions/add-menu-accessibility.test.cjs" "Original en français/Point 1 - Sélecteur et composition/reproductions/prompt-history-accessibility.test.cjs"
```

| Sous-point | Contrôle synthétique | Preuve du site et reproduction |
| --- | --- | --- |
| 1A — Sélecteur et langue | [model-accessibility.test.cjs](model-accessibility.test.cjs) : choix de nom, cohérence de sélection, langue, préservation des réglages et attributs restaurés. | [Libellés natifs](../preuves/1A-libelles-natifs-2026-10-07.json), [réception du 7 octobre](../preuves/reception-native-2026-10-07.json) et [procédure 1A](PROCEDURES.md#1a--le-sélecteur-fermé-ne-permet-pas-didentifier-rapidement-le-choix), y compris l’état du mode rapide. |
| 1B — Menu d’ajout | [add-menu-accessibility.test.cjs](add-menu-accessibility.test.cjs) : éléments indisponibles, navigation, activation unique, contrôles imbriqués et restauration. | [Mécanismes natifs](../preuves/mecanismes-natifs.md), [réception du 7 octobre](../preuves/reception-native-2026-10-07.json) et [procédure 1B](PROCEDURES.md#1b--le-menu--ajouter-des-fichiers-et-plus-encore--ferme-sans-activer-loption-voulue). |
| 1C — Historique involontaire | [prompt-history-accessibility.test.cjs](prompt-history-accessibility.test.cjs) : éditeur vide, gardes de menus/sélection/langue et démarrage précoce. | [Constats historiques](../preuves/constats-et-receptions.json), [réception du 7 octobre](../preuves/reception-native-2026-10-07.json) et [procédure 1C](PROCEDURES.md#1c--flèche-haut-ajoute-involontairement-un-ancien-prompt-dans-un-champ-vide). |

Le DOM est simulé : ces tests ne reproduisent ni toute l’interface ChatGPT, ni la parole, ni le curseur PC virtuel de JAWS. Le cas du mode rapide de 1A est un constat produit reçu ; aucun traitement local ni test de correction de cette ambiguïté n’est revendiqué.

Le [contrôle complémentaire du 8 octobre](../preuves/2026-10-08-selecteur-reception-edge.json) comprend 22 tests du sélecteur : préfixe Raisonnement, absence d’ajout d’un modèle non visible, formes natives, choix ambigus et restauration.

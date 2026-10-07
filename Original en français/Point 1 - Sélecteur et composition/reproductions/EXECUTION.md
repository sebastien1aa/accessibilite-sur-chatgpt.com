# Tests des adaptations de composition

Les trois fichiers `.test.cjs` de ce dossier sont copiés des tests du démonstrateur, sans changement de leur logique. Ils utilisent uniquement les modules standard de Node et lisent l’extension commune depuis la racine du dépôt.

Depuis cette racine, avec Node disponible :

```powershell
node --test "Original en français/Point 1 - Sélecteur et composition/reproductions/model-accessibility.test.cjs" "Original en français/Point 1 - Sélecteur et composition/reproductions/add-menu-accessibility.test.cjs" "Original en français/Point 1 - Sélecteur et composition/reproductions/prompt-history-accessibility.test.cjs"
```

Ces tests vérifient le choix de nom, les gardes de langue/sélection, les éléments indisponibles, la navigation du menu, l’activation unique, les attributs restaurés et le démarrage précoce. Le DOM est simulé : ils ne reproduisent ni toute l’interface ChatGPT, ni la parole, ni le curseur PC virtuel de JAWS. Le rapport contient séparément les parcours réels et les réceptions.

# Contrôles existants du Point 2

Ces fichiers sélectionnent les tests et fixtures déjà employés pour vérifier les contournements liés au Point 2. Les quatre cas du maintien moderne vérifient la conservation des clés, la préservation des paramètres et callbacks natifs, ainsi que les gardes de portée. Les chemins des fixtures HTML renvoient à l’extension commune.

## Node — depuis la racine du nouveau dépôt

Les tests lisent `extension/...` relativement au répertoire courant. **Se placer dans la racine qui contient `extension/` et `Original en français/`**, puis lancer :

```powershell
node --test "Original en français/Point 2 - Lecture et messages/reproductions/keep-turns.test.cjs" "Original en français/Point 2 - Lecture et messages/reproductions/keep-modern-turns.test.cjs" "Original en français/Point 2 - Lecture et messages/reproductions/reasoning-accessibility.test.cjs" "Original en français/Point 2 - Lecture et messages/reproductions/analysis-details-accessibility.test.cjs" "Original en français/Point 2 - Lecture et messages/reproductions/feedback-actions.test.cjs"
```

Le Node de l’environnement peut être fourni par son installation habituelle. Les tests utilisent seulement les modules intégrés `node:test`, `node:assert/strict`, `node:fs` et `node:vm` ; aucune installation de dépendance npm n’est nécessaire. La fixture Writing Blocks est un contrôle de navigateur, pas un fichier Node absent.

## Fixtures — servies depuis la même racine

Pour les contrôles de navigateur, servir la racine sur localhost, puis ouvrir les fichiers sous `Original en français/Point 2 - Lecture et messages/reproductions/`. Un serveur statique existant convient ; aucun serveur n’est lancé automatiquement par ces pièces. Les chemins `../../../extension/...` doivent rester servis par cette même racine.

| Fichier | Ce qu’il vérifie |
| --- | --- |
| [browser.html](browser.html) | Ancien virtualiseur synthétique, 80 messages, isolation des autres observateurs. |
| [modern-browser.html](modern-browser.html) | Contrat moderne synthétique, 126 messages et identité de leurs nœuds. |
| [reasoning-selection.html](reasoning-selection.html) | Sélection de détails affichés, fermeture native et texte/nœuds préservés ; grand texte exclusivement synthétique. |
| [page-selection.html](page-selection.html) | Locuteurs, date/heure, navigation, éditeurs et texte replié, sans contenu privé. |
| [feedback-actions.html](feedback-actions.html) | Annonces après réussite simulée, disponibilité, focus, retour à l’état natif et gardes. Ne crée aucun lien public ni copie de vraie conversation. |
| [writing-block-accessibility.html](writing-block-accessibility.html) | Quatre poignées inactives synthétiques, champs et callbacks préservés. |

Les contenus sont fictifs. Les routes `chatgpt.com/c/fixture` ou `example.test` éventuellement présentes dans les doubles Node sont des valeurs synthétiques sans requête au site. Les imports locaux n’exécutent aucun message ChatGPT.

## Valeur et limites

Node vérifie les mécanismes sur des doubles ; les fixtures vérifient les particularités du navigateur ; les JSON datés sous `../preuves/` décrivent des relevés du site. Aucun de ces résultats ne remplace la réception physique JAWS. Les retours humains datés figurent séparément dans le rapport.

Une exécution de ces tests vérifie uniquement les mécanismes et invariants synthétiques décrits. Elle ne constitue pas une nouvelle validation humaine des parcours du site.

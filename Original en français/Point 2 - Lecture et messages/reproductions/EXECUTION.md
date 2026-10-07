# Contrôles existants du Point 2

Ces fichiers sélectionnent les tests et fixtures déjà employés pour vérifier les contournements liés au Point 2. Les quatre cas du maintien moderne vérifient la conservation des clés, la préservation des paramètres et callbacks natifs, ainsi que les gardes de portée. Les chemins des fixtures HTML renvoient à l’extension commune.

## Node — depuis la racine du dépôt

Les tests lisent `extension/...` relativement au répertoire courant. **Se placer dans la racine qui contient `extension/` et `Original en français/`**, puis lancer :

```powershell
node --test "Original en français/Point 2 - Lecture et messages/reproductions/keep-turns.test.cjs" "Original en français/Point 2 - Lecture et messages/reproductions/keep-modern-turns.test.cjs" "Original en français/Point 2 - Lecture et messages/reproductions/reasoning-accessibility.test.cjs" "Original en français/Point 2 - Lecture et messages/reproductions/analysis-details-accessibility.test.cjs" "Original en français/Point 2 - Lecture et messages/reproductions/feedback-actions.test.cjs"
```

Les tests utilisent seulement les modules intégrés `node:test`, `node:assert/strict`, `node:fs` et `node:vm` ; aucune installation de dépendance npm n’est nécessaire. Writing Blocks est vérifié par la fixture de navigateur indiquée ci-dessous.

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

## Couverture des sous-points

| Sous-point | Contrôles et preuves |
| --- | --- |
| 2A — Lecture longue | Tests `keep-turns` et `keep-modern-turns`, fixtures ancienne/moderne ; [mesure du site et réception 3.6.2](../preuves/2A-virtualisation-2026-10-07.json). |
| 2B — Raisonnement | Tests `reasoning-accessibility` pour les repères, états et noms ; tests `analysis-details-accessibility` pour les cartes autonomes ; [comparaison native GPT-6/GPT-5.6](../preuves/2B-titre-raisonnement-gpt6-gpt56-2026-10-07.json). |
| 2C — Sélection | Fixtures `reasoning-selection` et `page-selection` ; [comparaison native du 6 octobre](../preuves/selection-native-2026-10-06.json) et [réception native du 7 octobre](../preuves/reception-native-2026-10-07.json). |
| 2D — Copier et Partager | Tests et fixture `feedback-actions` ; traces natives [de partage](../preuves/2026-10-05-partage-copie-natif.json) et [de disponibilité de copie](../preuves/2026-10-05-copie-disponibilite-native.json), [réceptions adaptées datées](../preuves/constats-2026-10-03-05.json) et [retour natif récent](../preuves/reception-native-2026-10-07.json). |
| 2E — Writing Blocks | Fixture `writing-block-accessibility` ; [signature DOM et callbacks natifs](../preuves/mecanismes-natifs.md), [réception du retrait adapté](../preuves/constats-2026-10-03-05.json) et [confirmation native récente](../preuves/reception-native-2026-10-07.json). |
| 2F — Dernière réponse | Contrôle structurel du `h4.sr-only` exact hors message et de `hideLastResponseHeading` dans [ui-accessibility.js](../../../extension/ui-accessibility.js) ; [procédure de parcours des titres](PROCEDURES.md), [réception adaptée](../preuves/constats-2026-10-03-05.json) et [présence native confirmée](../preuves/reception-native-2026-10-07.json). |

Les [procédures du site](PROCEDURES.md) couvrent les six sous-points. Pour 2F, le ciblage structurel et le parcours reçu constituent la vérification pertinente.

## Valeur et limites

Node vérifie les mécanismes sur des doubles ; les fixtures vérifient les particularités du navigateur ; les JSON datés sous `../preuves/` décrivent des relevés du site. Aucun de ces résultats ne remplace la réception physique JAWS. Les retours humains datés figurent séparément dans le rapport.

Une exécution de ces tests vérifie uniquement les mécanismes et invariants synthétiques décrits. Elle ne constitue pas une nouvelle validation humaine des parcours du site.

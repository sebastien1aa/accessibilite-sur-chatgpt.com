# Tests of the composer adaptations

The three `.test.cjs` files in this folder are copied from the demonstrator's tests, with no changes to their logic. They use only standard Node modules and read the shared extension from the repository root.

From that root, with Node available:

```powershell
node --test "English translation/Point 1 - Model selector and composer/reproductions/model-accessibility.test.cjs" "English translation/Point 1 - Model selector and composer/reproductions/add-menu-accessibility.test.cjs" "English translation/Point 1 - Model selector and composer/reproductions/prompt-history-accessibility.test.cjs"
```

| Subpoint | Synthetic check | Site evidence and reproduction |
| --- | --- | --- |
| 1A — Selector and language | [model-accessibility.test.cjs](model-accessibility.test.cjs): name selection, selection consistency, language, preservation of settings, and restored attributes. | [Native labels](../evidence/1A-native-labels-2026-10-07.json), [October 7 user validation](../evidence/native-user-validation-2026-10-07.json), and [procedure 1A](PROCEDURES.md#1a--selector-and-reasoning-information), including the fast-mode state. |
| 1B — Add menu | [add-menu-accessibility.test.cjs](add-menu-accessibility.test.cjs): unavailable items, navigation, single activation, nested controls, and restoration. | [Native mechanisms](../evidence/native-mechanisms.md), [October 7 user validation](../evidence/native-user-validation-2026-10-07.json), and [procedure 1B](PROCEDURES.md#1b--add-menu). |
| 1C — Unintentional history recall | [prompt-history-accessibility.test.cjs](prompt-history-accessibility.test.cjs): empty editor, menu/selection/language guards, and early startup. | [Historical observations](../evidence/observations-and-user-validation.json), [October 7 user validation](../evidence/native-user-validation-2026-10-07.json), and [procedure 1C](PROCEDURES.md#1c--unintentional-prompt-recall). |

The DOM is simulated: these tests reproduce neither the entire ChatGPT interface, nor speech, nor the JAWS virtual PC cursor. The fast-mode case in 1A is a product observation confirmed by user feedback; no local treatment or test correcting this ambiguity is claimed.

The [historical October 8 check in 4.1.1](../evidence/2026-10-08-selector-user-validation-edge.json) retains 22 passing tests and the adapted name « Modèle ChatGPT : Élevée », which predates the final prefix.

The [22 selector tests currently supplied in 4.1.2](model-accessibility.test.cjs) cover the Raisonnement prefix, no addition of a model that is not visible, native forms, ambiguous choices, and restoration. The [human confirmation of 4.1.2](../evidence/2026-10-08-confirmation-4.1.2.json) validates the final « Raisonnement : » prefix and preservation of the native information.

# Point 1 — Model selector and composer

This Point covers controls used before sending: recognizing the reasoning choice, choosing a function in the add menu, and composing without unintentionally recalling a prompt. Each subpoint begins with the problem and expected result, then presents the observations, mechanism, and local illustration.

French announcements and native labels are retained as evidence; their meaning is explained in the [French-label glossary](../METHODOLOGY.md#french-labels-used-in-the-reports).

The [conditions and versions](../ENVIRONMENT.md) are shared. The [site procedures](reproductions/PROCEDURES.md), [native evidence and JAWS feedback](evidence/native-user-validation-2026-10-07.json), and [isolated tests](reproductions/RUNNING_TESTS.md) allow independent examination. The supplied demonstrator is **4.1.2**.

## 1A — The closed selector does not allow the choice to be identified quickly

**Problem.** The closed selector announces its generic action and hides the displayed choice; the levels and fast mode also show inconsistencies in language or state.

**Expected result.** Identify the choice from the closed button and provide localized levels and a comprehensible fast-mode state.

**Reproduction.** [Procedure 1A](reproductions/PROCEDURES.md#1a--selector-and-reasoning-information).

### Obstacle and consequence

On October 7, JAWS always announces **« Sélectionner le modèle ChatGPT »**, without the current choice, after closing with Escape and regardless of the selected level, in both Chat and Work. Space or Enter opens the selector. In the Chat procedure of October 7, the Up/Down arrows move through « Sélectionner le modèle. 1 sur 2 », then « Puissance. 2 sur 2. Arrow left arrow right ». On Puissance, Left/Right successively announces **« Instant », « Medium », « High », « Extra high », « Pro »**: these reported announcements are in English in a French interface. They are distinct from the French DOM/AX inspection described below.

In Work, the validated procedure includes « Sélectionner le modèle. 1 sur 4 », then, with fast mode disabled, « Activer le mode rapide non coché. 2 sur 4 ». With fast mode enabled, JAWS announces **« Activer le mode standard coché. 2 sur 4 »**: the label describes a future action while « coché » may wrongly suggest that standard mode is already active. « Rétablir la sélection par défaut. 3 sur 4 » is also announced. The Work levels are in French; their native spelling is given below. The ambiguity of the fast-mode state is a product observation confirmed by user feedback, with no new local fix claimed.

This defect hinders checking the setting before a task: the button should immediately provide the current choice when navigating with the arrows. The user reports that the Windows application exposes the useful information in Work/Codex, but encounters a comparable problem in Chat. This comparison is usage feedback, not evidence of a common cause across surfaces.

### Evidence and adaptation

The identified native control carries `data-codex-intelligence-trigger` and the navigation target `reasoning`. The generic name obscures the information in its caption. The adaptation reads the native selection within a bounded scope and checks its consistency; it retains a model name only when the control exposes it. For Chat modes where only an effort preset is presented, it does not substitute an assumed internal model.

The [native user validation in Edge without the extension on October 8 at 01:55](evidence/2026-10-08-selector-user-validation-edge.json), Brussels time (UTC+02:00), confirms « Sélectionner le modèle ChatGPT » regardless of the model, including GPT-6 or GPT-5.6 Sol. The visible caption for GPT-6 is only « Élevée » in the inspected rendering; its name is not displayed there. Demonstrator 4.1.2 exposes « Raisonnement : Élevée » and retains a model only when it already appears in the visible caption. It does not add a hidden identity. The generic native name, which does not even announce the visible level, remains the reported defect. The [« c’est OK » feedback on 4.1.2](evidence/2026-10-08-confirmation-4.1.2.json) confirms the Raisonnement prefix and preservation of the visible information.

Module: [model-accessibility.js](../../extension/model-accessibility.js), functions `selectedModel`, `exposedLabel`, and `update`. The [summarized evidence](evidence/observations-and-user-validation.json) distinguishes the report, measurement, and user validation. The [reproducible tests](reproductions/RUNNING_TESTS.md) cover conflicting choices, language, preservation of settings, and late arrival of the control, among other cases.

### Additional item with GPT‑5.6 in Chat mode

On **October 8, 2026**, the user reports the following sequence, regardless of the chosen reasoning level:

~~~text
Sélectionner le modèle, 1 sur 3
Rétablir la sélection par défaut, 2 sur 3. Rétablir la sélection par défaut
Puissance, 3 sur 3. Arrow left Arrow right
~~~

Compared with the two-item Chat sequence described in the October 7 feedback, the GPT‑5.6 menu therefore has an additional command whose name is announced twice in this JAWS feedback. The [October 8 comparison](evidence/1A-gpt56-reset-to-default-2026-10-08.json) finds the three native items in Edge and the same control in Chrome with the adaptation: a DIV with the menuitem role, aria-label « Rétablir la sélection par défaut », and no text content. The additional item is a structural fact; its spoken repetition comes from user feedback.

**Demonstrator 4.1.2 does not address this duplicate announcement.** It is included in 1A for investigation by OpenAI teams alongside the other selector difficulties. The expected result is a single useful announcement of this command while preserving its reset function.

### Translation of levels, within the same subpoint

The public code examined on October 3 calculates `sliderLabel` from the selection and uses it before a translated fallback. An English value can therefore take precedence over the localized text. This localization lead remains tied to that dated observation. The [technical note](evidence/native-mechanisms.md) gives the modules, asset, offsets, and limits. The adaptation preserves the native French labels and other information.

The [native inspection of October 7](evidence/1A-native-labels-2026-10-07.json), performed in Chrome on a `fr-FR` page with the selector adaptation module inactive, exposes the Chat statuses « Instantané », « Moyenne », « Élevée », « Très élevé », and « Pro »; the captions agree except for the last, recorded as « 6Pro ». In Work, for GPT-6.1 Sol, the captions are **« Minimal », « Moyen », « Élevé », « Très élevé », « Max », « Ultra »**, while the accessible statuses are **« Minimal », « Moyenne », « Élevée », « Très élevé », « Maximum », « Ultra »**. The report uses this native spelling: the feminine forms written in the user's transcription do not demonstrate an audible difference, particularly for Minimal/Minimale or Élevé/Élevée.

The report notes the inconsistent forms between levels and the difference between the displayed caption and accessible status in Work. It also distinguishes the French DOM/AX inspection from the English announcements reported in Chat, without assuming their cause or that they correspond to the same rendering instant. The demonstrator preserves the native French status; its alignment is not a native site fix and does not erase these product observations. No grammatical defect is based solely on the phonetic transcription.

The French selector is among the points accepted in the overall user validation of October 4. This validates the described procedure without validating every combination of model, language, mode, account, or screen reader.

## 1B — The « Ajouter des fichiers et plus encore » menu closes without activating the intended option

**Problem.** Options are read outside the expected menu context; Space or Enter closes it without activating the function being navigated to.

**Expected result.** Enter a usable menu, activate the option being navigated to, and resume at the trigger when it closes.

**Reproduction.** [Procedure 1B](reproductions/PROCEDURES.md#1b--add-menu).

### Obstacle and reported announcements

The native user validation of October 7 confirms **« Ajouter des fichiers et plus encore, bouton réduit »**. On the first activation, focus moves to the prompt editing field; on subsequent openings, the cursor remains on the button. No opening announcement is reported in either case. After attempting to activate an option with Space or Enter, the first behavior recurs. Without pressing Escape to close it, reading the trigger again gives **« bouton étendu »**.

The entire page remains navigable with the arrows instead of limiting this navigation to the options. The popup content is read after the editor and **two « Fin de région principale »** announcements. The reported order is: text « Ajouter »; « Ajouter des photos et fichiers Importer depuis l’ordinateur », announced as **« bouton actuel »** without deliberate selection; « Ajouter les fichiers d’un espace Parcourez et recherchez vos fichiers »; « Travailler dans un projet Démarrez un chat dans un projet »; « Recherche approfondie Obtenir un rapport détaillé »; text « Plugins »; buttons « Créer une image Transformez vos idées en images », « Recherche sur le Web Trouvez des infos en temps réel », « Dessiner Dessiner et joindre une image », « GitHub Triage PRs, issues, CI, and publish flows », followed by other options and plain text **« Type to search plugins »**. The omission of a role in this transcription is not sufficient to conclude that it is absent.

Regardless of the option the user tries, Space or Enter closes the menu, **returns focus to the top of the page**, and does not activate the intended function. The expected role must correspond to a usable menu component; the absence of a role on the root is, separately, a historical DOM observation.

The impact concerns essential functions: attachments, library, search, and other options. Visually moving a popup does not guarantee that the screen reader is led to it or that the option being navigated to is the one activated.

### Native cause examined

Three facts were linked to the actual rendering of October 3:

- The popup root had no menu role, and focus remained in the ProseMirror editor.
- The native suggestion plugin closes through a `dismiss` transaction when the editor loses focus; its guard for keeping it open did not cover this transfer to the add buttons.
- A capturing keyboard listener on `window` chooses the action according to a highlighted index, which may differ from the button actually focused.

The note on [mechanisms and code location](evidence/native-mechanisms.md) links these paths to modules `tfV`, `UPl.k`, and `VCs.a`. A minimal probe allowed **Enter** to actually select Recherche approfondie in Chrome. This demonstrates that specific activation, not all file and plugin actions.

The native `aria-current=true` observed on Ajouter des photos et fichiers explains the information that the item is « actuel »; it is not a highlight state added by the extension. Its local removal is targeted and reversible.

### Demonstrator and user validation

[add-menu-accessibility.js](../../extension/add-menu-accessibility.js) preserves the buttons and their native `.click()`. It gives menu semantics to the identified popup, focuses the first available item, keeps it open during the relevant focus transition, and activates the item actually focused. Arrows, Home/End, Escape, and Tab are limited to this menu. IME composition, modifiers, and nested controls remain protected.

The usable menu is accepted in the overall user validation of October 4. Successful menu behavior after Escape was subsequently validated separately; Point 3 describes that feedback. No exhaustive test of all add commands is claimed.

## 1C — Up Arrow unintentionally inserts an old prompt into an empty field

**Problem.** Up Arrow in an empty composer can reinsert an old prompt without the writer's knowledge, in the contexts detailed below.

**Expected result.** Navigate without an unexpected change to the draft and access history deliberately.

**Reproduction.** [Procedure 1C](reproductions/PROCEDURES.md#1c--unintentional-prompt-recall).

### Obstacle and risk of error

When focus is in the empty composer, Up Arrow can recall an old prompt into it. The user relies on the arrows to navigate and leave fields; they may therefore begin a new draft using content they did not intend to reuse. If this insertion is not noticed, the sent message contains unwanted material.

The user feedback distinguishes two contexts: recall occurs in **previously used conversations**, and in a **new chat if this browser has already been used to send a prompt that creates a conversation**. In Opera, a browser that had never performed this send, the **new chat remains empty** after Up Arrow. This control case rules out generalizing to every new chat on an account with history. This distinction comes from the user's test; it does not attribute storage to a particular internal mechanism.

This problem affects accessibility and writing reliability. Blocking recall in the extension is a workaround; this does not reduce the obstacle to a mere aesthetic preference.

### Evidence, protection, and limit

Native recall was technically observed through the retrieval of an old text of **163 characters**, in the inspected context. The module [prompt-history-accessibility.js](../../extension/prompt-history-accessibility.js) intercepts only unmodified Up Arrow in a focused French editor that is genuinely empty, with no extended selection or active control/mention or menu. It does not change the text or block the browser's default behavior; it prevents this native recall path from being called.

The guard is installed from `document_start`, before the native recall handler. Protection from the beginning of loading was validated and retained in the overall user validation of October 4.

**Current limit: the extension provides no other access to prompt history.** This need remains open. Tests check fields containing spaces, rich content, menus, modifiers, IME, language, and startup without a root, among other cases. They do not by themselves prove physical JAWS navigation.

## Scope of this first report

The three subpoints relate to composing but do not necessarily have the same cause. The native user validations of October 7 confirm the obstacles for the described procedures. The code analysis, DOM, and Chrome, Opera, Edge, and JAWS 2025 feedback retain their respective provenance; they do not cover every future rendering. The [historical record](evidence/observations-and-user-validation.json) and [recent user validation](evidence/native-user-validation-2026-10-07.json) preserve this distinction.

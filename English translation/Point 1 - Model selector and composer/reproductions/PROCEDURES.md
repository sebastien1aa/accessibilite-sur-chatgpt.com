# Reproduction procedures — Point 1

These procedures concern the native site with the extension disabled. The [observed environment](../../ENVIRONMENT.md) and [evidence](../evidence/native-user-validation-2026-10-07.json) accompany the [report](../REPORT.md). To compare the demonstrator, repeat the same procedure after loading it and opening a new page.

## 1A — Selector and reasoning information

**Conditions:** French interface; Chat then Work modes; a model and level selected.

1. Navigate through the composer controls with the arrows using the virtual PC cursor and reach the closed selector.
2. Compare its accessible name with the displayed caption. Open it with Space or Enter.
3. In Chat, reach Puissance with the Up/Down arrows, then navigate through the levels with Left/Right. Compare the announcements, the language of the levels, and the captions.
4. In Work, compare the levels in the same way. Examine the label and checked state of the fast-mode command separately, before and after toggling it.
5. Separately select GPT‑5.6 in Chat mode: navigate through the three items. Compare the repetition « Rétablir la sélection par défaut, 2 sur 3. Rétablir la sélection par défaut » with a single command announcement. Repeat at another reasoning level.
6. Close with Escape and read the selector again.

**Additional GPT‑5.6 observation:** the reset command adds a second item, announced twice in the JAWS feedback of October 8; the supplied demonstrator does not address this duplication. The [evidence](../evidence/1A-gpt56-reset-to-default-2026-10-08.json) distinguishes the inspection from spoken feedback.

**Observation:** the closed name remains « Sélectionner le modèle ChatGPT » despite an informative caption. The JAWS feedback describes English levels in Chat and an ambiguity in « Activer le mode standard coché » when fast mode is active. Differences between French captions and statuses are detailed in the report.

**Expected result:** displayed choice identifiable from the closed button; localized, consistent levels; fast-mode state distinct from the proposed action.

## 1B — Add menu

**Conditions:** empty composer, French interface.

1. Reach « Ajouter des fichiers et plus encore » with the arrows and open it with Space.
2. Navigate through the options and compare the reading position with the editor: the options are encountered after it and two ends of the main region in the JAWS feedback.
3. Activate an option with Space or Enter and check whether the chosen function is actually selected.
4. Reopen the menu, compare the entry focus with that of the first opening, then close with Escape.

**Observation:** initial focus moves to the editor, while subsequent openings leave the reading position on the trigger; activating an option closes the menu without the intended action and returns the reading position to the top of the page.

**Expected result:** entry into a popup usable with the keyboard, activation of the option being navigated to, and return to the context when it closes.

## 1C — Unintentional prompt recall

**Conditions:** distinguish a previously used conversation from a new chat. For the latter, distinguish a browser that has already sent a prompt creating a conversation from a browser that has never been used to submit such a prompt.

1. Open a previously used conversation, empty the composer, then place focus in the editor.
2. Press Up Arrow without a modifier, in the mode where the key is passed to the editor.
3. Observe whether an old prompt fills the field.
4. Compare with a new chat in a browser already used to send a prompt creating a conversation.
5. Finally, compare with a new chat in a browser never used to submit such a prompt.

**Observation:** unintentional insertion affects previously used conversations and new chats after a prompt creating a conversation has been submitted from that browser. The Opera test confirms its absence in a new chat as long as that browser has never been used to submit such a prompt.

**Expected result:** navigation without unexpected changes to the draft and deliberate, accessible access to prompt history.

The [tests and fixtures](RUNNING_TESTS.md) isolate the demonstrator's mechanisms.

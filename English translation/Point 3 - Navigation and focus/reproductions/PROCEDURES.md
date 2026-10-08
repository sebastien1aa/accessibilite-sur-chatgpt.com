# Reproduction procedures — Point 3

These workflows concern the native site, with the extension disabled. The Virtual PC Cursor is used for arrow-key navigation; Forms Mode is distinguished when it changes the effect of Escape. The [environment](../../ENVIRONMENT.md) and [dated observations](../evidence/OBSERVATIONS_AND_USER_VALIDATION.md) accompany the [report](../REPORT.md). For a comparison with the demonstrator or of the first pass, load a fresh page.

## 3A — Project controls

1. On the home page with projects, navigate through a project row with the arrow keys and look for Actions, then Nouveau chat (New chat).
2. Compare access using Tab.
3. Open Actions with Space, navigate through the menu, then close it with Escape.

**Observation:** Actions and Nouveau chat are reached with Tab, but are absent from arrow-key navigation.

**Expected result:** access to both controls in the usual reading workflow, and menu activation from that workflow.

The first-focus blockage is reproduced separately in [4D](../../Point%204%20-%20Semantics%20and%20localization/reproductions/PROCEDURES.md#4d--first-pass-through-a-list).

## 3B — Reopening the sidebar

1. Close the sidebar using its control.
2. Look for the control to reopen it using the arrow keys, then Tab.
3. Check its activation and continuity of the navigation position. Compare with the native shortcut Ctrl+Shift+S.

**Observation:** the reopening control is reached by neither workflow in the JAWS feedback.

**Expected result:** the sidebar can be reopened using the keyboard, with the navigation position preserved when it is toggled.

## 3C — Afficher plus for a project's chats

**Conditions:** a project whose number of chats produces the “Afficher plus” (Show more) button.

1. Navigate through the end of the list and activate “Afficher plus” with Space.
2. After loading, use Down Arrow.
3. Compare the resumption position with the first newly loaded chat; inspect DOM focus separately during and after removal of the button.

**Observation:** reading resumes at the beginning of the project's chats, instead of continuing near the first new item.

**Expected result:** reading continues through the list at the new chats.

## 3D — Closing menus and panels

1. Reach a trigger: Profil (Profile), Actions for a chat or project, Filtrer (Filter), Options de la barre latérale (Sidebar options), or a settings menu.
2. Open with Space, then close with Escape. If the first press changes JAWS mode, distinguish that effect from closing the panel.
3. Use Down Arrow and compare the resumption position with the trigger.
4. Repeat separately for the other menu families.

**Observation:** reading resumes at the top of the page. In the feedback of October 7, Profil and chat Actions require two Escape presses; Filtrer and sidebar Options require one. DOM focus and the JAWS reading position can differ.

**Expected result:** consistent closure and resumption at the original button.

## 3E — “Explorer” (Explore)

1. After loading a fresh page, open “Explorer” with Space and navigate through the destinations.
2. Close with Escape and try Down Arrow.
3. Compare whether the panel is actually present, DOM focus, and reading resumption.
4. In another freshly loaded page, compare opening with Enter and then with an arrow key: focus on the container or on the first destination.

**Observation:** ordinary entry focuses the container, unlike opening with an arrow key; after closure, an arrow key can actually reopen the panel.

**Expected result:** entry and exit consistent with the screen-reader workflow, while preserving intentional opening with an arrow key. `aria-haspopup="dialog"` is valid; adapting this property illustrates compatibility, rather than correcting invalid ARIA.

## 3F — Cancelling sharing or editing

1. Open “Partager” (Share) below a response, close the panel with Escape, then use Down Arrow.
2. Repeat this workflow on “Partager le prompt” (Share the prompt) for a sent message.
3. Open “Modifier le message” (Edit the message), then cancel editing. In Forms Mode, distinguish the first Escape that returns to the Virtual PC Cursor from the press that actually closes editing.
4. Compare with closure when the Virtual PC Cursor is already active.

**Observation:** return to the top of the page after actual closure; the edit button is recreated after the form closes.

**Expected result:** resumption at the same message's button when the surface closes.

## 3G — Évaluer la réponse

1. Reach “Évaluer la réponse” (Rate the response) below a response and listen to its announced function.
2. Open with Space, then close the menu with Escape.
3. Use Down Arrow and compare the resumption position with the button.
4. Inspect `aria-haspopup`, `aria-expanded`, and the relationship to the menu on the button and its parent; compare the demonstrator.

**Observation:** “bouton” (button) is announced instead of a menu button; one Escape closes the menu, then reading resumes at the top of the page. The native menu properties are on the parent SPAN.

**Expected result:** the menu function is carried by the activatable control, with resumption at the same message.

The [tests and fixtures](RUNNING_TESTS.md) provide targeted comparisons.

# Reproduction procedures — Point 4

These workflows concern the native site, with the extension disabled, in a French interface with JAWS. The [report](../REPORT.md), [evidence](../evidence/OBSERVATIONS_AND_PROVENANCE.md), and [environment](../../ENVIRONMENT.md) specify the observed facts. Comparisons with the demonstrator and of the first pass use a freshly loaded page.

## 4A — Role descriptions

1. Navigate through Épinglés (Pinned), Projets (Projects), and Récents (Recents) with the arrow keys, then through ordinary chats and those in an expanded project.
2. From the position before a chat row, use Tab to focus it, return to the Virtual PC Cursor, then reread the row with the arrow keys.
3. Compare separately after opening and closing Actions du chat (Chat actions).
4. Inspect the roles, `aria-roledescription`, and movement instructions; compare the demonstrator.

**Observation:** “sortable” and “draggable” replace useful roles in announcements, on loading or after focus/Actions.

**Expected result:** recognizable links, buttons, and sections, with access to sorting and movement instructions preserved.

## 4B — Destination state

1. Navigate through the destinations Accueil (Home), Espace (Space), Planifié (Scheduled), and Plugins; compare “réduit” (collapsed) and “page courante” (current page) with their navigation action.
2. Similarly navigate through destinations pinned from “Explorer” (Explore) that are present in the rail, such as Sites or Images.
3. Activate a destination and compare the current state with the action performed.
4. Open Paramètres (Settings) from Profil (Profile); navigate through its categories and compare the current-page button, such as Général (General), with those in the rail.
5. Compare the demonstrator: actual “Explorer”/Profil menus and expandable sections retain their states.

**Observation:** navigation destinations are announced as collapsed. The current settings category button has `aria-current="page"` without `aria-expanded`.

**Expected result:** navigation and the current destination are clearly announced; collapsed/expanded state is associated with a control that actually shows or hides accessible content.

## 4C — Conversation groups

1. Navigate through an ordinary chat, a pinned chat, and a chat in an expanded project.
2. Compare the Début/Fin du groupe (Start/End of group) stops surrounding each link and its actions.
3. Compare the demonstrator: the link, Actions, and list must remain available.

**Observation:** two additional group lines per chat, repeated while searching through lists.

**Expected result:** direct navigation through chats and their actions without redundant group boundaries.

## 4D — First pass through a list

1. After loading a fresh page, navigate through Récents with the arrow keys, then use Tab to access a row.
2. Compare arrow-key availability, the mode sound, and resumption after Escape or a manual return to the Virtual PC Cursor.
3. In another freshly loaded page, activate project expansion with Space and compare the first pass with a repeated pass.
4. Compare the [A/B and C/D fixtures](RUNNING_TESTS.md), which isolate `tabindex=-1` on the parent list.

**Observation:** sound and blocked arrow keys on first access by Tab or expansion, then resumption after leaving Forms Mode. Parent focusability reproduces the phenomenon in both synthetic structures.

**Expected result:** arrow-key navigation is available from the first pass, without requiring a manual exit.

## 4E — Localization of project pinning

1. Open the project gallery and navigate through the pinning controls of a pinned project, then an unpinned project.
2. Compare “Pin project” / “Unpin project” with the interface language.
3. Compare these names with the French pinning actions in the project's sidebar menu, then with the demonstrator.

**Observation:** gallery names remain English, while the sidebar menu is translated.

**Expected result:** consistent “Épingler le projet” / “Désépingler le projet” (Pin the project / Unpin the project) wherever the action is offered. Access to sidebar controls is addressed separately in [3A](../../Point%203%20-%20Navigation%20and%20focus/reproductions/PROCEDURES.md#3a--project-controls).

The [tests and fixtures](RUNNING_TESTS.md) isolate the demonstrator's mechanisms.

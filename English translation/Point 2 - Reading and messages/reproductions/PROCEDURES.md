# Reproduction procedures — Point 2

These workflows concern the native site, with the extension disabled, using JAWS and its Virtual PC Cursor for reading with the arrow keys. The [report](../REPORT.md) distinguishes observations, code and adapted results; the [environment](../../ENVIRONMENT.md) defines the observed conditions. Comparison with the demonstrator takes place after loading a new page.

## 2A — Reading a long conversation

1. Open a long conversation.
2. Read the messages with the arrow keys from bottom to top, then back down.
3. Observe interruptions in reading, loss of position and messages that become unavailable.
4. When inspecting the rendering, compare the text of loaded turns with that of turns mounted outside the visible area.

**Finding:** position jumps in both directions; some available turns are not mounted by the virtualizer.

**Expected result:** continuous reading of loaded turns in both directions, including outside the visible area.

## 2B — Markers and reasoning order

**Conditions:** GPT‑6 with **High** reasoning, followed by a separate comparison with GPT‑5.6 at the same level; reasoning details expanded when offered.

1. Send a message that triggers reasoning and navigate through the start of the response during generation.
2. Check whether « ChatGPT a dit » identifies the speaker from the start of reasoning, then observe the headings for intermediate comments and the final response.
3. In the expanded details, navigate through the steps already completed and the current activity. Compare their order with that of the assistant marker. Continue as new intermediate comments appear.
4. Let generation finish. Read the reasoning button again, then use Down Arrow to look for a second line repeating exactly its activity or « Réfléchi pendant [durée] ».
5. In a response containing standalone analysis cards, collapse the main reasoning and navigate through the cards; compare their exposure with the collapsed state.

**Finding:** GPT‑5.6 exposes the speaker marker only after reasoning. GPT‑6 can produce several comments with headings, without guaranteeing this marker at the start. The current activity precedes the completed details in JAWS navigation; the activity or duration caption can be exposed twice. The standalone cards in the documented example remain independent of the main collapse state.

**Expected result:** an assistant marker from the start, completed details followed by the current activity in continuous reading, an explicit Show/Hide control during activity, and a final duration without duplication. Standalone cards should allow consistent navigation and collapsing while retaining their native controls.

## 2C — Selecting and copying several messages

1. Select a passage spanning several messages with Shift+Arrow keys or Shift+Page Up/Page Down.
2. Copy with Ctrl+C and paste into a text editor.
3. Compare the continuity of the selection and copied content. Examine speakers, durations and timestamps separately.
4. For the native mouse comparison, select two paragraphs of a response, then copy in the same way.

**Finding:** selection works as long as a reading jump does not interrupt it. Some displayed metadata is excluded from the copied text.

**Expected result:** stable accessible selection and copying of long passages. Inclusion of metadata remains a separate product request.

## 2D — Copy and Share

1. In a conversation, activate « Partager » and wait for confirmation that the public link has been created/copied.
2. Check the success announcement, the unavailable state while waiting, and the resumption of reading.
3. In a separate workflow, activate « Copier » below a response, then « Copier le message » below a sent message.
4. For each, check confirmation, its presence in navigation while waiting, and its return to the available state.

**Finding:** no JAWS confirmation received; return to the top of the page after Share and to Share after copying a response. Announcements and unavailable states differ between the two copy families.

**Expected result:** audible confirmation after success, preservation of the reading position, and an understandable unavailable state while the action is actually suspended.

## 2E — Writing Block handles

1. Request reusable text that produces a Writing Block that can be copied/edited, or open an existing example.
2. Wait for generation to finish, then navigate through the bottom of the page.
3. Compare the « ⋮⋮ » buttons encountered with their visibility and actual activity; also compare Tab navigation.
4. In the demonstrator, compare access to the field, Copy, and only those handles that have become active.

**Finding:** invisible, inactive handles remain exposed as buttons without an explicit name.

**Expected result:** navigation free of invisible inactive controls; active controls available and correctly named.

## 2F — « Dernière réponse » heading

1. Navigate through the headings of a conversation.
2. Compare « Dernière réponse » with the speaker markers and message headings.
3. Inspect the exact `h4.sr-only` outside the message; compare with the demonstrator.

**Finding:** an additional redundant stop in heading navigation.

**Expected result:** more direct navigation between useful markers, preserving content headings. This simplification is an organization request.

## 2G — References and source previews

**Conditions:** a GPT‑6 response containing citations with this rendering; a single-source reference, then a grouped reference if available.

1. Navigate through the reference with the arrow keys and compare with the screen reader's link navigation.
2. Activate with Space or Enter, check Web navigation, then return to the conversation.
3. Give the reference keyboard focus to open the preview; use Tab to enter its card.
4. Compare the name « Open [source] » with the source, title and visible information in the card. Also navigate through the panel appended to the end of the document.
5. Close with Escape and check the return to the reference.
6. With the demonstrator, compare the link role, panel name and card name derived from its content, as well as the reading of the decorative favicon.

**Finding:** the reference is announced as « Bouton de menu réduit dialogue » despite Web navigation; the card is reduced to the source name, with an extraneous favicon address.

**Expected result:** references identifiable as links; a named preview whose available information can be read without an abbreviated name or extraneous image address.

The [tests and fixtures](RUNNING_TESTS.md) supplement these workflows with isolated mechanisms.

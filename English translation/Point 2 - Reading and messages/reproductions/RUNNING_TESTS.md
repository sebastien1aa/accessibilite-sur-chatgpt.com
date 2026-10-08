# Existing checks for Point 2

These files select the tests and fixtures already used to verify the workarounds related to Point 2. The four modern retention cases check key retention, preservation of native parameters and callbacks, and scope guards. HTML fixture paths point to the shared extension.

## Node — from the repository root

The tests read `extension/...` relative to the current directory. **Go to the root containing `extension/` and `English translation/`**, then run:

```powershell
node --test "English translation/Point 2 - Reading and messages/reproductions/keep-turns.test.cjs" "English translation/Point 2 - Reading and messages/reproductions/keep-modern-turns.test.cjs" "English translation/Point 2 - Reading and messages/reproductions/reasoning-accessibility.test.cjs" "English translation/Point 2 - Reading and messages/reproductions/analysis-details-accessibility.test.cjs" "English translation/Point 2 - Reading and messages/reproductions/feedback-actions.test.cjs"
```

The tests use only the built-in modules `node:test`, `node:assert/strict`, `node:fs` and `node:vm`; no npm dependency installation is needed. Writing Blocks is checked using the browser fixture listed below.

## Fixtures — served from the same root

For browser checks, serve the root on localhost, then open the files under `English translation/Point 2 - Reading and messages/reproductions/`. An existing static server is suitable; none of these materials starts a server automatically. The `../../../extension/...` paths must remain served from this same root.

| File | What it checks |
| --- | --- |
| [browser.html](browser.html) | Synthetic legacy virtualizer, 80 messages, isolation of other observers. |
| [modern-browser.html](modern-browser.html) | Synthetic modern contract, 126 messages and the identity of their nodes. |
| [reasoning-regions.html](reasoning-regions.html) | GPT-6 prefix/suffix regional contracts, independent local phases, preservation of the GPT-5.6 contract, current state at the end, caption without duplication, and restoration. |
| [reasoning-selection.html](reasoning-selection.html) | Selection of displayed details, native closing, and preserved text/nodes; the long text is entirely synthetic. |
| [page-selection.html](page-selection.html) | Speakers, date/time, navigation, editors and collapsed text, without private content. |
| [feedback-actions.html](feedback-actions.html) | Announcements after simulated success, availability, focus, return to the native state, and guards. Does not create a public link or copy a real conversation. |
| [writing-block-accessibility.html](writing-block-accessibility.html) | Four synthetic inactive handles, preserved fields and callbacks. |

The content is fictional. Any `chatgpt.com/c/fixture` or `example.test` routes present in Node test doubles are synthetic values with no request to the site. Local imports do not execute any ChatGPT message.

## Coverage of the subpoints

| Subpoint | Checks and evidence |
| --- | --- |
| 2A — Reading a long conversation | `keep-turns` and `keep-modern-turns` tests, legacy/modern fixtures; [site measurement and user validation on October 7](../evidence/2A-virtualization-2026-10-07.json). |
| 2B — Reasoning | `reasoning-accessibility` tests for markers, states and names; 60 `reasoning-accessibility` tests; [regional fixture](reasoning-regions.html) and [15 Chromium checks](../evidence/2026-10-08-reasoning-regions.json); `analysis-details-accessibility` tests for standalone cards; [completed turn and regional trace with GPT‑6 High reasoning](../evidence/2B-completed-generations-gpt6-2026-10-08.json), historical GPT‑5.6 comparison in the [native timeline](../evidence/2B-reasoning-heading-gpt6-gpt56-2026-10-07.json). |
| 2C — Selection | `reasoning-selection` and `page-selection` fixtures; [native comparison on October 6](../evidence/native-selection-2026-10-06.json) and [native user validation on October 7](../evidence/native-user-validation-2026-10-07.json). |
| 2D — Copy and Share | `feedback-actions` tests and fixture; native traces [of sharing](../evidence/2026-10-05-native-sharing-and-copying.json) and [of copy availability](../evidence/2026-10-05-native-copy-availability.json), [dated adapted user validations](../evidence/observations-2026-10-03-05.json) and [recent native feedback](../evidence/native-user-validation-2026-10-07.json). |
| 2E — Writing Blocks | `writing-block-accessibility` fixture; [DOM signature and native callbacks](../evidence/native-mechanisms.md), [user validation of the adapted removal](../evidence/observations-2026-10-03-05.json) and [recent native confirmation](../evidence/native-user-validation-2026-10-07.json). |
| 2F — Dernière réponse | Structural check of the exact `h4.sr-only` outside the message and of `hideLastResponseHeading` in [ui-accessibility.js](../../../extension/ui-accessibility.js); [heading navigation procedure](PROCEDURES.md), [adapted user validation](../evidence/observations-2026-10-03-05.json) and [confirmed native presence](../evidence/native-user-validation-2026-10-07.json). |
| 2G — Sources and previews | [Source fixture](sources.html), 18 Node tests and nine stabilized Chromium states in 4.1.1; the previous thirteen scenarios remain historical results; [DOM/AX names and content](../evidence/2026-10-08-source-preview-content.json); [links and card names](../../../extension/source-links-accessibility.js), preserved callbacks/keyboard and preview. |

The [site procedures](PROCEDURES.md) cover all seven subpoints. For 2F, structural targeting and user-validated navigation are the relevant verification.

## Checking source references and cards — 2G

From the repository root containing `extension/` and `English translation/`, run:

```powershell
node --test "English translation/Point 2 - Reading and messages/reproductions/source-links-accessibility.test.cjs"
```

These eighteen Node tests require no external dependency. Serve this same root on localhost and open [sources.html](sources.html) for Chromium checks. The fixture explicitly loads `../../../extension/source-links-accessibility.js`; it does not install the extension. References, titles, texts and callbacks are synthetic.

The historical scenarios retained in the evidence for card content cover initial adaptation, names derived from content, native activation, a card emptied then refilled, stopping/resuming, a language other than French then returning to French, ID ambiguity then uniqueness, control replacement, and activation of a grouped reference with Space. The October 8 checks in 4.1.1 include [nine stabilized states and 153 invariants with no failures](../evidence/2026-10-08-favicon-checks.json), with a favicon lacking an alternative and subsequent restoration. The computed roles and names of the real example, with Tab, Enter and Escape preserved, appear in the [additional evidence](../evidence/2026-10-08-source-preview-content.json).

The tests preserve native elements and callbacks; they also check the exclusion of unrecognized buttons and panels. The transition from an explicit abbreviated name to a name derived from content is established in the Chromium tree. The card data remains as rendered; the results are neither a new JAWS transcript nor a guarantee covering every future preview.

## Value and limits

Node checks mechanisms on test doubles; fixtures check browser-specific behavior; the dated JSON files under `../evidence/` describe site observations. None of these results replaces physical JAWS user validation. Dated human feedback appears separately in the report.

Running these tests verifies only the synthetic mechanisms and invariants described. It is not a new human validation of the site's workflows.

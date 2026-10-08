# Methodology and limits of the evidence

Local times cited in this document are in Brussels time (Europe/Brussels, UTC+02:00 for dates in September and early October 2026). Technical timestamps retain their explicit time zone; the ISO suffix `Z` denotes UTC.

The original documentation is in French and is authoritative. The dossier describes chatgpt.com, studied on Windows with JAWS and an interface set to French. The [current versions and confirmations](ENVIRONMENT.md) accompany feedback received on 7 October. Each set introduces its evidence where it is used, so it can be read without consulting a development history.

In this English translation, French announcements, measured native labels and code strings retain their original wording. English glosses explain their meaning; they are not announcements heard with English JAWS. JSON evidence and executable reproduction files retain their original French content. Filenames and documentary paths are adapted to each language folder: documentary references in JSON evidence items are relative to the item's directory and point to the corresponding supplied file. These path differences do not change announcements, code excerpts, dates, measurements, results or evidence provenance; executable reproductions and the shared extension remain unchanged.

## Navigation terminology

The dossier uses **Virtual PC Cursor** for JAWS Web reading, corresponding to the [Virtual PC Cursor described by Freedom Scientific](https://support.freedomscientific.com/teachers/lessons/4.2.3_VirtualPCCursor.htm). “Curseur PC” or “PC virtuel” remain the user's wording where relevant. Its reading position is distinct from DOM focus, which may remain on a control during this navigation.

## French labels used in the reports

These glosses explain the controls referenced in French evidence; they are not a record of English speech or a replacement for measured native strings.

| French wording in the evidence | Meaning in the English explanations |
|---|---|
| Sélectionner le modèle ChatGPT | Select the ChatGPT model |
| Raisonnement | Reasoning |
| Puissance | The reasoning-effort control in the observed selector |
| Rétablir la sélection par défaut | Reset to the default selection |
| Ajouter des fichiers et plus encore | Add files and more |
| Recherche approfondie | Deep research |
| ChatGPT a dit / Vous avez dit | ChatGPT said / You said (speaker headings) |
| Réfléchi pendant [durée] | Thought for [duration] (after completion) |
| Afficher / Masquer les détails du raisonnement | Show / hide reasoning details |
| Copier / Partager / Modifier le message | Copy / Share / Edit message |
| Évaluer la réponse | Rate the response |
| Dernière réponse | Last response |
| Explorer | The observed exploration panel |
| Afficher plus | Show more |
| Épinglés / Projets / Récents / Accueil | Pinned / Projects / Recents / Home |
| réduit / étendu / page courante | collapsed / expanded / current page |
| coché / non coché | checked / not checked |

## Reading an evidence item

| Type of evidence | What it establishes | What it is not sufficient to establish |
|---|---|---|
| Exactly reported JAWS announcement | Wording actually heard and conveyed by the user in the stated context | Identical speech in every environment |
| Behavior described by the user | Interactions, obstacle, consequence and user validation; a paraphrase may be appropriate | The screen reader's internal mechanism |
| Actual DOM and events | Nodes, attributes, actions, selection and focus in the observed tab | Virtual PC Cursor position or JAWS speech |
| Accessibility tree | Computed role and name, state, exposure or exclusion by Chromium | Speech actually heard by the user |
| Loaded public code | The examined contract and rendering path, with context and conditions | Activation of all branches for all accounts |
| Synthetic fixture | Isolated mechanism, guards and controlled comparison | Full reproduction of ChatGPT or human validation |
| Physical user validation of a fixture | Reported effect of the compared conditions outside the site | A single cause of all symptoms on the site |
| User validation of the extension | Accepted result in the described flow and specified version | A fix to the native product or exhaustive validation of other flows |

Technical results and human feedback are linked but are not interchangeable. The user's transcriptions select the relevant information; omitting a role or state in an abbreviated quotation does not mean that JAWS does not announce it. A statement that “JAWS announces…” rests on corresponding actual feedback. Otherwise, the dossier specifies “name exposed in the accessibility tree” or describes the behavior more generally. Numerous analysis cards are described through their effect on reading; artificially transcribing dozens of announcements would not add evidence.

Each subpoint first presents the issue and expected result, followed by observations and reproduction interactions, the native mechanism and its attribution, and finally the illustration using the demonstration extension and the results obtained. A historical fix does not prove that it recognizes a new rendering. A feature available only under certain conditions must be tested under those conditions before comparing visual access and screen-reader access.

## Attribution

A native attribute, removal of nodes or a callback in public code can establish a site mechanism. A discrepancy between the JAWS reading position and correct DOM focus leaves the cause of the interoperability problem unresolved. Valid `aria-haspopup="dialog"` does not become invalid because a temporary adaptation improves Explorer. A focusable parent in a fixture may cause the observed symptom without demonstrating a universal ARIA violation.

An incorrect guard, a name applied at the wrong time or an unstable proxy introduced by the extension are local errors. They are not added to the ChatGPT issue report. Initial hypotheses that were rejected must not remain described as established causes.

Structural evidence warrants examination of the product before generic recommendations to clear the cache or reset a profile. It does not claim to experimentally rule out every configuration for every issue. Comparisons without the extension, their conditions and their limits are given in the relevant folders.

## Dates and versions

Initial observations from September and 3–6 October are supplemented by the user's reinvestigation on 7 October, from 19:18 to 22:40. Reconfirmed announcements and symptoms carry that new date; earlier measurements are not artificially redated. The general change observed on 25 September at 23:16 Brussels time comes from the user's account. Historical version numbers in user-validation records identify the software actually tested. The source files and executable tests supplied here are those of demonstration extension 4.1.2; no earlier archive is needed for the reproductions.

General user validation without reservations covers the points actually proposed for testing. Subsequent validation may resolve an earlier pending result without retroactively turning the old test into a success. Reproducibility reservations, qualified acceptances and negative tests remain visible when they affect interpretation.

A later reproduction must carry its own date and environment. A historical or unreproduced result and unresolved attribution retain their qualifications. A document's drafting date is not a reproduction date.

## Evidence items and demonstration extension

Copied evidence items retain their provenance and version. Derived files state that they synthesize evidence rather than presenting themselves as new raw captures. Conversation bodies, personal contact details, project names, profile paths, private identifiers, cookies and tokens are not included. Reproductions use synthetic content.

Extension 4.1.2 is a copy of the working demonstration extension, not a proposed patch ready for integration. It preserves native nodes and actions as far as the mechanism allows. Internal contracts can change. It is not a lasting solution to ChatGPT accessibility: that accessibility must be provided by the product.

The demonstration extension's complete functionality includes personal choices outside the report's scope. References in each subpoint identify the relevant module. Reasoning and Writing Blocks procedures use a text generation chosen by the tester; other structural observations can be examined directly in the code and evidence for the relevant Point.

## Check of the distributed evidence — 8 October 2026

The nine Node test files supplied in Points 1 and 2 pass **243 tests, zero failures**. Fixture pages isolate the stated mechanisms, with procedures and results documented in each Point. Local links and dependencies, JSON and script syntax have been checked. The extension's **25 files** match the supplied 4.1.2 archive and its source hashes exactly; the ZIP's SHA-256 hash accompanies it in `distribution/`.

The demonstration extension's consistency is verified through source and hash identity. Native observations rest on user feedback from 7 and 8 October and on DOM, accessibility and code measurements linked in each Point; earlier measurements retain their dates.

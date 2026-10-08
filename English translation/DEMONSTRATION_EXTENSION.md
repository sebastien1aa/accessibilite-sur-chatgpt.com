# Loading and examining demonstration extension 4.1.2

The [extension](../extension/manifest.json) folder contains the complete 4.1.2 demonstration extension. It is compatible with the Manifest V3 format used by Chrome and Edge. It targets only `https://chatgpt.com/*` and requires no bundled dependency, service worker or clipboard-read permission.

## Comparison in a browser

1. Start with the extension disabled, on a newly loaded page, under the conditions of the subpoint being examined.
2. On Chrome or Edge's native extensions page, enable developer mode if necessary, choose “Load unpacked”, then select this repository's `extension` folder.
3. Check the name **Accessibilité pour ChatGPT web** and version **4.1.2**. Avoid running two copies of the demonstration extension, or an experimental injection alongside the complete version.
4. Open a new ChatGPT page in French and repeat the specified flow. The preservation modules and several adaptations must be present from startup: loading the extension after the document has opened does not replace a newly loaded page.
5. Disable the demonstration extension and open a new page to return to the native rendering.

Version 4.1.2 preserves the adaptations validated by the user on the dates given in the reports. Upward and downward navigation in a long conversation was validated on 7 October; the evidence retains the version actually tested. The procedures allow the teams to compare the site with the demonstration extension while preserving the documented results for each flow.

Reproduction interactions are listed in each Point. Space activates buttons in the described flows. Tab sometimes reaches commands that arrow-key navigation exposes poorly; that success does not replace comparison using the Virtual PC Cursor.

## Reproductions and automated checks

Each Point retains its relevant files under `reproductions/`, together with execution instructions and their limitations. Node tests use modules from the shared extension; synthetic HTML pages evaluate only the mechanisms stated. A passing automated test is not JAWS user validation.

The supplied archive and file hashes are retained under `distribution/`. The source files remain available to examine the workaround without installing it.

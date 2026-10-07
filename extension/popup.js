"use strict";
const status = document.getElementById("status");
async function check() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.tabs.sendMessage(tab.id, { type: "navigation-continue-status" });
    if (result.coverageUnknown && result.turns) {
      status.textContent = `${result.turns} messages présents dans la conversation visible. Le nombre total chargé ne peut pas être confirmé dans cet affichage ; la continuité de lecture reste à vérifier.`;
    } else if (!result.containers) {
      status.textContent = result.turns
        ? `${result.turns} messages présents. Le mécanisme ciblé n’a pas été détecté ; son bon fonctionnement reste à vérifier.`
        : "Aucune conversation détectée. Ouvrez une conversation ChatGPT et attendez la fin du chargement.";
    } else if (result.rendered < result.containers) {
      status.textContent = `${result.rendered} messages présents sur ${result.containers} emplacements. Certains emplacements restent vides : rechargez ChatGPT après avoir conservé votre brouillon. Si cela persiste, le site peut avoir changé ou certains éléments peuvent être volontairement masqués.`;
    } else {
      status.textContent = `${result.rendered} messages présents sur ${result.containers} emplacements. Aucun emplacement vide détecté à cet instant. La continuité de lecture avec JAWS reste à vérifier.`;
    }
  } catch {
    status.textContent = "Diagnostic indisponible. Ouvrez ChatGPT et rechargez la page après avoir conservé votre brouillon. Vérifiez que l’extension est autorisée sur chatgpt.com.";
  }
}
document.getElementById("check").addEventListener("click", check);
check();

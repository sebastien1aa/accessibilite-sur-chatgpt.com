# Procédures de reproduction — Point 3

Les étapes suivantes permettent aux équipes de reproduire et de comparer les comportements décrits. Les observations et validations datées se trouvent dans les [preuves locales](../preuves/OBSERVATIONS_ET_RECEPTIONS.md).

## Conditions à noter

Relever date/heure, version Windows/navigateur/lecteur d’écran, langue, mode Chat/Work effectivement testé, extension absente ou version réellement chargée. Distinguer premier passage et répétition, activation Espace/Entrée et mode initial de JAWS. Pour chaque nouveau test de mode/curseur, partir d’un document fraîchement chargé, sans cumuler les variantes ni activer le contrôle avant la personne qui réalise l’essai.

Évaluer séparément présence du panneau, focus DOM, propriétés accessibles, parole et point de lecture. Des touches peuvent être absorbées par le lecteur d’écran : aucune entrée DOM ne signifie pas aucun appui physique. Ne pas attribuer aux défauts les mouvements de focus dus à une manipulation simultanée de l’onglet par une autre personne. Les parcours ci-dessous évitent créations de chats, modification des projets, envois de messages et publication de partages.

## Gestes sur chatgpt.com

### 3A — Projets et premier focus

1. Sur une page fraîche avec des projets existants, parcourir un projet avec les flèches ou les raccourcis habituels du curseur virtuel, sans rendre Tab obligatoire.
2. Vérifier si Actions puis Nouveau chat sont rencontrés ; ne pas activer Nouveau chat.
3. Ouvrir Actions avec Espace, rechercher Page d’accueil du projet sans l’activer, puis fermer avec Échap.
4. Comparer séparément l’accès avec Tab sur un autre parcours : Tab fonctionne nativement selon les retours historiques, y compris sans extension.
5. Pour isoler premier focus, repartir d’un document frais : Tab depuis Nouveau chat de Récents vers un lien de sa liste, puis Flèche bas. Noter bruit, blocage éventuel et cible DOM. Une lecture virtuelle seule et un premier Tab sont des conditions distinctes.

Attendu : commandes rencontrées et activables dans le parcours de lecture, sans blocage initial des flèches. Le nom statique puis le bouton de dépliage après les actions est une organisation locale demandée ; ne pas imposer cette disposition comme seule solution possible.

### 3B — Barre

1. Sans brouillon à perdre, atteindre la commande de barre et la fermer.
2. Vérifier si une commande de réouverture reste accessible et si le point de lecture est conservé.
3. Réouvrir par cette commande ; si elle est absente, noter l’absence et comparer séparément le raccourci natif Ctrl+Maj+S.

Attendu : cycle possible et continuité du point de navigation. La place stable après Profil est secondaire à ces conditions fonctionnelles.

### 3C — Afficher plus

1. Utiliser un projet existant dont la liste affiche réellement Afficher plus ; noter le nombre de lignes et la dernière commande précédant le bouton.
2. Activer Afficher plus avec Espace, sans navigation concurrente.
3. Pendant puis après le chargement, relever disparition/réapparition du bouton, focus DOM, première nouvelle ligne et reprise par Flèche bas.

Attendu : poursuite près des nouveaux éléments, sans saut au début. Si aucun projet n’offre ce bouton, marquer cas non disponible ; ne pas créer des chats pour le fabriquer.

### 3D — Menus et panneaux

1. Dans un document frais, atteindre un déclencheur précis : Profil, Actions projet, Actions chat récent/imbriqué, options, filtre ou un menu de paramètres.
2. Ouvrir avec Espace, parcourir sans choisir une option, fermer avec Échap.
3. Essayer Flèche bas et relever la reprise de lecture, la présence du panneau et le focus DOM.
4. Tester chaque famille séparément ; noter premier essai et répétitions. Comparer aussi sans extension lorsque l’examen le permet.

Attendu : retour au bouton d’origine et au point de lecture correspondant. Un bouton au focus DOM ne suffit pas à déclarer la réception virtuelle correcte. Explorer relève du cas suivant.

### 3E — Explorer

1. Sur un document frais, ouvrir Explorer avec Espace et parcourir les destinations sans les activer/épingler.
2. Appuyer sur un seul Échap ; vérifier immédiatement présence du panneau, état expanded, cible de focus et point de lecture.
3. Essayer Flèche bas ; relever si elle parcourt la page ou **rouvre réellement** Explorer.
4. Pour comparer Entrée ou ouverture native par flèche, utiliser un autre document frais. Noter si l’entrée cible le conteneur ou une destination.

Attendu : ouverture et fermeture cohérentes avec le mode du lecteur d’écran, sans supprimer la réouverture volontaire par flèche. La propriété dialog est valide : toute comparaison de son retrait doit être qualifiée d’adaptation de compatibilité, pas de correction d’un attribut illégal.

### 3F — Partager et annuler l’édition

1. Dans une conversation comportant des messages existants, atteindre Partager sous une réponse ; ouvrir avec Espace puis fermer avec Échap sans confirmer/copier/publier de lien. Essayer Flèche bas.
2. Réaliser séparément le même parcours sur Partager le prompt d’un message envoyé.
3. Ouvrir Modifier le message avec Espace, sans changer le texte ni envoyer. Relever le mode initial.
4. Si JAWS est en mode formulaire, distinguer le premier Échap qui revient au curseur virtuel de l’appui suivant qui ferme effectivement l’édition. Relever ensuite la reprise de lecture.
5. Dans un autre parcours déjà au curseur virtuel après sortie manuelle du champ, vérifier qu’un seul Échap ferme puis reprend au bouton du même message.

Attendu : retour au bouton du même message à la fermeture effective. Le remplacement du bouton par un formulaire puis sa recréation est à relever ; aucun retour à un autre message ne suffit. Un changement de mode sans fermeture ne doit pas être compté comme fermeture défectueuse.

### 3G — Réagir, à investiguer

1. Sur un document frais, atteindre Réagir sous une réponse existante puis ouvrir avec Espace.
2. Appuyer une fois sur Échap : noter panneau fermé ou présent, point de lecture et éventuel changement de mode.
3. Si la sortie n’est pas obtenue, appuyer une seconde fois et noter les mêmes éléments.
4. Comparer sans/avec extension en relevant les versions exactes, sans déduire la cause du cas Explorer ou édition.

Le dossier historique ne dit pas ce que fait le premier appui. Tout résultat nouveau doit compléter cette absence, sans inventer une reproduction antérieure.

Les [pages synthétiques et leur exécution](EXECUTION.md) permettent des comparaisons ciblées en dehors du compte.

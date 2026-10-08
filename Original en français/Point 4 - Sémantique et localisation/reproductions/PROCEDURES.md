# Procédures de reproduction — Point 4

Utiliser une interface française et relever date, système, navigateur, version/mode du lecteur d’écran et état de l’extension. Comparer dans des documents frais distincts. Les gestes ci-dessous permettent de reproduire ou de comparer les comportements du rapport ; les observations et validations datées y sont indiquées séparément.

Actualisation humaine native du 7 octobre 2026, plage 19 h 18–22 h 40, heure de Bruxelles (Europe/Brussels, UTC+02:00) : JAWS 2021 inchangé ; résultats identiques déclarés d’après l’expérience Edge/JAWS 2025 et un nouvel essai Opera. Voir les [repères d’environnement](../../ENVIRONNEMENT.md). Les transcriptions ne listent que les mots et états utiles réellement rapportés, sans imposer un rôle prononcé à chaque ligne.

## 4A — Descriptions de rôle

1. Sans extension, parcourir Épinglés, Projets et Récents aux flèches, puis les chats ordinaires et ceux d’un projet déjà déplié.
2. Se placer juste avant le premier chat de Récents aux flèches, faire Tab, revenir au curseur PC avec Échap ou la commande manuelle puis relire la ligne aux flèches. Comparer séparément l’activation d’Actions d’un chat.
3. Noter les annonces réellement entendues : le 7 octobre, sortable pour Épinglés/Projets/Récents, « sortable étendu » pour Projets, « sortable réduit menu » pour des actions imbriquées et remplacement lien/bouton par draggable après Tab. Le remplacement est également observé pour le chat dont Actions vient d’être activé. Inspecter rôle, nom, aria-roledescription et aria-describedby, sans transformer cette corrélation en causalité interne JAWS.
4. Comparer avec le démonstrateur : rôle reconnaissable et instructions de déplacement conservées.

Attendu : reconnaître sections, liens et boutons au chargement comme après Tab ou Actions, tout en gardant l’accès au tri et ses instructions.

## 4B — État des destinations

1. Parcourir Accueil, Espace, Planifié et Plugins sans extension ; relever rôle, nom, état réduit/étendu et « page courante » le cas échéant. Ne pas assimiler ces destinations aux sections Épinglés/Projets/Récents qui affichent ou masquent réellement leurs listes.
2. Dans un contexte sans brouillon à perdre, activer une destination et vérifier si son action est une navigation ou un dépliage, ainsi que son éventuel état de destination courante.
3. Comparer après adaptation. Un contrôle qui ouvre réellement un panneau doit conserver son état de dépliage.

Attendu : annonce cohérente avec la navigation et la destination courante ; état réduit/étendu réservé au contrôle qui affiche ou masque effectivement du contenu.

## 4C — Groupes des conversations

1. Parcourir séparément un chat ordinaire, un chat épinglé et un chat d’un projet déjà déplié, sans les activer.
2. Relever les arrêts de groupe en distinguant liste, ligne et wrapper de groupe : Début du groupe [Nom du chat], [Nom du chat], Actions du chat, Épingler le chat, Fin du groupe, puis le groupe suivant. L’utilisateur reconfirme ce parcours initial le 7 octobre.
3. Comparer après adaptation : le lien et son bouton Actions doivent rester disponibles, sans groupe redondant.

Attendu : parcourir les chats et leurs actions sans les deux arrêts Début/Fin du groupe répétés pour chaque ligne ; liste et commandes conservées.

## 4D — Premier passage dans une liste

1. Dans un document frais, comparer lecture aux flèches puis premier accès par Tab à une ligne de Récents.
2. Dans un autre document frais, atteindre puis activer avec Espace le dépliage d’un projet existant ; noter disponibilité des flèches et mode réellement constaté.
3. Distinguer premier passage, répétition dans le même document, sortie par Échap et retour manuel au curseur PC. Le 7 octobre, l’utilisateur identifie le passage en mode formulaire par le bruit et le blocage ; l’agent ne mesure pas sa cause interne.
4. Comparer les [fixtures A/B et C/D](EXECUTION.md) qui isolent tabindex=-1 sur la liste parente. Leur résultat ne suffit pas à attribuer exclusivement le symptôme du site à ce mécanisme.

Attendu : conserver la navigation aux flèches dès le premier passage, après Tab comme après dépliage, sans retour manuel imposé au curseur PC.

## 4E — Localisation des commandes de projet

1. Relever séparément les noms Pin project/Unpin project dans la galerie des projets. Pour la barre latérale, relever l’accès au menu Actions du projet par Tab et son indisponibilité aux flèches/raccourcis ; l’épinglage se trouve dans ce menu, dont la localisation était déjà française. Ne pas mêler ce défaut d’accès à la traduction manquante de galerie reconfirmée le 7 octobre.
2. Vérifier les deux états Épingler/Désépingler lorsqu’ils existent déjà ; ne pas modifier un épinglage uniquement pour obtenir un nom.
3. Comparer sans/avec adaptation, en conservant la distinction entre nom accessible et fonctionnement réel de l’action.

Attendu : noms français Épingler le projet et Désépingler le projet dans la galerie, cohérents avec le menu latéral. L’accès par flèches aux commandes latérales est traité séparément en [3A](../../Point%203%20-%20Navigation%20et%20focus/reproductions/PROCEDURES.md#3a--projets-et-premier-focus).

## 4F — Références et aperçus de sources

1. Ouvrir une réponse GPT-6 présentant ce rendu de citations ; repérer une référence simple et, si disponible, une référence regroupée avec un compteur. Aucun nouveau message n’est nécessaire si ces références existent déjà.
2. Sans extension, parcourir la référence aux flèches et relever son nom, rôle et états. Le retour JAWS fourni est « Bouton de menu réduit dialogue ». Comparer avec le parcours des liens du lecteur d’écran.
3. Activer par Espace ou Entrée : relever l’ouverture de la page Web, puis revenir au chat. Distinguer cette navigation du panneau d’aperçu également ouvert.
4. Donner simplement le focus clavier à la référence pour ouvrir l’aperçu sans navigation. Utiliser Tab pour entrer dans la carte. Comparer le nom « Open [source] » aux informations visibles dans la carte : source, titre et texte disponible. Le panneau se trouve à la fin du document dans le parcours aux flèches. Relever son rôle et son nom.
5. Appuyer sur Échap et vérifier la fermeture avec retour à la référence. Les essais techniques établissent ce comportement ; ne pas supposer qu’un seul Shift+Tab sort de tous les panneaux.
6. Avec le démonstrateur 4.1.2 dans un document frais, comparer le rôle lien, le nom du panneau et le nom de la carte issu de son contenu visible. Vérifier que la navigation, Tab et Échap conservent leur fonctionnement et que la favicon décorative n’ajoute pas son adresse ou une annonce graphique parasite. La carte doit restituer ce que fournit le site ; le texte intégral de l’article n’est pas un attendu lorsque le panneau ne le fournit pas.

Attendu : références accessibles comme liens, aperçu secondaire nommé et contenu disponible lisible sans réduction au seul « Open/Ouvrir [source] ». Le [rapport](../RAPPORT.md#4f--références-web-et-contenu-des-aperçus-de-sources) distingue le retour JAWS natif, le nom calculé dans Chromium et la réception de la restitution adaptée.

Les résultats historiques et la portée de chaque constat figurent dans le [rapport](../RAPPORT.md) et les [preuves](../preuves/CONSTATS_ET_PROVENANCE.md). Les [tests et fixtures](EXECUTION.md) fournissent les comparaisons synthétiques et leurs limites.

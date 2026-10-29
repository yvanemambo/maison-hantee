# 🎃 LA MAISON HANTÉE — Les 7 Secrets

Jeu d'énigmes d'Halloween pour le **Club de Vibe Coding du LPELIA**.
Le joueur est enfermé dans une maison hantée : il doit résoudre 7 énigmes en 180 secondes pour s'échapper.

Technologies : **HTML + CSS + JavaScript**, sans aucune bibliothèque. Le jeu marche sur ordinateur et sur téléphone.

---

## 1. Ce que contient le dossier

```
maison-hantee/
├── index.html   → la structure de la page (les écrans, les boutons)
├── style.css    → le design et toutes les animations
├── script.js    → la logique du jeu (énigmes, chrono, score…)
└── README.md    → ce guide
```

Les trois premiers fichiers doivent rester **dans le même dossier**, avec **exactement ces noms** (tout en minuscules).

---

## 2. Installer un éditeur de code (une seule fois)

1. Télécharge **Visual Studio Code** (gratuit) : https://code.visualstudio.com
2. Installe-le, puis ouvre-le.
3. Menu **Fichier → Ouvrir le dossier…** et choisis le dossier `maison-hantee`.

Tu vois maintenant les fichiers à gauche. Clique sur un fichier pour le lire ou le modifier.

> Pas d'ordinateur avec VS Code ? Le Bloc-notes de Windows suffit pour modifier les fichiers. Pense juste à enregistrer en « UTF-8 ».

---

## 3. Lancer le jeu

**Méthode simple :** double-clique sur `index.html`. Le jeu s'ouvre dans ton navigateur (Chrome, Edge, Firefox…).

**Méthode confortable (recommandée) :**
1. Dans VS Code, clique sur l'icône **Extensions** (les 4 carrés, à gauche).
2. Cherche **Live Server** et installe-le.
3. Fais un clic droit sur `index.html` → **Open with Live Server**.
4. Le jeu s'ouvre, et la page se recharge toute seule à chaque fois que tu enregistres une modification.

> Sans connexion Internet, le jeu fonctionne quand même : seules les polices gothiques sont remplacées par des polices de secours.

---

## 4. Tester le jeu (liste à cocher)

| # | Ce que tu fais | Ce qui doit se passer |
|---|---|---|
| 1 | Tu ouvres la page | L'écran d'accueil s'affiche : lune, maison, brouillard, fantômes, citrouilles |
| 2 | Tu cliques sur « Commencer l'aventure » | La salle I apparaît, la bougie-chrono part de 3:00 |
| 3 | Tu tapes une mauvaise réponse | La carte tremble, flash rouge, un fantôme surgit en criant, −10 points |
| 4 | Tu tapes `LA CITROUILLE` (majuscules) | Acceptée ! Tampon « Résolu », +100, le 1er sceau s'allume |
| 5 | Tu cliques sur « Demander un indice » | L'indice s'affiche, −25 points (2 indices maximum par salle) |
| 6 | Tu appuies sur la touche **Entrée** | La réponse est validée comme avec le bouton |
| 7 | Tu résous les 7 énigmes | Écran de victoire, pluie de bonbons, score final avec bonus de temps |
| 8 | Tu cliques sur « Rejouer » | Une nouvelle partie démarre à 3:00, score à 0 |
| 9 | Tu laisses le temps s'écouler | Sous 30 s le chrono devient rouge ; à 0, écran de défaite avec la réponse |
| 10 | Tu ouvres le jeu sur ton téléphone | Tout tient dans l'écran, sans défilement de côté |

**Astuce pour tester la défaite sans attendre 3 minutes :** dans `script.js`, mets `dureePartie: 15`, enregistre, recharge la page. **Pense à remettre `180` ensuite !**

**Tester l'affichage téléphone sur ordinateur :** dans Chrome, appuie sur **F12**, puis clique sur l'icône téléphone/tablette en haut à gauche du panneau. Choisis un modèle (ex. « iPhone 12 Pro »).

---

## 5. Les solutions (⚠️ pour les organisateurs seulement)

<details>
<summary>Afficher les solutions</summary>

| Salle | Énigme | Réponse |
|---|---|---|
| I | Le parchemin | citrouille |
| II | Les livres (1re lettre de chaque titre) | bouh |
| III | Le chaudron : 3 × 2 + 4 | 10 |
| IV | Les portraits | la comtesse |
| V | L'escalier : 1, 4, 9, 16 (carrés) | 25 |
| VI | Le miroir (ERIOMRA à l'envers) | armoire |
| VII | Le cadenas : 🎃 = 4, 👻 = 6, 🦇 = 5 | 564 |

</details>

---

## 6. Personnaliser le jeu

Tout se règle au début de `script.js`.

**Changer les règles** (partie `1. RÉGLAGES DU JEU`) :
```js
dureePartie: 180,        // durée en secondes
pointsBonneReponse: 100, // points par énigme
coutIndice: 25,          // coût d'un indice
penaliteErreur: 10,      // pénalité par erreur
bonusParSeconde: 3,      // bonus final par seconde restante
```

**Modifier une énigme** (partie `2. LES 7 ÉNIGMES`) : change le texte de `question`, ajoute des réponses acceptées dans `reponses`, réécris les `indices`. Pas besoin de mettre les accents ou les majuscules dans `reponses` : le jeu les ignore.

**Calcul du score :** +100 par énigme, −25 par indice, −10 par erreur (jamais sous 0), puis +3 points par seconde restante à la victoire. Le meilleur score est gardé dans le navigateur du joueur.

---

## 7. Publier le jeu gratuitement sur Internet

### Option A — Netlify Drop (le plus rapide, environ 2 minutes)

1. Crée d'abord un compte gratuit sur https://www.netlify.com (avec ton adresse e-mail ou ton compte GitHub).
   Sans compte, le site est protégé par mot de passe et finit par être supprimé.
2. Va sur https://app.netlify.com/drop
3. **Glisse-dépose le dossier `maison-hantee` entier** dans la zone prévue.
4. Quelques secondes plus tard, tu obtiens une adresse du type `https://nom-au-hasard.netlify.app`.
5. Dans les réglages du projet sur Netlify, cherche l'option pour **changer le nom** (« Change name ») et choisis par exemple `maison-hantee-lpelia` → `https://maison-hantee-lpelia.netlify.app`.
6. Pour publier une nouvelle version : ouvre ton projet dans Netlify et glisse-dépose à nouveau le dossier dans la zone de déploiement. L'adresse ne change pas.

### Option B — GitHub Pages (idéal pour un club qui apprend le code)

1. Crée un compte gratuit sur https://github.com
2. Clique sur **+** (en haut à droite) → **New repository**. Nom : `maison-hantee`. Coche **Public**. Clique sur **Create repository**.
3. Clique sur le lien **uploading an existing file**, glisse les fichiers `index.html`, `style.css`, `script.js` (et `README.md`), puis clique sur **Commit changes**.
4. Va dans **Settings** → **Pages** (menu de gauche).
5. Sous **Build and deployment → Source**, choisis **Deploy from a branch**. Choisis la branche **main** et le dossier **/ (root)**, puis **Save**.
6. Attends 1 à 2 minutes et recharge la page : l'adresse s'affiche, du type `https://ton-pseudo.github.io/maison-hantee/`.
7. Pour mettre à jour : *Add file → Upload files*, glisse les fichiers modifiés, *Commit changes*.

### Partager avec le club

- Envoie l'adresse sur le groupe WhatsApp du club.
- Astuce : génère un **QR code** de l'adresse (avec n'importe quel générateur de QR code gratuit) et affiche-le en salle : les membres flashent et jouent sur leur téléphone.
- Organisez un tournoi : chacun annonce son score final, le meilleur gagne le titre de « Légende d'Halloween ».

---

## 8. Dépannage

| Problème | Solution |
|---|---|
| Page blanche ou sans couleurs | Vérifie que les 3 fichiers sont dans le même dossier et s'appellent exactement `index.html`, `style.css`, `script.js` |
| Les boutons ne réagissent pas | Ouvre la console (F12 → onglet *Console*) et lis le message d'erreur en rouge |
| Pas de son | Clique sur le bouton haut-parleur ; sur iPhone, désactive le mode silencieux |
| La police est différente | Normal sans Internet : les polices gothiques viennent de Google Fonts |
| Netlify affiche une erreur 404 | Tu as glissé un dossier qui contient un autre dossier : glisse le dossier où se trouve directement `index.html` |

Bonne chasse aux fantômes ! 👻

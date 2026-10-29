/* ==========================================================================
   LA MAISON HANTÉE — Les 7 Secrets
   Logique du jeu (JavaScript pur, aucune bibliothèque)
   Club de Vibe Coding du LPELIA
   --------------------------------------------------------------------------
   Plan du fichier :
     1. Réglages du jeu        → change ici la durée, les points…
     2. Les 7 énigmes          → change ici les questions et les réponses
     3. État de la partie
     4. Vérification des réponses (majuscules et accents ignorés)
     5. Déroulement de la partie (démarrer, valider, indices, chrono…)
     6. Écrans de victoire et de défaite
     7. Effets visuels
     8. Sons (créés par le navigateur, aucun fichier audio)
     9. Démarrage
   ========================================================================== */

'use strict';

/* ==========================================================================
   1. RÉGLAGES DU JEU
   ========================================================================== */
const REGLAGES = {
  dureePartie: 180,        // durée totale en secondes
  pointsBonneReponse: 100, // points gagnés par énigme résolue
  coutIndice: 25,          // points perdus pour chaque indice
  penaliteErreur: 10,      // points perdus pour chaque mauvaise réponse
  bonusParSeconde: 3,      // bonus final : points par seconde restante
  seuilAlerte: 30,         // en dessous (secondes), le chrono passe en rouge
  delaiTransition: 1300    // pause (ms) après une bonne réponse
};

const ROMAINS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/* ==========================================================================
   2. LES 7 ÉNIGMES
   Chaque énigme contient :
     salle      : nom de la pièce
     histoire   : petit texte d'ambiance
     visuel     : le décor HTML de l'énigme
     question   : la question posée
     reponses   : toutes les réponses acceptées (accents et majuscules ignorés)
     solution   : la réponse affichée si le joueur perd
     indices    : deux indices, du plus léger au plus clair
     clavier    : "numeric" pour afficher le pavé numérique sur téléphone
   ========================================================================== */
const ENIGMES = [
  {
    salle: "Le Hall d'entrée",
    histoire: "La porte vient de claquer derrière toi. Sur une console poussiéreuse, une bougie éclaire un vieux parchemin.",
    visuel: `
      <div class="parchemin">
        <p>Je suis ronde et orange.<br>
        On me vide, on me sculpte un sourire,<br>
        puis on allume une bougie dans ma tête.</p>
        <p class="parchemin-chute">Qui suis-je ?</p>
      </div>`,
    question: "Quelle est la réponse de l'énigme du parchemin ?",
    reponses: ["citrouille", "potiron", "jack o lantern"],
    solution: "La citrouille",
    indices: [
      "On la voit partout à Halloween, posée devant les maisons.",
      "Elle pousse dans le potager et son nom commence par « CITR… »."
    ],
    placeholder: "Un seul mot…"
  },
  {
    salle: "La Bibliothèque",
    histoire: "Des milliers de livres prennent la poussière. Quatre d'entre eux dépassent de l'étagère, comme si un fantôme les avait tirés exprès.",
    visuel: `
      <div class="etagere">
        <div class="livre" style="--teinte:#6b1f3a; --h:170px"><span><span class="lettrine">B</span>ougies noires</span></div>
        <div class="livre" style="--teinte:#24405e; --h:140px"><span><span class="lettrine">O</span>ssements</span></div>
        <div class="livre" style="--teinte:#3d5a2a; --h:184px"><span><span class="lettrine">U</span>nivers des ombres</span></div>
        <div class="livre" style="--teinte:#5a3a7a; --h:164px"><span><span class="lettrine">H</span>iboux de minuit</span></div>
        <div class="livre livre-penche" style="--teinte:#4a2a14; --h:150px" aria-hidden="true"></div>
      </div>
      <p class="note-visuel">Un mot secret se cache sur la tranche de ces livres.</p>`,
    question: "Quel mot les quatre livres forment-ils ?",
    reponses: ["bouh"],
    solution: "BOUH",
    indices: [
      "Ne regarde que la première lettre de chaque titre.",
      "B… O… U… H… C'est le cri préféré des fantômes !"
    ],
    placeholder: "Un mot…"
  },
  {
    salle: "La Cuisine de la sorcière",
    histoire: "Un chaudron bouillonne sur le feu. La sorcière a griffonné sa recette sur le mur, juste au-dessus.",
    visuel: `
      <div class="cuisine">
        <div class="chaudron" aria-hidden="true">
          <span class="bulle" style="--x:34px; --t:10px; --delai:0s"></span>
          <span class="bulle" style="--x:62px; --t:7px;  --delai:.7s"></span>
          <span class="bulle" style="--x:84px; --t:12px; --delai:1.3s"></span>
          <span class="bulle" style="--x:50px; --t:6px;  --delai:1.8s"></span>
          <div class="chaudron-potion"></div>
          <div class="chaudron-corps"></div>
          <div class="chaudron-feu"><span></span><span></span><span></span></div>
        </div>
        <ol class="recette">
          <li>Verse <strong>3</strong> yeux de crapaud.</li>
          <li><strong>Double</strong> tout ce qu'il y a dans le chaudron.</li>
          <li>Ajoute <strong>4</strong> ailes de chauve-souris.</li>
        </ol>
      </div>`,
    question: "Combien d'ingrédients flottent maintenant dans le chaudron ?",
    reponses: ["10", "dix", "10 ingredients", "dix ingredients"],
    solution: "10",
    indices: [
      "Après l'étape 2, il y a 3 × 2 = 6 yeux de crapaud.",
      "Il reste à ajouter les 4 ailes : 6 + 4 = … ?"
    ],
    clavier: "numeric",
    placeholder: "Un nombre…"
  },
  {
    salle: "La Galerie des portraits",
    histoire: "Trois tableaux te fixent dans la pénombre. Un fantôme vit dans l'un d'eux, et il te souffle une phrase à l'oreille…",
    visuel: `
      <p class="murmure">« Je n'habite pas le tableau d'un animal… et les domestiques me font peur. »</p>
      <div class="portraits">
        <button type="button" class="portrait" data-choix="La Comtesse">
          <span class="cadre"><span class="silhouette" aria-hidden="true">👸</span></span>
          <span class="portrait-nom">La Comtesse</span>
        </button>
        <button type="button" class="portrait" data-choix="Le Chat noir">
          <span class="cadre"><span class="silhouette" aria-hidden="true">🐈</span></span>
          <span class="portrait-nom">Le Chat noir</span>
        </button>
        <button type="button" class="portrait" data-choix="Le Majordome">
          <span class="cadre"><span class="silhouette" aria-hidden="true">🤵</span></span>
          <span class="portrait-nom">Le Majordome</span>
        </button>
      </div>`,
    question: "Dans quel portrait se cache le fantôme ? Touche un tableau ou écris son nom.",
    reponses: ["comtesse", "portrait de la comtesse", "tableau de la comtesse", "gauche", "portrait de gauche", "tableau de gauche", "celui de gauche"],
    solution: "La Comtesse",
    indices: [
      "Un majordome est un domestique : il sert les maîtres de la maison.",
      "Le fantôme n'est ni dans le chat, ni dans le majordome. Qui reste-t-il ?"
    ],
    placeholder: "Le nom du portrait…"
  },
  {
    salle: "L'Escalier qui grince",
    histoire: "Chaque marche grince sous tes pas. Des nombres lumineux y sont gravés… mais la dernière marche a été effacée.",
    visuel: `
      <div class="escalier">
        <div class="marche" style="--n:1"><span>1</span></div>
        <div class="marche" style="--n:2"><span>4</span></div>
        <div class="marche" style="--n:3"><span>9</span></div>
        <div class="marche" style="--n:4"><span>16</span></div>
        <div class="marche marche-mystere" style="--n:5"><span data-solution="25">?</span></div>
      </div>`,
    question: "Quel nombre faut-il graver sur la dernière marche ?",
    reponses: ["25", "vingt cinq"],
    solution: "25",
    indices: [
      "Observe : 1 × 1 = 1, 2 × 2 = 4, 3 × 3 = 9…",
      "La cinquième marche, c'est donc 5 × 5."
    ],
    clavier: "numeric",
    placeholder: "Un nombre…"
  },
  {
    salle: "Le Grenier",
    histoire: "Sous les toits, un grand miroir est couvert de poussière. Quelqu'un y a tracé un mot du bout du doigt… mais tout est à l'envers.",
    visuel: `
      <div class="miroir">
        <span class="ecriture-miroir" aria-hidden="true">ARMOIRE</span>
        <span class="sr-only">Sur le miroir, les lettres sont inversées et se lisent : E, R, I, O, M, R, A.</span>
      </div>
      <p class="note-visuel">La clé de la sortie est cachée là où le miroir l'indique.</p>`,
    question: "Où la clé de la sortie est-elle cachée ?",
    reponses: ["armoire"],
    solution: "Dans l'armoire",
    indices: [
      "C'est écrit comme dans un miroir : lis les lettres de droite à gauche.",
      "C'est un grand meuble où l'on range ses vêtements."
    ],
    placeholder: "Un endroit…"
  },
  {
    salle: "La Porte de sortie",
    histoire: "La grande porte est enfin devant toi ! Un cadenas à trois chiffres la bloque. Sur la pierre, trois équations sont gravées.",
    visuel: `
      <div class="tablette" role="img" aria-label="Citrouille plus citrouille plus citrouille égale 12. Citrouille plus fantôme égale 10. Fantôme moins chauve-souris égale 1.">
        <p class="equation"><span>🎃</span>+<span>🎃</span>+<span>🎃</span>=<b>12</b></p>
        <p class="equation"><span>🎃</span>+<span>👻</span>=<b>10</b></p>
        <p class="equation"><span>👻</span>−<span>🦇</span>=<b>1</b></p>
      </div>
      <div class="cadenas">
        <div class="cadenas-icone" aria-hidden="true"><span class="cadenas-anse"></span><span class="cadenas-corps"></span></div>
        <div class="molettes" role="group" aria-label="Ordre du code : chauve-souris, fantôme, citrouille">
          <div class="molette"><span class="molette-symbole" aria-hidden="true">🦇</span><span class="molette-chiffre" data-solution="5">?</span></div>
          <div class="molette"><span class="molette-symbole" aria-hidden="true">👻</span><span class="molette-chiffre" data-solution="6">?</span></div>
          <div class="molette"><span class="molette-symbole" aria-hidden="true">🎃</span><span class="molette-chiffre" data-solution="4">?</span></div>
        </div>
      </div>`,
    question: "Quel est le code à trois chiffres du cadenas ?",
    reponses: ["564"],
    solution: "564",
    indices: [
      "Commence par la citrouille : 3 citrouilles font 12, donc 🎃 = 4.",
      "🎃 = 4, donc 👻 = 6 et 🦇 = 5. Range-les dans l'ordre du cadenas : 🦇 👻 🎃."
    ],
    clavier: "numeric",
    placeholder: "3 chiffres…",
    cadenas: true
  }
];

const MESSAGES_BRAVO = [
  "Bien joué ! Un secret de moins.",
  "Exact ! Une porte grince et s'ouvre.",
  "Bravo ! Les fantômes sont impressionnés.",
  "Correct ! Tu avances dans la maison."
];
const MESSAGES_ERREUR = [
  "Hihihi… Ce n'est pas ça !",
  "Raté ! Les murs ricanent.",
  "Non… Quelque chose bouge dans l'ombre.",
  "Mauvaise réponse ! Réessaie vite."
];
const CRIS_FANTOME = ["Hihihi !", "Raté !", "Bouh !", "Perdu !"];

/* ==========================================================================
   3. ÉTAT DE LA PARTIE
   Toutes les informations qui changent pendant le jeu sont rangées ici.
   ========================================================================== */
const etat = {
  index: 0,             // numéro de l'énigme en cours (0 à 6)
  score: 0,
  resolues: 0,          // nombre d'énigmes résolues
  indicesUtilises: 0,   // total sur la partie
  erreurs: 0,           // total sur la partie
  indicesSalle: 0,      // indices utilisés dans la salle actuelle
  erreursSalle: 0,
  tempsRestant: REGLAGES.dureePartie,
  finPrevue: 0,         // heure (en ms) à laquelle le temps sera écoulé
  minuteur: null,
  enCours: false,       // une partie est-elle en train de se jouer ?
  verrou: false         // bloque les clics pendant les animations
};

/* Raccourci pour récupérer un élément de la page par son id */
const $ = (id) => document.getElementById(id);

const el = {
  app: $('app'),
  ecrans: {
    accueil: $('ecran-accueil'),
    jeu: $('ecran-jeu'),
    victoire: $('ecran-victoire'),
    defaite: $('ecran-defaite')
  },
  hudChrono: $('hud-chrono'),
  chrono: $('chrono'),
  bougie: document.querySelector('.hud .bougie'),
  hudSalle: $('hud-salle'),
  score: $('score'),
  progression: $('progression'),
  remplissage: $('progression-remplissage'),
  sceaux: $('sceaux'),
  carte: $('carte'),
  salleNumero: $('salle-numero'),
  salleTitre: $('salle-titre'),
  salleHistoire: $('salle-histoire'),
  visuel: $('salle-visuel'),
  question: $('salle-question'),
  formulaire: $('formulaire'),
  champ: $('reponse'),
  btnValider: $('btn-valider'),
  btnIndice: $('btn-indice'),
  indicesRestants: $('indices-restants'),
  listeIndices: $('indices'),
  retour: $('retour'),
  flash: $('flash'),
  particules: $('particules'),
  moqueur: $('fantome-moqueur'),
  bulleMoqueur: $('bulle-moqueur'),
  annonce: $('annonce')
};

/* ==========================================================================
   4. VÉRIFICATION DES RÉPONSES
   ========================================================================== */

/* Mots que l'on peut retirer au début d'une réponse :
   « la citrouille », « dans l'armoire », « c'est 25 »… */
const MOTS_A_IGNORER = ['c', 'est', 'cest', 'le', 'la', 'les', 'l', 'un', 'une', 'des', 'du', 'de', 'd', 'dans', 'au', 'a'];

/**
 * Transforme un texte pour pouvoir le comparer facilement :
 *   "  Dans L'ARMOIRE ! " → "armoire"
 *   "Vingt-Cinq"          → "vingtcinq"
 */
function normaliser(texte) {
  let propre = String(texte)
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // é → e, à → a, ç → c…
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .replace(/[^a-z0-9]+/g, ' ')                        // ponctuation, tirets, apostrophes → espace
    .trim();

  // On retire les petits mots du début (« la », « dans », « c'est »…)
  let mots = propre.split(' ').filter(Boolean);
  while (mots.length > 1 && MOTS_A_IGNORER.includes(mots[0])) {
    mots.shift();
  }
  // On colle tout : « 5 6 4 » devient « 564 », « vingt cinq » devient « vingtcinq »
  return mots.join('');
}

/** Renvoie true si la saisie correspond à une des réponses acceptées. */
function estBonneReponse(saisie, enigme) {
  const proposition = normaliser(saisie);
  if (proposition === '') return false;
  return enigme.reponses.some((reponse) => normaliser(reponse) === proposition);
}

/* ==========================================================================
   5. DÉROULEMENT DE LA PARTIE
   ========================================================================== */

/** Affiche un seul écran et cache les autres. */
function afficherEcran(nom) {
  Object.entries(el.ecrans).forEach(([cle, ecran]) => {
    ecran.hidden = cle !== nom;
  });
  el.app.classList.toggle('en-jeu', nom !== 'accueil');
  window.scrollTo(0, 0);
}

/** Lance (ou relance) une partie complète. */
function demarrerPartie() {
  arreterChrono();
  Object.assign(etat, {
    index: 0,
    score: 0,
    resolues: 0,
    indicesUtilises: 0,
    erreurs: 0,
    tempsRestant: REGLAGES.dureePartie,
    finPrevue: Date.now() + REGLAGES.dureePartie * 1000,
    enCours: true,
    verrou: false
  });

  el.app.classList.remove('urgence');
  el.hudChrono.classList.remove('alerte');
  el.score.textContent = '0';
  construireSceaux();
  afficherEcran('jeu');
  afficherEnigme(true);
  majChrono();

  etat.minuteur = setInterval(tic, 200);
  Son.demarrer();
  Son.ambiance(true);
  Son.jouer('debut');
}

/** Crée les 7 sceaux de la barre de progression. */
function construireSceaux() {
  el.sceaux.innerHTML = ROMAINS.map((r) => `<li class="sceau"><span>${r}</span></li>`).join('');
  majProgression();
}

/** Met à jour la barre de progression et les sceaux. */
function majProgression() {
  const total = ENIGMES.length;
  [...el.sceaux.children].forEach((sceau, i) => {
    sceau.classList.toggle('resolu', i < etat.resolues);
    sceau.classList.toggle('actuel', i === etat.index && i >= etat.resolues && etat.enCours);
  });
  el.remplissage.style.width = Math.min(100, (etat.resolues / (total - 1)) * 100) + '%';
  el.progression.setAttribute('aria-valuenow', etat.resolues);
  el.progression.setAttribute('aria-valuetext', `${etat.resolues} secret${etat.resolues > 1 ? 's' : ''} sur ${total}`);
}

/** Affiche l'énigme numéro etat.index dans la carte. */
function afficherEnigme(premiere = false) {
  const enigme = ENIGMES[etat.index];
  const avaitLeFocus = document.activeElement === el.champ;

  etat.indicesSalle = 0;
  etat.erreursSalle = 0;

  el.salleNumero.textContent = `Salle ${ROMAINS[etat.index]} sur VII`;
  el.salleTitre.textContent = enigme.salle;
  el.salleHistoire.textContent = enigme.histoire;
  el.visuel.innerHTML = enigme.visuel;
  el.visuel.dataset.indices = '0';
  el.visuel.classList.remove('resolu');
  el.question.textContent = enigme.question;
  el.hudSalle.textContent = `${ROMAINS[etat.index]} / VII`;

  el.champ.value = '';
  el.champ.setAttribute('inputmode', enigme.clavier || 'text');
  el.champ.placeholder = enigme.placeholder || 'Écris ta réponse…';

  el.listeIndices.innerHTML = '';
  majBoutonIndice();
  afficherRetour('', '');
  el.carte.classList.remove('bonne', 'mauvaise', 'sortie');
  if (!premiere) rejouerAnimation(el.carte, 'entree');
  majProgression();

  // Sur ordinateur, on place le curseur dans le champ. Sur téléphone, on évite
  // d'ouvrir le clavier tout seul (sauf s'il était déjà ouvert).
  const ordinateur = window.matchMedia('(pointer: fine)').matches;
  if (avaitLeFocus || ordinateur) {
    el.champ.focus({ preventScroll: true });
  } else if (!premiere) {
    el.salleTitre.focus({ preventScroll: true });
  }
  if (el.carte.getBoundingClientRect().top < 0) {
    el.carte.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}

/** Le joueur valide sa réponse (bouton « Valider » ou touche Entrée). */
function validerReponse(evenement) {
  evenement.preventDefault();
  if (!etat.enCours || etat.verrou) return;

  const saisie = el.champ.value;
  if (normaliser(saisie) === '') {
    afficherRetour('Écris une réponse avant de valider.', 'info');
    rejouerAnimation(el.carte, 'mauvaise');
    el.champ.focus();
    return;
  }

  if (estBonneReponse(saisie, ENIGMES[etat.index])) {
    bonneReponse();
  } else {
    mauvaiseReponse();
  }
}

function bonneReponse() {
  etat.verrou = true;
  etat.resolues++;
  const derniere = etat.resolues === ENIGMES.length;
  if (derniere) arreterChrono(); // le temps s'arrête dès la dernière bonne réponse

  ajouterPoints(REGLAGES.pointsBonneReponse, el.btnValider);
  afficherRetour(auHasard(MESSAGES_BRAVO), 'ok');
  el.carte.classList.remove('mauvaise');
  el.carte.classList.add('bonne');
  revelerSolution();
  majProgression();
  eclatParticules(el.btnValider, 30, ['#6dffb0', '#ffc061', '#ff7b1c', '#eee8f8']);
  Son.jouer('bonne');

  setTimeout(() => {
    if (!etat.enCours) return;
    if (derniere) {
      victoire();
      return;
    }
    el.carte.classList.remove('entree');
    el.carte.classList.add('sortie');
    setTimeout(() => {
      if (!etat.enCours) return;
      etat.index++;
      afficherEnigme();
      etat.verrou = false;
    }, 420);
  }, REGLAGES.delaiTransition);
}

function mauvaiseReponse() {
  etat.erreurs++;
  etat.erreursSalle++;
  ajouterPoints(-REGLAGES.penaliteErreur, el.champ);

  let message = auHasard(MESSAGES_ERREUR);
  const enigme = ENIGMES[etat.index];
  if (etat.erreursSalle >= 2 && etat.indicesSalle < enigme.indices.length) {
    message += ' Un indice peut t\'aider.';
  }
  afficherRetour(message, 'ko');

  rejouerAnimation(el.carte, 'mauvaise');
  rejouerAnimation(el.flash, 'actif');
  faireSurgirFantome();
  vibrer(120);
  Son.jouer('mauvaise');
  el.champ.select();
}

/** Révèle la bonne réponse dans le décor de l'énigme (escalier, cadenas, portrait…). */
function revelerSolution() {
  const enigme = ENIGMES[etat.index];
  el.visuel.classList.add('resolu');
  el.visuel.querySelectorAll('[data-solution]').forEach((zone) => {
    zone.textContent = zone.dataset.solution;
  });
  el.visuel.querySelectorAll('[data-choix]').forEach((bouton) => {
    bouton.classList.toggle('bon-choix', estBonneReponse(bouton.dataset.choix, enigme));
  });
}

/** Le joueur demande un indice. */
function demanderIndice() {
  if (!etat.enCours || etat.verrou) return;
  const enigme = ENIGMES[etat.index];
  if (etat.indicesSalle >= enigme.indices.length) return;

  const texte = enigme.indices[etat.indicesSalle];
  etat.indicesSalle++;
  etat.indicesUtilises++;

  const li = document.createElement('li');
  li.innerHTML = `<span class="indice-label">Indice ${etat.indicesSalle}</span>${texte}`;
  el.listeIndices.appendChild(li);
  el.visuel.dataset.indices = String(etat.indicesSalle);

  ajouterPoints(-REGLAGES.coutIndice, el.btnIndice);
  majBoutonIndice();
  Son.jouer('indice');
}

function majBoutonIndice() {
  const restants = ENIGMES[etat.index].indices.length - etat.indicesSalle;
  el.btnIndice.disabled = restants <= 0;
  el.indicesRestants.textContent =
    restants === 0 ? 'Plus d\'indice dans cette salle'
    : restants === 1 ? `1 restant · −${REGLAGES.coutIndice} pts`
    : `${restants} restants · −${REGLAGES.coutIndice} pts chacun`;
}

/** Ajoute (ou retire) des points, sans jamais descendre sous 0. */
function ajouterPoints(points, origine) {
  const avant = etat.score;
  etat.score = Math.max(0, etat.score + points);
  const difference = etat.score - avant;
  el.score.textContent = etat.score;
  rejouerAnimation(el.score, 'bump');
  if (difference !== 0) afficherPointsFlottants(difference, origine);
}

function afficherRetour(texte, type) {
  el.retour.textContent = texte;
  el.retour.className = 'retour' + (type ? ' ' + type : '');
}

/* --- Chronomètre --- */
function tic() {
  const restant = Math.max(0, Math.ceil((etat.finPrevue - Date.now()) / 1000));
  if (restant !== etat.tempsRestant) {
    etat.tempsRestant = restant;
    majChrono();
    if (restant > 0 && restant <= 10) Son.jouer('tic');
    if ([120, 60, 30, 10].includes(restant)) {
      el.annonce.textContent = `Attention, il reste ${restant} secondes.`;
    }
  }
  if (restant <= 0) defaite();
}

function majChrono() {
  const t = etat.tempsRestant;
  const minutes = Math.floor(t / 60);
  const secondes = String(t % 60).padStart(2, '0');
  el.chrono.textContent = `${minutes}:${secondes}`;
  el.bougie.style.setProperty('--reste', (t / REGLAGES.dureePartie).toFixed(3));
  const alerte = t <= REGLAGES.seuilAlerte;
  el.hudChrono.classList.toggle('alerte', alerte);
  el.app.classList.toggle('urgence', alerte && etat.enCours);
}

function arreterChrono() {
  clearInterval(etat.minuteur);
  etat.minuteur = null;
}

/* ==========================================================================
   6. ÉCRANS DE VICTOIRE ET DE DÉFAITE
   ========================================================================== */
function victoire() {
  etat.enCours = false;
  etat.verrou = false;
  arreterChrono();
  el.app.classList.remove('urgence');

  const bonus = etat.tempsRestant * REGLAGES.bonusParSeconde;
  etat.score += bonus;
  const nouveauRecord = enregistrerRecord(etat.score);

  $('v-score').textContent = etat.score;
  $('v-rang').textContent = rangDuJoueur(etat.score);
  $('v-enigmes').textContent = `${etat.resolues} / ${ENIGMES.length}`;
  $('v-temps').textContent = `${etat.tempsRestant} s`;
  $('v-bonus').textContent = `+${bonus}`;
  $('v-indices').textContent = etat.indicesUtilises;
  $('v-erreurs').textContent = etat.erreurs;
  $('v-record').textContent = lireRecord();
  $('v-nouveau').hidden = !nouveauRecord;

  afficherEcran('victoire');
  $('titre-victoire').focus({ preventScroll: true });
  pluieDeConfettis();
  Son.ambiance(false);
  Son.jouer('victoire');
}

function defaite() {
  if (!etat.enCours) return;
  etat.enCours = false;
  etat.verrou = false;
  arreterChrono();
  el.app.classList.remove('urgence');
  enregistrerRecord(etat.score);

  const enigme = ENIGMES[etat.index];
  $('d-salle').textContent = `salle ${ROMAINS[etat.index]}, ${enigme.salle.toLowerCase()}`;
  $('d-solution').textContent = enigme.solution;
  $('d-score').textContent = etat.score;
  $('d-enigmes').textContent = `${etat.resolues} / ${ENIGMES.length}`;
  $('d-indices').textContent = etat.indicesUtilises;
  $('d-erreurs').textContent = etat.erreurs;

  afficherEcran('defaite');
  $('titre-defaite').focus({ preventScroll: true });
  Son.ambiance(false);
  Son.jouer('defaite');
}

function rangDuJoueur(score) {
  if (score >= 850) return 'Rang : Légende d\'Halloween';
  if (score >= 700) return 'Rang : Chasseur de fantômes';
  if (score >= 500) return 'Rang : Explorateur courageux';
  return 'Rang : Survivant tremblant';
}

function retourAccueil() {
  arreterChrono();
  etat.enCours = false;
  Son.ambiance(false);
  afficherRecordAccueil();
  afficherEcran('accueil');
}

/* --- Record (gardé dans le navigateur du joueur) --- */
const CLE_RECORD = 'maison-hantee-record';

function lireRecord() {
  try {
    return parseInt(localStorage.getItem(CLE_RECORD), 10) || 0;
  } catch (erreur) {
    return 0; // navigation privée ou stockage bloqué : pas grave
  }
}

/** Enregistre le score s'il bat le record. Renvoie true si c'est un nouveau record. */
function enregistrerRecord(score) {
  if (score <= lireRecord()) return false;
  try {
    localStorage.setItem(CLE_RECORD, String(score));
  } catch (erreur) { /* stockage indisponible */ }
  return true;
}

function afficherRecordAccueil() {
  const record = lireRecord();
  $('record-accueil').hidden = record === 0;
  $('record-accueil-valeur').textContent = record;
}

/* ==========================================================================
   7. EFFETS VISUELS
   ========================================================================== */
const mouvementsReduits = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Relance une animation CSS même si la classe est déjà présente. */
function rejouerAnimation(element, classe) {
  element.classList.remove(classe);
  void element.offsetWidth; // force le navigateur à « oublier » l'animation précédente
  element.classList.add(classe);
}

function auHasard(liste) {
  return liste[Math.floor(Math.random() * liste.length)];
}

function centreDe(element) {
  const r = element.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Affiche « +100 » ou « −25 » qui s'envole depuis un élément. */
function afficherPointsFlottants(points, origine) {
  const { x, y } = centreDe(origine || el.score);
  const span = document.createElement('span');
  span.className = 'flottant ' + (points > 0 ? 'plus' : 'moins');
  span.textContent = (points > 0 ? '+' : '−') + Math.abs(points);
  span.style.left = x + 'px';
  span.style.top = y + 'px';
  el.particules.appendChild(span);
  span.addEventListener('animationend', () => span.remove());
  setTimeout(() => span.remove(), 1500);
}

/** Petite explosion d'étincelles autour d'un élément. */
function eclatParticules(origine, nombre, couleurs) {
  if (mouvementsReduits.matches) return;
  const { x, y } = centreDe(origine);
  for (let i = 0; i < nombre; i++) {
    const p = document.createElement('span');
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 120;
    p.className = 'particule';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    p.style.setProperty('--dx', Math.cos(angle) * distance + 'px');
    p.style.setProperty('--dy', Math.sin(angle) * distance + 'px');
    p.style.setProperty('--taille', 4 + Math.random() * 6 + 'px');
    p.style.setProperty('--couleur', auHasard(couleurs));
    p.style.setProperty('--duree', 700 + Math.random() * 500 + 'ms');
    el.particules.appendChild(p);
    setTimeout(() => p.remove(), 1400);
  }
}

/** Pluie de bonbons, citrouilles et chauves-souris pour fêter la victoire. */
function pluieDeConfettis() {
  if (mouvementsReduits.matches) return;
  const symboles = ['🎃', '🍬', '🦇', '👻', '✨', '🍭'];
  for (let i = 0; i < 28; i++) {
    const c = document.createElement('span');
    c.className = 'confetti';
    c.textContent = auHasard(symboles);
    c.style.left = Math.random() * 100 + 'vw';
    c.style.setProperty('--taille', 18 + Math.random() * 18 + 'px');
    c.style.setProperty('--duree', 2.6 + Math.random() * 2.4 + 's');
    c.style.setProperty('--delai', Math.random() * 1.6 + 's');
    c.style.setProperty('--dx', (Math.random() - .5) * 200 + 'px');
    c.style.setProperty('--rot', (Math.random() - .5) * 720 + 'deg');
    el.particules.appendChild(c);
    setTimeout(() => c.remove(), 7000);
  }
}

/** Le fantôme moqueur surgit sur le côté de l'écran. */
function faireSurgirFantome() {
  el.bulleMoqueur.textContent = auHasard(CRIS_FANTOME);
  rejouerAnimation(el.moqueur, 'apparait');
}

/** Fait vibrer le téléphone (si l'appareil le permet). */
function vibrer(duree) {
  try {
    if (navigator.vibrate) navigator.vibrate(duree);
  } catch (erreur) { /* non disponible */ }
}

/** Crée les étoiles du ciel. */
function creerEtoiles() {
  const ciel = $('etoiles');
  const nombre = window.innerWidth < 600 ? 45 : 90;
  let html = '';
  for (let i = 0; i < nombre; i++) {
    const taille = Math.random() < 0.85 ? 1 + Math.random() * 1.5 : 2.5 + Math.random();
    html += `<span class="etoile" style="left:${(Math.random() * 100).toFixed(2)}%;` +
      `top:${(Math.random() * 62).toFixed(2)}%;--taille:${taille.toFixed(1)}px;` +
      `--duree:${(2 + Math.random() * 4).toFixed(1)}s;--delai:${(-Math.random() * 6).toFixed(1)}s"></span>`;
  }
  ciel.innerHTML = html;
}

/* ==========================================================================
   8. SONS
   Tous les sons sont fabriqués par le navigateur (Web Audio API) :
   aucun fichier à télécharger. Le bouton haut-parleur coupe tout.
   ========================================================================== */
const Son = (() => {
  let contexte = null;
  let volumeGeneral = null;
  let nappe = null;          // l'ambiance sonore de fond
  let actif = true;

  try {
    actif = localStorage.getItem('maison-hantee-son') !== 'off';
  } catch (erreur) { /* on garde le son activé */ }

  /** Le navigateur n'autorise le son qu'après un clic : on démarre ici. */
  function demarrer() {
    if (contexte) {
      if (contexte.state === 'suspended') contexte.resume();
      return;
    }
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    contexte = new AudioCtx();
    volumeGeneral = contexte.createGain();
    volumeGeneral.gain.value = actif ? 0.55 : 0;
    volumeGeneral.connect(contexte.destination);
  }

  /** Joue une note : fréquence (Hz), départ (s), durée (s), type d'onde, volume. */
  function note(frequence, depart, duree, type = 'sine', volume = 0.2, frequenceFin = null) {
    if (!contexte) return;
    const t = contexte.currentTime + depart;
    const osc = contexte.createOscillator();
    const gain = contexte.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequence, t);
    if (frequenceFin) osc.frequency.exponentialRampToValueAtTime(frequenceFin, t + duree);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    osc.connect(gain);
    gain.connect(volumeGeneral);
    osc.start(t);
    osc.stop(t + duree + 0.05);
  }

  const effets = {
    debut:    () => { note(196, 0, .5, 'triangle', .18); note(233, .18, .6, 'triangle', .16); note(147, .4, 1.1, 'sine', .2); },
    bonne:    () => { note(523, 0, .18, 'triangle', .22); note(659, .09, .18, 'triangle', .22); note(784, .18, .35, 'triangle', .22); note(1047, .28, .4, 'sine', .12); },
    mauvaise: () => { note(150, 0, .35, 'sawtooth', .14, 70); note(110, .05, .4, 'square', .06, 60); },
    indice:   () => { note(880, 0, .25, 'sine', .14); note(1320, .08, .35, 'sine', .08); },
    tic:      () => { note(1200, 0, .05, 'square', .05); },
    victoire: () => { [392, 523, 659, 784, 1047].forEach((f, i) => note(f, i * .13, .5, 'triangle', .2)); note(1568, .7, .9, 'sine', .1); },
    defaite:  () => { note(220, 0, .6, 'sawtooth', .12, 160); note(185, .45, .7, 'sawtooth', .12, 120); note(98, .9, 1.4, 'triangle', .2, 55); }
  };

  function jouer(nom) {
    if (actif && effets[nom]) effets[nom]();
  }

  /** Nappe grave et inquiétante qui tourne en fond pendant la partie. */
  function ambiance(allumer) {
    if (!contexte) return;
    if (allumer && !nappe) {
      const filtre = contexte.createBiquadFilter();
      filtre.type = 'lowpass';
      filtre.frequency.value = 320;
      const gain = contexte.createGain();
      gain.gain.setValueAtTime(0, contexte.currentTime);
      gain.gain.linearRampToValueAtTime(0.07, contexte.currentTime + 2);
      const oscs = [55, 55.6, 82.4].map((f) => {
        const o = contexte.createOscillator();
        o.type = 'triangle';
        o.frequency.value = f;
        o.connect(filtre);
        o.start();
        return o;
      });
      filtre.connect(gain);
      gain.connect(volumeGeneral);
      nappe = { oscs, gain };
    } else if (!allumer && nappe) {
      const { oscs, gain } = nappe;
      gain.gain.cancelScheduledValues(contexte.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, contexte.currentTime);
      gain.gain.linearRampToValueAtTime(0, contexte.currentTime + 0.8);
      oscs.forEach((o) => o.stop(contexte.currentTime + 0.9));
      nappe = null;
    }
  }

  function basculer() {
    actif = !actif;
    try {
      localStorage.setItem('maison-hantee-son', actif ? 'on' : 'off');
    } catch (erreur) { /* stockage indisponible */ }
    demarrer();
    if (volumeGeneral) volumeGeneral.gain.value = actif ? 0.55 : 0;
    majBoutons();
  }

  function majBoutons() {
    document.querySelectorAll('[data-son]').forEach((bouton) => {
      bouton.setAttribute('aria-pressed', String(actif));
      bouton.querySelector('.sr-only').textContent = actif ? 'Son activé' : 'Son coupé';
      bouton.title = actif ? 'Couper le son' : 'Activer le son';
    });
  }

  return { demarrer, jouer, ambiance, basculer, majBoutons };
})();

/* ==========================================================================
   9. DÉMARRAGE : on branche les boutons
   ========================================================================== */
function initialiser() {
  creerEtoiles();
  afficherRecordAccueil();
  Son.majBoutons();

  $('btn-commencer').addEventListener('click', demarrerPartie);
  el.formulaire.addEventListener('submit', validerReponse);
  el.btnIndice.addEventListener('click', demanderIndice);

  document.querySelectorAll('[data-son]').forEach((bouton) => {
    bouton.addEventListener('click', Son.basculer);
  });
  document.querySelectorAll('[data-action="rejouer"]').forEach((bouton) => {
    bouton.addEventListener('click', demarrerPartie);
  });
  document.querySelectorAll('[data-action="accueil"]').forEach((bouton) => {
    bouton.addEventListener('click', retourAccueil);
  });

  // Portraits cliquables : un clic remplit le champ de réponse
  el.visuel.addEventListener('click', (evenement) => {
    const bouton = evenement.target.closest('[data-choix]');
    if (!bouton || etat.verrou) return;
    el.champ.value = bouton.dataset.choix;
    el.visuel.querySelectorAll('[data-choix]').forEach((b) => b.classList.toggle('choisi', b === bouton));
    el.btnValider.focus({ preventScroll: true });
    afficherRetour(`Tu as choisi : ${bouton.dataset.choix}. Appuie sur Valider !`, 'info');
  });

  // Quand le joueur retape, la bordure rouge disparaît
  el.champ.addEventListener('input', () => {
    if (!etat.verrou) el.carte.classList.remove('mauvaise');
  });

  // L'animation d'entrée de la carte est retirée une fois finie
  // (sinon elle empêcherait l'animation de secousse de se rejouer)
  el.carte.addEventListener('animationend', (evenement) => {
    if (evenement.target === el.carte && evenement.animationName === 'entree-carte') {
      el.carte.classList.remove('entree');
    }
  });

  // Cadenas : les chiffres tapés s'affichent sur les molettes
  el.champ.addEventListener('input', () => {
    if (!ENIGMES[etat.index].cadenas || etat.verrou) return;
    const chiffres = el.champ.value.replace(/\D/g, '').slice(0, 3);
    el.visuel.querySelectorAll('.molette-chiffre').forEach((molette, i) => {
      molette.textContent = chiffres[i] || '?';
    });
  });
}

initialiser();

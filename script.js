/* ==========================================================================
   LA MAISON HANTÉE — Les 10 Secrets
   Logique du jeu (JavaScript pur, aucune bibliothèque)
   Club de Vibe Coding du LPELIA
   --------------------------------------------------------------------------
   Plan du fichier :
     1. Réglages du jeu        → change ici la durée, les points…
     2. Les 10 énigmes         → change ici les questions et les réponses
     3. État de la partie
     4. Vérification des réponses (majuscules et accents ignorés)
     5. Déroulement de la partie (démarrer, valider, indices, chrono…)
     6. Écrans de victoire et de défaite
     7. Effets visuels
     8. Sons et musique (créés par le navigateur, aucun fichier audio)
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

const ROMAINS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/* ==========================================================================
   2. LES 10 ÉNIGMES
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
    salle: "Le Salon de l'horloge",
    histoire: "Une grande horloge s'est arrêtée au milieu du salon. Sous le cadran, une phrase est gravée dans le bois.",
    visuel: `
      <div class="salon">
        <div class="horloge" role="img" aria-label="Horloge arrêtée : la petite aiguille est sur le 10 et la grande aiguille sur le 12.">
          <span class="chiffre-horloge" style="--a:0deg">12</span>
          <span class="chiffre-horloge" style="--a:90deg">3</span>
          <span class="chiffre-horloge" style="--a:180deg">6</span>
          <span class="chiffre-horloge" style="--a:270deg">9</span>
          <span class="aiguille aiguille-heures"></span>
          <span class="aiguille aiguille-minutes"></span>
          <span class="axe-horloge"></span>
        </div>
        <p class="gravure">« La porte de la cave s'ouvrira <strong>5 heures</strong> après l'heure où je me suis arrêtée. »</p>
      </div>`,
    question: "À quelle heure la porte de la cave s'ouvrira-t-elle ?",
    reponses: ["3", "3h", "3 heure", "3 heures", "3h00", "3 00", "trois", "trois heure", "trois heures",
               "15", "15h", "15 heure", "15 heures", "15h00", "15 00", "quinze heures"],
    solution: "3 heures (15 h)",
    indices: [
      "L'horloge s'est arrêtée à 10 heures. Avance de 5 heures : 11, 12, 1…",
      "10 + 5 = 15 heures, c'est-à-dire 3 heures sur le cadran."
    ],
    placeholder: "Une heure…"
  },
  {
    salle: "Le Cimetière",
    histoire: "Derrière la maison, un petit cimetière dort sous la brume. Sur une pierre tombale, des lettres de bronze sont tombées dans le désordre.",
    visuel: `
      <div class="tombe">
        <p class="tombe-rip" aria-hidden="true">R.I.P.</p>
        <p class="tombe-epitaphe">Ici repose le compagnon de vol de la sorcière</p>
        <div class="lettres-tombe" role="group" aria-label="Lettres mélangées : L, I, A, B, A">
          <span class="lettre-bronze" style="--r:-8deg" data-solution="B">L</span>
          <span class="lettre-bronze" style="--r:6deg"  data-solution="A">I</span>
          <span class="lettre-bronze" style="--r:-3deg" data-solution="L">A</span>
          <span class="lettre-bronze" style="--r:9deg"  data-solution="A">B</span>
          <span class="lettre-bronze" style="--r:-5deg" data-solution="I">A</span>
        </div>
      </div>`,
    question: "Remets les lettres dans l'ordre. Quel mot obtiens-tu ?",
    reponses: ["balai", "balais"],
    solution: "Le balai",
    indices: [
      "La sorcière s'en sert pour voler dans le ciel… et aussi pour faire le ménage !",
      "Le mot commence par B et se termine par I."
    ],
    placeholder: "Un mot…"
  },
  {
    salle: "Le Laboratoire du savant",
    histoire: "Des fioles fument sur les étagères. Le savant fou a écrit son mot de passe en code sur le tableau noir.",
    visuel: `
      <div class="tableau-noir">
        <p class="craie-regle">Mon code : chaque lettre a avancé d'une place dans l'alphabet.<br>A devient B, B devient C…</p>
        <div class="code-craie" role="group" aria-label="Mot codé : O, V, J, U">
          <span data-solution="N">O</span><span data-solution="U">V</span><span data-solution="I">J</span><span data-solution="T">U</span>
        </div>
        <p class="alphabet-craie" aria-hidden="true">A B C D E F G H I J K L M N O P Q R S T U V W X Y Z</p>
      </div>`,
    question: "Quel est le mot de passe une fois décodé ?",
    reponses: ["nuit"],
    solution: "NUIT",
    indices: [
      "Recule chaque lettre d'une place dans l'alphabet : O devient N.",
      "N… U… I… T… C'est le moment où sortent les fantômes !"
    ],
    placeholder: "Un mot…"
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

/** Crée un sceau par énigme dans la barre de progression. */
function construireSceaux() {
  el.sceaux.innerHTML = ENIGMES.map((_, i) => `<li class="sceau"><span>${ROMAINS[i]}</span></li>`).join('');
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

  el.salleNumero.textContent = `Salle ${ROMAINS[etat.index]} sur ${ROMAINS[ENIGMES.length - 1]}`;
  el.salleTitre.textContent = enigme.salle;
  el.salleHistoire.textContent = enigme.histoire;
  el.visuel.innerHTML = enigme.visuel;
  el.visuel.dataset.indices = '0';
  el.visuel.classList.remove('resolu');
  el.question.textContent = enigme.question;
  el.hudSalle.textContent = `${ROMAINS[etat.index]} / ${ROMAINS[ENIGMES.length - 1]}`;

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
  Son.regleTempo(t / REGLAGES.dureePartie); // la musique accélère quand le temps file
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
  if (score >= 1150) return 'Rang : Légende d\'Halloween';
  if (score >= 950) return 'Rang : Chasseur de fantômes';
  if (score >= 700) return 'Rang : Explorateur courageux';
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
   8. SONS ET MUSIQUE
   Tous les sons et la musique sont fabriqués par le navigateur (Web Audio API) :
   aucun fichier à télécharger. Le bouton haut-parleur coupe tout.
   ========================================================================== */
const Son = (() => {
  let contexte = null;
  let volumeGeneral = null;
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
    debut:    () => { note(140, 0, .18, 'square', .1, 45); note(62, 0, .7, 'sine', .35, 32); }, // la porte claque
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

  /* ------------------------------------------------------------------
     MUSIQUE EFFRAYANTE
     Une bande-son d'horreur fabriquée par le navigateur, en 4 couches :
       1. au début, un orgue d'église joue la Toccata en ré mineur de
          J.-S. Bach (domaine public), le grand classique de l'épouvante ;
       2. une boîte à musique désaccordée joue une berceuse sinistre
          (mélodie originale) qui ralentit et se détraque avec le temps ;
       3. un grondement grave et un cœur qui bat de plus en plus vite ;
       4. des bruits au hasard : vent qui hurle, cri lointain, coup sourd,
          accord d'orgue menaçant… de plus en plus fréquents.
     ------------------------------------------------------------------ */

  /** Convertit un nom de note (ex. "C#4") en fréquence (Hz). */
  function frequenceDe(nom) {
    const demiTons = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
    const [, lettre, octave] = nom.match(/^([A-G]#?)(\d)$/);
    const midi = 12 * (Number(octave) + 1) + demiTons[lettre];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  // La berceuse de la boîte à musique (ré mineur, à 3 temps) : [note, durée en temps]
  const MELODIE_BERCEUSE = [
    ['D5', 1], ['F5', 1], ['A5', 1],   ['G#5', 1], ['A5', 1], ['F5', 1],
    ['E5', 1], ['F5', 1], ['D5', 1],   ['C#5', 3],
    ['D5', 1], ['F5', 1], ['A5', 1],   ['A#5', 1], ['A5', 1], ['G5', 1],
    ['F5', 1], ['E5', 1], ['C#5', 1],  ['D5', 3],
    ['A4', 1], ['D5', 1], ['F5', 1],   ['E5', 1], ['D5', 1], ['C#5', 1],
    ['D5', 1], ['A#4', 1], ['G4', 1],  ['A4', 2], [null, 1],
    ['G4', 1], ['A#4', 1], ['D5', 1],  ['C#5', 1], ['E5', 1], ['G5', 1],
    ['F5', 1], ['E5', 1], ['C#5', 1],  ['D5', 3],
    [null, 6]                           // un silence inquiétant avant de recommencer
  ];
  // Une note grave au début de chaque mesure
  const BASSES_BERCEUSE = ['D4', 'D4', 'D4', 'A3', 'D4', 'A#3', 'A3', 'D4',
                           'D4', 'A3', 'G3', 'A3', 'G3', 'A3', 'A3', 'D4'];

  function construireBerceuse() {
    const notes = [];
    let temps = 0;
    MELODIE_BERCEUSE.forEach(([nom, duree]) => {
      const mesure = temps / 3;
      const basse = Number.isInteger(mesure) && BASSES_BERCEUSE[mesure];
      notes.push({ frequence: nom ? frequenceDe(nom) : null, duree, basse: basse ? frequenceDe(basse) : null });
      temps += duree;
    });
    return notes;
  }
  const BERCEUSE = construireBerceuse();

  const musique = { active: false, minuteur: null, reste: 1, battements: 0 };

  /** Bruit blanc (souffle) utilisé pour le vent et les coups. */
  function bruitBlanc() {
    if (!musique.bruit) {
      const buffer = contexte.createBuffer(1, contexte.sampleRate * 2, contexte.sampleRate);
      const donnees = buffer.getChannelData(0);
      for (let i = 0; i < donnees.length; i++) donnees[i] = Math.random() * 2 - 1;
      musique.bruit = buffer;
    }
    return musique.bruit;
  }

  /** Note tenue (orgue, accords) : attaque, tenue, puis extinction. */
  function voixTenue(frequence, t, duree, type, volume, filtreHz, attaque = 0.03) {
    const osc = contexte.createOscillator();
    const filtre = contexte.createBiquadFilter();
    const gain = contexte.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequence, t);
    filtre.type = 'lowpass';
    filtre.frequency.value = filtreHz;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + attaque);
    gain.gain.setValueAtTime(volume, t + duree);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duree + 0.3);
    osc.connect(filtre);
    filtre.connect(gain);
    gain.connect(musique.entree);
    osc.start(t);
    osc.stop(t + duree + 0.35);
  }

  /** Son percussif qui glisse d'une fréquence à une autre (cœur, coups). */
  function coupSourd(f0, f1, t, duree, type, volume) {
    const osc = contexte.createOscillator();
    const gain = contexte.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f1, t + duree * 0.8);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duree);
    osc.connect(gain);
    gain.connect(musique.entree);
    osc.start(t);
    osc.stop(t + duree + 0.05);
  }

  /** Un orgue : trois tuyaux qui sonnent ensemble. */
  function orgue(frequence, t, duree, volume, attaque) {
    voixTenue(frequence, t, duree, 'sawtooth', volume, 2600, attaque);
    voixTenue(frequence / 2, t, duree, 'square', volume * 0.6, 1800, attaque);
    voixTenue(frequence * 2, t, duree, 'sine', volume * 0.5, 4000, attaque);
  }

  /** L'ouverture : la Toccata en ré mineur de Bach (domaine public). */
  function toccata(t0) {
    const phrase = [
      ['A4', 0, 0.12], ['G4', 0.12, 0.12], ['A4', 0.24, 1.1],
      ['G4', 1.6, 0.11], ['F4', 1.71, 0.11], ['E4', 1.82, 0.11], ['D4', 1.93, 0.11],
      ['C#4', 2.04, 0.55], ['D4', 2.65, 1.5]
    ];
    phrase.forEach(([nom, debut, duree]) => {
      const f = frequenceDe(nom);
      orgue(f, t0 + debut, duree, 0.05);
      orgue(f * 2, t0 + debut, duree, 0.04);
    });
    // le grand accord diminué, sur une pédale grave de ré
    ['D2', 'C#4', 'E4', 'G4', 'A#4'].forEach((nom) => orgue(frequenceDe(nom), t0 + 4.6, 2.4, 0.032));
  }

  /** Une note de boîte à musique, de plus en plus désaccordée. */
  function noteBoite(frequence, t, volume) {
    const fausseNote = (Math.random() * 14 - 7) - (1 - musique.reste) * 45; // en centièmes de demi-ton
    const f = frequence * Math.pow(2, fausseNote / 1200);
    [[1, 1, 1.6], [2, 0.18, 0.9], [3.01, 0.22, 0.5]].forEach(([multiple, part, extinction]) => {
      const osc = contexte.createOscillator();
      const gain = contexte.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f * multiple, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume * part, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + extinction);
      osc.connect(gain);
      gain.connect(musique.entree);
      osc.start(t);
      osc.stop(t + extinction + 0.05);
    });
  }

  /** Le cœur : « boum-boum ». */
  function battementCoeur(t) {
    [[0, 1], [0.17, 0.7]].forEach(([decalage, force]) => {
      coupSourd(85, 42, t + decalage, 0.22, 'sine', 0.5 * force);
      coupSourd(170, 85, t + decalage, 0.12, 'triangle', 0.1 * force); // audible sur un haut-parleur de téléphone
    });
    musique.battements++;
  }

  /** Les bruits étranges qui surgissent au hasard. */
  const BRUITS = {
    vent(t) {
      const source = contexte.createBufferSource();
      const filtre = contexte.createBiquadFilter();
      const gain = contexte.createGain();
      source.buffer = bruitBlanc();
      source.loop = true;
      filtre.type = 'bandpass';
      filtre.Q.value = 1.4;
      filtre.frequency.setValueAtTime(300, t);
      filtre.frequency.exponentialRampToValueAtTime(1200, t + 1.6);
      filtre.frequency.exponentialRampToValueAtTime(260, t + 3.6);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 3.8);
      source.connect(filtre);
      filtre.connect(gain);
      gain.connect(musique.entree);
      source.start(t);
      source.stop(t + 4);
    },
    cri(t) {
      const osc = contexte.createOscillator();
      const vibrato = contexte.createOscillator();
      const profondeur = contexte.createGain();
      const filtre = contexte.createBiquadFilter();
      const gain = contexte.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1250, t);
      osc.frequency.exponentialRampToValueAtTime(1850, t + 2.2);
      vibrato.frequency.value = 7;
      profondeur.gain.value = 28;
      vibrato.connect(profondeur);
      profondeur.connect(osc.frequency);
      filtre.type = 'bandpass';
      filtre.frequency.value = 1800;
      filtre.Q.value = 3;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.06, t + 0.9);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
      osc.connect(filtre);
      filtre.connect(gain);
      gain.connect(musique.entree);
      osc.start(t);
      vibrato.start(t);
      osc.stop(t + 2.6);
      vibrato.stop(t + 2.6);
    },
    coup(t) {
      coupSourd(70, 28, t, 1.5, 'sine', 0.55);
      const source = contexte.createBufferSource();
      const filtre = contexte.createBiquadFilter();
      const gain = contexte.createGain();
      source.buffer = bruitBlanc();
      filtre.type = 'lowpass';
      filtre.frequency.value = 500;
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
      source.connect(filtre);
      filtre.connect(gain);
      gain.connect(musique.entree);
      source.start(t);
      source.stop(t + 0.7);
    },
    accord(t) {
      // accord diminué qui enfle lentement, puis s'éteint
      ['D3', 'F3', 'G#3', 'B3'].forEach((nom) => orgue(frequenceDe(nom), t, 2.2, 0.03, 1.4));
    }
  };

  /** Le grondement grave continu (ré et la bémol : l'intervalle « du diable »). */
  function demarrerGrondement(t) {
    const filtre = contexte.createBiquadFilter();
    const lfo = contexte.createOscillator();
    const profondeurLfo = contexte.createGain();
    const gain = contexte.createGain();
    filtre.type = 'lowpass';
    filtre.frequency.value = 240;
    filtre.Q.value = 2.5;
    lfo.frequency.value = 0.06;
    profondeurLfo.gain.value = 140;
    lfo.connect(profondeurLfo);
    profondeurLfo.connect(filtre.frequency);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.06, t + 3);
    const oscs = [[73.42, 'sawtooth'], [103.83, 'sawtooth'], [36.71, 'sine']].map(([f, type]) => {
      const o = contexte.createOscillator();
      o.type = type;
      o.frequency.value = f;
      o.connect(type === 'sine' ? gain : filtre);
      o.start(t);
      return o;
    });
    filtre.connect(gain);
    gain.connect(musique.entree);
    lfo.start(t);
    musique.grondement = { oscs: [...oscs, lfo], filtre };
  }

  /** Programme les notes un petit peu en avance pour un rythme parfait. */
  function planifierMusique() {
    if (!musique.active) return;
    const maintenant = contexte.currentTime;
    const horizon = maintenant + 0.15;

    // la boîte à musique ralentit avec le temps (0,5 s → 0,75 s par temps)
    if (musique.boite.prochain < maintenant - 0.2) musique.boite.prochain = maintenant + 0.05;
    while (musique.boite.prochain < horizon) {
      const note = BERCEUSE[musique.boite.index % BERCEUSE.length];
      if (note.frequence) noteBoite(note.frequence, musique.boite.prochain, 0.2);
      if (note.basse) noteBoite(note.basse, musique.boite.prochain, 0.11);
      musique.boite.prochain += note.duree * (0.5 + (1 - musique.reste) * 0.25);
      musique.boite.index++;
    }

    // le cœur accélère avec le temps (58 → 150 battements par minute)
    if (musique.coeur < maintenant - 0.2) musique.coeur = maintenant + 0.05;
    while (musique.coeur < horizon) {
      battementCoeur(musique.coeur);
      musique.coeur += 60 / musique.bpm;
    }

    // un bruit étrange de temps en temps, de plus en plus souvent
    if (musique.prochainBruit < horizon) {
      const noms = Object.keys(BRUITS);
      BRUITS[noms[Math.floor(Math.random() * noms.length)]](Math.max(musique.prochainBruit, maintenant));
      musique.prochainBruit += 5 + Math.random() * (4 + 8 * musique.reste);
    }
  }

  /** Lance ou arrête la musique (avec un fondu). */
  function jouerMusique(allumer) {
    if (!contexte) return;
    const t = contexte.currentTime;
    if (allumer && !musique.active) {
      // entree → sortie (son direct) + écho de cathédrale
      musique.entree = contexte.createGain();
      musique.sortie = contexte.createGain();
      const echo = contexte.createDelay(1);
      const retour = contexte.createGain();
      const humide = contexte.createGain();
      echo.delayTime.value = 0.28;
      retour.gain.value = 0.38;
      humide.gain.value = 0.35;
      musique.entree.connect(musique.sortie);
      musique.entree.connect(echo);
      echo.connect(retour);
      retour.connect(echo);
      echo.connect(humide);
      humide.connect(musique.sortie);
      musique.sortie.gain.setValueAtTime(0, t);
      musique.sortie.gain.linearRampToValueAtTime(1, t + 0.3);
      musique.sortie.connect(volumeGeneral);

      Object.assign(musique, {
        active: true, reste: 1, bpm: 58, battements: 0,
        boite: { index: 0, prochain: t + 7.8 },   // la berceuse commence après l'orgue
        coeur: t + 1.2,
        prochainBruit: t + 10
      });
      toccata(t + 0.15);
      demarrerGrondement(t);
      musique.minuteur = setInterval(planifierMusique, 25);
    } else if (!allumer && musique.active) {
      musique.active = false;
      clearInterval(musique.minuteur);
      const sortie = musique.sortie;
      sortie.gain.cancelScheduledValues(t);
      sortie.gain.setValueAtTime(sortie.gain.value, t);
      sortie.gain.linearRampToValueAtTime(0, t + 0.6);
      musique.grondement.oscs.forEach((o) => o.stop(t + 0.7));
      setTimeout(() => sortie.disconnect(), 900);
    }
  }

  /** Règle l'angoisse selon le temps restant (1 = début, 0 = fin). */
  function regleTempo(reste) {
    musique.reste = Math.max(0, Math.min(1, reste));
    musique.bpm = 58 + (1 - musique.reste) * 92;
    if (musique.active && contexte) {
      // le grondement s'ouvre et devient plus menaçant
      musique.grondement.filtre.frequency.setTargetAtTime(240 + (1 - musique.reste) * 520, contexte.currentTime, 0.5);
    }
  }

  function etatMusique() {
    return {
      active: musique.active,
      tempo: Math.round(musique.bpm || 58),
      pas: musique.boite ? musique.boite.index : 0,
      battements: musique.battements
    };
  }

  /** Ambiance de la partie : la musique effrayante. */
  function ambiance(allumer) {
    if (!contexte) return;
    jouerMusique(allumer);
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

  return { demarrer, jouer, ambiance, basculer, majBoutons, regleTempo, etatMusique };
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

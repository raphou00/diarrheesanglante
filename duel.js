
// Variables de base

let terrain = document.querySelector(".terrain")
let largeurTerrain = Math.round(window.innerWidth / 100) * 100;
let distanceDeplacement = largeurTerrain / 10;
let touchesRebel = ["w", "s", "a", "d", "Space"];
let touchesImperial = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"];
let jeuCommance = false;
let degat = 40;


// Fonctions

function creerTerrain() {
    terrain.style.width = largeurTerrain + "px";
    terrain.style.height = Math.round(window.innerHeight / 10) * 10 + "px";
    terrain.style.backgroundSize = "cover";
    terrain.style.marginTop = "50px"
}

function lancerJeu() {
    let msg = document.createElement("div");
    msg.setAttribute("id", "msg")
    msg.classList.add("message");

    msg.style.backgroundColor = "#000000";
    msg.innerHTML = '<h1>Appuyer sur n\'importe quel touche pour démarrer le jeu...</h1>';

    document.body.appendChild(msg);

    setTimeout(() => {msg.style.backgroundColor = "#00000000";}, 10);
}


// classes

class Joueur {
    constructor(type, direction, vie, refroidissement, coordX, coordY) {
        this.type = type;
        this.direction = direction;
        this.vie = vie;
        this.refroidissement = refroidissement;
        this.coordX = coordX;
        this.coordY = Math.round(coordY);
    }

    afficherInfo() {
        let boxInfo = document.createElement("div");
        let boxVie = document.createElement("div");
        let vie = document.createElement("div");

        boxVie.classList.add("boxVie");
        vie.classList.add("vie");

        boxInfo.style.position = "absolute";
        boxInfo.style.top = 0;
        boxInfo.style.padding = "20px";

        if (this.type == "rebel") {
            vie.setAttribute("id", "vieRebel");
            boxInfo.style.left = 0;
            boxInfo.innerText = "Rebelles";
        } else {
            vie.setAttribute("id", "vieImperial");
            boxInfo.style.right = 0;
            boxInfo.innerText = "Empire";
        }

        terrain.appendChild(boxInfo);
        boxInfo.appendChild(boxVie);
        boxVie.appendChild(vie);
    }

    afficherJoueur() {
        let joueur = document.createElement("div");
        let apparence;

        if (this.type == "rebel") {
            joueur.setAttribute("id", this.type);
            apparence = "rebelDuel";
        } else {
            joueur.setAttribute("id", this.type);
            apparence = "ennemi";
        }
        
        joueur.classList.add("ennemi");
        joueur.style.backgroundImage = "url(img/" + apparence + ".png)";
        joueur.style.top = this.coordY + "px";
        joueur.style.left = this.coordX + "px";

        terrain.appendChild(joueur);
    }

    bougerJoueur(e) {
        if (!jeuCommance) {
            let volMusique = 0.01;
            musique.play();
            musique.volume = volMusique;
            musique.loop = true;
            jeuCommance = true;
            document.getElementById("msg").remove();

            function volumeMusique() {
                setTimeout(() => {
                    if (volMusique < 0.1) {
                        volMusique += 0.01;
                        musique.volume = volMusique;
                        volumeMusique();
                    }
                }, 100);
            }
            volumeMusique();
        }

        if (this.vie > 0) {
            let joueur = document.getElementById(this.type);
            let touches;

            if (this.type == "rebel") {
                touches = touchesRebel;
            } else {
                touches = touchesImperial;
            } 


            if (e.key == touches[0]) {
                if (this.coordY - distanceDeplacement >= 50) {
                    this.coordY -= distanceDeplacement;
                }
            } else if (e.key == touches[1]) {
                if (this.coordY + distanceDeplacement <= Math.round(window.innerHeight / 10) * 10 - 100) {
                    this.coordY += distanceDeplacement;
                }
            } else if (e.key == touches[2]) {
                if (this.coordX - distanceDeplacement >= 50) {
                    this.coordX -= distanceDeplacement;
                    if (this.direction == "droite") {
                        this.direction = "gauche";
                        joueur.style.transform = "scaleX(-1)";
                    }
                }
            } else if (e.key == touches[3]) {
                if (this.coordX + distanceDeplacement <= largeurTerrain - 100) {
                    this.coordX += distanceDeplacement;
                    if (this.direction == "gauche") {
                        this.direction = "droite";
                        joueur.style.transform = "scaleX(1)";
                    }
                }
            } else if (e.key == touches[4] || e.code == touches[4]) {
                this.attaquer();
            }

            joueur.style.top = this.coordY + "px";
            joueur.style.left = this.coordX + "px";
        }
    }

    attaquer() {
        if (this.refroidissement == 1) {
            let tire = new Tire(this.type, this.direction, this.coordX, this.coordY);
            tire.tire();
            this.refroidissement = 0;
            setTimeout(() => {this.refroidissement = 1}, 200);
        }
    }

    perdreVie() {
        let sonTouche = new Audio("son/son_touche.mp3");
        let vie;
        if (this.type == "rebel") {
            vie = document.getElementById("vieRebel");
        } else if (this.type == "imperial") {
            vie = document.getElementById("vieImperial");
        }

        sonTouche.play();
        sonTouche.volume = 0.1;
        this.vie -= degat;
        vie.style.width = this.vie + "px";
        vie.style.backgroundColor = "red";

        setTimeout(() => {vie.style.backgroundColor = "var(--rose)";}, 500);

        if (this.vie <= 0) {
            this.mourir();
        }
    }

    mourir() {
        let joueur = document.getElementById(this.type);
        let sonExplosion = new Audio("son/son_explosion.mp3");
        let gagnant;
        degat = 0;

        joueur.style.width = "100px";
        joueur.style.backgroundImage = "url(img/explosion.png)";
        sonExplosion.play();

        let msg = document.createElement("div");
        msg.setAttribute("id", "msg")
        msg.classList.add("message");

    
        msg.style.backgroundColor = "#00000000";

        if (this.type == "rebel") {
            gagnant = "L'empire a";
        } else if (this.type == "imperial") {
            gagnant = "Les rebelles ont";
        }

        msg.innerHTML = '<h1>' + gagnant + ' gagné la partie !</h1>';
    
        document.body.appendChild(msg);

        setTimeout(() => {document.location.replace("index.html")}, 5000);
    }
}

class Tire {
    constructor(tireur, direction, coordX, coordY) {
        this.tireur = tireur;
        this.direction = direction;
        this.coordX = coordX;
        this.coordY = coordY;
    }

    tire() {
        let tire = document.createElement("div");

        if (this.tireur == "rebel") {
            let sonJoueur = new Audio("son/son_tire_joueur.mp3");
            sonJoueur.play();
            sonJoueur.volume = 0.05;
            tire.style.backgroundImage = "url(img/tire_rebel.png)";
        } else if (this.tireur == "imperial") {
            let sonEnnemi = new Audio("son/son_tire_ennemi.mp3");
            sonEnnemi.play();
            sonEnnemi.volume = 0.05;
            tire.style.backgroundImage = "url(img/tire_ennemi.png)";
        }

        tire.classList.add("tire");

        tire.style.left = this.coordX + "px";
        tire.style.top = this.coordY + "px";
        tire.style.transform = "translateY(20px) translate(10px) rotate(45deg)";

        terrain.appendChild(tire);

        setInterval(() => {
            if (this.coordX <= 0 || this.coordX > window.innerWidth) {
                tire.remove();
            } else {
                if (this.direction == "droite") {
                    this.coordX += 5;
                } else if (this.direction == "gauche") {
                    this.coordX -= 5;
                }

                if (this.tireur == "rebel") {
                    if (this.coordX == imperial.coordX && this.coordY == imperial.coordY) {
                        imperial.perdreVie();
                        tire.remove();
                    }
                } else if (this.tireur == "imperial") {
                    if (this.coordX == rebel.coordX && this.coordY == rebel.coordY) {
                        tire.remove();
                        rebel.perdreVie();
                    }
                }

                tire.style.left = this.coordX + "px";
            }
        }, 1)
    }
}


// Programme principale
// ====================

lancerJeu();
creerTerrain();

let musique = new Audio("son/son_duel.mp3");


let rebel = new Joueur("rebel", "droite", 200, 1, distanceDeplacement, distanceDeplacement);
rebel.afficherInfo();
rebel.afficherJoueur();
document.addEventListener("keydown", (e) => {rebel.bougerJoueur(e);});


let imperial = new Joueur("imperial", "gauche", 200, 1, Math.round(window.innerWidth / 100) * 100 - distanceDeplacement, distanceDeplacement);
imperial.afficherInfo();
imperial.afficherJoueur();
document.addEventListener("keydown", (e) => {imperial.bougerJoueur(e);});
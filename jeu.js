
// Variables de base

let terrain = document.querySelector(".terrain");
let nomJoueur = sessionStorage.getItem("nom");
let difficulte = sessionStorage.getItem("difficulte");
let apparence = sessionStorage.getItem("apparence");
let largeurTerrain = Math.round(window.innerWidth / 100) * 100;
let distanceDeplacement = largeurTerrain / 10;
let touches = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "1", "2", "3", "4"];
let jeuCommance = false;
let surPause = true;
let temps = 0;
let score = 0;
let refroidissement = 1;
let nbrTire = 0;
let bonusDiff = ["alliance_rebels", "vie", "meth_bleu", "invincibilite"];
let nbrParBonus = {};
let listeBonus = [];
let listeBonusDispo = [];
let nbrBonus = 0;
let ennemis = [];
let nbrEnnemi = 0;
let nbrEnnemiTue = 0;
let degatEnnemi = controleDifficulte();
let boss;


// Fonctions

function creerTerrain() {
    terrain.style.width = largeurTerrain + "px";
    terrain.style.height = Math.round(window.innerHeight / 10) * 10 + "px";
    terrain.style.backgroundSize = "cover";
    terrain.style.marginTop = "50px"
}

function controleNom() {
    if (nomJoueur == "") {
        nomJoueur = "Dhiarrée Sanglante";
    }

    return nomJoueur;
}

function controleDifficulte() {
    let _degatEnnemi;
    if (difficulte == "facile") {
        _degatEnnemi = 20;
    } else if (difficulte == "normal") {
        _degatEnnemi = 40;
    } else if (difficulte == "difficile") {
        _degatEnnemi = 80;
    }

    return _degatEnnemi;
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

function pause() {
    let btn = document.getElementById("iconBtnPause");
    btn.innerHTML = "Pause";
    let sonClick = new Audio("son/son_click.mp3");
    sonClick.play();
    sonClick.volume = 0.25;
    
    if (surPause == false) {
        surPause = true;
        btn.classList.remove("fa-pause");
        btn.classList.add("fa-play");
        musique.pause();
    } else if (surPause == true) {
        surPause = false;
        btn.classList.remove("fa-play");
        btn.classList.add("fa-pause");
        musique.play();
    }
}

function genererEnnemi() {
    let numLigne = distanceDeplacement * Math.floor(Math.random() * largeurTerrain / distanceDeplacement);
    if ((numLigne >= 50) && (numLigne <= largeurTerrain - 100)) {
        let ennemi = new Ennemi(nbrEnnemi, true, numLigne, 0);
        ennemi.afficherEnnemi();
        ennemi.bougerEnnemi();
        ennemi.attaquerEnnemi();
        ennemis.push(ennemi);
        nbrEnnemi++;
    } else {
        genererEnnemi();
    }
}

function genererBonus() {
    let bonusPosX = joueur.coordX;
    let bonusPosY = joueur.coordY - distanceDeplacement;
    if (bonusPosY > 100) {
        if (listeBonus.length == 0) {
            let bonus = new Bonus(nbrBonus, bonusDiff[Math.round(Math.random() * bonusDiff.length)], bonusPosX, bonusPosY);
            bonus.afficherBonus();
            listeBonus.push(bonus);
            listeBonusDispo.push(bonus);
            nbrBonus++;
        } else {
            let nbrBonusOn = listeBonus.length;
            let nbrBonusOff = 0;
            for (let i in listeBonus) {
                if ((listeBonus[i].coordX != bonusPosX) || (listeBonus[i].coordY != bonusPosY)) {
                    nbrBonusOff++;
                }
            }
            if (nbrBonusOn == nbrBonusOff) {
                let bonus = new Bonus(nbrBonus, bonusDiff[Math.round(Math.random() * bonusDiff.length)], bonusPosX, bonusPosY);
                bonus.afficherBonus();
                listeBonus.push(bonus);
                listeBonusDispo.push(bonus);
                nbrBonus++;
            } else {
                setTimeout(() => {genererBonus();}, 500);
            }
        }
    } else {
        setTimeout(() => {genererBonus();}, 500);
    }
}


// classes

class Joueur {
    constructor(nom, vie, degat, coordX, coordY) {
        this.nom = nom;
        this.vie = vie;
        this.degat = 20;
        this.degat = degat;
        this.coordX = coordX;
        this.coordY = Math.round(coordY);
    }

    afficherInfo() {
        let boxInfo = document.createElement("div");
        let btnPause = document.createElement("button");
        let boxVie = document.createElement("div");
        let vie = document.createElement("div");
        let boxNom = document.createElement("div");
        let boxScore = document.createElement("div");
        let icoBtnPause = "<i id='iconBtnPause' style='font-size: 25px;' class='fa-solid fa-pause'>";

    
        let inventaire = document.createElement("div");
        inventaire.classList.add("inventaire");

        for (let i = 0; i < bonusDiff.length; i++) {
            let caseInventaire = document.createElement("div");
            let caseIcone = document.createElement("div");
            let nomBonus = bonusDiff[i];

            caseInventaire.classList.add("case");
            caseIcone.classList.add("caseIcone");
            caseIcone.setAttribute("id", "inventaire" + i);

            nbrParBonus[bonusDiff[i]] = 0;

            caseIcone.style.backgroundImage = "url(img/" + nomBonus + ".png)";
            caseIcone.innerText = "x" + nbrParBonus[bonusDiff[i]];

            caseInventaire.appendChild(caseIcone);
            inventaire.appendChild(caseInventaire);
        }

        boxInfo.classList.add("boxInfo");
        btnPause.classList.add("btnPause");
        boxVie.classList.add("boxVie");
        vie.classList.add("vie");
        boxNom.classList.add("boxNom");
        boxScore.classList.add("boxScore");

        boxInfo.setAttribute("id", "info")


        btnPause.innerHTML = icoBtnPause;
        btnPause.setAttribute("onclick", "pause()");

        vie.setAttribute("id", "vieJoueur");

        boxNom.innerText = this.nom;

        boxScore.innerText = "Score: " + score;
        boxScore.setAttribute("id", "scoreJoueur");


        terrain.appendChild(boxInfo);
        boxInfo.appendChild(btnPause);
        boxInfo.appendChild(inventaire)
        boxInfo.appendChild(boxVie);
        boxVie.appendChild(vie);
        boxInfo.appendChild(boxNom);
        terrain.appendChild(boxScore);
    }

    afficherJoueur() {
        let joueur = document.createElement("div");
        joueur.setAttribute("id", "joueur");
        joueur.classList.add("joueur");

        joueur.style.backgroundImage = "url(img/" + apparence + ".png)";
        joueur.style.top = this.coordY + "px";
        joueur.style.left = this.coordX + 50 + "px";

        terrain.appendChild(joueur);
    }

    bougerJoueur(key, code, which) {
        if (which == 27) {
            pause();
        }

        if (jeuCommance == false) {
            let volMusique = 0.01;
            musique.play();
            musique.volume = volMusique;
            surPause = false;
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

        if (surPause == false && this.vie > 0) {
            let joueur = document.getElementById("joueur");

            if (key == touches[0]) {
                if (this.coordY - distanceDeplacement >= 75) {
                    this.coordY -= distanceDeplacement;
                }
            } else if (key == touches[1]) {
                if (this.coordY + distanceDeplacement <= Math.round(window.innerHeight / 10) * 10 - 75) {
                    this.coordY += distanceDeplacement;
                }
            } else if (key == touches[2]) {
                if (this.coordX - distanceDeplacement >= 0) {
                    this.coordX -= distanceDeplacement;
                }
            } else if (key == touches[3]) {
                if (this.coordX + distanceDeplacement <= largeurTerrain - 100) {
                    this.coordX += distanceDeplacement;
                }
            } else if (code == touches[4]) {
                this.attaquer();
            } else if (key == touches[5] && nbrParBonus["alliance_rebels"] > 0) {
                let nInventaire = document.getElementById("inventaire0");
                nbrParBonus["alliance_rebels"]--;
                nInventaire.innerText = "x" + nbrParBonus["alliance_rebels"];
                
                listeBonusDispo[0].bonusAllianceRebels();
                listeBonusDispo.pop(0);
            } else if (key == touches[6] && nbrParBonus["vie"] > 0) {
                let nInventaire = document.getElementById("inventaire1");
                nbrParBonus["vie"]--;
                nInventaire.innerText = "x" + nbrParBonus["vie"];
                
                listeBonusDispo[0].bonusVie();
                listeBonusDispo.pop(0);
            } else if (key == touches[7] && nbrParBonus["meth_bleu"] > 0) {
                let nInventaire = document.getElementById("inventaire2");
                nbrParBonus["meth_bleu"]--;
                nInventaire.innerText = "x" + nbrParBonus["meth_bleu"];
                
                listeBonusDispo[0].bonusMethBleu();
                listeBonusDispo.pop(0);
            } else if (key == touches[8] && nbrParBonus["invincibilite"] > 0) {
                let nInventaire = document.getElementById("inventaire3");
                nbrParBonus["invincibilite"]--;
                nInventaire.innerText = "x" + nbrParBonus["invincibilite"];
                
                listeBonusDispo[0].bonusInvincibilite();
                listeBonusDispo.pop(0);
            }

            joueur.style.top = this.coordY + "px";
            joueur.style.left = this.coordX + 50 + "px";

            for (let _bonus in listeBonus) {
                if ((listeBonus[_bonus].coordX == this.coordX) && (this.coordY == listeBonus[_bonus].coordY)) {
                    listeBonus[_bonus].ajouterBonus();
                    listeBonus[_bonus].supprimerBonus();
                }
            }
        }
    }

    attaquer() {
        if (surPause == false && refroidissement == 1) {
            let tire = new Tire("joueur", this.coordX, this.coordY);
            tire.tire();
            refroidissement = 0;
            setTimeout(() => {refroidissement = 1}, 200);
        }
    }

    perdreVie() {
        if (surPause == false) {
            let vie = document.getElementById("vieJoueur");

            this.vie -= degatEnnemi;
            vie.style.width = this.vie + "px";
            vie.style.backgroundColor = "red";

            setTimeout(() => {vie.style.backgroundColor = "var(--rose)";}, 1000);

            if (this.vie <= 0) {
                this.mourir();
            }
        }
    }

    mourir(boss) {
        let joueur = document.getElementById("joueur");

        if (boss) {
            sessionStorage.setItem("boolGagne", "gagne");
        } else {
            sessionStorage.setItem("boolGagne", "perdu");
            let sonExplosion = new Audio("son/son_explosion.mp3");
            joueur.style.width = "100px";
            joueur.style.backgroundImage = "url(img/explosion.png)";
            sonExplosion.play();
        }

        sessionStorage.setItem("nbrEnnemis", nbrEnnemi);
        sessionStorage.setItem("nbrTires", nbrTire);
        sessionStorage.setItem("nbrEnnemisTues", nbrEnnemiTue);
        sessionStorage.setItem("score", score);
        sessionStorage.setItem("temps", temps);
        sessionStorage.setItem("ratio", (nbrTire / nbrEnnemiTue).toFixed(2));

        setTimeout(() => {document.location.replace("resultat.html");}, 1000);
    }
}

class Ennemi {
    constructor(id, vie, coordX, coordY) {
        this.id = id;
        this.vie = vie;
        this.coordX = coordX;
        this.coordY = coordY;
    }

    afficherEnnemi() {
        if (surPause == false) {
            let ennemi = document.createElement("div");
            ennemi.setAttribute("id", "ennemi" + this.id);
            ennemi.classList.add("ennemi");

            ennemi.style.left = this.coordX + 50 + "px";
            ennemi.style.top = this.coordY + "px";

            terrain.appendChild(ennemi);
        }
    }

    bougerEnnemi() {
        if (surPause == false) {
            let ennemi = document.getElementById("ennemi" + this.id);
    
            setInterval(() => {
                if (surPause == false) {
                    if (this.coordY > window.innerHeight) {
                        this.mourirEnnemi();
                    } else {
                        if (this.vie == true) {
                            this.coordY += 5;
                            ennemi.style.top = this.coordY + "px";
                        }
                    }
                }
            }, 50);
        }
    }

    attaquerEnnemi() {
        if (surPause == false && this.vie == true) {
            setInterval(() => {
                if (surPause == false && this.vie == true) {
                    let tire = new Tire("ennemi", this.coordX, this.coordY);
                    tire.tire();
                }
            }, 1500);
        }
    }

    mourirEnnemi(tueParJoueur) {
        if (surPause == false && this.vie == true) {
            let ennemi = document.getElementById("ennemi" + this.id);
            let sonExplosion = new Audio("son/son_explosion.mp3");
            sonExplosion.play();
            sonExplosion.volume = 0.5;

            this.vie = false;
            delete ennemis[this.id];

            ennemi.style.backgroundImage = "url(img/explosion.png)";
            setTimeout(() => {ennemi.remove();}, 500)

            if (tueParJoueur == true) {
                nbrEnnemiTue++;
                score += 100;
            } else {
                joueur.perdreVie();
            }
        }
    }
}

class Boss {
    constructor(id, vie, coordX, coordY, vieBoss) {
        this.id = id;
        this.vie = vie;
        this.coordX = coordX;
        this.coordY = coordY;
        this.vieBoss = vieBoss;
    }

    afficherBoss() {
        let boss = document.createElement("div");
        boss.setAttribute("id", "boss");
        boss.classList.add("boss");

        boss.style.backgroundImage = "url(img/boss.png)";
        boss.style.left = this.coordX + "px";
        boss.style.top = this.coordY + "px";

        terrain.appendChild(boss);
    }

    afficherVieBoss() {
        let infoBoss = document.createElement("div");
        let vieBossCadre = document.createElement("div");
        let vieBoss = document.createElement("div");
        let nomBoss = document.createElement("div");

        vieBossCadre.setAttribute("id", "vieBossCadre");
        vieBoss.setAttribute("id", "vieBoss");
        
        infoBoss.classList.add("infoBoss");
        vieBossCadre.classList.add("vieBossCadre");
        vieBoss.classList.add("vieBoss");

        nomBoss.innerText = "Dark Vador";
        nomBoss.style.padding = "5px";
        vieBoss.style.width = this.vieBoss / 2 + "px";
        infoBoss.style.top = this.coordY - 50 + "px";
        infoBoss.style.left = this.coordX - 50 + "px"

        terrain.appendChild(infoBoss);
        infoBoss.appendChild(nomBoss);
        infoBoss.appendChild(vieBossCadre);
        vieBossCadre.appendChild(vieBoss);
    }

    perdreVieBoss() {
        let vieBoss = document.getElementById("vieBoss");
        this.vieBoss -= 10;
        vieBoss.style.width = this.vieBoss / 2 + "px";
        if (this.vieBoss == 0) {
            this.mourirBoss();
        }
    }

    mourirBoss() {
        if (surPause == false) {
            let boss = document.getElementById("boss");
            boss.style.animation = "vibre 0.2s infinite ease-in";
            setTimeout(() => {joueur.mourir(true);}, 5000);
            setInterval(() => {
                if (surPause == false) {
                    setTimeout(() => {
                        boss.style.height = "150px";
                        boss.style.backgroundImage = "url(img/explosion.png)";
                        let explosion = new Audio("son/son_explosion.mp3");
                        explosion.play();
                    }, 375);
                    boss.style.backgroundImage = "url(img/boss.png)";
                    boss.style.height = "100px";
                }
            }, 750);
        }
    }

    bougerBoss() {
        let _boss = document.getElementById("boss");
        let infoBoss = document.querySelector(".infoBoss");
        bouger("droite");
        setInterval(() => {if (surPause == false) boss.laserBoss()}, 5000);
        function bouger(direction) {
            if (surPause == false) {
                setTimeout(() => {
                    if (direction == "droite") {
                        if (boss.coordX + distanceDeplacement <= window.innerWidth - 75) {
                            boss.coordX += distanceDeplacement;
                        } else {
                            direction = "gauche";
                        }
                    } else if (direction == "gauche") {
                        if (boss.coordX - distanceDeplacement > 0) {
                            boss.coordX -= distanceDeplacement;
                        } else {
                            direction = "droite";
                        }
                    }
                    _boss.style.left = boss.coordX + "px";
                    infoBoss.style.left = boss.coordX - 50 + "px";
                    bouger(direction);
                    let tire = new Tire("ennemi", boss.coordX, boss.coordY);
                    tire.tire();
                }, 500);
            }
        }
    }

    laserBoss() {
        let nbrLaser = 0;
        laser();
        function laser() {
            if (surPause == false) {
                setTimeout(() => {
                    if (nbrLaser < 10) {
                        let tire = new Tire("ennemi", boss.coordX, boss.coordY);
                        tire.tire();
                        nbrLaser++;
                        laser();
                    }
                }, 50);
            }
        }
    }
}

class Bonus {
        constructor(id, nom, coordX, coordY) {
        this.id = id;
        this.nom = nom;
        this.coordX = coordX;
        this.coordY = coordY;
    }

    afficherBonus() {
        if (surPause == false) {
            let bonus = document.createElement("div");
            bonus.setAttribute("id", "bonus" + this.id);
            bonus.classList.add("bonus");

            bonus.style.backgroundImage = "url(img/" + this.nom + ".png)";
            bonus.style.left = this.coordX + 50 + "px";
            bonus.style.top = this.coordY + 25 + "px";

            terrain.appendChild(bonus);
        }
    }

    supprimerBonus() {
        let bonus = document.getElementById("bonus" + this.id);
        bonus.remove();
        listeBonus.pop(this.id);
    }

    ajouterBonus() {
        let caseInventaire = document.getElementById("inventaire" + bonusDiff.indexOf(this.nom));
        nbrParBonus[this.nom] += 1;
        caseInventaire.innerText = "x" + nbrParBonus[this.nom]
    }

    bonusAllianceRebels() {
        let rebels = [];
        for (let i = 0; i < largeurTerrain / distanceDeplacement; i++) {
            let rebel = document.createElement("div");
            rebel.classList.add("rebels");

            rebel.style.left = distanceDeplacement * i + 50 + "px";
            rebel.style.top = window.innerHeight + 100 + "px";
            rebels.push(rebel);
            terrain.appendChild(rebel);
        }

        let rebelId = 0;
        rebels.forEach((e) => {
            if (surPause == false) {   
                rebelId++;
                setTimeout(() => {
                    e.style.top = window.innerHeight - 150 + "px";
                }, 500)
            }
        });

        let nbrAttaque = 0;
        function rebelsAttaque() {
            setTimeout(() => {
                let tireID = 0;
                setInterval(() => {
                    if (surPause == false) {
                        if (tireID <= rebels.length) {
                            let tire = new Tire("rebel", distanceDeplacement * tireID, Math.round(window.innerHeight / 10) * 10 - 150);
                            tire.tire();
                            tireID++;
                        }
                    }
                }, 100);

                nbrAttaque++;
                if (nbrAttaque < 3) {
                    rebelsAttaque();
                } else {
                    if (surPause == false) {
                        setTimeout(() => {
                            let rebelId = 0;
                            rebels.forEach((e) => {
                                rebelId++;
                                setTimeout(() => {
                                    e.style.top = window.innerHeight + 100 +"px";
                                    setTimeout(() => { e.remove(); }, 500);
                                }, 500)
                            });
                        }, 1000);
                    }
                }
            }, 1000)
        }
        rebelsAttaque();
    }

    bonusVie() {
        if (joueur.vie < 200) {
            let vie = document.getElementById("vieJoueur");
            joueur.vie += degatEnnemi;
            vie.style.width = joueur.vie + "px";
        }
    }

    bonusMethBleu() {
        let musiqueMeth = new Audio("son/son_meth_bleu.mp3");
        musiqueMeth.play();
        musiqueMeth.volume = 0.25;
        let nbrAttaque = 0;
        attaqueRapide();
        function attaqueRapide() {
            setTimeout(() => {
                if (nbrAttaque < 20) {
                    let tire = new Tire("joueur", joueur.coordX, joueur.coordY);
                    tire.tire();
                    attaqueRapide();
                    nbrAttaque++;

                    document.body.filter = "blur(10px)";
                    setTimeout(() => {document.body.filter = "blur(0px)";}, 90);
                }
            }, 100);
        }
        setTimeout(() => {musiqueMeth.pause();}, 4000);
    }

    bonusInvincibilite() {
        if (surPause == false) {
            document.getElementById("vieJoueur").style.backgroundColor = "var(--blue)";
            degatEnnemi = 0;
            setTimeout(() => {
                degatEnnemi = controleDifficulte();
                vie.style.backgroundColor = "var(--rose)";
            }, 5000);
        }
    }
}

class Tire {
    constructor(tireur, coordX, coordY) {
        this.tireur = tireur;
        this.coordX = coordX;
        this.coordY = coordY;
    }

    tire() {
        let tire = document.createElement("div");

        if (this.tireur == "joueur" || this.tireur == "rebel") {
            let sonJoueur = new Audio("son/son_tire_joueur.mp3");
            sonJoueur.play();
            sonJoueur.volume = 0.05;
            if (this.tireur == "joueur") {
                tire.style.backgroundImage = "url(img/tire_joueur.png)";
                nbrTire++;
            } else if (this.tireur == "rebel") {
                tire.style.backgroundImage = "url(img/tire_rebel.png)";
            }
        } else if (this.tireur == "ennemi") {
            let sonEnnemi = new Audio("son/son_tire_ennemi.mp3");
            sonEnnemi.play();
            sonEnnemi.volume = 0.05;
            tire.style.backgroundImage = "url(img/tire_ennemi.png)";
        }

        tire.setAttribute("id" , nbrTire);
        tire.classList.add("tire");

        tire.style.left = this.coordX + 50 + "px";
        tire.style.top = this.coordY + "px";

        terrain.appendChild(tire);

        setInterval(() => {
            if (surPause == false) {
                if (this.coordY <= 0 || this.coordY > window.innerHeight) {
                    tire.remove();
                    delete this;
                } else {
                    if (this.tireur == "joueur" || this.tireur == "rebel") {
                        this.coordY -= 5;
                        for (let ennemi in ennemis) {
                            if ((ennemis[ennemi].coordX == this.coordX) && (this.coordY == ennemis[ennemi].coordY)) {
                                if (ennemis[ennemi].id == "boss") {
                                    ennemis[ennemi].perdreVieBoss();
                                } else {
                                    ennemis[ennemi].mourirEnnemi(true);
                                }
                                this.coordX = undefined;
                                tire.remove();
                            }
                        }
                    } else if (this.tireur == "ennemi") {
                        this.coordY += 5;
                        if (this.coordX == joueur.coordX && this.coordY == joueur.coordY) {
                            joueur.perdreVie();
                            tire.remove();
                        }
                    }

                    tire.style.top = this.coordY + "px";
                }
            }
        }, 1)
    }
}


// Programme principale
// ====================

lancerJeu();
creerTerrain();

let musique = new Audio("son/son_principale.mp3");

let joueur = new Joueur(controleNom(), 200, 100, distanceDeplacement, Math.round(window.innerHeight / 10) * 10 - distanceDeplacement);
joueur.afficherInfo();
joueur.afficherJoueur();
document.addEventListener("keydown", (e) => {joueur.bougerJoueur(e.key, e.code, e.which);});
document.addEventListener("keydown", (e) => {joueur.bougerJoueur("","","");});

setInterval(() => {
    if (surPause == false) {
        temps += 1;
        score += 100;
        document.getElementById("scoreJoueur").innerText = "Score: " + score;

        if (score % 1000 == 0 && temps != 0) {
            genererBonus();
        }

        if (temps == 120) {
            document.body.style.backgroundImage = "url(img/fond_boss.png)";
            setTimeout(() => {
                musique.pause();
                musique = new Audio("son/son_boss.mp3");
                musique.volume = 0.1;
                musique.play();
                boss = new Boss(id = "boss", vie = true, coordX = 0, coordY = distanceDeplacement, vieBoss = 200);
                boss.afficherBoss();
                boss.afficherVieBoss();
                boss.bougerBoss();
                ennemis.push(boss);
            }, 2000);
        } else if (temps < 120){
            genererEnnemi();
        }
    }
}, 1000);

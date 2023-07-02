// __________________________________________Classes________________________________________________________

// Classe pure virtuelle au possible
class Entity {
    Update() { }
    Draw() { }
}

class Ile extends Entity {
    #id;                    // ID au sens HTML du terme de l'image associée à cette entité
    #x; #y;                 // Position de monde
    #screen_x; #screen_y;   // Position relative à la caméra (position finale, sur l'écran quoi)
    #speed_x; #speed_y;

    #width;
    #height;
    #screen_width;
    #screen_height;

    #anims                  // Liste de listes d'images (1 elem = 1 animation de plusieurs frames, chaque frame = 1 path d'image)
    #anim_actuelle;         // indice dans anims de l'animation en train de se jouer
    #frame_actuelle;
    #compt;                 // Compteur qui compte les passages de boucle pour savoir quand passer a la frame suivante

    constructor(id, x0, y0, vx, vy, width, height, anims) {
        super();
        this.#id = id;
        this.#anims = anims;
        this.#compt = 0;

        this.#x = x0;
        this.#y = y0;
        this.#screen_x = this.#x;
        this.#screen_y = this.#y;

        this.#speed_x = vx;
        this.#speed_y = vy;

        this.#width = width;
        this.#height = height;
        this.#screen_width = width;
        this.#screen_height = height;

        this.#anim_actuelle = 0;
        this.#frame_actuelle = 0;
    }

    get_x() { return this.#x; }
    get_y() { return this.#y; }
    get_w() { return this.#width; }
    get_h() { return this.#height; }

    get_screen_w() { return this.#screen_width; }
    get_screen_h() { return this.#screen_height; }
    get_speed() { return this.#speed_x; }

    set_screen_x(v) { this.#screen_x = v; }
    set_screen_y(v) { this.#screen_y = v; }
    set_screen_w(v) { this.#screen_width = v; }
    set_screen_h(v) { this.#screen_height = v; }

    Update() {
        this.#compt++;
        if (this.#compt % 10 == 0)
            this.#frame_actuelle = (this.#frame_actuelle + 1) % (this.#anims[this.#anim_actuelle]).length;

        this.#x += this.#speed_x;
        this.#y += this.#speed_y;

        if (this.#y >= 1000 || this.#y < 0) {
            this.#speed_y *= -1;
        }
        if (this.#x >= 600 || this.#x < 0) {
            this.#speed_x *= -1;
        }
    }
    Draw() {
        let image = document.getElementById(this.#id);

        // On suppose qu'il y a bien eu une caméra qui met à jour this.#screen_x/y, this.#screen_width/height
        image.style.top = this.#screen_y + "px";
        image.style.left = this.#screen_x + "px";

        image.style.width = this.#screen_width + "px";
        image.style.height = this.#screen_height = "px";

        image.src = this.#anims[this.#anim_actuelle][this.#frame_actuelle];
    }
}


class Camera extends Entity {
    #following;             // Reference a l'ile que la camera est en train de suivre

    #x; #y;
    #target_x; #target_y;   // Objectif a atteindre pour la position
    #time_anim;              // incrément de x et y pour les animations
    #x_ref; #y_ref;         // pos de la camera quand il y a pas de focus
    #zoom                   // Ce coefficient multiplie la taille de tout, littéralement
    #zoom_target;           // A la fin de l'animation de zoom, zoom aura atteint target
    #zoom_ref;
    #zoom_incr;
    #x_incr; #y_incr;

    constructor(following, zoom) {
        super();
        this.#following = following;
        this.#x_ref = 690;
        this.#y_ref = 300;
        this.#time_anim = 1;
        this.#x_incr = 1;
        this.#y_incr = 1;
        this.#zoom_incr = 1.0 / 60;

        this.#x = this.#x_ref;
        this.#y = this.#y_ref;

        if (this.#following == null) {
            this.#target_x = this.#x_ref;
            this.#target_y = this.#y_ref;
        }
        else {
            this.#target_x = this.#following.get_x();
            this.#target_y = this.#following.get_y();
        }
        this.#x_incr = (this.#target_x - this.#x) / 60;
        this.#y_incr = (this.#target_y - this.#y) / 60;

        this.#zoom = 1.0;
        this.#zoom_ref = 2.0;
        this.#zoom_target = zoom;
    }

    set_focus(e) {
        this.#following = e;
        if (e == null) {
            this.#zoom_target = 1.0;
            this.#target_x = this.#x_ref;
            this.#target_y = this.#y_ref;
        }
        else {
            this.#zoom_target = this.#zoom_ref;
            this.#target_x = this.#following.get_x();
            this.#target_y = this.#following.get_y();
        }
        this.#x_incr = (this.#target_x - this.#x) / 60;
        this.#y_incr = (this.#target_y - this.#y) / 60;
    }

    avancer_anim() {
        if (((-this.#zoom_incr + this.#zoom_target) < this.#zoom) && (this.#zoom < (this.#zoom_incr + this.#zoom_target))) {
            // rien ptdr je suis crevé
        }
        else if (this.#zoom < this.#zoom_target) {
            this.#zoom += this.#zoom_incr;
        }
        else {
            this.#zoom -= this.#zoom_incr;
        }

        if (((- 4 + this.#target_x) < this.#x) && (this.#x < (4 + this.#target_x))) {
            // idem
        }
        else {
            this.#x += this.#x_incr;
        }

        if (((- 4 + this.#target_y) < this.#y) && (this.#y < (4 + this.#target_y))) {
            // idem
        }
        else {
            this.#y += this.#y_incr;
        }
    }

    Update() {
        if (this.#following != null) {
            this.#target_x = this.#following.get_x();
            this.#target_y = this.#following.get_y();
            // this.#x_incr = (this.#target_x - this.#x) / 60;
            // this.#y_incr = (this.#target_y - this.#y) / 60;
        }

        this.avancer_anim();
        console.log("x, target_x, y, target_y, zoom, target_zoom", this.#x, this.#target_x, this.#y, this.#target_y, this.#zoom, this.#zoom_target);
    }

    // Met à jour toutes les entités de l (en dehors de la camera)
    // Pour que leur position relative soit bien relative a la position de la caméra
    Changement_de_repere(l) {
        for (const e of l) {
            if (e.constructor.name != "Camera") {
                e.set_screen_w(e.get_w() * this.#zoom);
                e.set_screen_h(e.get_h() * this.#zoom);

                e.set_screen_x(this.#zoom * (e.get_x() - this.#x) + window.screen.width / 2 - e.get_screen_w() / 2);
                e.set_screen_y(this.#zoom * (e.get_y() - this.#y) + window.screen.height / 2 - e.get_screen_h() / 2);
            }
        }
    }

    Draw() {
        // La caméra va pas se dessiner...
    }
}


// __________________________________________Programme principal__________________________________________

entities = []
cam = null;

function focus_kaki() { cam.set_focus(entities[0]); }
function focus_ile1() { cam.set_focus(entities[1]); }
function focus_ile2() { cam.set_focus(entities[2]); }
function focus_ile3() { cam.set_focus(entities[3]); }

document.addEventListener('keyup', (event) => {
    var code = event.code;
    switch (code) {
        case 'Escape':
            cam.set_focus(null, 1);
            console.log("yo");
            break;
        default:
            break;
    }
}, false);

function loop() {

    for (const e of entities) {
        e.Update();
    }

    cam.Changement_de_repere(entities);

    for (const e of entities) {
        e.Draw();
    }

    requestAnimationFrame(loop);
}

function main() {
    // Instanciation de tout ce dont on aura besoin

    var kaki = new Ile("kaki", 0, 300, 2, -2, 64, 64, [["assets/kaki/1.png", "assets/kaki/2.png", "assets/kaki/3.png", "assets/kaki/4.png"]])
    entities.push(kaki);

    var i1 = new Ile("ile1", 200, 300, 0, 0, 512, 512, [["assets/ile1.png"]]);
    entities.push(i1);

    var i2 = new Ile("ile2", 700, 30, 0, 0, 512, 512, [["assets/ile2.png"]]);
    entities.push(i2);

    var i3 = new Ile("ile3", 1200, 400, 0, 0, 512, 512, [["assets/ile3.png"]]);
    entities.push(i3);

    cam = new Camera(null, 1.0)
    entities.push(cam);


    requestAnimationFrame(loop);
}

main();
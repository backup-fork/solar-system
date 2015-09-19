function initialize(){
    //alert("hello!");
    c = document.getElementById("solar_system");
    c.width = window.innerWidth || document.body.clientWidth;
    c.height = window.innerHeight || document.body.clientHeight;

    ctx = c.getContext("2d");

    ctx.fillStyle = "red";

    Xpos = 0;
    Ypos = 0;
    Xvel = 0;
    Yvel = 0;

    size = 20;
    move_vel = 3;


    lastframe = Date.now();
    var timer;
    clearInterval(timer);
    timer = setInterval(function(){update()}, 1);

    clouds = new Array();
    clouds[0] = new Point(10, 10);
    clouds[1] = new Point(20, 20);

    starttime = Date.now();
    frames = 0;

    fps = 0;

    // Load images
    imageObj = new Image();

    images = new Array();
    images[0] = "clouds.gif";

    n_images = 1;

    for (var i = 0; i < n_images; i++){
        imageObj.src=images[i]
    }

}

function drawBox(x, y){
    ctx.fillStyle = "#FF0000";
    ctx.fillRect(x, y, size, size);
}

function drawCirc(x, y){
    now = Date.now();
}

function drawPlayer(x, y){
    //drawBox(x, y);
    fish = new Image();
    fish.src = "fishie.png";
    var scale = 0.5;

    ctx.save();
    if (Xvel > 0){
        ctx.scale(-1, 1);
    }
    ctx.translate(x + fish.width/2*scale, y + fish.height/2*scale);
    //ctx.rotate(0.5);
    ctx.drawImage(fish, 0, 0, fish.width*scale, fish.height*scale);
    ctx.restore();
}

function update(){
    now = Date.now()
    dt = (now - lastframe)/1000;
    lastframe = now;

    draw()

    // *** compute fps *** //
    if (frames % 10 == 0){
        time = Date.now();
        fps = frames / (time - starttime) * 1000;
        fps = parseInt(fps);
    }

    if (frames % 1000 == 0){
        starttime = Date.now();
        frames = 0;
    }
    frames++;
}

function Point (x, y){
    this.x = x;
    this.y = y;
}

// needs work
function Rect(bottomleft, topright){
    this.bottomleft = bottomleft;
    this.topright = topright;
}

function collideRect(r1, r2){
    return false;
}

function draw(){
    //ctx.clearRect(0, 0, c.width, c.height);

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, c.width, c.height);


    drawBox(10, 10);

    ctx.font="20px Georgia";
    ctx.fillText(fps, c.width - 40, c.height - 5);
}

function keyDown(e){
    //alert("Keycode: " + e.keyCode);
    kc = e.keyCode;
    if(kc == 37)
        Xpos = Xpos - move_vel;
    if(kc == 38)
        Ypos = Ypos - move_vel;
    if(kc == 39)
        Xpos = Xpos + move_vel;
    if(kc == 40)
        Ypos = Ypos + move_vel;
}

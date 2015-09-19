function initialize(){
    //alert("hello!");
    c = document.getElementById("myCanvas");
    ctx = c.getContext("2d");

    lastframe = Date.now();
    starttime = Date.now();
    frames = 0;
    fps = 0;

    planets = [];
    //planets[0] = new Planet(100, 100);

    //p = new Planet(10, 10);

    //var timer;
    sim_loop = setInterval(function(){loop()}, 16);
    //clearInterval(timer);
}

function loop(){
    now = Date.now()
    dt = (now - lastframe)/1000;
    lastframe = now;

    if (dt > 0.1)
        return;


    //ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, c.width, c.height);

    G = 10000;
    a = 10;
    for (var i = 0; i < planets.length; i++){
        p1 = planets[i];
        fx = 0;
        fy = 0;
        for (var j = 0; j < planets.length; j++){
            if (i == j)
                continue;
            p2 = planets[j];
            rx = p2.x - p1.x;
            ry = p2.y - p1.y;
            r = Math.sqrt( rx*rx + ry*ry );

            fx += G * p1.m * p2.m * rx / (r*r*r + a*a*a);
            fy += G * p1.m * p2.m * ry / (r*r*r + a*a*a);
        }
        p1.vx += fx * dt / p1.m;
        p1.vy += fy * dt / p1.m;
    }

    for (var i = 0; i < planets.length; i++){
        p = planets[i];
        p.x += p.vx*dt;
        p.y += p.vy*dt;
    }


    for (var i = 0; i < planets.length; i++){
        p = planets[i];
        draw_circ(p.x, p.y, 10);
    }

    // *** compute fps *** //
    if (frames % 100 == 0){
        time = Date.now();
        fps = frames / (time - starttime) * 1000;
        fps = parseInt(fps);
    }

    if (frames % 1000 == 0){
        starttime = Date.now();
        frames = 0;
    }

    frames++;

    ctx.font="20px Georgia";
    ctx.fillText(fps, c.width - 40, c.height - 5);
}

function Planet(x, y, vx, vy, m){
    this.x  = x;
    this.y  = y;
    this.vx = vx;
    this.vy = vy;
    this.m  = m;
}

function draw_circ(x, y, r){
    ctx.beginPath();
    ctx.fillStyle = "#FFFFFF";
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
}

function new_planet_loop(){
}

function mouseDown(e){
    //alert(e.screenX + " " + e.screenY);
    x = e.clientX - c.offsetLeft;
    y = e.clientY - c.offsetTop;

    planets.push( new Planet(x, y, 0, 0, 1) );

    clearInterval(sim_loop);
}

function mouseUp(e){
    sim_loop = setInterval(function(){loop()}, 16);
}

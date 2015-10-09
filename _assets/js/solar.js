function initialize(){
    //alert("hello!");
    c = document.getElementById("solar_system");

    ctx = c.getContext("2d");

    // boolean of keys currently pressed
    keys = [];

    speed_multiplier = 1;
    paused = -1; // -1 = not paused, 1 = paused

    trail_length = 200;

    lastframe = Date.now();
    starttime = Date.now();
    frames = 0;
    fps = 0;

    planets = [];

    mode = "sim";

    fps = 60; // frames/sec
    mspf = 1 / fps * 1000; // ms per frame

    sim_loop = setInterval(function(){loop()}, mspf);
}

function force( p, planets ){
    var fx = 0;
    var fy = 0;
    for (var j = 0; j < planets.length; j++){
        p2 = planets[j];

        if (p.x == p2.x && p.y == p2.y)
            continue;

        rx = p2.x - p.x;
        ry = p2.y - p.y;
        r = Math.sqrt( rx*rx + ry*ry );

        r = r / 30;

        fx += G * p.m * p2.m * rx / (r*r*r + a*a*a);
        fy += G * p.m * p2.m * ry / (r*r*r + a*a*a);
    }
    return [fx, fy];
}

function loop(){
    now = Date.now();
    dt = (now - lastframe)/1000;
    lastframe = now;

    dt *= speed_multiplier;

    trail_length = 4 * trails_slider.value;

    if (trails_slider.value == 100){
        trail_length = Number.MAX_VALUE;
    }

    if (paused == 1){
        draw();
        return;
    }

    if (dt > 0.2)
        return;

    //G = 10000;
    G = 4 * Math.pi^2; // AU^3 yr^-2 Ms^-1
    a = 10;
    for (var i = 0; i < planets.length; i++){
        p = planets[i];
        f = force( p, planets);
        fx = f[0];
        fy = f[1];
        p.vx += fx * dt / p.m;
        p.vy += fy * dt / p.m;

        if (p.frozen == 1){
            p.vx = 0;
            p.vy = 0;
        }
    }

    for (var i = 0; i < planets.length; i++){
        p = planets[i];
        p.x += p.vx*dt;
        p.y += p.vy*dt;

        p.prev_x.push(p.x);
        p.prev_y.push(p.y);

        while (p.prev_x.length > trail_length){
            p.prev_x.shift();
            p.prev_y.shift();
        }
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

    draw();

    frames++;

}

function draw(){
    //ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#263238";
    //ctx.fillStyle = "rgba(38, 50, 56, 0.9)";
    var da = 0.1;
    ctx.fillRect(0, 0, c.width, c.height);

    for (var i = 0; i < planets.length; i++){
        planets[i].draw();
    }
    ctx.fillStyle = "#4A90E2";
    ctx.font="13px Helvetica";
    ctx.fillText(fps + " FPS", c.width - 50, c.height - 6);
}

function Planet(x, y, vx, vy, m){
    this.x  = x;
    this.y  = y;
    this.vx = vx;
    this.vy = vy;
    this.m  = m;

    // -1 = not frozen, 1 = frozen
    this.frozen = -1; 

    this.count = 0;

    this.prev_x = [];
    this.prev_y = [];

    this.draw = function(){
        draw_circ(this.x, this.y, radius( this.m ));
        draw_trail(this.prev_x, this.prev_y);
    };
}

function radius(m){
    return 2*Math.pow(m, 1./3);
}

function draw_circ(x, y, r){
    ctx.beginPath();
    ctx.fillStyle = "#FFFFFF";
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
}

function draw_trail(xs, ys){
    var n_steps = 40; // number of segments to draw for the tail


    var a = 0.2; // initial opacity

    var di = Math.max(1,  Math.floor(xs.length / n_steps));
    var da = a / (xs.length / di);

    var rgb = "rgba(255, 255, 255, ";
    ctx.lineWidth = 2;


    // if it's an infinite trail, just draw it all at one opacity
    if (trail_length == Number.MAX_VALUE){
        ctx.strokeStyle = rgb + a;

        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (var i = 1; i < xs.length; i++){
            ctx.lineTo(xs[i], ys[i]);
        }
        ctx.stroke();
        ctx.closePath();
    }

    // otherwise draw a fading trail
    for (var i = xs.length - 1; i > di; i -= di){
        ctx.strokeStyle = rgb + a;

        ctx.beginPath();

        ctx.moveTo(xs[i], ys[i]);
        ctx.lineTo(xs[i - di], ys[i - di]);

        ctx.stroke();
        ctx.closePath();

        a -= da;
    }
}

function mass_loop(){
    now = Date.now();

    held = (now - start_planet)/100;

    mass = held*held;

    planets[planets.length - 1].m = mass;

    draw();
}

function sign(x){
    if (x > 0)
        return 1;
    if (x < 0)
        return -1;
    return 0;
}

function mouseDown(e){
    //alert(e.screenX + " " + e.screenY);
    x = e.clientX - c.offsetLeft;
    y = e.clientY - c.offsetTop;


    if (mode == "sim"){
        for (var i = 0; i < planets.length; i++){
            p = planets[i];

            dx = x - p.x;
            dy = y - p.y;

            rad = radius( p.m );

            if (dx*dx + dy*dy <= rad*rad){
                p.frozen *= -1;
                return;
            }
        }

        clearInterval(sim_loop);

        start_planet = Date.now();
        planets.push( new Planet(x, y, 0, 0, 1) );

        mode = "mass";
        mass_timer = setInterval(function(){
            mass_loop()}, mspf);
    }
    if (mode == "vec"){

        mode = "sim";
        sim_loop = setInterval(function(){loop()}, mspf);
    }
}

function mouseUp(e){
    if (mode == "mass"){
        clearInterval(mass_timer);
        mode = "vec";
    }
}

function trajectory(){
    q = planets[ planets.length - 1 ];

    plans = planets.slice(0, planets.length-1);

    p = new Planet( q.x, q.y, q.vx, q.vy, q.m );

    var dt = 0.01;
    var xs = []
    var ys = []

    for (var i = 1; i < 1000; i++){
        f = force(p, plans);
        fx = f[0];
        fy = f[1];

        p.vx += dt * fx/p.m;
        p.vy += dt * fy/p.m;

        p.x += dt * p.vx;
        p.y += dt * p.vy;

        xs.push(p.x);
        ys.push(p.y);
    }

    // draw the trajectory
    dottedstroke(xs, ys);
}

function dottedstroke(xs, ys){
    //ctx.strokeStyle = "#FFFFFF";
    ctx.strokeStyle = "rgba(250, 128, 114, 0.4)";
    ctx.beginPath();
    ctx.moveTo(xs[0], ys[0]);
    ctx.lineCap = "round";
    var count = 0;
    var max_count = 3;
    for (var i = 0; i < xs.length; i++){
        if ( count == 0 ){
            ctx.moveTo(xs[i], ys[i]);
        }

        ctx.lineTo(xs[i], ys[i]);
        count++;

        if (count == max_count){
            i += max_count;
            count = 0;
        }
    }
    ctx.stroke();
    ctx.lineCap = "butt";
}

function mouseMove(e){
    x = e.clientX - c.offsetLeft;
    y = e.clientY - c.offsetTop;
    if (mode == "vec"){
        draw();

        p = planets[planets.length-1];

        dx = x - p.x;
        dy = y - p.y;

        if (dx == 0)
            p.vx = 0;
        else
            p.vx = dx;
        if (dy == 0)
            p.vy = 0;
        else
            p.vy = dy;


        ctx.strokeStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(x, y);
        ctx.stroke();

        trajectory();
    }

}

function keyDown(e){
    kc = e.keyCode;
    //alert(kc);

    keys[kc] = true;


    // space bar
    if (kc == 32){
        paused *= -1;
    }

    // c
    if (kc == 67){
        // control key already pressed
        if (keys[17]){
            planets = [];
        }
    }

    // escape
    if (kc == 27){
        if (mode == "vec"){
            p = planets[ planets.length - 1 ];
            p.vx = 0;
            p.vy = 0;
            mode = "sim";
            sim_loop = setInterval(function(){loop()}, mspf);
        }
    }
}

function keyUp(e){
    kc = e.keyCode;
    keys[kc] = false;
}

function reverse_particles(){
    for (var i = 0; i < planets.length; i++){
        planets[i].vx *= -1;
        planets[i].vy *= -1;
    }
}

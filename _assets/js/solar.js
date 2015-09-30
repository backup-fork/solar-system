function initialize(){
    //alert("hello!");
    c = document.getElementById("solar_system");

    ctx = c.getContext("2d");

    lastframe = Date.now();
    starttime = Date.now();
    frames = 0;
    fps = 0;

    planets = [];

    mode = "sim";

    sim_loop = setInterval(function(){loop()}, 16);
}

function loop(){
    now = Date.now()
    dt = (now - lastframe)/1000;
    lastframe = now;

    if (dt > 0.1)
        return;



    //G = 10000;
    G = 4 * Math.pi^2; // AU^3 yr^-2 Ms^-1
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

            r = r / 30;

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

        p.prev_x.push(p.x);
        p.prev_y.push(p.y);
        if (p.prev_x.length > p.tail){
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

    ctx.font="20px Georgia";
    ctx.fillText(fps, c.width - 40, c.height - 5);
}

function Planet(x, y, vx, vy, m){
    this.x  = x;
    this.y  = y;
    this.vx = vx;
    this.vy = vy;
    this.m  = m;

    this.tail = 200;

    this.count = 0;

    this.prev_x = [];
    this.prev_y = [];

    this.draw = function(){
        draw_circ(this.x, this.y, 2*Math.pow(this.m, 1/3));
        draw_curve(this.prev_x, this.prev_y);
    };
}

function draw_circ(x, y, r){
    ctx.beginPath();
    ctx.fillStyle = "#FFFFFF";
    ctx.arc(x, y, r, 0, 2*Math.PI);
    ctx.fill();
    ctx.closePath();
}

function draw_curve(xs, ys){
    var a = 0.2;
    da = 0.001;
    var rgb = "rgba(255, 255, 255, ";

    ctx.strokeStyle = rgb + a;
    //ctx.lineCap = "round";
    ctx.lineWidth = 2;

    //ctx.beginPath();
    var n = xs.length - 1;
    //ctx.moveTo(xs[n], ys[n]);
    for (var i = n; i > 1; i--){
        ctx.strokeStyle = rgb + a;
        ctx.beginPath();
        ctx.moveTo(xs[i], ys[i]);
        ctx.lineTo(xs[i-1], ys[i-1]);
        ctx.stroke();
        ctx.closePath();
        a -= da;
    }
    //ctx.stroke();
    //ctx.closePath();

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
        clearInterval(sim_loop);

        start_planet = Date.now();
        planets.push( new Planet(x, y, 0, 0, 1) );

        mode = "mass";
        mass_timer = setInterval(function(){
            mass_loop()}, 16);
    }
    if (mode == "vec"){
        p = planets[planets.length-1];

        dx = x - p.x;
        dy = y - p.y;

        if (dx == 0)
            p.vx = 0;
        else
            p.vx = sign(dx)*20*Math.log(Math.abs(dx));
        if (dy == 0)
            p.vy = 0;
        else
            p.vy = sign(dy)*20*Math.log(Math.abs(dy));

        mode = "sim";
        sim_loop = setInterval(function(){loop()}, 16);
    }
}

function mouseUp(e){
    if (mode == "mass"){
        clearInterval(mass_timer);
        mode = "vec";
    }
}

function mouseMove(e){
    x = e.clientX - c.offsetLeft;
    y = e.clientY - c.offsetTop;
    if (mode == "vec"){
        draw();

        p = planets[planets.length-1];

        ctx.strokeStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

}

function keyDown(e){
    kc = e.keyCode;
    if (kc == 27){
        mode = "sim";
        sim_loop = setInterval(function(){loop()}, 16);
    }
}

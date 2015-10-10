var speed_control = document.getElementsByName("speed_control");
var speed_var;

function initialize(){
    //alert("hello!");
    c = document.getElementById("solar_system");

    ctx = c.getContext("2d");

    // boolean of keys currently pressed
    keys = [];

    speed_multiplier = 1;
    paused = -1; // -1 = not paused, 1 = paused
    collisions = 1;

    trail_length = 200;

    lastframe = Date.now();
    starttime = Date.now();
    frames = 0;
    fps = 0;

    planets = [];

    mode = "sim";

    fps = 100; // frames/sec
    mspf = 1 / fps * 1000; // ms per frame

    string2planets("&20#30#1#1#10&30#50#1#1#20");

    sim_loop = setInterval(function(){loop()}, mspf);

    /*
    p = new Planet(20, 30, 1, 1, 10);
    planets.push(p);
    p = new Planet(30, 50, 1, 1, 20);
    planets.push(p);


    console.log( planets2string() );
    */
}

function check_speed(){
    for (var i = 0, length = speed_control.length; i < length; i++) {
        if (speed_control[i].checked) {
            return speed_control[i].value;
            break;
        }
    }
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

    check_speed();
    if (check_speed() == 0.5)
        speed_multiplier = 0.25;
    else if (check_speed() == 1)
        speed_multiplier = 1;
    else
        speed_multiplier = 3;

    /*
    if (speed_var == 1)
        speed_multiplier = 0.25;
    else if (speed_var == 2)
        speed_multiplier = 1;
    else
        speed_multiplier = 4;
    */

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

    // compute the force
    G = 4 * Math.pi^2; // AU^3 yr^-2 Ms^-1
    G /= 100;
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

    // save old positions
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

    // collide planets
    if (collisions == 1){
        var temp_length = planets.length;
        for (var i = 0; i < temp_length-1; i++){
            for (var j = i+1; j < temp_length; j++){
                p1 = planets[i];
                p2 = planets[j];

                if (p1.destroyed || p2.destroyed)
                    continue;

                r1 = radius( p1.m );
                r2 = radius( p2.m );
                pos1 = [p1.x, p1.y];
                pos2 = [p2.x, p2.y];

                v = vec_sub( pos1, pos2 );
                norm = vec_norm( v );

                if (norm < r1 + r2){
                    // new particle at the center of mass
                    x = (p1.x * p1.m + p2.x * p2.m)/ (p1.m + p2.m);
                    y = (p1.y * p1.m + p2.y * p2.m)/ (p1.m + p2.m);

                    m = p1.m + p2.m;

                    // conserve momentum
                    vx = (p1.vx * p1.m + p2.vx * p2.m)/ m;
                    vy = (p1.vy * p1.m + p2.vy * p2.m)/ m;

                    p = new Planet( x, y, vx, vy, m);
                    planets.push( p );

                    p1.destroyed = true;
                    p2.destroyed = true;
                }

            }
        }
    }

    // get rid of destroyed planets
    new_planets = [];
    for (var i = 0; i < planets.length; i++){
        p = planets[i];
        if ( p.destroyed == false )
            new_planets.push( p );
    }
    planets = new_planets;



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

    this.destroyed = false;

    this.count = 0;

    this.prev_x = [];
    this.prev_y = [];

    this.draw = function(){
        draw_circ(this.x, this.y, radius( this.m ));
        if (trail_length != 0){
            draw_trail(this.prev_x, this.prev_y);
        }
    };
}

function vec_add( v1, v2 ){
    var v3 = [];
    for (var i = 0; i < v1.length; i++)
        v3.push( v1[i] + v2[i] );
    return v3;
}

function vec_sub( v1, v2 ){
    var v3 = [];
    for (var i = 0; i < v1.length; i++)
        v3.push( v1[i] - v2[i] );
    return v3;
}

function vec_dot( v1, v2 ){
    var sum = 0;
    for (var i = 0; i < v1.length; i++)
        sum += v1[i]*v2[i];
    return sum;
}

function vec_mul( a, v ){
    var v2 = [];
    for (var i = 0; i < v.length; i++)
        v2.push( a * v[i] );
    return v2;
}

function vec_norm( v ){
    var norm = vec_dot( v, v );
    norm = Math.sqrt( norm );
    return norm;
}

function radius(m){
    return Math.pow(3*m / (4 * Math.PI), 1./3);
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

    if (trail_length == Number.MAX_VALUE)
        di = xs.length - 2;

    // otherwise draw a fading trail
    for (var i = xs.length - 1; i > di; i -= di){
        ctx.strokeStyle = rgb + a;

        ctx.beginPath();

        ctx.moveTo(xs[i], ys[i]);
        for (var j = i-1; j >= i - di; j--){
            ctx.lineTo(xs[j], ys[j]);
        }

        ctx.stroke();
        ctx.closePath();

        a -= da;
    }
}

function mass_loop(){
    now = Date.now();

    held = (now - start_planet)/100;

    mass = 150*held*held;

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

    for (var i = 1; i < 3000; i++){
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
    var max_count = 6;
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

    // k
    if (kc == 75){
        collisions *= -1;
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

function string2planets(str){
    planet_strings = str.split("&");
    for (var i = 1; i < planet_strings.length; i++){
        planet_str = planet_strings[i];
        vars = planet_str.split("#");

        for (var j = 0; j < vars.length; j++){
            vars[j] = parseFloat( vars[j] );
        }

        p = new Planet( vars[0], vars[1], vars[2], vars[3], vars[4] );
        planets.push( p );
    }

}

function planets2string(){
    str = "";
    for (var i = 0; i < planets.length; i++){
        p = planets[i];
        str += "&"
            + p.x + "#" + p.y + "#"
            + p.vx + "#" + p.vy + "#" + p.m;
    }
    return str;
}

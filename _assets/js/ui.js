(function(){
	var canvas = document.getElementById("solar_system"),
		settings_button = document.getElementById("settings"),
		controlpanel = document.getElementById("control-panel"),
		hours_hand = document.getElementById("hours"),
		minutes_hand = document.getElementById("minutes"),
		time_toggle = document.getElementById("time"),
		time_message = document.getElementById("time-message"),
		trails_slider = document.getElementById("trails_slider"),
		trails_off = document.getElementById("options-off"),
		trails_inf = document.getElementById("options-inf"),
		speed_half = document.getElementById("speed-half"),
		speed_normal = document.getElementById("speed-normal"),
		speed_twice = document.getElementById("speed-twice"),

		//Timers
		debounce_resize,

		//Int
		window_w,
		window_h,
		timescale = 10,

		//Bool
		traveling_forward = true,
		drawer_open = false,

		//Animation timelines
		animate_clock_forward = new TimelineMax({
			repeat:-1,
			onReverseComplete: function(){
				animate_clock_forward.seek(360);
			}
		}),

		animate_drawer = new TimelineMax(),

	//Functions
	query_window_dimensions = function(){
		window_w = window.innerWidth || document.body.clientWidth;
		window_h = window.innerHeight || document.body.clientHeight;
	},

	size_canvas = function(){
		query_window_dimensions();
		canvas.width = window_w;
		canvas.height = window_h;
	},

	init_controlpanel = function(){
		TweenMax.set(controlpanel, {
			x: -300,
			autoAlpha: 1
		})
	};

	//ANIMATIONS
	animate_clock_forward.to(hours, 360, {
		rotation: 360,
		transformOrigin:'0px 0px',
		ease: Linear.easeNone
	});

	animate_clock_forward.to(minutes, 360, {
		rotation: 21600,
		transformOrigin:'0px 0px',
		ease: Linear.easeNone
	}, "-=360");

	//Control panel opening
	animate_drawer.to(controlpanel, .282, {
		x: 0,
		ease:Cubic.easeInOut
	});
	animate_drawer.to(canvas, .282, {
		left: 300,
		ease:Cubic.easeInOut
	}, "-=.282");
	animate_drawer.to(settings, .282, {
		left: 300,
		ease:Cubic.easeInOut
	}, "-=.282");
	
	animate_drawer.pause();

	//init
	size_canvas();
	init_controlpanel();

	//Events
	window.onresize = function(e){
		clearTimeout(debounce_resize);
		debounce_resize = setTimeout(function() {
			size_canvas();
		}, 100);
	};

	settings.onclick = function(){
		if(drawer_open){
			settings.className = '';
			controlpanel.className = '';
			animate_drawer.timeScale(1.5);
			animate_drawer.reverse();
			animate_clock_forward.pause();
			drawer_open = false;
		} else {
			settings.className = 'active'
			controlpanel.className = 'active'
			animate_drawer.timeScale(1);
			if(traveling_forward){
				animate_clock_forward.play();
			} else {
				animate_clock_forward.reverse();
			}
			animate_drawer.play();
			drawer_open = true;
		}
	};

	time_toggle.onclick = function(){
		if(traveling_forward){
			time_message.innerHTML = "backward";
			animate_clock_forward.reverse();
			traveling_forward = false;
		} else {
			time_message.innerHTML = "forward";
			animate_clock_forward.play();
			traveling_forward = true;
		}
	};
	trails_slider.onmouseup = function(){
		if(trails_slider.value == 0){
			trails_off.className = "active";
			trails_inf.className = "";
		} else if (trails_slider.value == 100){
			trails_off.className = "";
			trails_inf.className = "active";
		} else {
			trails_off.className = "";
			trails_inf.className = "";
		}
	};
	speed_half.onmouseup = function(){
		animate_clock_forward.timeScale(0.25);
	}

	speed_normal.onmouseup = function(){
		animate_clock_forward.timeScale(1);
	}
	
	speed_twice.onmouseup = function(){
		animate_clock_forward.timeScale(2.5);
	}
})();

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
		dialog_trigger = document.getElementById("keyboard-shortcuts"),
		dialog_window = document.getElementById("keyboard-window"),
		dialog_ink = document.getElementById("keyboard-window-ink"),
		dialog_content = dialog_window.getElementsByClassName("content"),
		one_key = document.getElementById("onekey"),
		two_key = document.getElementById("twokey"),
		three_key = document.getElementById("threekey"),
		r_key = document.getElementById("rkey"),
		ctrl_key = document.getElementById("ctrlkey"),
		space_key = document.getElementById("spacekey"),

		//Timers
		debounce_resize,

		//Int
		window_w,
		window_h,
		timescale = 10,

		//Bool
		traveling_forward = true,
		drawer_open = false,
		dialog_visible = false,

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
	},

	position_dialog = function(){
		query_window_dimensions();
		dialog_window.style.left = (window_w - dialog_window.offsetWidth + (drawer_open ? 300 : 0)) / 2 + "px"
		dialog_window.style.top = (window_h - dialog_window.offsetHeight) / 2 + "px"
	},

	open_dialog = function(){
		position_dialog();
		dialog_trigger.className = 'active'
		dialog_window.className = 'active'
		TweenMax.set(dialog_ink, {
			scale: 0
		})
		TweenMax.set(dialog_content, {
			autoAlpha: 0,
			y: "5px"
		})
		TweenMax.to(dialog_window, .212, {
			autoAlpha: 1,
			marginTop: -20,
		});
		TweenMax.to(dialog_ink, .212, {
			scale: 1
		});
		TweenMax.to(dialog_window, .212, {
			boxShadow:  "0px 10px 20px rgba(0, 0, 0, 0.2)",
			delay: 0.2
		});
		TweenMax.to(dialog_content, .212, {
			autoAlpha: 1,
			y: "0",
			delay: .212
		});
		dialog_visible = true;
	}

	close_dialog = function(){
		if(dialog_visible){
			dialog_trigger.className = ''
			dialog_window.className = ''
			TweenMax.to(dialog_window, .212, {
				autoAlpha: 0,
				marginTop: 0,
				boxShadow:  "0px 0px 0px rgba(0, 0, 0, 0)"
			});
			dialog_visible = false;
		}
	},

	flash_key = function(object){
		if(dialog_visible){
			TweenMax.to(object, .212, {
				background: "#1f1f1f",
				color: "#4A90E2",
				boxShadow: "inset 0px 1px 0px #1f1f1f",
			});
			TweenMax.to(object, .212, {
				background: "#222222",
				color: "#979797",
				boxShadow: "inset 0px 1px 0px #2A2A2A",
				delay: .212
			});
		}
	},

	toggle_dialog = function(){
		if(dialog_visible){
			close_dialog();
		} else {
			open_dialog();
		};
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
		left: 282,
		top: 0,
		rotation: 90,
		ease:Cubic.easeInOut
	}, "-=.282");
	
	animate_drawer.pause();

	//init
	size_canvas();
	init_controlpanel();
	position_dialog();

	TweenMax.set(dialog_window, {
		autoAlpha: 0
	})

	//Events
	window.onresize = function(e){
		clearTimeout(debounce_resize);
		debounce_resize = setTimeout(function() {
			size_canvas();
			if(dialog_visible){
				position_dialog();			
			}
		}, 100);
	};

	document.onmousedown = function(e) {
		if(e.target != dialog_window && e.target != dialog_trigger) {
			close_dialog();         
		}
	}

	window.onkeydown = function(e){
		switch(e.keyCode){
			case 49:
				// 1 key			
				flash_key(one_key);
				speed_half.getElementsByTagName("input")[0].checked = true;
				animate_clock_forward.timeScale(0.3);
                speed_multiplier = 0.5;
				break;
			case 50:
				// 2 key
				flash_key(two_key);
				speed_normal.getElementsByTagName("input")[0].checked = true;
				animate_clock_forward.timeScale(1);
                speed_multiplier = 1.;
				break;
			case 51:
				// 3 key
				flash_key(three_key);
				speed_twice.getElementsByTagName("input")[0].checked = true;
				animate_clock_forward.timeScale(2.5);
                speed_multiplier = 2.;
				break;
			case 82:
				// R key
				flash_key(r_key);
				time_toggle.click();
				break;
			case 32:
				//space key
				flash_key(space_key);
				break;
		}
	}

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
			if(traveling_forward){
				animate_clock_forward.play();
			} else {
				animate_clock_forward.reverse();
			}
			animate_drawer.timeScale(.5)
			animate_drawer.play();
			drawer_open = true;
		}
	};

	time_toggle.onclick = function(){
		if(traveling_forward){
			time_message.innerHTML = "playing backward";
			animate_clock_forward.reverse();
			traveling_forward = false;
		} else {
			time_message.innerHTML = "playing forward";
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
		animate_clock_forward.timeScale(0.3);
        speed_multiplier = 0.5;
	}

	speed_normal.onmouseup = function(){
		animate_clock_forward.timeScale(1);
        speed_multiplier = 1;
	}
	
	speed_twice.onmouseup = function(){
		animate_clock_forward.timeScale(2.5);
        speed_multiplier = 2;
	}

	dialog_trigger.onclick = function(){
		toggle_dialog();
	}
})();

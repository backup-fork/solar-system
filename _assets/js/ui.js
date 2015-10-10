(function(){
	var canvas = document.getElementById("solar_system");
	var settings_button = document.getElementById("settings");
	var controlpanel = document.getElementById("control-panel");
	var hours_hand = document.getElementById("hours");
	var minutes_hand = document.getElementById("minutes");
	var time_toggle = document.getElementById("time");
	var time_message = document.getElementById("time-message");
	var trails_slider = document.getElementById("trails_slider");
	var trails_off = document.getElementById("options-off");
	var trails_inf = document.getElementById("options-inf");
	var speed_half = document.getElementById("speed-half");
	var speed_normal = document.getElementById("speed-normal");
	var speed_twice = document.getElementById("speed-twice");
	var dialog_trigger = document.getElementById("keyboard-shortcuts");
	var dialog_window = document.getElementById("keyboard-window");
	var dialog_ink = document.getElementById("keyboard-window-ink");
	var dialog_content = dialog_window.getElementsByClassName("content");
	var one_key = document.getElementById("onekey");
	var two_key = document.getElementById("twokey");
	var three_key = document.getElementById("threekey");
	var r_key = document.getElementById("rkey");
	var ctrl_key = document.getElementById("ctrlkey");
	var space_key = document.getElementById("spacekey");

	//Timers
	var debounce_resize;

	//Int
	var window_w;
	var window_h;
	var timescale = 10;

	//Bool
	var traveling_forward = true;
    var spacebar_toggle = -1;
	var drawer_open = false;
	var dialog_visible = false;

	//Animation timelines
	var animate_clock_forward = new TimelineMax({
		repeat:-1,
		onReverseComplete: function(){
			animate_clock_forward.seek(360);
		}
	});

	var animate_drawer = new TimelineMax();

	//Functions
	function query_window_dimensions(){
		window_w = window.innerWidth || document.body.clientWidth;
		window_h = window.innerHeight || document.body.clientHeight;
	};

	function size_canvas(){
		query_window_dimensions();
		canvas.width = window_w;
		canvas.height = window_h;
	};

	function init_controlpanel(){
		TweenMax.set(controlpanel, {
			x: -300,
			autoAlpha: 1
		})
	};

	function position_dialog(){
		query_window_dimensions();
		dialog_window.style.left = (window_w - dialog_window.offsetWidth + (drawer_open ? 300 : 0)) / 2 + "px"
		dialog_window.style.top = (window_h - dialog_window.offsetHeight) / 2 + "px"
	};

	function open_dialog(){
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
	};

	function close_dialog(){
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
	};

	function flash_key(object){
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
	};

	function toggle_dialog(){
		if(dialog_visible){
			close_dialog();
		} else {
			open_dialog();
		};
	};

	function check_speed(){
	    for (var i = 0, length = speed_control.length; i < length; i++) {
	        if (speed_control[i].checked) {
	            return speed_control[i].value;
	            break;
	        }
	    }
	}

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
				break;
			case 50:
				// 2 key
				flash_key(two_key);
				speed_normal.getElementsByTagName("input")[0].checked = true;
				animate_clock_forward.timeScale(1);
				break;
			case 51:
				// 3 key
				flash_key(three_key);
				speed_twice.getElementsByTagName("input")[0].checked = true;
				animate_clock_forward.timeScale(2.5);
				break;
			case 82:
				// R key
				flash_key(r_key);
				time_toggle.click();
				break;
			case 32:
				//space key
				flash_key(space_key);
                if (spacebar_toggle == -1){
                    animate_clock_forward.timeScale(0);
                    time_message.innerHTML = "paused";
                }
                if (spacebar_toggle == 1){
                	check_speed();
	                if (check_speed() == 0.5)
	                    animate_clock_forward.timeScale(0.3);
	                if (check_speed() == 1)
	                    animate_clock_forward.timeScale(1.);
	                if (check_speed() == 2)
	                    animate_clock_forward.timeScale(2.5);

                    if (traveling_forward)
                        time_message.innerHTML = "playing forward";
                    else
                        time_message.innerHTML = "playing backward";
                }

                spacebar_toggle *= -1;
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
        reverse_particles();
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
	}

	speed_normal.onmouseup = function(){
		animate_clock_forward.timeScale(1);
	}
	
	speed_twice.onmouseup = function(){
		animate_clock_forward.timeScale(2.5);
	}

	dialog_trigger.onclick = function(){
		toggle_dialog();
	}
})();

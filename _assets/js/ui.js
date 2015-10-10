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
	var toast = document.getElementById("toast");
	var toast_message = document.getElementById("message");

	//Timers
	var debounce_resize;

	//Int
	var window_w;
	var window_h;
	var timescale = 10;

	//Bool
	var traveling_forward = true;
    var simulation_paused = false;
	var drawer_open = false;
	var dialog_visible = false;
	var system_message_visible = false;

	//Strings
	//playing forward
	var st_f_slow = "<span>Playing:</span> slow motion";
	var st_f_norm = "<span>Playing:</span> forward";
	var st_f_fast = "<span>Playing:</span> fast forward";

	//playing backward
	var st_backward = "<span>Playing:</span> backward";

	//paused backward
	var st_p_backward = "<span>Paused:</span> backward";

	//Speed
	var st_slow = "<span>Speed:</span> slow motion";
	var st_norm = "<span>Speed:</span> normal";
	var st_fast = "<span>Speed:</span> fast forward";
	
	//Paused speed
	var st_p_slow = "<span>Paused:</span> slow motion";
	var st_p_norm = "<span>Paused:</span> normal";
	var st_p_fast = "<span>Paused:</span> fast forward";
	

	//Animation timelines
	var animate_clock = new TimelineMax({
		repeat:-1,
		onReverseComplete: function(){
			animate_clock.seek(360);
		}
	});

	var animate_drawer = new TimelineMax();
	var animate_toast = new TimelineMax();

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
	};

	function check_message(key){
		if(traveling_forward){
			//arrow of time forward
			if(simulation_paused){
				//simulation paused
				if(key == "space"){
					return "Paused"
				} else {
					switch(check_speed()){
						case "0.5":
							return st_p_slow;
							break;
						case "1":
							return st_p_norm;
							break;
						case "2":
							return st_p_fast;
							break;
					}
				}
			} else { 
				//simulation playing
				switch(check_speed()){
					case "0.5":
						return st_f_slow;
						break;
					case "1":
						return st_f_norm;
						break;
					case "2":
						return st_f_fast;
						break;
				}
			}
		} else {
			//arrow of time backward
			if(simulation_paused){
				//simulation paused
				return st_p_backward 

			} else {
				//simulation playing
				return st_backward
			}
		}

	};

	function open_drawer(){
		settings.className = 'active'
		controlpanel.className = 'active'
		if(!simulation_paused){
			if(traveling_forward){
				animate_clock.play();
			} else {
				animate_clock.reverse();
			}
		}
		animate_drawer.timeScale(.5)
		animate_drawer.play();
		drawer_open = true;
		position_message();
	};

	function close_drawer(){
		settings.className = '';
		controlpanel.className = '';
		animate_drawer.timeScale(1.25);
		animate_drawer.reverse();
		animate_clock.pause();
		drawer_open = false;
		position_message();
	};

	function position_message(){
		query_window_dimensions();
		var toast_w = toast.offsetWidth;
		if(drawer_open){
			TweenMax.to(toast, .3, {
				left: ((window_w / 2) - (toast_w / 2) + 150 + "px")
			})			
		} else {
			TweenMax.to(toast, .3, {
				left: 30
			})			
		}

	};

	function send_toast(message){
		if(system_message_visible){
			animate_toast.seek(1);
		} else {
			animate_toast.seek(0);
		}
		toast_message.innerHTML = message;
		animate_toast.play();
	};

	//ANIMATIONS
	animate_clock.to(hours, 360, {
		rotation: 360,
		transformOrigin:'0px 0px',
		ease: Linear.easeNone
	});

	animate_clock.to(minutes, 360, {
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

	//toast
	animate_toast.timeScale(3)
	animate_toast.set("#toast", {
		background: "rgba(0, 0, 0, 0)",
		y: "50px"
	});

	animate_toast.set("#message", {
		autoAlpha: 0,
		y: 0
	});

	animate_toast.set("#splash", {
		scale: 0,
		autoAlpha: 1
	});

	animate_toast.set("#evaporate", {
		scale: 0,
		autoAlpha: 1,
	});

	animate_toast.to("#toast", .5, {
		y: 0,
		boxShadow: "0px 2px 15px rgba(0, 0, 0, .2)"
	});


	animate_toast.to("#splash", .5, {
		scale: 1.2
	}, "-=.5");

	animate_toast.to("#message", .5, {
		autoAlpha: 1,
		y: 0,
		onComplete: function(){
			system_message_visible = true;
		}
	}, "-=.25");

	animate_toast.to("#evaporate", 1, {
		scale: 2.2,
		autoAlpha: 0,
		ease: Linear.easeNone, 
		delay: 5, 
		onComplete: function(){
			system_message_visible = false;
		}
	});

	animate_toast.to("#message", .5, {
		autoAlpha: 0,
		y: 0
	}, "-=1");

	animate_toast.to("#splash", .6, {
		autoAlpha: 0
	}, "-=.9");

	animate_toast.to("#toast", .6, {
		boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)"
		
	}, "-=.6");

	animate_toast.pause();

	//init
	size_canvas();
	init_controlpanel();
	position_dialog();
	position_message();

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
			if(system_message_visible){
				position_message();
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
				animate_clock.timeScale(0.3);
				if(simulation_paused){
					send_toast(st_p_slow);
					animate_clock.pause()
				} else {
					send_toast(st_slow);
				}
				break;
			case 50:
				// 2 key
				flash_key(two_key);
				speed_normal.getElementsByTagName("input")[0].checked = true;
				animate_clock.timeScale(1);
				if(simulation_paused){
					send_toast(st_p_norm);
					animate_clock.pause()
				} else{
					send_toast(st_norm);					
				};
				break;
			case 51:
				// 3 key
				flash_key(three_key);
				speed_twice.getElementsByTagName("input")[0].checked = true;
				animate_clock.timeScale(2.5);
				if(simulation_paused){
					send_toast(st_p_fast);
					animate_clock.pause()
				} else {
					send_toast(st_fast);
				};
				break;

			case 77:
				//M key for menu
				if(!drawer_open){
					open_drawer();
				} else {
					close_drawer();
				}
				break;

			case 82:
				// R key
				flash_key(r_key);
				time_toggle.click();
				send_toast(check_message());
				break;
			case 32:
				//space key
				flash_key(space_key);
                if (simulation_paused == false){
                	//pause the simulation
                    animate_clock.pause();
                    time_message.innerHTML = "Paused";
                }
                if (simulation_paused == true){
                	//play the simulation, reset UI
                    if (traveling_forward){
                        time_message.innerHTML = "Playing forward";
                        animate_clock.play();
                    } else {
                        time_message.innerHTML = "playing backward";
                    	animate_clock.reverse();
                    };
                }
                simulation_paused = !simulation_paused;
                send_toast(check_message("space"));
				break;
		}
	}

	settings.onclick = function(){
		if(drawer_open){
			close_drawer();
		} else {
			open_drawer();
		}
	};

	time_toggle.onclick = function(){
        reverse_particles();
		if(traveling_forward){
			if(!simulation_paused){
				time_message.innerHTML = "Playing backward";
				animate_clock.reverse();
			}
			traveling_forward = false;
		} else {
			if(!simulation_paused){
				time_message.innerHTML = "playing forward";
				animate_clock.play();
			}
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
		animate_clock.timeScale(0.3);
	}

	speed_normal.onmouseup = function(){
		animate_clock.timeScale(1);
	}
	
	speed_twice.onmouseup = function(){
		animate_clock.timeScale(2.5);
	}

	dialog_trigger.onclick = function(){
		toggle_dialog();
	}
})();

(function(){
	var canvas = document.getElementById("solar_system"),
		cursor = document.getElementById("cursor"),
		caption = document.getElementById("caption"),
		clicked_once = false,

		//Timers
		debounce_resize,

		//Int
		window_w,
		window_h,
		clicked = 0,


	query_window_dimensions = function(){
		window_w = window.innerWidth || document.body.clientWidth;
		window_h = window.innerHeight || document.body.clientHeight;
	},

	size_canvas = function(){
		query_window_dimensions();
		canvas.width = window_w;
		canvas.height = window_h;
	},

	position_cursor = function(e){
		var cx = e.clientX - (cursor.offsetWidth / 2),
			cy = e.clientY - (cursor.offsetHeight / 2);
		cursor.style.transform = "translate(" + cx + "px, " + cy + "px)";
		caption.style.transform = "translate(" + cx + "px, " + cy + "px)";
	},

	position_caption = function(){
		query_window_dimensions();
		caption.style.bottom = window_h / 2 + "px";
	},

	init_tooltip = function(){
		TweenMax.set("#caption-ink", {
			scale: 0
		});

		TweenMax.set("#caption-message", {
			autoAlpha: 0
		});
	},

	close_tooltip = function(){
		TweenMax.to("#caption-message", .12, {
			autoAlpha: 0,
		});
		TweenMax.to("#caption", .212, {
			boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
			marginTop: "0"
		});
		TweenMax.to("#caption-ink", .12, {
			scale: 0,
			delay: .1
		});
	},

	open_tooltip = function(){
		TweenMax.to("#caption-ink", .212, {
			scale: 1,
		});
		TweenMax.to("#caption", .212, {
			boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.25)",
			marginTop: "-3px"
		});
		TweenMax.to("#caption-message", .212, {
			autoAlpha: 1,
			delay: .1
		});
	},

	set_idle_timer = function(){
		idle_timer = setTimeout(function() {
			if(!clicked_once)
			open_tooltip();
		}, 500);
	};

	//init
	size_canvas();
	position_caption();
	set_idle_timer();
	init_tooltip();


	//Events
	window.onresize = function(e){
		clearTimeout(debounce_resize);
		debounce_resize = setTimeout(function() {
			size_canvas();
			position_caption();
		}, 100);
	}

	window.onmousemove = function(e){
		cursor.style.visibility = "visible";
		position_cursor(e);

		close_tooltip();
		clearTimeout(idle_timer);
		set_idle_timer();
	}

	canvas.onmousedown = function(e){
		close_tooltip();
		clicked_once = true;
		TweenMax.to("#header", .412, {
			height: 10
		})
		if(clicked){
			cursor.className = "";
			clicked = false;
		}else {
			TweenMax.set("#cursor", {
				x: e.clientX - (cursor.offsetWidth / 2),
				y: e.clientY - (cursor.offsetHeight / 2),
				scale: 1,
				rotation: 0
			})
			TweenMax.to("#cursor", .412, {
				scale: 0,
				rotation: 30,
				onComplete: function(){
					cursor.className = "vector"
				}
			})
			clicked = true;
		}
	}
	document.onkeydown = function(e){
	    if (e.keyCode == 27){
			cursor.className = "";
			clicked = false;
	    }
	}
})();

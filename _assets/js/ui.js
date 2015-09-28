(function(){
	var canvas = document.getElementById("solar_system"),
		cursor = document.getElementById("cursor"),
		caption = document.getElementById("caption"),

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
	},

	position_caption = function(){
		query_window_dimensions();
		caption.style.bottom = window_h / 2 + "px";
	};

	//init
	size_canvas();
	position_caption();

	//Events
	window.onresize = function(e){
		clearTimeout(debounce_resize);
		debounce_resize = setTimeout(function() {
			size_canvas();
			position_caption();
		}, 100);
	}

	window.onmousemove = function(e){
		position_cursor(e);
	}

	canvas.onmousedown = function(e){
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
			TweenMax.to("#caption", .412, {
				opacity: 0,
				scale: .95
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
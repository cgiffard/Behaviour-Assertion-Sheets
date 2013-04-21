;(function() {
	
	if (!document.querySelector) return;
	
	window.addEventListener("load",onload);
	
	function onload() {
		
		var navBar = document.querySelector("nav"),
			nodePointer = navBar,
			positionTop = 0;
			
		resetSizing();
		onscroll();
		
		window.addEventListener("scroll",onscroll);
		window.addEventListener("resize",resetSizing);
		
		function onscroll() {
			if (window.scrollY >= positionTop) {
				navBar.className = "top";
			} else {
				navBar.className = "";
			}
		}
		
		function resetSizing() {
			nodePointer = navBar;
			positionTop = 0;
			
			do {
				positionTop += nodePointer.offsetTop;
			} while (nodePointer = nodePointer.offsetParent);
		}
	}
	
})();
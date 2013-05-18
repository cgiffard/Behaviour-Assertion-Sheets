;(function() {
	
	if (!document.querySelector) return;
	
	window.addEventListener("load",onload);
	
	function onload() {
		
		var navBar = document.querySelector("nav"),
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
			positionTop = getElementOffset(navBar);
		}
		
		alterLinkBehaviour();
	}
	
	function alterLinkBehaviour() {
		var links = [].slice.call(document.querySelectorAll("nav a"),0);
		
		links.forEach(function(link) {
			if (link.getAttribute("href").indexOf("#") === 0) {
				link.addEventListener("click",linkHandler);
				link.addEventListener("keydown",linkHandler);
			}
		});
		
		function linkHandler(evt) {
			if (evt.target !== this) return true;
			
			if (evt.preventDefault) {
				evt.preventDefault();
			}
			
			var target = document.querySelector(this.getAttribute("href"))
				targetOffset = getElementOffset(target);
			
			window.scrollTo(0,targetOffset - 100);
			
			return false;
		}
	}
	
	function getElementOffset(element) {
		var nodePointer = element,
			positionTop = 0;
		
		if (!element) return 0;
		
		do {
			positionTop += nodePointer.offsetTop;
		} while ((nodePointer = nodePointer.offsetParent));
		
		return positionTop;
	}
	
})();
initScrollObserver();

function initScrollObserver() {
	const stickyElement = document.querySelector('.growing-cards');
	// growth percentage is tied to the onscreen percentage of growthControllerElement 
	const growthControllerElement = stickyElement.querySelector('.peeker').nextElementSibling;
	// stickyElement does not become sticky unless stickyInhibitorElement is offscreen
	const stickyInhibitorElement = document.querySelector('.sticky-inhibitor');

	function updateSize() {
		stickyElement.style.setProperty('--computed-height', `${stickyElement.getBoundingClientRect().height}px`);
	}

	function updateScroll() {
		const topEdge = growthControllerElement.getBoundingClientRect().top;
		const bottomEdge = stickyElement.getBoundingClientRect().bottom;
		const onscreenHeight = document.documentElement.clientHeight - topEdge;
		const onscreenPortion = onscreenHeight / (bottomEdge - topEdge)
		stickyElement.style.setProperty(
			'--scroll-grow-percentage', 
			clamp(0, onscreenPortion, 1)
		);
		stickyElement.classList.toggle('growing', onscreenPortion > 0);
	}

	function onIntersect(entries) {
		entries.forEach(entry => {
			if (entry.target === stickyInhibitorElement) {
				stickyElement.classList.toggle('peeking', !entry.isIntersecting);
			}
			if (entry.target === growthControllerElement) {
				updateScroll();
				if (entry.isIntersecting) {
					window.addEventListener('scroll', updateScroll);
				} else {
					window.removeEventListener('scroll', updateScroll);
				}
			}
		})
	}


	updateSize();
	window.addEventListener('resize', updateSize);

	const observer = new IntersectionObserver(onIntersect);
	if (stickyInhibitorElement) observer.observe(stickyInhibitorElement);
	observer.observe(growthControllerElement);
	stickyElement.style.setProperty('--scroll-grow-percentage', 0);

	stickyElement.classList.add('observing');


	// scroll parallax
	const parallaxWatchList = [];
	function updateScrollPercent(node) {
		const topPosition = document.documentElement.clientHeight - node.getBoundingClientRect().top;
		const progress = topPosition / (node.clientHeight + document.documentElement.clientHeight);
		node.style.setProperty('--scroll-progress', progress.toFixed(3));
	}
	function updateParallaxItemsInView() {
		if (parallaxWatchList.length > 0) {
			parallaxWatchList.forEach(node=>{ updateScrollPercent(node) });
		}
	}
	function handleParallaxIntersect(entries) {
		entries.forEach(entry => {
			const node = entry.target;
			if (entry.isIntersecting) {
				updateScrollPercent(node);
				parallaxWatchList.push(node);
			} else {
				const listIndex = parallaxWatchList.indexOf(node);
				if (listIndex > -1) {
					parallaxWatchList.splice(listIndex, 1);
				}
			}
		})
	}
	const parallaxObserver = new IntersectionObserver(
		handleParallaxIntersect, 
		{ rootMargin: getComputedStyle(document.documentElement).getPropertyValue('--parallax-distance') }
	);
	if (document.querySelector('.gallery, .multi-quote figure')) {
		document.querySelectorAll('.gallery, .multi-quote figure').forEach(
			node => parallaxObserver.observe(node)
		);
		// scroll listener is needed because additional IntersectionObserver thresholds do not trigger while item is fully in view
		window.addEventListener('scroll', updateParallaxItemsInView);
	}
}

function clamp(min, value, max) {
	return Math.max(min, Math.min(value, max) );
}

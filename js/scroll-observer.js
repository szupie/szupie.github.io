initScrollObserver();

function initScrollObserver() {
	const stickyElement = document.querySelector('.growing-cards');
	const postPeekElement = stickyElement.querySelector('.peeker').nextElementSibling;
	const stickyInhibitorElement = document.querySelector('.sticky-inhibitor');

	function updateSize() {
		stickyElement.style.setProperty('--computed-height', `${stickyElement.getBoundingClientRect().height}px`);
	}

	function updateScroll() {
		const offscreenHeight = stickyElement.getBoundingClientRect().bottom - document.documentElement.clientHeight;
		const offscreenPortion = offscreenHeight / -parseFloat(getComputedStyle(stickyElement).bottom);
		stickyElement.style.setProperty(
			'--scroll-grow-percentage', 
			clamp(0, 1 - offscreenPortion, 1)
		);
	}

	function onIntersect(entries) {
		entries.forEach(entry => {
			if (entry.target === stickyInhibitorElement) {
				stickyElement.classList.toggle('peeking', !entry.isIntersecting);
			}
			if (entry.target === postPeekElement) {
				stickyElement.classList.toggle('growing', entry.isIntersecting);
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

	const observer = new IntersectionObserver(onIntersect, { rootMargin: '-3px' });
	if (stickyInhibitorElement) observer.observe(stickyInhibitorElement);
	observer.observe(postPeekElement);
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
	if (document.querySelector('.gallery')) {
		document.querySelectorAll('.gallery').forEach(
			node => parallaxObserver.observe(node)
		);
		// scroll listener is needed because additional IntersectionObserver thresholds do not trigger while item is fully in view
		window.addEventListener('scroll', updateParallaxItemsInView);
	}
}

function clamp(min, value, max) {
	return Math.max(min, Math.min(value, max) );
}

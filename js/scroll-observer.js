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

	stickyElement.classList.add('observing')
}

function clamp(min, value, max) {
	return Math.max(min, Math.min(value, max) );
}

initScrollObserver();

function initScrollObserver() {
	const stickyElement = document.querySelector('.sticky-cards');
	const postPeekElement = stickyElement.querySelector('.peeker').nextElementSibling;
	const offscreenTriggerElement = document.querySelector('header');

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
			if (entry.target === offscreenTriggerElement) {
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
	observer.observe(offscreenTriggerElement);
	observer.observe(postPeekElement);
	stickyElement.style.setProperty('--scroll-grow-percentage', 0);

	stickyElement.classList.add('observing')
}

function clamp(min, value, max) {
	return Math.max(min, Math.min(value, max) );
}

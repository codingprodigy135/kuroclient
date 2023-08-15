var THEME = THEME || {};

(function () {
	"use strict";

	$(window).ready(function () {
		$("#preloader").delay(100).fadeOut("fade");
	});

	$("ul.nav li.dropdown").hover(
		function () {
			$(this).find(".dropdown-menu").stop(true, true).delay(100).fadeIn(200);
		},
		function () {
			$(this).find(".dropdown-menu").stop(true, true).delay(100).fadeOut(200);
		}
	);

	$(window).on("scroll", function () {
		var scroll = $(window).scrollTop();

		if (scroll < 2) {
			$("nav.sticky-header").removeClass("affix");
		} else {
			$("nav.sticky-header").addClass("affix");
		}
	});

	var swiper = new Swiper(".testimonialSwiper", {
		slidesPerView: 1,
		speed: 700,
		spaceBetween: 30,
		slidesPerGroup: 1,
		loop: true,
		breakpoints: {
			320: {
				slidesPerView: 1,
			},
			640: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 2,
				spaceBetween: 20,
			},
			1024: {
				slidesPerView: 2,
				spaceBetween: 20,
			},
			1142: {
				slidesPerView: 2,
				spaceBetween: 25,
			},
		},
		navigation: {
			nextEl: ".swiper-button-next",
			prevEl: ".swiper-button-prev",
		},
	});

	var swiper = new Swiper(".testimonialThreeSwiper", {
		slidesPerView: 2,
		speed: 700,
		spaceBetween: 30,
		slidesPerGroup: 2,
		loop: true,
		pagination: {
			el: ".swiper-pagination",
			clickable: true,
		},
		breakpoints: {
			320: {
				slidesPerView: 1,
				spaceBetween: 30,
			},
			768: {
				slidesPerView: 2,
				spaceBetween: 30,
			},
			991: {
				slidesPerView: 3,
				spaceBetween: 30,
			},
		},
		navigation: {
			nextEl: ".swiper-button-next",
			prevEl: ".swiper-button-prev",
		},
	});

	var swiper = new Swiper(".appTwoReviewSwiper", {
		slidesPerView: 2,
		speed: 700,
		spaceBetween: 30,
		slidesPerGroup: 2,
		loop: true,
		navigation: {
			nextEl: ".swiper-button-next",
			prevEl: ".swiper-button-prev",
		},
		breakpoints: {
			320: {
				slidesPerView: 1,
				spaceBetween: 30,
			},
			768: {
				slidesPerView: 2,
				spaceBetween: 30,
			},
			991: {
				slidesPerView: 3,
				spaceBetween: 30,
			},
		},
	});

	var swiper = new Swiper(".brand-logo-slider", {
		slidesPerView: 2,
		speed: 700,
		spaceBetween: 30,
		slidesPerGroup: 2,
		loop: true,
		breakpoints: {
			320: {
				slidesPerView: 2,
				spaceBetween: 30,
			},
			768: {
				slidesPerView: 3,
				spaceBetween: 30,
			},
			991: {
				slidesPerView: 5,
				spaceBetween: 30,
			},
		},
	});

	var swiper = new Swiper(".cyber-testimonial-slider", {
		slidesPerView: 1,
		speed: 700,
		pagination: {
			clickable: true,
			el: ".swiper-pagination",
		},
		slidesPerGroup: 2,
		loop: true,
		breakpoints: {
			320: {
				slidesPerView: 1,
				spaceBetween: 30,
			},
			768: {
				slidesPerView: 1,
			},
			991: {
				slidesPerView: 1,
			},
		},
	});

	var swiper = new Swiper(".cyber-blog", {
		slidesPerView: 3,
		spaceBetween: 30,
		speed: 1000,
		autoplay: {
			delay: 2500,
		},
		slidesPerGroup: 1,
		loop: true,
		breakpoints: {
			320: {
				slidesPerView: 1,
				spaceBetween: 30,
			},
			768: {
				slidesPerView: 2,
			},
			991: {
				slidesPerView: 3,
			},
		},
	});

	var swiper = new Swiper(".crypto-testimonial", {
		slidesPerView: 3,
		spaceBetween: 30,
		speed: 1000,
		autoplay: {
			delay: 2500,
		},
		slidesPerGroup: 1,
		loop: true,
		breakpoints: {
			320: {
				slidesPerView: 1,
				spaceBetween: 30,
			},
			768: {
				slidesPerView: 2,
			},
			991: {
				slidesPerView: 3,
			},
		},
	});

	var swiper = new Swiper(".hero-slider", {
		slidesPerView: 1,
		loop: true,
		speed: 800,
		autoplay: {
			delay: 3000,
		},
	});

	var swiper = new Swiper(".payment-brand-logo", {
		slidesPerView: 1,
		spaceBetween: 24,
		speed: 1000,
		autoplay: {
			delay: 2500,
		},
		slidesPerGroup: 1,
		loop: true,
		breakpoints: {
			320: {
				slidesPerView: 1,
				spaceBetween: 16,
			},
			768: {
				slidesPerView: 3,
			},
			991: {
				slidesPerView: 5,
			},
		},
	});

	var swiper = new Swiper(".payment-testimonial-slider", {
		slidesPerView: 2,
		spaceBetween: 24,
		speed: 1000,
		autoplay: {
			delay: 3000,
		},
		slidesPerGroup: 1,
		loop: true,
		breakpoints: {
			320: {
				slidesPerView: 1,
			},
			768: {
				slidesPerView: 2,
			},
			991: {
				slidesPerView: 3,
			},
		},
	});

	var swiper = new Swiper(".digi-logo-slider", {
		slidesPerView: 1,
		spaceBetween: 24,
		speed: 1000,
		autoplay: {
			delay: 2500,
		},
		slidesPerGroup: 1,
		loop: true,
		breakpoints: {
			320: {
				slidesPerView: 1,
				spaceBetween: 16,
			},
			768: {
				slidesPerView: 3,
			},
			991: {
				slidesPerView: 6,
			},
		},
	});

	var swiper = new Swiper(".digi-testimonial-wrapper", {
		slidesPerView: 1,
		loop: true,
		speed: 800,
		navigation: {
			nextEl: ".digi-nav-control .swiper-button-next",
			prevEl: ".digi-nav-control .swiper-button-prev",
		},
	});

	var swiper = new Swiper(".ev-testimonial-slider", {
		slidesPerView: 1,
		loop: true,
		speed: 800,
		pagination: {
			clickable: true,
			el: ".eve-pagination.swiper-pagination",
		},
	});
	THEME.initialize = {
		init: function () {
			THEME.initialize.general();
		},
		general: function () {
			var $scene = $(".parallax-element").parallax({
				scalarX: 100,
				scalarY: 100,
			});
		},
	};
	THEME.documentOnReady = {
		init: function () {
			THEME.initialize.init();
		},
	};
	$(document).ready(THEME.documentOnReady.init);
	$(function () {
		$('[data-bs-toggle="tooltip"]').tooltip();
	});

	AOS.init({
		easing: "ease-in-out",

		once: true,

		duration: 500,
	});
})();

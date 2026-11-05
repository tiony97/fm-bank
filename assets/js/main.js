$(function () {
  const $header = $(".site-header");
  const $menuItem = $(".has-mega-menu");
  const $megaMenu = $(".mega-menu");
  const $menuTrigger = $menuItem.children(".nav-link");
  const $primaryNav = $(".primary-nav");
  const $mobileToggle = $(".mobile-toggle");

  const mobileQuery = window.matchMedia("(max-width: 900px)");

  let closeTimer;

  // Check whether the user is on a mobile-sized screen.
  function isMobile() {
    return mobileQuery.matches;
  }

  // Open the mega-menu.
  function openMegaMenu() {
    clearTimeout(closeTimer);

    $megaMenu.addClass("is-open");
    $menuTrigger.attr("aria-expanded", "true");
  }

  // Close the mega-menu.
  function closeMegaMenu() {
    clearTimeout(closeTimer);

    $megaMenu.removeClass("is-open");
    $menuTrigger.attr("aria-expanded", "false");
  }

  // Delay closing slightly to prevent flickering.
  function scheduleClose() {
    clearTimeout(closeTimer);

    closeTimer = setTimeout(function () {
      closeMegaMenu();
    }, 120);
  }

  // ================= DESKTOP HOVER =================

  // ================= DESKTOP HOVER =================

  $menuItem.on("mouseenter", function () {
    if (!isMobile()) {
      const $currentItem = $(this);
      const $currentMegaMenu = $currentItem.find(".mega-menu");
      const $currentTrigger = $currentItem.children(".nav-link");

      clearTimeout(closeTimer);

      // Close ALL other menus instantly to prevent them from staying open
      $menuItem.not($currentItem).each(function () {
        $(this).find(".mega-menu").removeClass("is-open");
        $(this).children(".nav-link").attr("aria-expanded", "false");
      });

      // Open the currently hovered menu
      $currentMegaMenu.addClass("is-open");
      $currentTrigger.attr("aria-expanded", "true");
    }
  });

  $menuItem.on("mouseleave", function () {
    if (!isMobile()) {
      const $currentMegaMenu = $(this).find(".mega-menu");
      const $currentTrigger = $(this).children(".nav-link");

      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () {
        $currentMegaMenu.removeClass("is-open");
        $currentTrigger.attr("aria-expanded", "false");
      }, 120);
    }
  });

  // Keep the dropdown open while moving between
  // the trigger and the dropdown itself.
  $megaMenu.on("mouseenter", function () {
    if (!isMobile()) {
      clearTimeout(closeTimer);
    }
  });

  $megaMenu.on("mouseleave", function () {
    if (!isMobile()) {
      const $currentMegaMenu = $(this);
      const $currentTrigger = $(this).siblings(".nav-link");

      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () {
        $currentMegaMenu.removeClass("is-open");
        $currentTrigger.attr("aria-expanded", "false");
      }, 120);
    }
  });

  // ================= KEYBOARD ACCESSIBILITY =================

  $menuItem.on("focusin", function () {
    if (!isMobile()) {
      const $currentItem = $(this);
      const $currentMegaMenu = $currentItem.find(".mega-menu");
      const $currentTrigger = $currentItem.children(".nav-link");

      // Close ALL other menus instantly
      $menuItem.not($currentItem).each(function () {
        $(this).find(".mega-menu").removeClass("is-open");
        $(this).children(".nav-link").attr("aria-expanded", "false");
      });

      $currentMegaMenu.addClass("is-open");
      $currentTrigger.attr("aria-expanded", "true");
    }
  });

  $menuItem.on("focusout", function () {
    if (!isMobile()) {
      const $currentItem = $(this);
      const $currentMegaMenu = $(this).find(".mega-menu");
      const $currentTrigger = $(this).children(".nav-link");

      // Wait until the next focused element is known.
      setTimeout(function () {
        if (!$currentItem.has(document.activeElement).length) {
          $currentMegaMenu.removeClass("is-open");
          $currentTrigger.attr("aria-expanded", "false");
        }
      }, 0);
    }
  });

  $(document).on("keydown", function (event) {
    if (event.key === "Escape") {
      // Close all menus
      $(".mega-menu").removeClass("is-open");
      $(".has-mega-menu > .nav-link").attr("aria-expanded", "false");

      // Optionally, focus the trigger that was open
      $(".nav-link").trigger("focus");
    }
  });

  // ================= MOBILE DROPDOWN =================

  $menuTrigger.on("click", function (event) {
    if (isMobile()) {
      event.preventDefault();

      const $currentTrigger = $(this);
      const $currentMegaMenu = $currentTrigger.siblings(".mega-menu");
      const isOpen = $currentMegaMenu.hasClass("is-open");

      // Close ALL other open menus first
      $(".mega-menu").not($currentMegaMenu).removeClass("is-open");
      $(".nav-link").not($currentTrigger).attr("aria-expanded", "false");

      // Toggle the clicked one
      if (isOpen) {
        $currentMegaMenu.removeClass("is-open");
        $currentTrigger.attr("aria-expanded", "false");
      } else {
        $currentMegaMenu.addClass("is-open");
        $currentTrigger.attr("aria-expanded", "true");
      }
    }
  });

  // ================= UTILITY BAR ACTIVE STATE =================

  // Normalize a URL path so we can compare it reliably:
  // - strip protocol, host, query string, and hash
  // - strip trailing slash
  // - strip .html extension
  function normalizePath(path) {
    return path
      .toLowerCase()
      .replace(/\/+$/, "") // remove trailing slashes
      .replace(/\.html$/, ""); // strip .html extension
  }

  const currentPath = normalizePath(window.location.pathname);

  $(".utility-bar nav a").each(function () {
    const $link = $(this);
    const href = $link.attr("href");

    // Skip placeholder links ("#") and empty hrefs.
    if (!href || href === "#" || href.charAt(0) === "#") {
      return;
    }

    // Resolve relative hrefs against the current location
    // so "./personal.html" and "/personal" both compare correctly.
    let linkPath;
    try {
      linkPath = new URL(href, window.location.href).pathname;
    } catch (e) {
      return; // Skip malformed URLs.
    }

    const normalizedLink = normalizePath(linkPath);

    // Skip the root/home link unless we're actually on it,
    // otherwise "/" matches everything via startsWith below.
    if (normalizedLink === "" || normalizedLink === "/") {
      if (currentPath === "" || currentPath === "/") {
        $link.addClass("active");
        $link.attr("aria-current", "page");
      }
      return;
    }

    // Match exact page OR any child route beneath it.
    // e.g. /personal matches /personal and /personal/accounts
    const isMatch =
      currentPath === normalizedLink ||
      currentPath.indexOf(normalizedLink + "/") === 0;

    if (isMatch) {
      $link.addClass("active");
      $link.attr("aria-current", "page");
    }
  });

  // ================= PRIMARY NAV OVERFLOW SCROLLER =================
  (function initNavScroller() {
    const $nav = $(".primary-nav");
    if (!$nav.length) return;

    const navEl = $nav[0];
    const $wrap = $(".nav-scroll-wrap");
    const $prevBtn = $(".nav-scroll-btn--prev");
    const $nextBtn = $(".nav-scroll-btn--next");

    const SCROLL_STEP = 200;

    function updateOverflowState() {
      // Mobile: hamburger drawer handles nav, no scroller needed.
      if (mobileQuery.matches) {
        $wrap.removeClass("has-nav-overflow");
        $nav.removeClass("has-overflow-right");
        $prevBtn.prop("disabled", true);
        $nextBtn.prop("disabled", true);
        return;
      }

      const scrollLeft = navEl.scrollLeft;
      const scrollWidth = navEl.scrollWidth;
      const clientWidth = navEl.clientWidth;

      // Everything fits — hide buttons entirely.
      if (scrollWidth <= clientWidth + 1) {
        $wrap.removeClass("has-nav-overflow");
        $nav.removeClass("has-overflow-right");
        $prevBtn.prop("disabled", true);
        $nextBtn.prop("disabled", true);
        return;
      }

      // Overflow exists — show buttons and enable based on position.
      $wrap.addClass("has-nav-overflow");

      const atStart = scrollLeft <= 1;
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

      $prevBtn.prop("disabled", atStart);
      $nextBtn.prop("disabled", atEnd);

      $nav.toggleClass("has-overflow-right", !atEnd);
    }

    function scrollNav(direction) {
      navEl.scrollBy({
        left: direction * SCROLL_STEP,
        behavior: "smooth",
      });
    }

    $prevBtn.on("click", function () {
      if ($(this).prop("disabled")) return;
      scrollNav(-1);
    });

    $nextBtn.on("click", function () {
      if ($(this).prop("disabled")) return;
      scrollNav(1);
    });

    navEl.addEventListener("scroll", updateOverflowState, { passive: true });

    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateOverflowState, 120);
    });

    $(".mobile-toggle").on("click", updateOverflowState);

    requestAnimationFrame(updateOverflowState);
    setTimeout(updateOverflowState, 300);
  })();

  // ================= MOBILE NAVIGATION =================

  $mobileToggle.on("click", function () {
    const isOpen = $primaryNav.hasClass("is-open");

    $primaryNav.toggleClass("is-open", !isOpen);

    $(this).attr("aria-expanded", String(!isOpen));
    $(this).find("i").toggleClass("fa-bars", isOpen);
    $(this).find("i").toggleClass("fa-xmark", !isOpen);
  });

  // Close mobile navigation when a normal link is selected.
  $primaryNav.on("click", "a", function () {
    if (isMobile() && !$(this).closest(".has-mega-menu").length) {
      $primaryNav.removeClass("is-open");
      $mobileToggle.attr("aria-expanded", "false");
      $mobileToggle.find("i").removeClass("fa-xmark").addClass("fa-bars");
    }
  });

  // Reset navigation when switching between mobile
  // and desktop layouts.
  function resetNavigation() {
    closeMegaMenu();

    $primaryNav.removeClass("is-open");

    $mobileToggle.attr("aria-expanded", "false");
    $mobileToggle.find("i").removeClass("fa-xmark").addClass("fa-bars");
  }

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", resetNavigation);
  } else {
    // Compatibility with older browsers.
    mobileQuery.addListener(resetNavigation);
  }

  // Close the dropdown when clicking outside the header.
  $(document).on("click", function (event) {
    if (!$(event.target).closest(".site-header").length) {
      closeMegaMenu();
    }
  });

  // ================= NEWSLETTER FORM =================

  $(".newsletter-form").on("submit", function (event) {
    event.preventDefault();

    const $form = $(this);
    const $email = $form.find('input[type="email"]');
    const $message = $(".newsletter-message");
    const email = $email.val().trim();

    if (!email || !$email[0].checkValidity()) {
      $message.text("Please enter a valid email address.");
      $email.trigger("focus");
      return;
    }

    // Frontend demonstration only.
    // Connect this form to a real backend or email
    // marketing service to save subscriber addresses.
    $message.text(
      "Your email is valid. Connect a subscription service to complete signup.",
    );
  });

  // ================= PRODUCT CARDS =================
  $(".products-tabs .tab-links li").click(function () {
    var tabID = $(this).data("tab");

    $(".tab-links li").removeClass("active");
    $(this).addClass("active");

    $(".tab").removeClass("active");
    $("#" + tabID).addClass("active");
  });

  // ================= STORIES CAROUSEL 1 =================
  const storiesElement = document.querySelector(".stories-swiper");

  if (storiesElement && typeof Swiper !== "undefined") {
    const storiesSwiper = new Swiper(storiesElement, {
      // Use the actual CSS width of each story card.
      slidesPerView: 1,
      spaceBetween: 20,

      // Smooth movement between cards.
      speed: 500,

      // Keep the first story aligned with the carousel start.
      slidesOffsetBefore: 0,
      slidesOffsetAfter: 0,

      // Navigation buttons — scoped to this section so it
      // doesn't collide with the second carousel's buttons.
      navigation: {
        prevEl: ".stories-section .stories-prev",
        nextEl: ".stories-section .stories-next",
      },

      // Update navigation button states automatically.
      watchOverflow: true,
      watchSlidesProgress: true,

      // Accessibility support.
      a11y: {
        prevSlideMessage: "Previous story",
        nextSlideMessage: "Next story",
        firstSlideMessage: "This is the first story",
        lastSlideMessage: "This is the last story",
      },

      // Recalculate layout when the viewport changes.
      observer: true,
      observeParents: true,
      resizeObserver: true,

      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 12,
        },

        601: {
          slidesPerView: 2,
          spaceBetween: 12,
        },

        901: {
          slidesPerView: 2.7,
          spaceBetween: 20,
        },
      },
    });

    // Allow keyboard navigation when the carousel has focus.
    storiesElement.setAttribute("tabindex", "0");

    storiesElement.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        storiesSwiper.slideNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        storiesSwiper.slidePrev();
      }
    });
  }

  // ================= STORIES CAROUSEL 2 =================
  const storiesElement2 = document.querySelector(".stories-swiper-2");

  if (storiesElement2 && typeof Swiper !== "undefined") {
    const storiesSwiper2 = new Swiper(storiesElement2, {
      // Use the actual CSS width of each story card.
      slidesPerView: 1,
      spaceBetween: 20,

      // Smooth movement between cards.
      speed: 500,

      // Keep the first story aligned with the carousel start.
      slidesOffsetBefore: 0,
      slidesOffsetAfter: 0,

      // Navigation buttons — scoped to this section so it
      // doesn't collide with the first carousel's buttons.
      navigation: {
        prevEl: ".stories-section-2 .stories-prev",
        nextEl: ".stories-section-2 .stories-next",
      },

      // Update navigation button states automatically.
      watchOverflow: true,
      watchSlidesProgress: true,

      // Accessibility support.
      a11y: {
        prevSlideMessage: "Previous story",
        nextSlideMessage: "Next story",
        firstSlideMessage: "This is the first story",
        lastSlideMessage: "This is the last story",
      },

      // Recalculate layout when the viewport changes.
      observer: true,
      observeParents: true,
      resizeObserver: true,

      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 12,
        },

        601: {
          slidesPerView: 2.7,
          spaceBetween: 12,
        },

        901: {
          slidesPerView: 3.7,
          spaceBetween: 20,
        },
      },
    });

    // Allow keyboard navigation when the carousel has focus.
    storiesElement2.setAttribute("tabindex", "0");

    storiesElement2.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        storiesSwiper2.slideNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        storiesSwiper2.slidePrev();
      }
    });
  }

  // ================= IMPACT SECTION TABS =================
  const tabButtons = document.querySelectorAll(".impact-section .tab-btn");
  const tabPanels = document.querySelectorAll(".impact-section .tab-panel");

  // Shared activation function so hover and click behave identically
  function activateTab(button) {
    const targetId = button.getAttribute("data-tab");

    // 1. Reset all buttons
    tabButtons.forEach((btn) => {
      btn.classList.remove("active");
      btn.setAttribute("aria-selected", "false");
    });

    // 2. Activate the given button
    button.classList.add("active");
    button.setAttribute("aria-selected", "true");

    // 3. Hide all panels
    tabPanels.forEach((panel) => {
      panel.classList.remove("active");
    });

    // 4. Show the matching panel
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }
  }

  tabButtons.forEach((button) => {
    // Click (keyboard/touch/accessibility)
    button.addEventListener("click", () => activateTab(button));

    // Hover (desktop)
    button.addEventListener("mouseenter", () => activateTab(button));

    // Keyboard focus (nice for accessibility, mirrors hover)
    button.addEventListener("focus", () => activateTab(button));
  });

  // ================= SUSTAINABILITY CAROUSEL =================
  // 1. Inject Cloudinary background videos
  $(".sustainability-swiper .swiper-slide").each(function () {
    const slide = $(this);
    const videoUrl = slide.attr("data-background-video");

    if (!videoUrl) return;

    // Prevent duplicate video injection
    if (slide.find(".video-background-container").length) return;

    const videoHtml = `
    <div class="video-background-container">
      <video
        class="background-video"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        aria-hidden="true"
        tabindex="-1"
      >
        <source src="${videoUrl}" type="video/mp4">
      </video>
    </div>
  `;

    slide.prepend(videoHtml);

    const video = slide.find(".background-video")[0];

    // Explicitly mute the video
    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;
  });

  // 2. Pause every background video
  function pauseAllVideos() {
    $(".sustainability-swiper .background-video").each(function () {
      this.pause();
    });
  }

  // 3. Play only the active slide's video
  //    Accepts the swiper instance directly (passed as `this` from
  //    Swiper event handlers) to avoid referencing the outer
  //    `sustainabilitySwiper` const before it is initialized.
  function playSlideVideo(swiper) {
    pauseAllVideos();

    if (!swiper) return;

    // Swiper's loop mode may create duplicate slides.
    // Use the active slide element instead of relying
    // on realIndex to find the correct video.
    const activeSlide = swiper.slides[swiper.activeIndex];

    if (!activeSlide) return;

    const video = activeSlide.querySelector(".background-video");

    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.volume = 0;

    const tryPlay = () => {
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay can be blocked by browser settings.
        });
      }
    };

    // The video element may have just been injected, or the
    // browser may not have buffered enough yet. Wait until it
    // can play, with a fallback timeout in case `canplay`
    // has already fired or never fires.
    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener("canplay", tryPlay, { once: true });
      setTimeout(tryPlay, 300);
    }
  }

  // 4. Initialize Swiper
  const sustainabilitySwiper = new Swiper(".sustainability-swiper", {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,

    effect: "fade",
    fadeEffect: {
      crossFade: true,
    },

    speed: 1000,

    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },

    pagination: {
      el: ".custom-fullwidth-pagination",
      clickable: true,
    },

    on: {
      init: function () {
        // `this` is the Swiper instance. Use it instead of the
        // outer `sustainabilitySwiper` const, which is still in
        // the temporal dead zone during initialization.
        playSlideVideo(this);
      },

      slideChangeTransitionStart: function () {
        // Stop all videos during the transition
        pauseAllVideos();

        // Reset slide text animations
        $(".sustainability-swiper .slide-text-container").css({
          animation: "none",
          opacity: "0",
          transform: "translateY(30px)",
        });
      },

      slideChangeTransitionEnd: function () {
        // Play the video belonging to the active slide
        playSlideVideo(this);

        // Re-trigger the text animation
        setTimeout(() => {
          $(
            ".sustainability-swiper .swiper-slide-active .slide-text-container",
          ).css("animation", "slideUpFade 0.8s ease forwards");
        }, 100);
      },
    },
  });

  // ================= PRODUCT TABS =================

  $(document).on("click", ".product-tabs-section .tab-btn", function () {
    const $btn = $(this);
    const targetId = $btn.data("tab");

    // 1. Update the buttons
    $(".product-tabs-section .tab-btn")
      .removeClass("active")
      .attr("aria-selected", "false");
    $btn.addClass("active").attr("aria-selected", "true");

    // 2. Hide all panels and show the targeted one
    $(".product-tabs-section .tab-panel").removeClass("active");
    $("#" + targetId).addClass("active");
  });

  // ================= SIMILAR PRODUCTS CAROUSEL =================
  const similarProductsElement = document.querySelector(".similar-swiper");

  if (similarProductsElement && typeof Swiper !== "undefined") {
    const similarSwiper = new Swiper(similarProductsElement, {
      slidesPerView: 1.2, // Shows a hint of the next slide on mobile
      spaceBetween: 20,
      speed: 500,

      // Connect to our custom buttons
      navigation: {
        prevEl: ".similar-products-section .similar-prev",
        nextEl: ".similar-products-section .similar-next",
      },

      // Accessibility
      a11y: {
        prevSlideMessage: "Previous product",
        nextSlideMessage: "Next product",
      },

      // Recalculate layout when viewport changes
      observer: true,
      observeParents: true,
      resizeObserver: true,

      // Responsive Breakpoints
      breakpoints: {
        // Mobile (0px and up)
        0: {
          slidesPerView: 1.2,
          spaceBetween: 15,
        },
        // Tablet (600px and up)
        600: {
          slidesPerView: 2.2,
          spaceBetween: 20,
        },
        // Small Desktop (900px and up)
        900: {
          slidesPerView: 3.2,
          spaceBetween: 20,
        },
        // Desktop (1200px and up) - Shows 4.5 slides
        1200: {
          slidesPerView: 4.5,
          spaceBetween: 24,
        },
      },
    });
  }

  // ================= CREDIT CARDS CAROUSEL =================
  const creditCardsElement = document.querySelector(".credit-swiper");

  if (creditCardsElement && typeof Swiper !== "undefined") {
    const creditSwiper = new Swiper(creditCardsElement, {
      slidesPerView: 1.2,
      spaceBetween: 30, // Gap between slides
      speed: 500,

      navigation: {
        prevEl: ".credit-cards-section .credit-prev",
        nextEl: ".credit-cards-section .credit-next",
      },

      a11y: {
        prevSlideMessage: "Previous credit card",
        nextSlideMessage: "Next credit card",
      },

      observer: true,
      observeParents: true,
      resizeObserver: true,

      breakpoints: {
        // Mobile
        0: {
          slidesPerView: 1.2,
          spaceBetween: 20,
        },
        // Tablet
        768: {
          slidesPerView: 2.2,
          spaceBetween: 30,
        },
        // Desktop
        1024: {
          slidesPerView: 3.8, // Shows 3 full cards and 80% of the 4th
          spaceBetween: 30,
        },
      },
    });
  }
});

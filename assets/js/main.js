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

  $menuItem.on("mouseenter", function () {
    if (!isMobile()) {
      openMegaMenu();
    }
  });

  $menuItem.on("mouseleave", function () {
    if (!isMobile()) {
      scheduleClose();
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
      scheduleClose();
    }
  });

  // ================= KEYBOARD ACCESSIBILITY =================

  $menuItem.on("focusin", function () {
    if (!isMobile()) {
      openMegaMenu();
    }
  });

  $menuItem.on("focusout", function () {
    if (!isMobile()) {
      // Wait until the next focused element is known.
      setTimeout(function () {
        if (!$menuItem.has(document.activeElement).length) {
          closeMegaMenu();
        }
      }, 0);
    }
  });

  $(document).on("keydown", function (event) {
    if (event.key === "Escape") {
      closeMegaMenu();
      $menuTrigger.trigger("focus");
    }
  });

  // ================= MOBILE DROPDOWN =================

  $menuTrigger.on("click", function (event) {
    if (isMobile()) {
      event.preventDefault();

      const isOpen = $megaMenu.hasClass("is-open");

      if (isOpen) {
        closeMegaMenu();
      } else {
        openMegaMenu();
      }
    }
  });

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

  // ================= STORIES CAROUSEL =================
  const storiesElement = document.querySelector(".stories-swiper");

  // Only initialize if the stories carousel exists
  // and Swiper has loaded.
  if (!storiesElement || typeof Swiper === "undefined") {
    return;
  }

  const storiesSwiper = new Swiper(storiesElement, {
    // Use the actual CSS width of each story card.
    slidesPerView: 1,
    spaceBetween: 20,

    // Smooth movement between cards.
    speed: 500,

    // Keep the first story aligned with the carousel start.
    slidesOffsetBefore: 0,
    slidesOffsetAfter: 0,

    // Navigation buttons from the custom design.
    navigation: {
      prevEl: ".stories-prev",
      nextEl: ".stories-next",
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

  // Optional: allow keyboard navigation when the
  // carousel itself has focus.
  storiesElement.setAttribute("tabindex", "0");

  $(storiesElement).on("keydown", function (event) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      storiesSwiper.slideNext();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      storiesSwiper.slidePrev();
    }
  });

  // ================= STORIES CAROUSEL =================
  const tabButtons = document.querySelectorAll(".impact-section .tab-btn");
  const tabPanels = document.querySelectorAll(".impact-section .tab-panel");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // 1. Get the target ID from the clicked button
      const targetId = button.getAttribute("data-tab");

      // 2. Remove active class from all buttons
      tabButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });

      // 3. Add active class to clicked button
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      // 4. Hide all content panels
      tabPanels.forEach((panel) => {
        panel.classList.remove("active");
      });

      // 5. Show the specific content panel
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.add("active");
      }
    });
  });

  // ================= SUSTAINABILITY CAROUSEL =================
  // 1. Inject YouTube iframes into the background
  $(".sustainability-swiper .swiper-slide").each(function () {
    const videoUrl = $(this).attr("data-background-video");
    if (videoUrl) {
      // Create the iframe container
      const videoHtml = `<div class="video-background-container">
                                 <iframe src="${videoUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                               </div>`;
      // Prepend it to the slide
      $(this).prepend(videoHtml);
    }
  });

  // 2. Initialize Swiper
  const sustainabilitySwiper = new Swiper(".sustainability-swiper", {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    effect: "fade", // Smooth crossfade between slides
    fadeEffect: {
      crossFade: true,
    },
    speed: 1000, // Transition speed
    autoplay: {
      delay: 5000, // 5 seconds per slide
      disableOnInteraction: false,
    },
    // Custom Pagination config
    pagination: {
      el: ".custom-fullwidth-pagination",
      clickable: true,
    },
    // Events
    on: {
      init: function () {
        // Start playing the first video
        playSlideVideo(this.realIndex);
      },
      slideChangeTransitionStart: function () {
        // Pause all videos when sliding starts to prevent audio/video bleed
        pauseAllVideos();

        // Reset the CSS animation for text so it re-animates on every slide
        $(".swiper-slide .slide-text-container").css({
          animation: "none",
          opacity: "0",
          transform: "translateY(30px)",
        });
      },
      slideChangeTransitionEnd: function () {
        // Play the video of the new active slide
        playSlideVideo(this.realIndex);

        // Re-trigger text animation
        setTimeout(() => {
          $(".swiper-slide-active .slide-text-container").css(
            "animation",
            "slideUpFade 0.8s ease forwards",
          );
        }, 100);
      },
    },
  });
});

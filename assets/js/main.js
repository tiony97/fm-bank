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
    if (isMobile()) return;
    // Never close anything while inside the overflow tray
    if ($(this).closest(".mega-menu--overflow").length) return;

    const $currentMegaMenu = $(this).find(".mega-menu").first();
    const $currentTrigger = $(this).children(".nav-link").first();

    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      $currentMegaMenu.removeClass("is-open");
      $currentTrigger.attr("aria-expanded", "false");
    }, 120);
  });

  // Keep the dropdown open while moving between
  // the trigger and the dropdown itself.
  // Keep the dropdown open while moving between
  // the trigger and the dropdown itself.
  $megaMenu.on("mouseenter", function () {
    if (!isMobile() && !$(this).hasClass("mega-menu--overflow")) {
      clearTimeout(closeTimer);
    }
  });

  $megaMenu.on("mouseleave", function () {
    if (isMobile()) return;
    // 1. Skip the overflow tray itself
    if ($(this).hasClass("mega-menu--overflow")) return;
    // 2. Skip any mega menu nested inside the overflow tray
    if ($(this).closest(".mega-menu--overflow").length) return;
    // 3. Skip if a drill-in panel inside this mega is currently open
    //    (prevents hover-out closing a drilled panel)
    if ($(this).find(".sub-menu.is-open").length) return;

    const $currentMegaMenu = $(this);
    const $currentTrigger = $(this).siblings(".nav-link").first();

    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      $currentMegaMenu.removeClass("is-open");
      $currentTrigger.attr("aria-expanded", "false");
    }, 120);
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
    if (event.key !== "Escape") return;

    $(".mega-menu").removeClass("is-open");
    $(".has-mega-menu > .nav-link").attr("aria-expanded", "false");

    $(".mega-menu--overflow").removeClass("is-open");
    $(".nav-overflow-trigger")
      .attr("aria-expanded", "false")
      .find("i, svg")
      .removeClass("fa-xmark")
      .addClass("fa-bars");

    $(".site-header .sub-menu.is-open").removeClass("is-open");
    $(".site-header a.has-child.is-active")
      .removeClass("is-active")
      .attr("aria-expanded", "false");

    $(".nav-link").trigger("focus");
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

  // ================= NAV OVERFLOW (CAP + WIDTH SAFETY NET) =================
  /* =========================================================
   OVERFLOW + DRILL-IN SUBMENU ENGINE
   Works for:
   - Main nav hover mega menus (.has-mega-menu > .mega-menu)
   - Overflow tray items (items moved into [data-overflow-links])
   ========================================================= */
  (function initNavOverflow() {
    const $nav = $(".primary-nav");
    const $trigger = $(".nav-overflow-trigger");
    const $overflow = $(".mega-menu--overflow");
    const $overflowList = $overflow.find("[data-overflow-links]");

    if (!$nav.length || !$trigger.length || !$overflow.length) return;

    // Snapshot of the ORIGINAL nav items — captured once,
    // never mutated by the move-to-overflow process.
    const originalItems = $nav.children().toArray();

    function getCap() {
      if (mobileQuery.matches) return 0;
      return window.innerWidth >= 1441 ? 7 : 5;
    }

    /* --------------------------------------------------------
     Restore the pristine nav. Detach everything currently
     living in the tray and re-append the untouched originals
     in their original order.
     -------------------------------------------------------- */
    function restoreAllItems() {
      $overflowList.empty();
      originalItems.forEach((el) => $nav.append(el));
    }

    /* --------------------------------------------------------
     Clone a nav item into the overflow tray as a drill-in
     trigger + panel, and DETACH it from the primary nav.
     Returns the cloned tray item (or null if it was a plain
     link that had no mega menu).
     -------------------------------------------------------- */
    function moveToOverflow($sourceItem) {
      const $mega = $sourceItem.children(".mega-menu").first();
      const $link = $sourceItem.children(".nav-link").first();

      // Plain link → mirror it and detach the source.
      if (!$mega.length) {
        const $clone = $sourceItem.clone(true, true);
        $overflowList.append($clone);
        $sourceItem.detach();
        return $clone;
      }

      // Deep-clone the panel and the trigger.
      const $panel = $mega.clone(true, true);
      const $trayLink = $link.clone(true, true);

      // --- Panel cleanup ---------------------------------------
      $panel
        .removeClass("mega-menu")
        .addClass("sub-menu")
        .attr("data-overflow-panel", "")
        .removeAttr("style")
        .removeAttr("id");

      $panel.find(".sub-menu").removeClass("is-open").removeAttr("style");
      $panel
        .find("a.has-child")
        .removeClass("is-active")
        .attr("aria-expanded", "false");

      // Tray is links-only — drop decorative columns.
      $panel.find(".mega-menu__promo, .mega-menu__feature").remove();

      if (!$panel.children(".back-button").length) {
        $panel.prepend(
          '<div class="back-button"><i class="fa-solid fa-chevron-left"></i> Back</div>',
        );
      }

      // --- Trigger cleanup -------------------------------------
      $trayLink
        .removeClass("nav-link")
        .addClass("overflow-link has-child")
        .removeAttr("aria-haspopup")
        .attr("role", "button")
        .attr("aria-expanded", "false");

      const $icon = $trayLink.find("i").first();
      if ($icon.length) {
        $icon.attr("class", "fa-solid fa-chevron-right");
      } else {
        $trayLink.append(' <i class="fa-solid fa-chevron-right"></i>');
      }

      // --- Wrap into a tray item -------------------------------
      const $trayItem = $('<div class="nav-item overflow-item"></div>');
      $trayItem.append($trayLink).append($panel);
      $overflowList.append($trayItem);

      // CRITICAL: remove the source item from the primary nav
      // so it disappears from the header (it lives in the tray now).
      $sourceItem.detach();

      return $trayItem;
    }

    /* --------------------------------------------------------
     Distribute visible vs. overflow items.
     -------------------------------------------------------- */
    function distributeItems() {
      if (mobileQuery.matches) {
        restoreAllItems();
        $trigger.hide();
        $overflow.removeClass("is-open");
        $trigger
          .attr("aria-expanded", "false")
          .find("i, svg")
          .removeClass("fa-xmark")
          .addClass("fa-bars");
        return;
      }

      // Start from a pristine nav every time.
      restoreAllItems();

      // Width-only: move items to the tray until the nav fits.
      const visibleItems = $nav.children().toArray();

      let safety = 0;
      while (
        $nav[0].scrollWidth > $nav[0].clientWidth + 1 &&
        visibleItems.length > 1 &&
        safety < 20
      ) {
        const last = visibleItems.pop();
        moveToOverflow($(last));
        safety++;
      }

      const hasOverflow = $overflowList.children().length > 0;
      $trigger.toggle(hasOverflow);

      if (!hasOverflow) {
        $overflow.removeClass("is-open");
        $trigger
          .attr("aria-expanded", "false")
          .find("i, svg")
          .removeClass("fa-xmark")
          .addClass("fa-bars");
      }
    }

    let resizeTimer;
    $(window).on("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(distributeItems, 150);
    });
    setTimeout(distributeItems, 200);

    /* --------------------------------------------------------
     Overflow tray toggle
     -------------------------------------------------------- */
    $trigger.on("click", function (e) {
      if (mobileQuery.matches) return; // no-op on mobile
      e.preventDefault();
      const isOpen = $overflow.hasClass("is-open");
      $overflow.toggleClass("is-open", !isOpen);
      $(this).attr("aria-expanded", String(!isOpen));
      $(this)
        .find("i, svg")
        .toggleClass("fa-bars", isOpen)
        .toggleClass("fa-xmark", !isOpen);
      if (!isOpen) {
        $(".mega-menu").not($overflow).removeClass("is-open");
        $(".has-mega-menu > .nav-link").attr("aria-expanded", "false");
      }
    });

    $overflow.on("mouseleave", function () {
      // no-op: intentionally left empty to prevent accidental
      // hover-out closing of drilled-in panels.
    });

    /* =========================================================
     UNIVERSAL DRILL-IN HANDLER (main mega menus + tray)
     ========================================================= */
    const $header = $(".site-header");

    $header.on("click", "a.has-child", function (e) {
      if (this.classList.contains("nav-link")) return;

      const $link = $(this);
      const $parentItem = $link.closest(
        ".overflow-item, .nav-item, .mega-menu__links",
      );
      if (!$parentItem.length) return;

      let $panel = $link.siblings(".sub-menu").first();
      if (!$panel.length) $panel = $link.nextAll(".sub-menu").first();
      if (!$panel.length) return;

      e.preventDefault();
      e.stopPropagation();

      const willOpen = !$panel.hasClass("is-open");

      const $scope = $link.closest(
        ".overflow-item, .mega-menu__links, .mega-menu",
      );
      $scope.find(".sub-menu.is-open").not($panel).removeClass("is-open");
      $scope
        .find("a.has-child.is-active")
        .not($link)
        .removeClass("is-active")
        .attr("aria-expanded", "false");

      $panel.toggleClass("is-open", willOpen);
      $link
        .toggleClass("is-active", willOpen)
        .attr("aria-expanded", String(willOpen));

      if (willOpen && !$panel.children(".back-button").length) {
        $panel.prepend(
          '<div class="back-button"><i class="fa-solid fa-chevron-left"></i> Back</div>',
        );
      }
    });

    $header.on("click", ".sub-menu > .back-button", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $panel = $(this).closest(".sub-menu");
      const $triggerLink = $panel
        .siblings("a.has-child")
        .first()
        .add($panel.prevAll("a.has-child").first());

      $panel.removeClass("is-open");
      $triggerLink.removeClass("is-active").attr("aria-expanded", "false");

      const $tray = $panel.closest(".overflow-item");
      if ($tray.length) {
        $tray
          .children("a.has-child")
          .removeClass("is-active")
          .attr("aria-expanded", "false");
      }
    });

    /* --------------------------------------------------------
     Outside click + Escape
     -------------------------------------------------------- */
    $(document).on("click", function (event) {
      if (
        !$(event.target).closest(
          ".nav-links-container, .mega-menu--overflow, .nav-overflow-trigger",
        ).length
      ) {
        $overflow.removeClass("is-open");
        $trigger
          .attr("aria-expanded", "false")
          .find("i, svg")
          .removeClass("fa-xmark")
          .addClass("fa-bars");
      }
    });

    if (mobileQuery.addEventListener) {
      mobileQuery.addEventListener("change", distributeItems);
    }
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

  // ================= SIMILAR ARTICLES CAROUSEL =================
  const similarArticlesElement = document.querySelector(
    ".similar-articles-swiper",
  );

  if (similarArticlesElement && typeof Swiper !== "undefined") {
    const similarArticlesSwiper = new Swiper(similarArticlesElement, {
      slidesPerView: 1.2,
      spaceBetween: 20,
      speed: 500,

      navigation: {
        prevEl: ".similar-articles-section .similar-articles-prev",
        nextEl: ".similar-articles-section .similar-articles-next",
      },

      a11y: {
        prevSlideMessage: "Previous article",
        nextSlideMessage: "Next article",
      },

      observer: true,
      observeParents: true,
      resizeObserver: true,

      breakpoints: {
        0: {
          slidesPerView: 1.2,
          spaceBetween: 15,
        },
        600: {
          slidesPerView: 2.2,
          spaceBetween: 20,
        },
        900: {
          slidesPerView: 3.2,
          spaceBetween: 20,
        },
        1200: {
          slidesPerView: 4, // Shows exactly 4 articles to match the blog grid
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

  // ================= RESOURCES CAROUSEL =================
  const resourcesElement = document.querySelector(".resources-swiper");

  if (resourcesElement && typeof Swiper !== "undefined") {
    const resourcesSwiper = new Swiper(resourcesElement, {
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
        prevEl: ".featured-resources .resources-prev",
        nextEl: ".featured-resources .resources-next",
      },

      // Update navigation button states automatically.
      watchOverflow: true,
      watchSlidesProgress: true,

      // Accessibility support.
      a11y: {
        prevSlideMessage: "Previous resources",
        nextSlideMessage: "Next resources",
        firstSlideMessage: "This is the first resources",
        lastSlideMessage: "This is the last resources",
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
    resourcesElement.setAttribute("tabindex", "0");

    resourcesElement.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        resourcesSwiper.slideNext();
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        resourcesSwiper.slidePrev();
      }
    });
  }

  // ================= CUSTOM MULTI-SELECT DROPDOWNS =================

  // Toggle Dropdown Open/Close
  $(".custom-select .select-trigger").on("click", function (e) {
    e.stopPropagation();
    const $parent = $(this).closest(".custom-select");
    const $dropdown = $parent.find(".select-dropdown");
    const $trigger = $(this);

    // Close other dropdowns
    $(".custom-select")
      .not($parent)
      .find(".select-dropdown")
      .removeClass("open");
    $(".custom-select")
      .not($parent)
      .find(".select-trigger")
      .removeClass("active");

    $dropdown.toggleClass("open");
    $trigger.toggleClass("active");

    // Auto-focus the search input if it exists (Year dropdown)
    if (
      $dropdown.hasClass("open") &&
      $dropdown.find(".search-year-input").length
    ) {
      $dropdown.find(".search-year-input").trigger("focus");
    }
  });

  // Close custom dropdowns when clicking outside
  $(document).on("click.customDropdown", function (e) {
    $(".custom-select").each(function () {
      const $sel = $(this);
      if (!$sel.is(e.target) && $sel.has(e.target).length === 0) {
        $sel.find(".select-dropdown").removeClass("open");
        $sel.find(".select-trigger").removeClass("active");
      }
    });
  });

  // Prevent close when clicking inside the dropdown
  $(".custom-select .select-dropdown").on("click", function (e) {
    e.stopPropagation();
  });

  // ================= INJECT FA CHECK ICONS INTO CHECKBOXES =================
  // Runs once on page load. Adds <i class="fa-solid fa-check"></i>
  // inside every custom-select checkbox, so the icon renders via
  // FontAwesome's normal mechanism (which we know works on this page).
  // ================= INJECT FA CHECK ICONS INTO CHECKBOXES =================
  $(".custom-select .option-item .checkbox").each(function () {
    if (!$(this).find(".check-icon").length) {
      $(this).append('<i class="fa-solid fa-check check-icon"></i>');
    }
  });

  // Handle Option Selection
  $(".custom-select .option-item").on("click", function () {
    const $item = $(this);
    const $parent = $item.closest(".custom-select");
    const $triggerText = $parent.find(".selected-text");
    const selectName = $parent.data("name");
    const itemValue = $item.data("value");

    // Special Logic for "All" category
    if (selectName === "category" && itemValue === "All") {
      const isAllSelected = $item.hasClass("selected");

      if (!isAllSelected) {
        // Select "All" and deselect others
        $parent.find(".option-item").removeClass("selected");
        $item.addClass("selected");
      } else {
        // Deselect "All"
        $item.removeClass("selected");
      }
    } else {
      // Standard Toggle Logic
      $item.toggleClass("selected");

      // If a specific category is selected, deselect "All"
      if (selectName === "category") {
        $parent.find('.option-item[data-value="All"]').removeClass("selected");
      }
    }

    // Update trigger text
    const selectedValues = $parent
      .find(".option-item.selected")
      .map(function () {
        return $(this).data("value");
      })
      .get();

    if (selectedValues.length === 0) {
      // Reset to default labels
      if (selectName === "category") $triggerText.text("Category");
      if (selectName === "date") $triggerText.text("Date");
      if (selectName === "year") $triggerText.text("Period");
    } else if (selectedValues.length === 1) {
      $triggerText.text(selectedValues[0]);
    } else {
      $triggerText.text(`${selectedValues.length} Selected`);
    }
  });

  // Year Search Filtering
  $(".search-year-input").on("input", function () {
    const query = $(this).val().toLowerCase().trim();
    const $options = $(this)
      .closest(".select-dropdown")
      .find(".year-options .option-item");

    $options.each(function () {
      const text = $(this).text().toLowerCase();
      if (text.includes(query)) {
        $(this).removeClass("hidden");
      } else {
        $(this).addClass("hidden");
      }
    });
  });

  // Clear Filters Button
  $("#clear-filters").on("click", function () {
    // Reset all selections
    $(".custom-select .option-item").removeClass("selected");
    $(".custom-select .selected-text").each(function () {
      const name = $(this).closest(".custom-select").data("name");
      if (name === "category") $(this).text("Category");
      if (name === "date") $(this).text("Date");
      if (name === "year") $(this).text("Period");
    });

    // Clear search input
    $(".search-year-input").val("");
    $(".search-year-input").trigger("input"); // reset list visibility

    // Optional: Reset actual search input if needed
    $("#search").val("");
  });

  // ================= ASSET AUCTION SECTION =================

  // 1. Tab Switching
  $(".asset-tab").on("click", function () {
    const target = $(this).data("target");

    // Toggle active state on tab buttons
    $(".asset-tab").removeClass("active");
    $(this).addClass("active");

    // Toggle active state on panels
    $(".auction-tab-panel").removeClass("active");
    $("#" + target).addClass("active");
  });

  // 2. Inject Check Icons into Auction Checkboxes
  $(".auction-select .auction-option .auction-checkbox").each(function () {
    if (!$(this).find(".check-icon").length) {
      $(this).append('<i class="fa-solid fa-check check-icon"></i>');
    }
  });

  // 3. Auction Dropdown Toggle Logic
  $(".auction-select .auction-trigger").on("click", function (e) {
    e.stopPropagation();
    const $parent = $(this).closest(".auction-select");
    const $dropdown = $parent.find(".auction-dropdown");
    const $trigger = $(this);

    // Close all other auction dropdowns
    $(".auction-select")
      .not($parent)
      .find(".auction-dropdown")
      .removeClass("open");
    $(".auction-select")
      .not($parent)
      .find(".auction-trigger")
      .removeClass("active");

    $dropdown.toggleClass("open");
    $trigger.toggleClass("active");

    if (
      $dropdown.hasClass("open") &&
      $dropdown.find(".search-year-input").length
    ) {
      $dropdown.find(".search-year-input").trigger("focus");
    }
  });

  // Close auction dropdowns on outside click
  $(document).on("click.auctionDropdown", function (e) {
    $(".auction-select").each(function () {
      const $sel = $(this);
      if (!$sel.is(e.target) && $sel.has(e.target).length === 0) {
        $sel.find(".auction-dropdown").removeClass("open");
        $sel.find(".auction-trigger").removeClass("active");
      }
    });
  });

  // Prevent closing when clicking inside the dropdown
  $(".auction-select .auction-dropdown").on("click", function (e) {
    e.stopPropagation();
  });

  // 4. Option Selection Logic
  $(".auction-select .auction-option").on("click", function () {
    const $item = $(this);
    const $parent = $item.closest(".auction-select");
    const $triggerText = $parent.find(".selected-text");
    const selectName = $parent.data("name");

    // Toggle selection
    $item.toggleClass("selected");

    // Get all selected values
    const selectedValues = $parent
      .find(".auction-option.selected")
      .map(function () {
        return $(this).data("value");
      })
      .get();

    // Update the trigger text based on selection state
    if (selectedValues.length === 0) {
      if (selectName === "county") $triggerText.text("County");
      if (selectName === "property") $triggerText.text("Property Type");
      if (selectName === "price") $triggerText.text("Price");
      if (selectName === "vehicle-type") $triggerText.text("Vehicle Type");
      if (selectName === "year") $triggerText.text("Year of Manufacture");
    } else if (selectedValues.length === 1) {
      $triggerText.text(selectedValues[0]);
    } else {
      $triggerText.text(`${selectedValues.length} Selected`);
    }
  });

  // 5. Year Search Filtering
  $(".auction-select .search-year-input").on("input", function () {
    const query = $(this).val().toLowerCase().trim();
    const $options = $(this)
      .closest(".auction-dropdown")
      .find(".year-options .auction-option");

    $options.each(function () {
      const text = $(this).text().toLowerCase();
      if (text.includes(query)) {
        $(this).removeClass("hidden");
      } else {
        $(this).addClass("hidden");
      }
    });
  });

  // 6. Price Range Slider Logic
  const $priceMin = $("#price-min");
  const $priceMax = $("#price-max");
  const $priceMinInput = $("#price-min-input");
  const $priceMaxInput = $("#price-max-input");
  const $sliderFill = $("#slider-fill");
  const $priceDisplay = $("#price-display");
  const maxLimit = 120000000;

  function updatePriceSlider() {
    let minVal = parseInt($priceMin.val());
    let maxVal = parseInt($priceMax.val());

    // Ensure min doesn't exceed max by more than 1M
    if (minVal > maxVal - 1000000) {
      minVal = maxVal - 1000000;
      $priceMin.val(minVal);
    }

    // Update Inputs
    $priceMinInput.val(minVal);
    $priceMaxInput.val(maxVal);

    // Update Visuals
    const minPercent = (minVal / maxLimit) * 100;
    const maxPercent = (maxVal / maxLimit) * 100;
    $sliderFill.css({
      left: minPercent + "%",
      right: 100 - maxPercent + "%",
    });

    // Update Text Display
    const formatCurrency = (num) => "KES " + num.toLocaleString();
    $priceDisplay.text(`${formatCurrency(minVal)} - ${formatCurrency(maxVal)}`);
  }

  // Bind Price Slider Events
  if ($priceMin.length) {
    $priceMin.on("input", updatePriceSlider);
    $priceMax.on("input", updatePriceSlider);

    $priceMinInput.on("input", function () {
      let val = parseInt($(this).val()) || 0;
      if (val > maxLimit) val = maxLimit;
      $priceMin.val(val);
      updatePriceSlider();
    });

    $priceMaxInput.on("input", function () {
      let val = parseInt($(this).val()) || 0;
      if (val > maxLimit) val = maxLimit;
      $priceMax.val(val);
      updatePriceSlider();
    });

    updatePriceSlider(); // Initialize on load
  }

  // 7. Clear Filters (Scoped to active tab)
  $(".clear-auction-btn").on("click", function () {
    const $panel = $(this).closest(".auction-tab-panel");

    // Clear Custom Selects
    $panel.find(".auction-option").removeClass("selected");
    $panel.find(".selected-text").each(function () {
      const name = $(this).closest(".auction-select").data("name");
      if (name === "county") $(this).text("County");
      if (name === "property") $(this).text("Property Type");
      if (name === "price") $(this).text("Price");
      if (name === "vehicle-type") $(this).text("Vehicle Type");
      if (name === "year") $(this).text("Year of Manufacture");
    });

    // Clear Search Input
    $panel.find('input[type="search"]').val("");

    // Reset Year search input list
    $panel.find(".search-year-input").val("").trigger("input");

    // Reset Price Slider (if inside this panel)
    if ($panel.find("#price-min").length) {
      $panel.find("#price-min").val(0);
      $panel.find("#price-max").val(maxLimit);
      updatePriceSlider();
    }
  });

  // ================= ASSET DETAILS GALLERY =================

  $(".asset-gallery .thumbnail").on("click", function () {
    // 1. Get the image source from the clicked thumbnail
    const newImageSrc = $(this).find("img").attr("src");

    // 2. Swap the main image source
    $("#main-asset-image").attr("src", newImageSrc);

    // 3. Remove active class from all thumbnails and add to the clicked one
    $(".asset-gallery .thumbnail").removeClass("active");
    $(this).addClass("active");
  });

  // ================= IMPACT STORIES TABS =================
  $(".impact-stories-section .tab-links li").on("click", function () {
    // 1. Get the target tab ID
    const targetTab = $(this).data("tab");

    // 2. Toggle active state on the list items
    $(".impact-stories-section .tab-links li").removeClass("active");
    $(this).addClass("active");

    // 3. Hide all tab panels and show the targeted one
    $(".impact-stories-section .tab-content .tab").removeClass("active");
    $("#" + targetTab).addClass("active");
  });

  // ================= SUSTAINABILITY REPORTS FILTERS =================

  // 1. Inject Check Icons
  $(".report-select .report-checkbox").each(function () {
    if (!$(this).find(".check-icon").length) {
      $(this).append('<i class="fa-solid fa-check check-icon"></i>');
    }
  });

  // 2. Toggle Dropdowns
  $(".report-select .report-trigger").on("click", function (e) {
    e.stopPropagation();
    const $parent = $(this).closest(".report-select");
    const $dropdown = $parent.find(".report-dropdown");
    const $trigger = $(this);

    // Close other report dropdowns
    $(".report-select")
      .not($parent)
      .find(".report-dropdown")
      .removeClass("open");
    $(".report-select")
      .not($parent)
      .find(".report-trigger")
      .removeClass("active");

    $dropdown.toggleClass("open");
    $trigger.toggleClass("active");
  });

  // 3. Close on Outside Click
  $(document).on("click.reportClose", function (e) {
    $(".report-select").each(function () {
      const $sel = $(this);
      // If the click is outside this specific dropdown
      if (!$sel.is(e.target) && $sel.has(e.target).length === 0) {
        $sel.find(".report-dropdown").removeClass("open");
        $sel.find(".report-trigger").removeClass("active");
      }
    });
  });

  // Prevent closing when clicking inside the dropdown
  $(".report-select .report-dropdown").on("click", function (e) {
    e.stopPropagation();
  });

  // 4. Handle Selection
  $(".report-select .report-option").on("click", function () {
    const $item = $(this);
    const $parent = $item.closest(".report-select");
    const $triggerText = $parent.find(".report-selected-text");
    const selectName = $parent.data("name");

    // Toggle selected class
    $item.toggleClass("selected");

    // Get selected values
    const selectedValues = $parent
      .find(".report-option.selected")
      .map(function () {
        return $(this).data("value");
      })
      .get();

    // Update trigger text
    if (selectedValues.length === 0) {
      if (selectName === "date") $triggerText.text("Date");
      if (selectName === "period") $triggerText.text("Period");
    } else if (selectedValues.length === 1) {
      $triggerText.text(selectedValues[0]);
    } else {
      $triggerText.text(`${selectedValues.length} Selected`);
    }
  });

  // 5. Clear Filters
  $(".clear-reports-btn").on("click", function () {
    const $section = $(this).closest(".sustainability-reports-section");

    // Clear selects
    $section.find(".report-option").removeClass("selected");
    $section.find(".report-selected-text").each(function () {
      const name = $(this).closest(".report-select").data("name");
      if (name === "date") $(this).text("Date");
      if (name === "period") $(this).text("Period");
    });

    // Clear search
    $section.find('input[type="search"]').val("");
  });

  // ================= FX CONVERTER LOGIC =================

  const $fxForm = $("#fx-converter-form");
  const $fromCurrency = $("#from-currency");
  const $toCurrency = $("#to-currency");
  const $amountInput = $("#amount-input");
  const $convertedAmount = $("#converted-amount");
  const $convertBtn = $("#convert-btn");

  // 1. Enable/Disable Submit Button based on inputs
  function checkFormValidity() {
    const fromVal = $fromCurrency.val();
    const toVal = $toCurrency.val();
    const amountVal = $amountInput.val();

    // Check if all fields have values and amount is greater than 0
    if (fromVal && toVal && amountVal && parseFloat(amountVal) > 0) {
      $convertBtn.prop("disabled", false);
    } else {
      $convertBtn.prop("disabled", true);
    }
  }

  // Attach event listeners for live validation
  $fxForm.on("input change", "select, input", function () {
    checkFormValidity();
  });

  // 2. Handle Form Submission (Conversion)
  $fxForm.on("submit", function (e) {
    e.preventDefault();

    // Get rates from the selected options' data attributes
    const fromRate = parseFloat($fromCurrency.find(":selected").data("rate"));
    const toRate = parseFloat($toCurrency.find(":selected").data("rate"));
    const amount = parseFloat($amountInput.val());

    // Get the currency name for the placeholder text
    const toCurrencyText = $toCurrency.find(":selected").text();

    // Perform conversion (Amount * From Rate / To Rate)
    const convertedValue = (amount * fromRate) / toRate;

    // Format the output with commas and 2 decimal places
    const formattedResult = convertedValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    // Display result
    $convertedAmount.val(
      `${toCurrencyText.split(" - ")[0]} ${formattedResult}`,
    );
  });

  // ================= TREASURY MONEY MARKET CALCULATOR =================

  const $calcForm = $("#interest-calc-form");
  const $calcSubmitBtn = $("#calc-submit-btn");
  const $calcFormView = $("#calc-form-view");
  const $calcResultsView = $("#calc-results-view");
  const $calcBackBtn = $("#calc-back-btn");

  // 1. Enable/Disable Submit Button
  function checkCalcFormValidity() {
    const currency = $("#calc-currency").val();
    const principal = $("#calc-principal").val();
    const rate = $("#calc-rate").val();
    const tenor = $("#calc-tenor").val();

    if (
      currency &&
      principal &&
      parseFloat(principal) > 0 &&
      rate &&
      parseFloat(rate) >= 0 &&
      tenor &&
      parseInt(tenor) > 0
    ) {
      $calcSubmitBtn.prop("disabled", false);
    } else {
      $calcSubmitBtn.prop("disabled", true);
    }
  }

  // Listen for live changes on all inputs/selects inside the calculator
  $calcForm.on("input change", "input, select", function () {
    checkCalcFormValidity();
  });

  // 2. Handle Form Submit & Calculate
  $calcForm.on("submit", function (e) {
    e.preventDefault();

    const currency = $("#calc-currency").val();
    const principal = parseFloat($("#calc-principal").val());
    const rate = parseFloat($("#calc-rate").val());
    const tenor = parseInt($("#calc-tenor").val());

    // Simple calculation formula: (Principal * Rate% * Days) / 365
    const grossInterest = (principal * (rate / 100) * tenor) / 365;

    // Assuming standard 15% Withholding Tax (WRH) on interest
    const wrhTax = grossInterest * 0.15;
    const netInterest = grossInterest - wrhTax;

    // Format outputs
    const formatCurrency = (num) => {
      return (
        currency +
        " " +
        num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    };

    // Inject results into DOM
    $("#res-gross").text(formatCurrency(grossInterest));
    $("#res-tax").text(formatCurrency(wrhTax));
    $("#res-net").text(formatCurrency(netInterest));

    // Toggle Views
    $calcFormView.hide();
    $calcResultsView.fadeIn(300);
  });

  // 3. Handle Back Button
  $calcBackBtn.on("click", function () {
    $calcResultsView.hide();
    $calcFormView.fadeIn(300);

    // Optional: Reset form on back
    // $calcForm[0].reset();
    // $calcSubmitBtn.prop("disabled", true);
  });

  // ================= MARKET INFORMATION FILTERS =================

  // 1. Inject Check Icons
  $(".market-select .market-checkbox").each(function () {
    if (!$(this).find(".check-icon").length) {
      $(this).append('<i class="fa-solid fa-check check-icon"></i>');
    }
  });

  // 2. Toggle Dropdowns
  $(".market-select .market-trigger").on("click", function (e) {
    e.stopPropagation();
    const $parent = $(this).closest(".market-select");
    const $dropdown = $parent.find(".market-dropdown");
    const $trigger = $(this);

    // Close other market dropdowns
    $(".market-select")
      .not($parent)
      .find(".market-dropdown")
      .removeClass("open");
    $(".market-select")
      .not($parent)
      .find(".market-trigger")
      .removeClass("active");

    $dropdown.toggleClass("open");
    $trigger.toggleClass("active");
  });

  // 3. Close on Outside Click
  $(document).on("click.marketClose", function (e) {
    $(".market-select").each(function () {
      const $sel = $(this);
      // If the click is outside this specific dropdown
      if (!$sel.is(e.target) && $sel.has(e.target).length === 0) {
        $sel.find(".market-dropdown").removeClass("open");
        $sel.find(".market-trigger").removeClass("active");
      }
    });
  });

  // Prevent closing when clicking inside the dropdown
  $(".market-select .market-dropdown").on("click", function (e) {
    e.stopPropagation();
  });

  // 4. Handle Selection
  $(".market-select .market-option").on("click", function () {
    const $item = $(this);
    const $parent = $item.closest(".market-select");
    const $triggerText = $parent.find(".market-selected-text");
    const selectName = $parent.data("name");

    // Toggle selected class
    $item.toggleClass("selected");

    // Get selected values
    const selectedValues = $parent
      .find(".market-option.selected")
      .map(function () {
        return $(this).data("value");
      })
      .get();

    // Update trigger text
    if (selectedValues.length === 0) {
      if (selectName === "category") $triggerText.text("Category");
      if (selectName === "date") $triggerText.text("Date");
      if (selectName === "period") $triggerText.text("Period");
    } else if (selectedValues.length === 1) {
      $triggerText.text(selectedValues[0]);
    } else {
      $triggerText.text(`${selectedValues.length} Selected`);
    }
  });

  // 5. Clear Filters
  $(".clear-market-btn").on("click", function () {
    const $section = $(this).closest(".market-info-section");

    // Clear selects
    $section.find(".market-option").removeClass("selected");
    $section.find(".market-selected-text").each(function () {
      const name = $(this).closest(".market-select").data("name");
      if (name === "category") $(this).text("Category");
      if (name === "date") $(this).text("Date");
      if (name === "period") $(this).text("Period");
    });

    // Clear search
    $section.find('input[type="search"]').val("");
  });

  // ================= MEMBERS DIRECTORY MODAL =================
  $(function () {
    const $modalOverlay = $("#memberModal");
    const $modalImage = $("#modalImage");
    const $modalName = $("#modalName");
    const $modalRole = $("#modalRole");
    const $modalLinkedin = $("#modalLinkedin");
    const $modalBio = $("#modalBio");
    const $profileBtns = $(".view-profile-btn");

    let currentIndex = 0;
    let membersData = [];

    // 1. Extract data from all buttons on page load
    $profileBtns.each(function (index) {
      const $btn = $(this);
      membersData.push({
        name: $btn.data("name"),
        role: $btn.data("role"),
        image: $btn.data("image"),
        bio: $btn.data("bio"),
        linkedin: $btn.data("linkedin"),
        element: $btn, // Store the button to reference for focus return
      });
    });

    // 2. Function to populate and open the modal
    function openModal(index) {
      currentIndex = index;
      const member = membersData[currentIndex];

      // Populate content
      $modalName.text(member.name);
      $modalRole.text(member.role);
      $modalImage.attr("src", member.image).attr("alt", member.name);

      // Handle LinkedIn link (hide if not provided)
      //   if (member.linkedin && member.linkedin !== "#") {
      //     $modalLinkedin.attr("href", member.linkedin).show();
      //   } else {
      //     $modalLinkedin.hide();
      //   }
      // Always show LinkedIn and set the href
      $modalLinkedin.attr("href", member.linkedin || "#").show();

      // Handle Bio (Split by "||" if you used the delimiter for paragraphs)
      let bioHtml = "";
      if (member.bio) {
        const paragraphs = member.bio.split("||");
        paragraphs.forEach((p) => {
          bioHtml += `<p>${p.trim()}</p>`;
        });
      }
      $modalBio.html(bioHtml);

      // Show modal
      $modalOverlay.addClass("is-active").attr("aria-hidden", "false");
      $("body").css("overflow", "hidden"); // Prevent background scrolling
    }

    // 3. Function to close the modal
    function closeModal() {
      $modalOverlay.removeClass("is-active").attr("aria-hidden", "true");
      $("body").css("overflow", "");

      // Return focus to the button that opened the modal
      if (membersData[currentIndex]) {
        membersData[currentIndex].element.trigger("focus");
      }
    }

    // 4. Event Listeners

    // Open Modal
    $profileBtns.on("click", function (e) {
      e.preventDefault();
      const index = $profileBtns.index(this);
      openModal(index);
    });

    // Close Modal (Button, Overlay click, or Escape key)
    $modalOverlay.find(".close-btn").on("click", closeModal);

    $modalOverlay.on("click", function (e) {
      if (e.target === this) closeModal();
    });

    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && $modalOverlay.hasClass("is-active")) {
        closeModal();
      }
    });

    // Next / Previous Navigation
    $modalOverlay.find(".next-btn").on("click", function () {
      let nextIndex = (currentIndex + 1) % membersData.length;
      openModal(nextIndex);
    });

    $modalOverlay.find(".prev-btn").on("click", function () {
      let prevIndex =
        (currentIndex - 1 + membersData.length) % membersData.length;
      openModal(prevIndex);
    });
  });

  // ================= GLOBAL FILTER COMPONENT =================
  $(function () {
    const $globalFilters = $(".global-filter");

    if (!$globalFilters.length) return;

    // 1. Inject Check Icons into Checkboxes
    $globalFilters.find(".gf-option .gf-checkbox").each(function () {
      if (!$(this).find(".check-icon").length) {
        $(this).append('<i class="fa-solid fa-check check-icon"></i>');
      }
    });

    // 2. Toggle Dropdown Open/Close
    $globalFilters.find(".gf-trigger").on("click", function (e) {
      e.stopPropagation();
      const $parent = $(this).closest(".gf-select");
      const $dropdown = $parent.find(".gf-dropdown");
      const $trigger = $(this);

      // Close all other global dropdowns
      $globalFilters
        .find(".gf-select")
        .not($parent)
        .find(".gf-dropdown")
        .removeClass("open");
      $globalFilters
        .find(".gf-select")
        .not($parent)
        .find(".gf-trigger")
        .removeClass("active");

      // Toggle current
      $dropdown.toggleClass("open");
      $trigger.toggleClass("active");
    });

    // 3. Close dropdowns when clicking outside
    $(document).on("click.gfClose", function (e) {
      if (!$(e.target).closest(".gf-select").length) {
        $globalFilters.find(".gf-dropdown").removeClass("open");
        $globalFilters.find(".gf-trigger").removeClass("active");
      }
    });

    // 4. Prevent closing when clicking inside the dropdown menu
    $globalFilters.find(".gf-dropdown").on("click", function (e) {
      e.stopPropagation();
    });

    // 5. Handle Option Selection
    $globalFilters.find(".gf-option").on("click", function () {
      const $item = $(this);
      const $parent = $item.closest(".gf-select");
      const $triggerText = $parent.find(".gf-selected-text");
      const selectName = $parent.data("name");

      // Toggle selection state
      $item.toggleClass("selected");

      // Get all currently selected values in this dropdown
      const selectedValues = $parent
        .find(".gf-option.selected")
        .map(function () {
          return $(this).data("value");
        })
        .get();

      // Update Trigger Text
      if (selectedValues.length === 0) {
        // Reset to default based on the data-name attribute
        if (selectName === "category") $triggerText.text("Category");
        else if (selectName === "date") $triggerText.text("Date");
        else if (selectName === "period") $triggerText.text("Period");
        else $triggerText.text("Select...");
      } else if (selectedValues.length === 1) {
        $triggerText.text(selectedValues[0]);
      } else {
        $triggerText.text(`${selectedValues.length} Selected`);
      }
    });

    // 6. Handle Clear Button
    $globalFilters.find(".gf-clear-btn").on("click", function (e) {
      e.preventDefault();
      const $filterContainer = $(this).closest(".global-filter");

      // Clear search input
      $filterContainer.find('input[type="search"]').val("");

      // Clear all selected options
      $filterContainer.find(".gf-option").removeClass("selected");

      // Reset all trigger texts to default
      $filterContainer.find(".gf-selected-text").each(function () {
        const name = $(this).closest(".gf-select").data("name");
        if (name === "category") $(this).text("Category");
        else if (name === "date") $(this).text("Date");
        else if (name === "period") $(this).text("Period");
        else $(this).text("Select...");
      });
    });

    // 7. Handle Apply Button (Optional - add your filter logic here)
    $globalFilters.find(".gf-apply-btn").on("click", function (e) {
      e.preventDefault();
      // Example: Collect all selected data to filter your grid
      const selectedFilters = {};
      $(this)
        .closest(".global-filter")
        .find(".gf-select")
        .each(function () {
          const name = $(this).data("name");
          const values = $(this)
            .find(".gf-option.selected")
            .map(function () {
              return $(this).data("value");
            })
            .get();
          if (values.length > 0) selectedFilters[name] = values;
        });

      console.log("Applying filters:", selectedFilters);
      // Add your AJAX call or frontend filtering logic here
    });
  });

  // ================= JOB DETAILS FORM LOGIC =================
  $(function () {
    const $jobForm = $(".job-application-form");

    if (!$jobForm.length) return;

    // 1. Handle File Upload UI
    const $fileInput = $("#resume");
    const $dropZone = $("#drop-zone");
    const $uploadContent = $dropZone.find(".upload-content");
    const $fileInfo = $dropZone.find(".file-info");

    $fileInput.on("change", function () {
      const file = this.files[0];

      if (file) {
        // Show file name and hide the default upload UI
        $uploadContent.hide();
        $fileInfo.text(`Selected: ${file.name}`).fadeIn(200);
      } else {
        // Reset if no file is selected
        $fileInfo.hide();
        $uploadContent.fadeIn(200);
      }
    });

    // Add drag and drop styling
    $dropZone.on("dragover dragenter", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).addClass("dragover");
    });

    $dropZone.on("dragleave drop", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).removeClass("dragover");
    });

    // 2. Handle Phone Number Country Code
    const $countrySelect = $("#country-code");
    const $phoneInput = $("#phone-number");

    $countrySelect.on("change", function () {
      const selectedCode = $(this).val();

      // Update the placeholder to show the country code
      $phoneInput.attr("placeholder", selectedCode);

      // Optional: If the input is empty, pre-fill the country code
      if ($phoneInput.val() === "" || $phoneInput.val().startsWith("+")) {
        $phoneInput.val(selectedCode + " ");
      }
    });

    // Trigger change on load to set initial placeholder
    $countrySelect.trigger("change");
  });

  // ================= SIMILAR JOBS SWIPER =================
  const similarJobsElement = document.querySelector(".similar-jobs-swiper");

  if (similarJobsElement && typeof Swiper !== "undefined") {
    const similarJobsSwiper = new Swiper(similarJobsElement, {
      slidesPerView: 1.1, // Shows a tiny peek of the next slide on mobile
      spaceBetween: 20,
      speed: 500,

      // Connect to our custom navigation buttons
      navigation: {
        prevEl: ".similar-jobs-section .similar-prev",
        nextEl: ".similar-jobs-section .similar-next",
      },

      // Accessibility
      a11y: {
        prevSlideMessage: "Previous job",
        nextSlideMessage: "Next job",
      },

      // Recalculate layout when viewport changes
      observer: true,
      observeParents: true,
      resizeObserver: true,

      // Responsive Breakpoints
      breakpoints: {
        // Mobile (0px and up)
        0: {
          slidesPerView: 1.1,
          spaceBetween: 15,
        },
        // Tablet (600px and up)
        600: {
          slidesPerView: 2.2,
          spaceBetween: 20,
        },
        // Small Desktop (900px and up)
        900: {
          slidesPerView: 2.8, // Shows 2 full cards and a peek of the 3rd
          spaceBetween: 24,
        },
        // Large Desktop (1200px and up)
        1200: {
          slidesPerView: 3.5, // Shows 3 full cards and a half card, matching the image
          spaceBetween: 30,
        },
      },
    });
  }

  // ================= CAREERS VIDEO MODAL =================
  $(function () {
    const $videoPreview = $("#openVideoModal");
    const $videoModal = $("#videoModal");
    const $closeBtn = $("#closeVideoModal");
    const $videoPlayer = $("#videoPlayer");

    // REPLACE THIS with your actual YouTube embed link or MP4 URL
    const videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1";

    // Open Modal
    $videoPreview.on("click", function (e) {
      // Prevent opening if they clicked the "Read Transcript" button
      if ($(e.target).closest(".transcript-btn").length) {
        return;
      }

      $videoPlayer.attr("src", videoUrl); // Load video
      $videoModal.addClass("is-active");
      $("body").css("overflow", "hidden"); // Prevent background scrolling
    });

    // Close Modal Function
    function closeVideoModal() {
      $videoModal.removeClass("is-active");
      $videoPlayer.attr("src", ""); // Stop video playback
      $("body").css("overflow", "");
    }

    // Close on Button Click
    $closeBtn.on("click", closeVideoModal);

    // Close on Overlay Click
    $videoModal.on("click", function (e) {
      if (e.target === this) {
        closeVideoModal();
      }
    });

    // Close on Escape Key
    $(document).on("keydown", function (e) {
      if (e.key === "Escape" && $videoModal.hasClass("is-active")) {
        closeVideoModal();
      }
    });
  });

  // ================= OUR JOURNEY SWIPER =================
  $(function () {
    const journeyElement = document.querySelector(".journey-swiper");
    const $timelineLabelsContainer = $("#timelineLabels");
    const $timelineProgress = $("#timelineProgress");
    const $nextBtn = $(".journey-next");
    const $prevBtn = $(".journey-prev");

    if (journeyElement && typeof Swiper !== "undefined") {
      const slides = journeyElement.querySelectorAll(".swiper-slide");
      const totalSlides = slides.length;

      // 1. Build Timeline Labels
      // We use the original totalSlides to build the timeline (without the loop clones)
      slides.forEach((slide, index) => {
        const year = slide.getAttribute("data-year");
        const activeClass = index === 0 ? "active" : "";
        $timelineLabelsContainer.append(
          `<span class="timeline-label ${activeClass}" data-index="${index}">${year}</span>`,
        );
      });

      // 2. Initialize Swiper with Loop mode
      const journeySwiper = new Swiper(journeyElement, {
        slidesPerView: 1.5,
        spaceBetween: 40,
        speed: 600,
        loop: true, // ENABLED LOOP MODE
        watchSlidesProgress: true,
        // Swiper requires at least double the slidesPerView to loop smoothly
        loopedSlides: 4,

        breakpoints: {
          0: { slidesPerView: 1.1, spaceBetween: 20 },
          768: { slidesPerView: 1.5, spaceBetween: 30 },
          1200: { slidesPerView: 2, spaceBetween: 50 },
        },

        on: {
          init: function () {
            updateUI(this);
          },
          slideChange: function () {
            updateUI(this);
          },
          slideChangeTransitionEnd: function () {
            updateUI(this);
          },
        },
      });

      // 3. Custom UI Update Function
      function updateUI(swiper) {
        // In loop mode, Swiper uses realIndex to track the actual slide index (0 to 5)
        let currentIndex = swiper.realIndex;

        // --- TIMELINE UPDATE ---
        $timelineLabelsContainer.find(".timeline-label").removeClass("active");
        $timelineLabelsContainer
          .find(`.timeline-label[data-index="${currentIndex}"]`)
          .addClass("active");

        const progressPercentage = (currentIndex / (totalSlides - 1)) * 100;
        $timelineProgress.css("width", `${progressPercentage}%`);

        // --- BUTTON STATES ---
        // Because we are looping, the buttons technically never disable,
        // but we can disable them visually if you don't want users to click "Prev" on the very first slide
        if (currentIndex === 0) {
          $prevBtn.addClass("swiper-button-disabled");
        } else {
          $prevBtn.removeClass("swiper-button-disabled");
        }

        if (currentIndex === totalSlides - 1) {
          $nextBtn.addClass("swiper-button-disabled");
        } else {
          $nextBtn.removeClass("swiper-button-disabled");
        }
      }

      // 4. Custom Next/Prev Click Handlers
      $nextBtn.on("click", function (e) {
        e.preventDefault();
        // With loop: true, this will wrap around to the start automatically
        journeySwiper.slideNext();
      });

      $prevBtn.on("click", function (e) {
        e.preventDefault();
        journeySwiper.slidePrev();
      });

      // 5. Timeline Label Click Handlers
      $(document).on("click", ".timeline-label", function () {
        const targetIndex = parseInt($(this).data("index"));

        // slideToLoop handles jumping to the correct clone in loop mode
        journeySwiper.slideToLoop(targetIndex);
      });
    }
  });

  // ================= FAQ SECTION LOGIC =================
  $(function () {
    // 1. Tab Switching
    $(".faq-tab-btn").on("click", function () {
      const targetPanelId = $(this).data("tab");

      // Remove active from all buttons
      $(".faq-tab-btn").removeClass("active").attr("aria-selected", "false");
      // Add active to clicked button
      $(this).addClass("active").attr("aria-selected", "true");

      // Hide all panels
      $(".faq-panel").removeClass("active").hide();

      // Show targeted panel
      $("#" + targetPanelId)
        .addClass("active")
        .fadeIn(300);
    });

    // 2. Accordion Logic
    $(".faq-question").on("click", function () {
      const $parentItem = $(this).closest(".faq-item");
      const $answer = $parentItem.find(".faq-answer");
      const $icon = $(this).find(".faq-icon");

      // Check if this item is currently open
      const isOpen = $parentItem.hasClass("active");

      // Optional: Close all other items in the same tab (Accordion style)
      $parentItem
        .siblings(".faq-item")
        .removeClass("active")
        .find(".faq-answer")
        .slideUp(300);
      $parentItem
        .siblings(".faq-item")
        .find(".faq-icon")
        .removeClass("fa-chevron-up")
        .addClass("fa-chevron-down");

      // Toggle the clicked item
      if (isOpen) {
        $parentItem.removeClass("active");
        $answer.slideUp(300);
        $icon.removeClass("fa-chevron-up").addClass("fa-chevron-down");
      } else {
        $parentItem.addClass("active");
        $answer.slideDown(300);
        $icon.removeClass("fa-chevron-down").addClass("fa-chevron-up");
      }
    });
  });

  // ================= LOCATIONS MAP LOGIC (LEAFLET) =================
  let map;
  let markers = [];

  // --- 1. Dummy Data (Keep your existing array here) ---
  const locationData = {
    branch: [
      {
        name: "Family Bank Towers - 001",
        lat: -1.2845,
        lng: 36.8235,
        address: "Family Bank Towers, Muindi Mbingu Street, Nairobi",
        hours: "Retail: Mon-Fri 8:00am – 4:00pm; Sat 8:00am – 12:00pm",
      },
      {
        name: "Wote Branch - 088",
        lat: -1.7833,
        lng: 37.6333,
        address: "Junction Mall, along Wote – Makindu Road",
        hours: "Retail: Mon-Fri 8:00am – 5:00pm; Sat 8:00am – 1:00pm",
      },
      // ... other branches
    ],
    agent: [
      {
        name: "PesaPap Agent - Kajiado",
        lat: -1.8522,
        lng: 36.7768,
        address: "Kitengela Town, Kajiado",
        hours: "Mon-Sat: 8:00am – 6:00pm",
      },
      // ... other agents
    ],
    atm: [
      {
        name: "ATM - JKIA",
        lat: -1.3191,
        lng: 36.9278,
        address: "4th Season Centre Building, JKIA, Nairobi",
        hours: "24/7",
      },
      // ... other ATMs
    ],
  };

  // --- 2. Initialize Leaflet Map ---
  function initMap() {
    // Set default view to Kenya
    map = L.map("googleMap").setView([-1.286389, 36.817223], 7);

    // Add OpenStreetMap Tile Layer (Completely Free, No API Key)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Load initial markers (Branches)
    updateMarkers("branch");
  }

  // --- 3. Function to Update Markers based on Tab ---
  function updateMarkers(type) {
    // Clear existing markers from the map
    markers.forEach((marker) => map.removeLayer(marker));
    markers = [];

    const locations = locationData[type] || [];

    // Add new markers
    locations.forEach((loc) => {
      // You can use custom icons here if you want different colors per type
      const marker = L.marker([loc.lat, loc.lng]).addTo(map);

      // Add click event to open your custom modal
      marker.on("click", () => {
        showLocationModal(loc);
        map.panTo([loc.lat, loc.lng]);
      });

      markers.push(marker);
    });

    // Adjust map bounds to fit all markers
    if (markers.length > 0) {
      const group = new L.featureGroup(markers);
      map.fitBounds(group.getBounds());

      // Prevent zooming in too much if there's only one marker
      if (markers.length === 1) {
        map.setZoom(15);
      }
    }
  }

  // --- 4. Popup Modal Logic (Unchanged) ---
  const $locationModal = $("#locationModal");
  const $closeLocationModal = $("#closeLocationModal");

  function showLocationModal(loc) {
    $("#locName").text(loc.name);
    $("#locHours").text(loc.hours);
    $("#locAddress").text(loc.address);

    // Generate Google Maps directions link (still works for navigating)
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`;
    $("#locDirections").attr("href", directionsUrl);

    $locationModal.addClass("is-active");
    $("body").css("overflow", "hidden");
  }

  function closeLocationModal() {
    $locationModal.removeClass("is-active");
    $("body").css("overflow", "");
  }

  // Close Modal Listeners
  $closeLocationModal.on("click", closeLocationModal);
  $locationModal.on("click", function (e) {
    if (e.target === this) closeLocationModal();
  });
  $(document).on("keydown", function (e) {
    if (e.key === "Escape" && $locationModal.hasClass("is-active")) {
      closeLocationModal();
    }
  });

  // --- 5. Event Listeners for Tabs & Load ---
  $(function () {
    // Initialize map on page load
    initMap();

    // Tab Switching
    $(".loc-tab-btn").on("click", function () {
      const type = $(this).data("type");

      $(".loc-tab-btn").removeClass("active").attr("aria-selected", "false");
      $(this).addClass("active").attr("aria-selected", "true");

      updateMarkers(type);
    });

    // Get Current Location Button
    $("#getLocationBtn").on("click", function () {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userPos = [
              position.coords.latitude,
              position.coords.longitude,
            ];

            map.setView(userPos, 14);

            // Add a marker for user
            L.marker(userPos).addTo(map).bindPopup("You are here").openPopup();
          },
          () => {
            alert(
              "Unable to retrieve your location. Please check your browser permissions.",
            );
          },
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }
    });
  });

  // =========================================
  // HEADER DROPDOWNS (Login & Search)
  // =========================================

  // --- 1. Login Dropdown ---
  const $loginTrigger = $(".login-trigger");
  const $loginDropdown = $(".login-dropdown");

  $loginTrigger.on("click", function (e) {
    e.stopPropagation();
    const isOpen = $loginDropdown.hasClass("is-open");

    // Close search if open
    $(".header-search-dropdown").removeClass("is-open");
    $(".search-trigger")
      .removeClass("is-active")
      .html('<i class="fa-solid fa-magnifying-glass"></i>');

    // Toggle Login
    $loginDropdown.toggleClass("is-open", !isOpen);

    // Update Text
    $(this).text(isOpen ? "Login" : "Close");
  });

  // --- 2. Search Dropdown ---
  const $searchTrigger = $(".search-trigger");
  const $searchDropdown = $(".header-search-dropdown");

  $searchTrigger.on("click", function (e) {
    e.stopPropagation();
    const isOpen = $searchDropdown.hasClass("is-open");

    // Close login if open
    $loginDropdown.removeClass("is-open");
    $loginTrigger.text("Login");

    // Toggle Search
    $searchDropdown.toggleClass("is-open", !isOpen);

    // Update Icon
    if (isOpen) {
      $(this)
        .removeClass("is-active")
        .html('<i class="fa-solid fa-magnifying-glass"></i>');
    } else {
      $(this).addClass("is-active").html('<i class="fa-solid fa-xmark"></i>');
      // Optional: Focus the input when opened
      setTimeout(() => {
        $searchDropdown.find("input").trigger("focus");
      }, 300);
    }
  });

  // --- 3. Close on Outside Click ---
  $(document).on("click", function (e) {
    // Close Login Dropdown
    if (!$(e.target).closest(".login-dropdown-wrapper").length) {
      $loginDropdown.removeClass("is-open");
      $loginTrigger.text("Login");
    }

    // Close Search Dropdown
    if (
      !$(e.target).closest(".header-search-dropdown").length &&
      !$(e.target).closest(".search-trigger").length
    ) {
      $searchDropdown.removeClass("is-open");
      $searchTrigger
        .removeClass("is-active")
        .html('<i class="fa-solid fa-magnifying-glass"></i>');
    }
  });

  // --- 4. Close on Escape Key ---
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      $loginDropdown.removeClass("is-open");
      $loginTrigger.text("Login");

      $searchDropdown.removeClass("is-open");
      $searchTrigger
        .removeClass("is-active")
        .html('<i class="fa-solid fa-magnifying-glass"></i>');
    }
  });

  // Awards Accordion functionality
  $(".awards-accordion .accordion-header").on("click", function () {
    var $item = $(this).parent(".accordion-item");
    var $content = $item.find(".accordion-content");
    var $icon = $(this).find(".icon i");
    var isActive = $item.hasClass("active");

    // 1. Close all other items
    $(".awards-accordion .accordion-item").removeClass("active");
    $(".awards-accordion .accordion-content").slideUp(300);
    $(".awards-accordion .accordion-header .icon i")
      .removeClass("fa-arrow-up")
      .addClass("fa-arrow-down");
    $(".awards-accordion .accordion-header").attr("aria-expanded", "false");

    // 2. Toggle the clicked item
    if (!isActive) {
      $item.addClass("active");
      $content.slideDown(300);
      $icon.removeClass("fa-arrow-down").addClass("fa-arrow-up");
      $(this).attr("aria-expanded", "true");
    }
  });
});

// =========================================
// CALCULATOR MODALS LOGIC
// =========================================
$(function () {
  const $mortgageModal = $("#mortgage-calculator");
  const $loanModal = $("#loan-calculator");
  const $fullResultsModal = $("#full-results-modal");
  const $body = $("body");

  // 1. OPEN MAIN MODALS
  $('a[href="#mortgage-calculator"]').on("click", function (e) {
    e.preventDefault();
    openModal($mortgageModal);
  });

  $('a[href="#loan-calculator"]').on("click", function (e) {
    e.preventDefault();
    openModal($loanModal);
  });

  function openModal($modal) {
    $modal.find(".calc-view").removeClass("active");
    $modal.find(".calc-input-view").addClass("active");
    $modal.find("form")[0].reset();
    $modal.find(".calc-submit-btn").prop("disabled", true);

    $modal.addClass("is-open");
    $body.css("overflow", "hidden");
  }

  // 2. CLOSE MAIN MODALS
  $(".calculator-modal").on(
    "click",
    ".calc-modal-overlay, .calc-close-btn",
    function () {
      const $modal = $(this).closest(".calculator-modal");
      $modal.removeClass("is-open");
      $body.css("overflow", "");
    },
  );

  // 3. LIVE FORM VALIDATION
  $(".calculator-form").on("input", "input", function () {
    const $form = $(this).closest("form");
    const inputs = $form.find("input[required]");
    let allFilled = true;

    inputs.each(function () {
      const val = $(this).val().trim();
      if (val === "" || parseFloat(val) <= 0) {
        allFilled = false;
        return false;
      }
    });

    $form.find(".calc-submit-btn").prop("disabled", !allFilled);
  });

  // 4. CALCULATION & PRIMARY RESULTS
  $(".calculator-form").on("submit", function (e) {
    e.preventDefault();

    const $form = $(this);
    const $modal = $form.closest(".calculator-modal");
    const isMortgage = $modal.attr("id") === "mortgage-calculator";

    // Get values
    const loanAmount = parseFloat(
      $form.find('input[name="loan_amount"]').val(),
    );
    const durationMonths = parseFloat(
      $form.find('input[name="duration"]').val(),
    );
    const annualRate = parseFloat(
      $form.find('input[name="interest_rate"]').val(),
    );
    const propertyValue = isMortgage
      ? parseFloat($form.find('input[name="property_value"]').val())
      : 0;

    // Math logic
    const monthlyRate = annualRate / 100 / 12;
    const durationYears = (durationMonths / 12).toFixed(1);

    let monthlyRepayment = 0;
    let totalRepayment = 0;
    let totalInterest = 0;

    if (monthlyRate === 0) {
      monthlyRepayment = loanAmount / durationMonths;
      totalRepayment = loanAmount;
    } else {
      const factor = Math.pow(1 + monthlyRate, durationMonths);
      monthlyRepayment = (loanAmount * (monthlyRate * factor)) / (factor - 1);
      totalRepayment = monthlyRepayment * durationMonths;
      totalInterest = totalRepayment - loanAmount;
    }

    const formatCurrency = (num) =>
      num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // Populate Blue Results View
    const prefix = isMortgage ? "#mortgage-res" : "#loan-res";
    $modal.find(`${prefix}-loan-amount`).text(formatCurrency(loanAmount));
    $modal.find(`${prefix}-interest`).text(annualRate);
    $modal.find(`${prefix}-years`).text(durationYears);
    $modal.find(`${prefix}-monthly`).text(formatCurrency(monthlyRepayment));
    $modal.find(`${prefix}-total-interest`).text(formatCurrency(totalInterest));
    $modal.find(`${prefix}-total`).text(formatCurrency(totalRepayment));

    // Switch to Results View
    $modal.find(".calc-view").removeClass("active");
    $modal.find(".calc-results-view").addClass("active");
  });

  // 5. OPEN FULL RESULTS MODAL
  $(".view-full-results-btn").on("click", function () {
    const type = $(this).data("type"); // "mortgage" or "loan"
    const isMortgage = type === "mortgage";
    const $sourceModal = isMortgage ? $mortgageModal : $loanModal;

    // Get fresh values from the source form
    const $form = $sourceModal.find("form");
    const loanAmount = parseFloat(
      $form.find('input[name="loan_amount"]').val(),
    );
    const durationMonths = parseFloat(
      $form.find('input[name="duration"]').val(),
    );
    const annualRate = parseFloat(
      $form.find('input[name="interest_rate"]').val(),
    );
    const propertyValue = isMortgage
      ? parseFloat($form.find('input[name="property_value"]').val())
      : 0;

    // Recalculate to ensure accuracy
    const monthlyRate = annualRate / 100 / 12;
    const durationYears = (durationMonths / 12).toFixed(1);
    let monthlyRepayment = 0;
    let totalRepayment = 0;
    let totalInterest = 0;

    if (monthlyRate === 0) {
      monthlyRepayment = loanAmount / durationMonths;
      totalRepayment = loanAmount;
    } else {
      const factor = Math.pow(1 + monthlyRate, durationMonths);
      monthlyRepayment = (loanAmount * (monthlyRate * factor)) / (factor - 1);
      totalRepayment = monthlyRepayment * durationMonths;
      totalInterest = totalRepayment - loanAmount;
    }

    const formatCurrency = (num) =>
      num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    // --- POPULATE NEW MODAL ---

    // 1. Update Text based on type
    if (isMortgage) {
      $fullResultsModal
        .find("#fr-type-title")
        .text("Mortgage Repayment Estimate");
      $fullResultsModal
        .find("#fr-main-title")
        .text("Mortgage Repayment Results");
      $fullResultsModal
        .find("#fr-footer-title")
        .text("Ready to own your home?");
      $fullResultsModal
        .find("#fr-footer-desc")
        .text(
          "Talk to our mortgage team about your options and the next steps.",
        );
      $fullResultsModal.find("#fr-mortgage-costs").show();
    } else {
      $fullResultsModal.find("#fr-type-title").text("Loan Repayment Estimate");
      $fullResultsModal.find("#fr-main-title").text("Loan Repayment Results");
      $fullResultsModal.find("#fr-footer-title").text("Ready to apply?");
      $fullResultsModal
        .find("#fr-footer-desc")
        .text("Call us to take the next step and apply for your loan.");
      $fullResultsModal.find("#fr-mortgage-costs").hide();
    }

    // 2. Date
    const dateOptions = { day: "numeric", month: "short", year: "numeric" };
    $fullResultsModal
      .find("#fr-date")
      .text(new Date().toLocaleDateString("en-GB", dateOptions));

    // 3. Summary Cards
    $fullResultsModal
      .find("#fr-monthly-val")
      .text(formatCurrency(monthlyRepayment));
    $fullResultsModal
      .find("#fr-total-val")
      .text(formatCurrency(totalRepayment));

    // 4. Inputs Section
    $fullResultsModal.find("#fr-input-amount").text(formatCurrency(loanAmount));
    $fullResultsModal.find("#fr-input-rate").text(annualRate.toFixed(2));
    $fullResultsModal
      .find("#fr-input-term")
      .text(`${durationMonths} months (${durationYears} years)`);
    $fullResultsModal
      .find("#fr-input-interest")
      .text(formatCurrency(totalInterest));

    // 5. Progress Bar
    const loanPercent = ((loanAmount / totalRepayment) * 100).toFixed(1);
    const interestPercent = ((totalInterest / totalRepayment) * 100).toFixed(1);
    $fullResultsModal.find("#fr-progress-fill").css("width", `${loanPercent}%`);
    $fullResultsModal.find("#fr-percent-loan").text(`${loanPercent}%`);
    $fullResultsModal.find("#fr-percent-interest").text(`${interestPercent}%`);

    // 6. Mortgage Specific Upfront Costs
    if (isMortgage) {
      // Assuming standard rates for estimation as per image
      const stampRate = 0.04;
      const appraisalRate = 0.01;
      const stampDuty = propertyValue * stampRate;
      const appraisalFee = propertyValue * appraisalRate;
      const deposit = propertyValue - loanAmount;
      const ltv = ((loanAmount / propertyValue) * 100).toFixed(1);
      const totalUpfront = stampDuty + appraisalFee + deposit;

      $fullResultsModal
        .find("#fr-prop-val")
        .text(formatCurrency(propertyValue));
      $fullResultsModal.find("#fr-stamp-val").text(formatCurrency(stampDuty));
      $fullResultsModal
        .find("#fr-appraisal-val")
        .text(formatCurrency(appraisalFee));
      $fullResultsModal
        .find("#fr-deposit-val")
        .text(formatCurrency(deposit > 0 ? deposit : 0));
      $fullResultsModal.find("#fr-ltv-val").text(`${ltv}%`);
      $fullResultsModal
        .find("#fr-total-upfront")
        .text(formatCurrency(totalUpfront));
    }

    // Open Modal
    $fullResultsModal.addClass("is-open");
  });

  // 6. CLOSE FULL RESULTS MODAL
  $(".full-results-close-btn, .full-results-overlay").on("click", function () {
    $fullResultsModal.removeClass("is-open");
    // Note: We don't remove overflow from body because the main calculator modal is still open underneath
  });

  // 7. ESCAPE KEY
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      if ($fullResultsModal.hasClass("is-open")) {
        $fullResultsModal.removeClass("is-open");
      } else {
        const $openMainModal = $(".calculator-modal.is-open");
        if ($openMainModal.length) {
          $openMainModal.removeClass("is-open");
          $body.css("overflow", "");
        }
      }
    }
  });
});

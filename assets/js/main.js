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

      const cap = getCap();
      const items = $nav.children().toArray();

      // 1) Cap-based split.
      const visibleItems = items.slice(0, cap);
      const overflowItems = items.slice(cap);

      overflowItems.forEach((el) => moveToOverflow($(el)));

      // 2) Width safety net — remove visible items until the
      //    remaining ones fit, then move them to the tray.
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
});

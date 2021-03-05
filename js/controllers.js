"use strict"
class TownController {
  constructor() {
    this.onTouchStart = null;
    this.onTouchEnd = null;
    this.windowW = null;
    this.windowH = null;
    this.field = null;
    this.model = null;
  }

  start(field, model) {
    this.field = field;
    this.model = model;
  }

  init() {
    this.addCellListeners();
    this.addMenuListeners();
    this.addDocumentListeners();
    this.addWindowListeners();
    this.addTouchEvents(); 
    this.rememberWindowSize();
    this.hidePreloadPage()
    if (window.location.hash.substr(1) !== "Main" &&
        window.location.hash.substr(1) !== "")
      this.switchToStateFromURLHash();
  }

  addCellListeners() {
    let cellCollect = this.field.querySelectorAll(".cell");
    for (let i = 0; i < cellCollect.length; i++) {
      cellCollect[i].addEventListener("click", (e) => {
        e = e || window.event;
        let cors = e.currentTarget.id.split("");
        let prevElem = e.currentTarget.querySelector(".item__active");
        if (prevElem) e.currentTarget.innetHTML = "";
        let y = +cors[0];
        let x = +cors[1];
        this.model.addElemToUserPos(y, x);
      });

      cellCollect[i].addEventListener("mouseenter", (e) => {
        e = e || window.event;
        let cors = e.target.id.split("");
        let y = +cors[0];
        let x = +cors[1];
        this.model.showBeforeClick(y, x);
      });

      cellCollect[i].addEventListener("mouseleave", (e) => {
        e = e || window.event;
        let cors = e.target.id.split("");
        let y = +cors[0];
        let x = +cors[1];
        this.model.removeBeforeClick(y, x);
      });

      cellCollect[i].addEventListener('animationend', (e) => {
        e = e || window.event;
        cellCollect[i].style.animation = "";
        cellCollect[i].classList.remove("going");
        let pointWrap = cellCollect[i].querySelector(".point__active");
        if (pointWrap) cellCollect[i].removeChild(pointWrap);
      });
    }
  }

  addMenuListeners() {
    document.querySelector(".game__score").addEventListener("click", () => {
      this.switchToScorePage();
    });

    document.querySelector(".game__rules").addEventListener("click", () => {
      this.switchToRulesPage();
    });

    document.querySelector(".game__start").addEventListener("click", () => {
      this.model.newGame();
    });
      
    document.querySelector(".close__btn").addEventListener('click', () => {
      this.switchToMainPage();
    });
  }

  addNameBtnListeners() {
    document.querySelector(".winner__name").addEventListener("keypress", (e) => {
      e = e || window.event;
      this.model.setName(e);
    });

    document.querySelector(".winner__name").addEventListener("blur", (e) => {
      e = e || window.event;
      this.model.setName(e);
    });
  }

  addGameOverBtnEvent() {
    document.querySelector(".close__over").addEventListener('click', () => {
      document.querySelector(".win__wrapper").style.animation = "closeMenuItem 1s linear 1 forwards";
    });
  }

  addDocumentListeners() {
    document.addEventListener('animationstart', (e) => {
      e = e || window.event;
      document.querySelector(".field").style.pointerEvents = "none";
    }); 

    document.addEventListener('animationend', (e) => {
      e = e || window.event;
      document.querySelector(".field").style.pointerEvents = "";
      let cellCollect = this.field.querySelectorAll(".out");
      for(let i = 0; i < cellCollect.length; i++)
        cellCollect[i].classList.remove("out");
    }); 

    document.addEventListener('animationcancel', (e) => {
      e = e || window.event;
      document.querySelector(".field").style.pointerEvents = "";
      let cellCollect = this.field.querySelectorAll(".out");
      for(let i = 0; i < cellCollect.length; i++)
        cellCollect[i].classList.remove("out");
    }); 
  }

  addWindowListeners() {
    window.addEventListener("beforeunload", (e) => {
      e = e || window.event;
      if (this.model.getTotalPoints()) {
        e.returnValue = "This page has unsaved changes";
        return "This page has unsaved changes";
      }
    });

    window.addEventListener("hashchange", this.switchToStateFromURLHash.bind(this));

    window.addEventListener("resize", () => {
      let w = window.outerWidth;
      let h = window.outerHeight;

      if (w - this.windowW > 10 || this.windowW - w > 10 ||
          h - this.windowH > 10 || this.windowH - h > 10) {
        this.model.resize();
        this.windowW = w;
        this.windowH = h;
      }
    });

    window.addEventListener("load", () => {
      let preloadWpap = document.querySelector(".preload__view");
      let preload = document.querySelector(".overlay-loader");
      let preBtn = document.querySelector(".preload__btn");

      preloadWpap.removeChild(preload);
      preBtn.classList.remove("preload__item--unactive");
    });
  }

  addTouchEvents() {
    document.addEventListener("touchstart", (e) => {
      e = e || window.event;
      if (e.touches.length === 1) 
        this.onTouchStart = e.touches[0].pageX;
    });

    document.addEventListener("touchend", (e) => {
      e = e || window.event;
      if (!e.touches.length) {
        this.onTouchEnd = e.changedTouches[0].pageX;
        this.swipe();
      }
    });
  }

  rememberWindowSize() {
    this.windowW = window.outerWidth;
    this.windowH = window.outerHeight;
  }

  swipe() {
    if (this.onTouchStart < this.onTouchEnd && 
        this.onTouchEnd - this.onTouchStart > 50) {
      this.switchToRulesPage();
    } else if (this.onTouchStart > this.onTouchEnd && 
               this.onTouchStart - this.onTouchEnd > 50) {
      this.switchToScorePage();
    }
  }

  hidePreloadPage() {
    document.querySelector(".preload__btn").addEventListener("click", () => {
      let wrap = document.querySelector(".preload__view");
      let audio = new Audio();
      wrap.style.animation = "fromViewedtoHidden 0.5s linear 1 forwards"
      setTimeout(() => wrap.style.display = "none", 500);
      audio.src = "./assets/sounds/main.mp3";
      audio.loop = true;
      audio.volume = 0.5;
      audio.play();
    })
  }

  switchToStateFromURLHash() {
    let hash = window.location.hash.substr(1);
    if (hash === "") this.model.showPage("Main");
    this.model.showPage(hash);
  }

  switchToMainPage() {
    location.hash = "Main";
  }

  switchToScorePage() {
    location.hash = "Score";
  }

  switchToRulesPage() {
    location.hash = "Rules";
  }
}
"use strict"
class TownView {
  constructor() {
    this.model = null;
    this.controllers = null;
    this.itemsObj = null
    this.field = document.createElement("div");
    this.winPage = document.createElement("div");
    this.previousField = []; 
    this.password = null;
    this.ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
    this.stringName = "POTOTSKAYA_SPOOKY_TOWN";
    this.totalPoints = 0;
    this.score = null;
    this.sound = true; 
    this.clickSound = new Audio("assets/sounds/click.mp3");
  }

  init() {
    document.body.innerHTML += `
    <input id="menu__toggle" type="checkbox" />
    <label class="menu__btn" for="menu__toggle">
      <span></span>
    </label>
    `;
    this.createField();
    this.positionCell();
    this.addMenu();
    this.addMenuPages();
    this.addWinPage();
    this.addSoundBtn();
    this.preloadImages();
  }

  start(model, controllers, obj) {
    this.model = model;
    this.controllers = controllers;
    this.itemsObj = obj;
  }

  createField() {
    let field = this.model.getField();
    this.field.classList.add("field");
    document.body.appendChild(this.field);

    for (let i = 0; i < field.length; i++) {
      for(let j = 0; j < field.length; j++) {
        let cell = document.createElement("div");
        cell.id = i + "" + j;
        cell.classList.add("cell");
        this.field.appendChild(cell);
      }
    }
  }

  positionCell() {
    let field = this.model.getField();
    this.resize();

    for (let i = field.length - 1; i >= 0; i--) {
      for(let j = field.length - 1; j >= 0; j--) {
        let cell = document.getElementById(`${i + "" + j}`);
        cell.style.position = "absolute";
      }
    }
  }

  addControllers(parent) {
    let container = document.createElement("div");
    let btnStart = document.createElement("button");
    let btnRules = document.createElement("button");
    let btnScore = document.createElement("button");

    btnStart.classList.add("game__controller", "game__start");
    btnRules.classList.add("game__controller", "game__rules");
    btnScore.classList.add("game__controller", "game__score");

    btnStart.innerHTML = "New Game";
    btnRules.innerHTML = "Rules";
    btnScore.innerHTML = "Score";

    container.classList.add("geme__controller__wrapper");
    container.appendChild(btnStart);
    container.appendChild(btnRules);
    container.appendChild(btnScore);
    parent.appendChild(container);
  }

  addMenu() {
    let wrap = document.createElement("div");
    let scoreWrap = document.createElement("div");
    let itemWrap = document.createElement("div");

    wrap.classList.add("game__menu");
    scoreWrap.classList.add("game__score--count");
    itemWrap.classList.add("game__item--active");

    scoreWrap.innerHTML = "<span>Points:  </span><span id='points'>0</span>";
    itemWrap.innerHTML = "<span class='image__pref'>Now:  </span><img src='' alt='active item' id='active'>";

    wrap.appendChild(scoreWrap);
    wrap.appendChild(itemWrap);
    this.addControllers(wrap);
    document.body.appendChild(wrap);
  }

  addMenuPages() {
    let rulesPage = document.createElement("div"),
        rulesWrap = document.createElement("div"),
        closeRulesBtn = document.createElement("div");
    
  
    rulesPage.classList.add("menu__item__wrapper");
    rulesWrap.classList.add("menu__item");
    closeRulesBtn.classList.add("close__btn");

    rulesWrap.innerHTML = `
    <span class="menu__item__title new__page__title"></span>
    <div class="new__page__wrapper"></div>`;

    closeRulesBtn.innerHTML = "×";

    rulesWrap.appendChild(closeRulesBtn);
    rulesPage.appendChild(rulesWrap);
    document.body.appendChild(rulesPage);
  }


  addSoundBtn() {
    let soundWrap = document.createElement("div");
    soundWrap.classList.add("game__sound__wrapper");
    soundWrap.innerHTML = `
    <button class="sound__btn music__btn" title="Click here to play or stop music">&#9835;</button>
    <button class="sound__btn sound" title="Click here to to play or stop sound">&#9834;</button>`;

    document.body.appendChild(soundWrap);
  }

  addWinPage() {
    let winWrap = document.createElement("div");

    this.winPage.classList.add("win__wrapper", "menu__item__wrapper");
    winWrap.classList.add("win__item", "menu__item");

    winWrap.innerHTML = `
    <span class="menu__item__title">Game Over</span>
    <div class="win__resuls"></div>`;

    this.winPage.appendChild(winWrap);
    document.body.appendChild(this.winPage);
  }

  fillField() {
    let modelField = this.model.getField();
    for(let i = 0; i < modelField.length; i++) {
      for(let j = 0; j < modelField[i].length; j++) {
        let key = modelField[i][j] + "";
        let cellId = i + "" + j;
        let cell = document.getElementById(`${cellId}`);
        cell.innerHTML = "";
        if (key !== "0") {
          let image = this.setImage(key);
          cell.appendChild(image);
        } 
      }
    }

    this.updatePointsContainer();
    this.previousField = JSON.parse(JSON.stringify(modelField));
  }

  updateField(points) {
    let newField = this.model.getField();
    let enemy = this.model.getEnemy();
    let rip = this.model.getRIP();
    let empty = 0;
    for(let i = 0; i < newField.length; i++) {
      for(let j = 0; j < newField[i].length; j++) {
        if (newField[i][j] === this.previousField[i][j] && 
            newField[i][j] !== empty) continue;
        let key = newField[i][j] + "";
        let cellId = i + "" + j;
        let cell = document.getElementById(`${cellId}`);
        cell.innerHTML = "";

        if (newField[i][j] === rip && this.previousField[i][j] === enemy ||
            newField[i][j] === rip && this.previousField[i][j] === empty) {
          cell.style.animation = "animationDying 0.8s steps(14) 1";
          setTimeout(() => cell.appendChild(this.setImage(key)), 1000);
        } else if (newField[i][j] === empty && this.previousField[i][j] !== empty){
          if (!cell.classList.contains("out")) cell.style.animation = "animationFire 0.3s steps(5) 1";
        } else if (key !== "0") {
          cell.appendChild(this.setImage(key));
        }
      }
    } 
    
    this.addPoints();
    this.updatePointsContainer(points);
    this.playSound();
    this.vibro();
    this.previousField = JSON.parse(JSON.stringify(newField));
  }

  addPoints() {
    let cord = this.model.getCords();
    let point = this.model.getPoints();
    let idx = cord[0] + "" + cord[1]; 
    let cell = document.getElementById(`${idx}`);
    let pointWrap = document.createElement("div");

    pointWrap.classList.add("point__active");
    pointWrap.innerHTML = "+" + point;
    pointWrap.style.animation = "pointsAnime 0.8s linear 1";

    cell.appendChild(pointWrap);
  }

  updatePointsContainer(points) {
    let active = this.model.getActiveElem() + "";
    document.getElementById("points").innerHTML = points || 0;
    document.getElementById("active").setAttribute("src", `${this.itemsObj[active].getSource()}`);
  }

  setImage(key) {
    let image = document.createElement("img");
    image.setAttribute("src", `${this.itemsObj[key].getSource()}`);
    image.setAttribute("alt", "Game Item");
    image.style.width = "100%";
    image.style.height = "100%";
    return image;
  }

  addPreview(idx, elem) {
    let cell = document.getElementById(`${idx}`);
    if (cell.innerHTML !== "") return;
    let container = document.createElement("div");
    let image = this.setImage(elem);
    container.classList.add("item__active");
    container.appendChild(image);
    cell.appendChild(container);
  }

  removePreview(idx) {
    let cell = document.getElementById(`${idx}`);
    let elem = document.querySelector(".item__active");
    if (elem) cell.removeChild(elem);
  }

  enemyGoTop(from, to) {
    let cell = document.getElementById(`${to}`);
    let cellPrev = document.getElementById(`${from}`);
    cellPrev.classList.add("out");
    cell.style.animationName = "enemyWalk, to-top";
    this.addWalkAnimation(cell);
  }

  enemyGoBottom(from, to) {
    let cell = document.getElementById(`${to}`);
    let cellPrev = document.getElementById(`${from}`);
    cellPrev.classList.add("out");
    cell.style.animationName = "enemyWalk, to-bottom";
    this.addWalkAnimation(cell);
  }

  enemyGoLeft(from, to) {
    let cell = document.getElementById(`${to}`);
    let cellPrev = document.getElementById(`${from}`);
    cellPrev.classList.add("out");
    cell.style.animationName = "enemyWalkLeft, to-left";
    this.addWalkAnimation(cell);
  }

  enemyGoRight(from, to) {
    let cell = document.getElementById(`${to}`);
    let cellPrev = document.getElementById(`${from}`);
    cellPrev.classList.add("out");
    cell.style.animationName = "enemyWalk, to-right";
    this.addWalkAnimation(cell);
  }

  addWalkAnimation(next) {
    let cell = next;
    cell.classList.add("going");
    cell.style.animationDuration = "1s, 1s";
    cell.style.animationIterationCount = "1, 1";
    cell.style.animationTimingFunction = "steps(16), linear";
    cell.style.anumetionFillMode = "forwards, none";
  }

  showEnd(points) {
    this.winPage.style.animation = "showMenuItem 0.5s linear 1 forwards";
    this.totalPoints = points;
    this.setScore();
  }

  getRules() {
    let scorePage = document.querySelector(".new__page__wrapper");
    let scorePageTitle = document.querySelector(".new__page__title");
    let wrapper = document.querySelector(".menu__item__wrapper");

    wrapper.style.animation = "showMenuItem 0.5s linear 1 forwards";
    scorePageTitle.innerHTML = "Rules";
    scorePage.innerHTML = `The premise of the game is that the player must build a new settlement. The game takes place on a 6×6 grid of fields on which some tiles are randomly placed.
    <br>
    <br>
    Players are given random tiles, most often grass tiles, that they must place on the grid. When three or more identical tiles adjoin, they merge into one more advanced tile at the position of the last tile placed: three grass tiles become a pumpkin, three pumpkins a mushroom, three mushrooms a house, and so forth. Merging four or more tiles earns points. Satyr move to a neighboring square each turn, blocking building sites until they are trapped. When they are trapped, they turn into a gravestone. Three gravestones make a black cat. 
    <br>
    <br>
    The objective of the game is to upgrade one's settlement's tiles to as high a rank as possible, earning an accordingly high score. The game ends if all fields of the grid are filled.`;
  }

  getMain() {
    let wrapper = document.querySelector(".menu__item__wrapper");
    wrapper.style.animation = "closeMenuItem 0.5s linear 1 forwards";
  }
  
  setScore() {
    this.password = Math.random();
    $.ajax({
      url: this.ajaxHandlerScript, 
      type: 'POST', 
      cache: false, 
      dataType:'json',
      data: { f: 'LOCKGET', n: this.stringName, p: this.password },
      success: this.lockGetReady.bind(this), 
      error: this.errorHandler.bind(this)
      }
    );  
  }

  lockGetReady(callresult) {
    if (callresult.error !== undefined) {
      alert(callresult.error);
      return;
    }

    this.score = JSON.parse(callresult.result);
    this.score.sort((a, b) => b[1] - a[1]);
    if (this.score.length >= 20) {
      for (let i=0; i < this.score.length; i++) {
        if (this.score[i][1] < this.totalPoints) {
          this.addResult();
          break;
        }
        if (i === this.score.length - 1) {
          let innerContent = document.querySelector(".win__resuls");
          innerContent.innerHTML = `
          <div class="winner__satyr"></div>
          <p class="winner__loose__title">Sorry, your points is not enought. Try again!</p>
          <button class="close__over">Close</button>`;
          this.model.addWinBtnEvent();
          this.addScore(this.score);
        }
      }
    } else {
      this.addResult();
    }
  }

  addResult() {
    let innerContent = document.querySelector(".win__resuls");
    innerContent.innerHTML = `
    <div class="winner__satyr"></div>
    <p class="winner__win__title">Congrats! Give us your name to save result</p>
    <p class="winner__name__title">Enter Name</p>
    <div class="winner__name" contenteditable></div>
    <p class="winner__name__subtitle">Press ENTER or click enywhere to save your name</p>`;
    this.model.addNameList();
  }

  setName(e) {
    let nameContainer = document.querySelector(".winner__name");
    let name = nameContainer.textContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

    if (e.type === 'keypress' && e.key !== "Enter") return;
    if (e.type === 'keypress' && e.key === "Enter") {
      nameContainer.blur();
      return;
    }
    
    name =  this.escapeHTML(nameContainer.textContent);
    if (name.length === 0) name = "Unknown";
    this.score.push([name, this.totalPoints]);
    this.score.sort((a, b) => b[1] - a[1]);
    this.score = this.score.slice(0, 20);
    this.winPage.style.animation = "closeMenuItem 0.5s linear 1 forwards";
    this.addScore(this.score);
  }

  escapeHTML(text) {
    text=text.toString()
        .split("&").join("&amp;")
        .split("<").join("&lt;")
        .split(">").join("&gt;")
        .split('"').join("&quot;")
        .split("'").join("&#039;");
    return text;
  }

  addScore(score) {
    $.ajax({
      url : this.ajaxHandlerScript, 
      type: 'POST', 
      cache: false, 
      dataType:'json',
      data : { f: 'UPDATE', n: this.stringName, v: JSON.stringify(score), p: this.password },
      success : this.updateReady.bind(this), 
      error : this.errorHandler.bind(this)
    });
  }

  getScore() { 
    $.ajax( {
      url: this.ajaxHandlerScript, 
      type: 'POST', 
      cache: false, 
      dataType:'json',
      data: {f: 'READ', n: this.stringName},
      success: this.readReady.bind(this), 
      error: this.errorHandler.bind(this)
      }
    );
  }

  readReady(callresult) {
    if (callresult.error !== undefined) { 
      alert(callresult.error);
      return;
    }

    let list = document.createElement("ol");
    let scoreList = JSON.parse(callresult.result);
    let wrapper = document.querySelector(".menu__item__wrapper");
    let scorePage = document.querySelector(".new__page__wrapper");
    let scorePageTitle = document.querySelector(".new__page__title");
    for (let i=0; i<scoreList.length; i++) {
      let pkt = document.createElement("li");
      pkt.innerHTML = `
      <div class="result">
        <span>${scoreList[i][0]}</span>
        <span>${scoreList[i][1]}</span>
      </div>`;
      pkt.classList.add("score__list__item");
      list.appendChild(pkt);
    }

    wrapper.style.animation = "showMenuItem 0.5s linear 1 forwards";
    scorePageTitle.innerHTML = "Score";
    list.classList.add("score__list");
    scorePage.innerHTML = "";
    scorePage.appendChild(list);
  }

  updateReady(callresult) {
    if (callresult.error !== undefined) 
      alert(callresult.error);
  }

  errorHandler(jqXHR, statusStr, errorStr) {
    alert(statusStr + ' ' + errorStr);
  }

  playSound() {
    this.clickSound.currentTime = 0;
    if (this.sound) this.clickSound.play();
  }

  vibro() {
    if (!navigator.vibrate) return;
    window.navigator.vibrate(100); 
  }

  preloadImages() {
    let images = {
      prev: "./assets/prev.jpg",
      1: "./assets/back.jpg",
      2: "./assets/church.png",
      3: "./assets/fire.png",
      4: "./assets/house_1.png",
      5: "./assets/house_2.png",
      6: "./assets/house_3.png",
      7: "./assets/RIP.png",
      8: "./assets/satyr_dying.png",
      9: "./assets/satyr_walk_left.png",
      10: "./assets/satyr_walk.png",
      11: "./assets/satyr.png",
      12: "./assets/stone.jpg",
      13: "./assets/tree_1.png",
      14: "./assets/tree_2.png",
      15: "./assets/tree_3.png",
    };

    for (let key of Object.keys(images)) {
      let pic = new Image();
      pic.src = images[key];
    }
  }

  updateSoundStat() {
    this.sound = !this.sound;
  }

  getField() {
    return this.field;
  }

  resize() {
    let matrix = this.model.getField();
    let w = this.field.offsetWidth;
    let cellSize = w / matrix.length;

    for(let i = 0; i < matrix.length; i++) {
      for(let j = 0; j < matrix.length; j++) {
        let cell = document.getElementById(`${i + "" + j}`);
        cell.style.top = 15 * i + "vmin";
        cell.style.left = 15 * j + "vmin";
      }
    }
  }
}
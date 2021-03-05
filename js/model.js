"use strict"
class Items {
  constructor(points, src, next) {
    this.src = src;
    this.points = points;
    this.next = next;
  }

  getSource() {
    return this.src;
  }

  getPoints() {
    return this.points;
  }

  getNext() {
    return this.next;
  }
}

class Town {
  constructor() {
    this.size = 6;
    this.field = [];
    this.grass = 11;
    this.bush = 22;
    this.tree = 33;
    this.house = 44;
    this.menor = 55;
    this.palace = 66;
    this.bear = 77;
    this.rip = 88;
    this.church = 99;
    this.emptyCell = 0;
    this.activeElem = 0;
    this.lastCordsY = 0;
    this.lastCordsX = 0;
    this.points = 0;
    this.clickPoints = 0;
    this.addPoints = false;
    this.coincidences = new Set();
    this.bearExit = false;
    this.items = [];
    this.view = null;
    this.controller = null;
    this.itemObj = null;
  }

  init() {
    this.createField();
    this.addItems();
    this.addElemsOnStartScreen();
    this.checkFullField();
    this.points = 0;
    this.clickPoints = 0;
  }

  start(view, field, obj) {
    this.view = view;
    this.controller = field;
    this.itemObj = obj;
  }

  createField() {
    this.field = Array(this.size);
    for(let i = 0; i < this.field.length; i++)
      this.field[i] = Array(this.size);
    this.clearField();
  }

  clearField() {
    for(let i = 0; i < this.size; i++) {
      for(let j = 0; j < this.size; j++) {
        this.field[i][j] = this.emptyCell;
      }
    }
  }

  addItems() {
    this.items.push(this.bush);
    this.items.push(this.grass);
    this.items.push(this.grass);
    this.items.push(this.bear);
    this.items.push(this.grass);
    this.items.push(this.house);
    this.items.push(this.grass);
    this.items.push(this.grass);
    this.items.push(this.bush);
    this.items.push(this.bush);
    this.items.push(this.tree);
    this.items.push(this.tree);
  }

  addElemsOnStartScreen() {
    let minItemsAtStart = 5,
        maxItemsAtStart = 8,
        itemsCount = this.getRandomNumber(minItemsAtStart, maxItemsAtStart);

    for (let i = 0; i < itemsCount; i++) 
      this.addElemToRandomPos();
  }

  getRandomElem() {
    let idx = this.getRandomNumber(0, this.items.length - 1);
    this.activeElem = this.items[idx];
    return this.activeElem;
  }

  addElemToRandomPos() {
    let  posIdxX = 0,
         posIdxY = 0;

    this.getRandomElem();
    do {
      posIdxX = this.getRandomNumber(0, this.size - 1),
      posIdxY = this.getRandomNumber(0, this.size - 1);
    } while (this.field[posIdxY][posIdxX] !== this.emptyCell);

    this.field[posIdxY][posIdxX] = this.activeElem;
  }

  addElemToUserPos(y, x) {
    this.coincidences.clear();
    if (this.field[y][x] !== this.emptyCell) return;
    this.field[y][x] = this.activeElem;
    this.lastCordsY = y;
    this.lastCordsX = x;
    this.bearExit = false;
    this.addPoints = true;
    this.checkСoincidences(y, x);
    this.walkingBears();
    this.checkRIP(); //if something wrong <- check it
    this.updateView();
    this.clickPoints = 0;
  }

  checkСoincidences(y, x) {
    this.checkSides(y, x);
    this.isElemGrow();
  }

  checkSides(y, x) {
    let cord = y + "" + x;
    if (this.coincidences.has(cord)) return;
    if (this.activeElem === this.bear) this.lookingForNeighbours(y, x);
    this.coincidences.add(cord);
    this.checkTop(y, x);
    this.checkBottom(y, x);
    this.checkLeft(y, x);
    this.checkRight(y, x);
  }

  checkTop(y, x) {
    if (y === 0) return;
    let top = this.field[y - 1][x];
    this.searchSameValues(top, y - 1, x);
  }

  checkBottom(y, x) {
    if (y === this.size - 1) return;
    let bottom = this.field[y + 1][x];
    this.searchSameValues(bottom, y + 1, x);
  }

  checkLeft(y, x) {
    if (x === 0) return;
    let left = this.field[y][x - 1];
    this.searchSameValues(left, y, x - 1);
  }

  checkRight(y, x) {
    if (x === this.size - 1) return;
    let right = this.field[y][x + 1];
    this.searchSameValues(right, y, x + 1);
  }

  searchSameValues(elem, y, x) {
    if (elem === this.activeElem) this.checkSides(y, x);
  }

  isElemGrow() {
    if (this.coincidences.size < 3 ||
        this.activeElem === this.bear && this.bearExit) {
      if (this.addPoints) {
        this.points += this.itemObj[this.activeElem + ""].getPoints();
        this.clickPoints += this.itemObj[this.activeElem + ""].getPoints();
      }
      this.getRandomElem();
      return;
    }
    
    if (this.activeElem === this.palace || this.activeElem === this.church) {
      this.coincidences.clear();
      this.addPoints = false;
      this.getRandomElem();
      return;
    }

    let nextElem = this.activeElem + 11;
    this.addPoints = true;
    for (let cell of this.coincidences) {
      cell = cell.split("");
      let y = cell[0],
          x = cell[1];

      this.field[y][x] = (this.activeElem === this.bear) ? 
        this.rip : this.emptyCell;
      this.points += this.itemObj[this.activeElem + ""].getPoints();
      this.clickPoints += this.itemObj[this.activeElem + ""].getPoints();
    }
    
    this.field[this.lastCordsY][this.lastCordsX] = nextElem;
    this.coincidences.clear();
    this.activeElem = nextElem;
    this.addPoints = false;
    this.checkСoincidences(this.lastCordsY, this.lastCordsX);
  }

  walkingBears() {
    let newPos = [];
    for(let i = 0; i < this.field.length; i++) {
      for (let j = 0; j < this.field[i].length; j++) {
        if (this.field[i][j] === this.bear) {
          if (newPos.indexOf(i + "" + j) > -1) continue;  
          let ways = this.checkBearWays(i, j);
          if (ways.length === 0) {
            this.lookingForNeighbours(i, j);
            this.field[i][j] = (this.bearExit) ? 
            this.bear : this.rip;
            this.bearExit = false;
          } else {
            let idx = this.getRandomNumber(0, ways.length - 1);
            let way = ways[idx];
            newPos.push(way[0] + "" + way[1]);
            this.bearGo(i + "" + j, way[0] + "" + way[1]);
            this.field[i][j] = this.emptyCell;
            this.field[way[0]][way[1]] = this.bear;
            this.bearExit = false;
          }
        }
      }
    }
  }

  checkBearWays(i, j) {
    let openWays = [];
    let ways = [
      [i + 1, j],
      [i - 1, j],
      [i, j - 1],
      [i, j + 1],
    ];

    ways.forEach(b => {
      if (b[0] >= 0 && b[0] < this.size &&
          b[1] >= 0 && b[1] < this.size) {
        if (this.field[b[0]][b[1]] === this.emptyCell) {
          openWays.push(b);
        }
      }
    });
    return openWays;
  }

  lookingForNeighbours(i, j, arr = []) {
    let ways = [
      [i + 1, j],
      [i - 1, j],
      [i, j - 1],
      [i, j + 1],
    ];

    arr.push(i + "" + j);
    ways.forEach(b => {
      let y = b[0],
          x = b[1];
      if (!(y >= 0 && y < this.size && x >= 0 && x < this.size)) return;
      if (arr.indexOf(y + "" + x) > -1) return;
      if (this.field[y][x] === this.bear) {
        let neihgbourWay = this.checkBearWays(y, x);
        this.bearExit = (neihgbourWay.length > 0) ? true : this.bearExit;
        this.lookingForNeighbours(y, x, arr);
      }
    });
  }

  checkFullField() {
    for(let i = 0; i < this.field.length; i++) {
      for(let j = 0; j < this.field[i].length; j++) {
        if (this.field[i][j] === this.emptyCell) continue;
        this.check(i, j);
      }
    }
  }

  checkRIP() {
    for(let i = 0; i < this.field.length; i++) {
      for(let j = 0; j < this.field[i].length; j++) {
        if (this.field[i][j] !== this.rip) continue;
        this.addPoints = false;
        this.check(i, j);
      }
    }
  }

  check(i, j) {
    let saveCords = [this.lastCordsY, this.lastCordsX];
    this.coincidences.clear();
    this.activeElem = this.field[i][j];
    this.lastCordsY = i;
    this.lastCordsX = j;
    this.checkСoincidences(i, j);
    this.lastCordsY = saveCords[0];
    this.lastCordsX = saveCords[1];
  }

  bearGo(from, to) {
    if (+from + 10 === +to) this.view.enemyGoTop(from, to);
    if (+from - 10 === +to) this.view.enemyGoBottom(from, to);
    if (+from - 1 === +to) this.view.enemyGoLeft(from, to);
    if (+from + 1 === +to) this.view.enemyGoRight(from, to);
  }

  isThisEnd() {
    for(let i = 0; i < this.size; i++) {
      for(let j = 0; j < this.size; j++) {
        if (this.field[i][j] === this.emptyCell) {
          return false;
        };
      }
    }
    return true;
  }

  getRandomNumber(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
  }

  showBeforeClick(y, x) {
    if(this.field[y][x] !== this.emptyCell) return;
    let idx = y + "" + x;
    this.view.addPreview(idx, this.activeElem);
  }

  removeBeforeClick(y, x) {
    let idx = y + "" + x;
    this.view.removePreview(idx);
  }

  getField() {
    return this.field;
  }

  getEnemy() {
    return this.bear;
  }

  getRIP() {
    return this.rip;
  }

  getActiveElem() {
    return this.activeElem;
  }

  getCords() {
    return [this.lastCordsY, this.lastCordsX];
  }

  getPoints() {
    return this.clickPoints;
  }

  getTotalPoints() {
    return this.points;
  }

  addFill() {
    this.view.fillField();
  }

  updateView() {
    this.view.updateField(this.points);
    if (this.isThisEnd()) this.view.showEnd(this.points);
  }

  newGame() {
    this.clearField();
    this.addElemsOnStartScreen();
    this.checkFullField();
    this.points = 0;
    this.clickPoints = 0;
    this.addFill();
  }

  addNameList() {
    this.controller.addNameBtnListeners();
  }

  setName(e) {
    this.view.setName(e);
  }

  addWinBtnEvent() {
    this.controller.addGameOverBtnEvent();
  }

  showPage(page) {
    switch(page) {
      case "Score":
      this.view.getScore();

      break;

      case "Rules": 
      this.view.getRules();

      break;

      default:
      this.view.getMain();

      break;
    }
  }

  resize() {
    
  }
}
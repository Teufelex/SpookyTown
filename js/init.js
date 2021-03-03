const GAME_ITEMS = {};

GAME_ITEMS["11"] = new Items(5, "assets/tree_1.png", "22");
GAME_ITEMS["22"] = new Items(10, "assets/tree_2.png", "33");
GAME_ITEMS["33"] = new Items(25, "assets/tree_3.png", "44");
GAME_ITEMS["44"] = new Items(50, "assets/house_1.png", "55");
GAME_ITEMS["55"] = new Items(150, "assets/house_2.png", "66");
GAME_ITEMS["66"] = new Items(300, "assets/house_3.png", null);
GAME_ITEMS["77"] = new Items(75, "assets/satyr.png", "88");
GAME_ITEMS["88"] = new Items(50, "assets/RIP.png", "99");
GAME_ITEMS["99"] = new Items(null, "assets/church.png", null);

GAME_ITEMS["77"].walk = "assets/satyr_walk.png";
GAME_ITEMS["88"].death = "assets/satyr_dying.png";

const SPOOKY_TOWN = new Town();
const TOWN_VIEW = new TownView();
const TOWN_CONTROLLER = new TownController();

SPOOKY_TOWN.start(TOWN_VIEW, TOWN_CONTROLLER, GAME_ITEMS);
TOWN_VIEW.start(SPOOKY_TOWN, TOWN_CONTROLLER, GAME_ITEMS);
TOWN_CONTROLLER.start(TOWN_VIEW.getField(), SPOOKY_TOWN);
SPOOKY_TOWN.init();
TOWN_VIEW.init();
SPOOKY_TOWN.addFill();
TOWN_CONTROLLER.init();
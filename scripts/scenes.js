"use strict";
const GameVariables = require("./game");
var Scenes;
(function (Scenes) {
    class Scene {
        constructor() {
            console.log(GameVariables.heroes);
        }
    }
    Scenes.Scene = Scene;
})(Scenes || (Scenes = {}));
module.exports = Scenes;

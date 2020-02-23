"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objects_1 = require("./objects");
const scenes_1 = require("./scenes");
const battle_1 = require("./battle");
exports.Graphics = require('terminal-kit').terminal;
const ATTACK_TIME = 50;
const PARTY_SIZE = 2;
const TICK_RATE = 20;
const hrtimeMs = function () {
    let time = process.hrtime();
    return time[0] * 1000 / TICK_RATE;
};
const readline = require('readline-sync');
class Game {
    static run() {
        exports.Graphics.clear();
        this.createHeroes();
        this.createEncounter();
        let x = new scenes_1.Scenes.Scene();
        battle_1.Battle.setup();
        this.requestUpdate();
    }
    static update() {
        (this.control >= 100) ? this.shutdown() : this.control++;
        if (battle_1.Battle.status !== 'standby') {
            battle_1.Battle.updateTurn();
        }
    }
    static createHeroes() {
        for (let i = 1; i <= PARTY_SIZE; i++) {
            let name = this.requestInput(`Whats the Name of the ${i}. Hero?`);
            this.heroes.push(new objects_1.Objects.Character(name));
        }
    }
    static createEncounter() {
        for (let i = 1; i <= PARTY_SIZE; i++) {
            this.enemies.push(new objects_1.Objects.Character());
        }
    }
    static requestUpdate() {
        setTimeout(() => this.requestUpdate(), this._tickLengthMs);
        let now = hrtimeMs();
        let delta = (now - this._previousTick) / 1000;
        this._previousTick = now;
        this._tick++;
        if (!this.isStopped()) {
            this.update();
        }
    }
    static requestInput(message) {
        if (!this.isInputActive()) {
            this.inputing = true;
            let input = readline.question(message);
            this.inputing = false;
            return input;
        }
    }
    static isInputActive() {
        return this.inputing;
    }
    static isWaiting() {
        return this.timeToWait > 0;
    }
    static isStopped() {
        if (this.isInputActive())
            return true;
        if (this.isWaiting())
            return true;
        return false;
    }
    static shutdown() {
        process.exit();
    }
}
exports.Game = Game;
Game._previousTick = hrtimeMs();
Game._tick = 0;
Game._tickLengthMs = 1000 / TICK_RATE;
Game.control = 0;
Game.inputing = false;
Game.heroes = [];
Game.enemies = [];
Game.timeToWait = 0;
Game.stopped = false;
//export = Game

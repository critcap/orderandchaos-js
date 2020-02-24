"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objects_1 = require("./objects");
const battle_1 = require("./battle");
exports.Graphics = require('terminal-kit').terminal;
const PARTY_SIZE = 2;
const TICK_RATE = 20;
const hrtimeMs = function () { let time = process.hrtime(); return time[0] * 1000 / TICK_RATE; };
class Game {
    static run() {
        exports.Graphics.clear();
        this.createHeroes();
        this.createEncounter();
        battle_1.Battle.setup();
        this.requestUpdate();
    }
    static update() {
        //(this._control >= 100)? this.shutdown(): this._control++
        if (battle_1.Battle.status !== 'standby') {
            battle_1.Battle.updateTurn();
        }
    }
    static createHeroes() {
        for (let i = 1; i <= PARTY_SIZE; i++) {
            this.heroes.push(new objects_1.Objects.Character());
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
        if (!this.isStopped()) {
            this.update();
        }
    }
    static isInputActive() {
        return (this._input) ? true : false;
    }
    static openInput(input) {
        if (!this.isInputActive()) {
            this._input = input;
        }
    }
    static overrideInput(input) {
        if (this.isInputActive()) {
            this._input = input;
        }
    }
    static closeInput() {
        this._input = undefined;
    }
    static isWaiting() {
        return this._timeToWait > 0;
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
Game._tickLengthMs = 1000 / TICK_RATE;
Game._control = 0;
Game._input = undefined;
Game._timeToWait = 0;
Game.heroes = [];
Game.enemies = [];
//export = Game

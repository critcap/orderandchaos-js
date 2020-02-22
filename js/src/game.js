"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const objects_1 = require("./objects");
const scenes_1 = require("./scenes");
const Graphics = require('terminal-kit').terminal;
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
        Graphics.clear();
        this.createHeroes();
        this.createEncounter();
        let x = new scenes_1.Scenes.Scene();
        Battle.setup();
        this.requestUpdate();
    }
    static update() {
        (this.control >= 100) ? this.shutdown() : this.control++;
        if (Battle.status !== 'standby') {
            Battle.updateTurn();
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
        if (!this.isInputActive()) {
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
    static output(...message) {
        console.log(message);
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
class Battle {
    static isBusy() {
        return false;
    }
    static requestBattle() {
        if (this.status = '')
            this.setup();
        return;
    }
    static inProgress() {
        return (this.status === '') ? false : true;
    }
    static setup() {
        this.turnCount = 0;
        this.heroes = [];
        this.enemies = [];
        this.activeBattler = undefined;
        this.createBattlers();
        this.status = 'start';
    }
    static createBattlers() {
        Game.heroes.forEach(hero => {
            this.heroes.push(new objects_1.Objects.Battler(hero));
        });
        Game.enemies.forEach(enemie => {
            this.enemies.push(new objects_1.Objects.Battler(enemie));
        });
    }
    static getAllBattlers() {
        return this.heroes.concat(this.enemies);
    }
    static getAllAliveBattlers() {
        return this.getAllBattlers().filter(battler => {
            return battler.alive == true;
        });
    }
    static initBattlersQueueTime() {
        this.getAllBattlers().forEach(battler => {
            battler.qt = battler.spd;
        });
    }
    static nextTurn() {
        this.turnCount++;
        this.status = 'turnStart';
    }
    static updateTurn() {
        switch (this.status) {
            case 'start':
                this.onStart();
                break;
            case 'turnStart':
                console.log(`Its ${this.getActiveBattler().name}'s turn`);
                this.status = 'input';
                break;
            case 'input':
                //Game.requestInput("Attack?")   
                Game.inputing = true;
                Graphics.singleLineMenu(['Attack', 'Guard'], (error, response) => {
                    if (response.selectedIndex === 0) {
                        this.processAttack();
                    }
                    else {
                        console.log(`${this.getActiveBattler().name} guards himself`);
                    }
                    this.status = 'turnEnd';
                    Game.inputing = false;
                });
                //this.processAttack()
                //this.status = 'turnEnd'
                break;
            case 'turnEnd':
                this.getActiveBattler().qt = this.getActiveBattler().spd + 1;
                this.activeBattler = this.getNextBattler();
                this.status = 'turnStart';
                break;
            case 'cleanup':
                this.afterBattleCleanUp();
                break;
            default: console.log("default");
        }
    }
    static onStart() {
        this.activeBattler = this.getNextBattler();
        this.nextTurn();
    }
    static onTurnStart() {
    }
    static onPhaseStart() {
    }
    static onActionSelect() {
    }
    static onPhaseEnd() {
    }
    static onTurnEnd() {
    }
    static onBattleEnd() { }
    static getActiveBattler() {
        if (!this.activeBattler)
            this.activeBattler = this.getNextBattler();
        return this.activeBattler;
    }
    static getNextBattler() {
        let qt = this.getAllAliveBattlers().sort((a, b) => a.qt - b.qt);
        let qtqt = qt[0].qt;
        this.getAllAliveBattlers().forEach(ele => {
            ele.qt -= qtqt;
        });
        qt[0].qt = -1;
        return qt[0];
    }
    static processAttack() {
        let attacker = this.getActiveBattler();
        let target = this.getAttackTarget(this.getBattlerOpponents(attacker));
        let damage = attacker.atk;
        let critical = this.isCriticalHit();
        (critical) ? damage *= 2 : null;
        if (target.vit <= attacker.atk) {
            target.vit = 0;
            target.alive = false;
            console.log(`${attacker.name} defeats ${target.name}`);
            let opponents = this.getBattlerOpponents(attacker);
            if (this.checkIfDefeated(opponents)) {
                if (opponents == this.heroes) {
                    this.processDefeat();
                }
                if (opponents == this.enemies) {
                    this.processVictory();
                }
            }
        }
        else if (critical) {
            target.vit -= damage;
            console.log(`${attacker.name} CRITICALLY strikes ${target.name} for ${damage}`);
        }
        else {
            target.vit -= damage;
            console.log(`${attacker.name} deals ${damage} damage to ${target.name}`);
        }
    }
    static isCriticalHit() {
        return Math.random() < 0.2;
    }
    static checkIfDefeated(group) {
        let alive = group.filter(ele => {
            return ele.alive == true;
        });
        return (alive.length === 0) ? true : false;
    }
    static getBattlerFriends(battler) {
        return (this.heroes.includes(battler)) ? this.heroes : this.enemies;
    }
    static getBattlerOpponents(battler) {
        return (this.heroes.includes(battler)) ? this.enemies : this.heroes;
    }
    static getAttackTarget(group) {
        let validTargets = group.filter(ele => {
            return ele.alive === true;
        });
        return validTargets[Math.floor((Math.random() * validTargets.length))];
    }
    static processVictory() {
        console.log('Your Group was Victorious');
        this.close();
    }
    static processDefeat() {
        console.log('Your Group was Defeated');
        this.close();
    }
    static afterBattleCleanUp() {
    }
    static close() {
        this.status = "standby";
        Game.shutdown();
    }
}
Battle.status = '';
Battle.turnCount = 0;
Battle.heroes = [];
Battle.enemies = [];
//export = Game

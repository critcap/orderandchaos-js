"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("./game");
const objects_1 = require("./objects");
const game_2 = require("./game");
class Battle {
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
        game_1.Game.heroes.forEach(hero => {
            this.heroes.push(new objects_1.Objects.Battler(hero));
        });
        game_1.Game.enemies.forEach(enemie => {
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
                this.startInput();
                break;
            case 'turnEnd':
                this.getActiveBattler().qt = this.getActiveBattler().spd + 1;
                this.activeBattler = this.getNextBattler();
                this.status = 'turnStart';
                break;
            case 'cleanup':
                this.afterBattleCleanUp();
                break;
        }
    }
    static async startInput() {
        this.status = 'input';
        //this.openCommandSelection()
        let command = await game_2.Graphics.singleLineMenu(['Attack', 'Guard']).promise;
        let action = new objects_1.Objects.Action(this.getActiveBattler(), command.selectedIndex);
        let targets = await action.getTargets();
        action.setTargets(targets);
        console.log(`${action.user.name} uses ${action.skill.name} on ${action.targets[0].name}`);
        this.status = 'turnEnd';
    }
    static onStart() {
        this.activeBattler = this.getNextBattler();
        this.nextTurn();
    }
    static onTurnStart() {
        //check buff/debuffs
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
        game_1.Game.shutdown();
    }
}
exports.Battle = Battle;
Battle.status = '';
Battle.turnCount = 0;
Battle.heroes = [];
Battle.enemies = [];
Battle.stack = [];

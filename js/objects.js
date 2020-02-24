"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const game_1 = require("./game");
const battle_1 = require("./battle");
const faker = require('faker');
var Objects;
(function (Objects) {
    class Character {
        constructor(name) {
            this.name = (name) ? name : faker.name.findName();
            this.spd = Math.floor((Math.random() * 16) + 8);
            this.vit = Math.floor((Math.random() * 16) + 8) * 10;
            this.atk = Math.floor((Math.random() * 16) + 8);
            this.hp = this.vit;
            this.exp = (this instanceof Hero) ? 0 : undefined;
            this.lvl = (this instanceof Hero) ? 1 : undefined;
        }
        update() {
        }
    }
    Objects.Character = Character;
    class Battler {
        constructor(data) {
            this.name = data.name;
            this.spd = data.spd;
            this.vit = data.vit;
            this.atk = data.atk;
            this.hp = data.hp;
            //@ts-ignore
            this.qt = null;
            this.alive = this.checkLifeStatus(data);
        }
        checkLifeStatus(data) {
            return data.vit > 0;
        }
        makeAction(id) {
            return new Action(this, id);
        }
        getFriends() {
            return (this instanceof Hero) ? battle_1.Battle.heroes : battle_1.Battle.enemies;
        }
        getOpponents() {
            return (this instanceof Enemy) ? battle_1.Battle.heroes : battle_1.Battle.enemies;
        }
    }
    Objects.Battler = Battler;
    class Hero extends Battler {
    }
    Objects.Hero = Hero;
    class Enemy extends Battler {
    }
    Objects.Enemy = Enemy;
    class Action {
        constructor(user, id) {
            this.user = user;
            this.skill = this.fetchSkillFromID(id);
            this.targets = [];
        }
        fetchSkillFromID(id) {
            //FIXME  Placeholder
            let data;
            switch (id) {
                case 0:
                    data = { id: 0, name: 'Attack', damage: { type: 1, formular: 'user.wdamage() * 1.0', element: 1, variance: 10 }, rt: 50, scope: 1, cost: 0, costType: 'Mana', tooltip: '' };
                    break;
                default:
                    data = { id: 1, name: 'Guard', damage: { type: 0, formular: '', element: 1, variance: 10 }, rt: 25, scope: 0, cost: 0, costType: 'Mana', tooltip: '' };
                    break;
            }
            return new Skill(data);
        }
        async getTargets() {
            let possibleTargetsNames = this.getPossibleTargets().map(target => target.name);
            let targets = await this.openTargetSelection(possibleTargetsNames);
            console.log(targets);
            return targets;
        }
        setTargets(targets) {
            this.targets = targets;
        }
        getPossibleTargets() {
            switch (this.skill.scope) {
                case 0:
                    return [this.user];
                    break;
                default:
                    return this.user.getOpponents();
                    break;
            }
        }
        async openTargetSelection(names) {
            //FIXME only single selection atm
            let name = await game_1.Graphics.gridMenu(names).promise;
            return [this.getPossibleTargets()[name.selectedIndex]];
        }
    }
    Objects.Action = Action;
    class Skill {
        constructor(data) {
            this.id = data.id;
            this.name = data.name;
            this.damage = data.damage;
            this.rt = data.rt;
            this.scope = data.scope;
            this.cost = data.cost;
            this.costType = data.costType;
            this.tooltip = data.tooltip;
        }
    }
    Objects.Skill = Skill;
})(Objects = exports.Objects || (exports.Objects = {}));
//export = Objects

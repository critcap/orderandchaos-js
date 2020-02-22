"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    }
    Objects.Battler = Battler;
    class Hero extends Battler {
    }
    Objects.Hero = Hero;
    class Skill {
        constructor(data) {
            this.id = data.id;
            this.name = data.name;
            this.power = data.power;
            this.rt = data.rt;
            this.cost = data.cost;
            this.tooltip = data.tooltip;
        }
    }
    Objects.Skill = Skill;
})(Objects = exports.Objects || (exports.Objects = {}));
//export = Objects

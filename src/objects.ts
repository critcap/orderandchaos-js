const faker = require('faker')

export namespace Objects {
    
    export interface Data_Skill {
        id: number
        name: string
        power: number
        rt: number
        cost: number
        tooltip: string
    }


    export class Character{
        name: string
        spd: number
        vit: number    
        atk: number
        hp: number
        exp?: number
        lvl?: number
        
        constructor(name?: string){
            this.name = (name)? name : faker.name.findName()
            this.spd = Math.floor((Math.random() * 16) + 8)
            this.vit = Math.floor((Math.random() * 16) + 8) * 10
            this.atk = Math.floor((Math.random() * 16) + 8)
            this.hp = this.vit
            
            this.exp = (this instanceof Hero)? 0 : undefined;
            this.lvl = (this instanceof Hero)? 1 : undefined;

        }

        update(): void {

        }

    }
    
    export class Battler {
        name: string
        spd: number
        vit: number
        atk: number
        hp: number

        qt: number
        alive: boolean

        constructor(data: Character){
            this.name = data.name 
            this.spd = data.spd
            this.vit = data.vit 
            this.atk = data.atk 
            this.hp = data.hp
            //@ts-ignore
            this.qt = null
            this.alive = this.checkLifeStatus(data)
        }

        checkLifeStatus(data:Character): boolean {
            return data.vit > 0;
        }
    }

    export class Hero extends Battler {

    }

    export class Skill {
        id: number
        name: string
        formular: number
        rt: number
        cost: number
        tooltip: string
        battler?: Battler
        target?: Battler

        constructor(data: Data_Skill, battler: Battler, target: Battler){
            this.id = data.id
            this.name = data.name
            this.formular = data.power
            this.rt = data.rt
            this.cost = data.cost
            this.tooltip = data.tooltip
            this.battler = battler;
            this.target = target
        }
    }
}

//export = Objects
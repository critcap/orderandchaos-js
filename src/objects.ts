import { Game, Graphics } from "./game"
import { Battle} from "./battle"

const faker = require('faker')

export namespace Objects {
    



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

        makeAction(id: number): Action {
            return new Action(this, id)
        }

        getFriends(): Array<Battler> {
            return (this instanceof Hero) ? Battle.heroes : Battle.enemies;
        }
        
        getOpponents(): Array<Battler> {
            return (this instanceof Enemy) ? Battle.heroes : Battle.enemies;
        }
    }

    export class Hero extends Battler {

    }

    export class Enemy extends Battler {

    }

    export class Action {
        user: Battler
        skill: Skill
        targets: Array<Battler>

        constructor(user: Battler, id: number) {
            this.user = user
            this.skill = this.fetchSkillFromID(id)
            this.targets = []
            
        }

        fetchSkillFromID(id: number): Skill {
            //FIXME  Placeholder
            let data: Skill
            switch (id) {
                case 0:
                    data = {id: 0, name: 'Attack', damage: {type: 1, formular: 'user.wdamage() * 1.0', element: 1, variance: 10}, rt: 50, scope: 1, cost: 0, costType: 'Mana', tooltip: ''}
                    break;
            
                default:
                    data = {id: 1, name: 'Guard', damage: {type: 0, formular: '', element: 1, variance: 10}, rt: 25, scope: 0, cost: 0, costType: 'Mana', tooltip: ''}
                    break;
            }
            return new Skill(data)
        }
        
        async getTargets(): Promise<Array<Battler>> {
            let possibleTargetsNames: Array<string> = this.getPossibleTargets().map(target => target.name)
            let targets = await this.openTargetSelection(possibleTargetsNames)   
            console.log(targets);
            
            return targets
        }

        setTargets(targets: Array<Battler>): void {
           this.targets = targets;      
        }

        getPossibleTargets(): Array<Battler> {
            switch (this.skill.scope) {
                case 0:
                    return [this.user]
                    break;
                
                default:
                    return this.user.getOpponents()
                    break;
            }
        }

        async openTargetSelection(names: Array<string>): Promise<Array<Battler>> {
            //FIXME only single selection atm
            let name = await Graphics.gridMenu(names).promise;
            return [this.getPossibleTargets()[name.selectedIndex]]
        }

    }

    interface Damage {
        type: number
        formular: string
        element: number
        variance: number
    }

    export class Skill {
        id: number
        name: string
        damage: Damage
        rt: number
        scope: number
        cost: number
        costType: string
        tooltip: string

        constructor(data: Skill){
            this.id = data.id
            this.name = data.name
            this.damage = data.damage
            this.rt = data.rt
            this.scope = data.scope
            this.cost = data.cost
            this.costType = data.costType
            this.tooltip = data.tooltip
        }
    }
}

//export = Objects
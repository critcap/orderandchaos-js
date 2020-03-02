import { Game, Graphics } from "./game"
import { Battle} from "./battle"
import { Utils } from "./game"
import { Random } from "./game"


export namespace Objects {

    export class Battler {
        id: number = 0
        name: string = ''
        
        private _state: string = ''
        private _vit: number = 0 
        private _str: number = 0
        private _dex: number = 0
        private _int: number = 0
        private _fth: number = 0
        private _wei: number = 0

        private _hp: number = 0
        private _mp: number = 0
        private _qt: number = 0
        
        get mhp(): number {return this._vit * 8}
        get hp(): number {return this._hp}
        get mmp(): number {return this._int * 2}
        get mp(): number {return this._mp}
        get wdmg(): number {return Math.round(this._str * 3 + this._dex * 0.5)}
        get mdmg(): number {return Math.round(this._int * 1 + this._dex * 0.5)}
        get qt(): number {return this._qt}

        constructor(){
            this.id = this.getFriends().length
        }

        setName(input: string): void {
            this.name = input
            Graphics(`\nYour name is ${this.name}`)
        }

        isAttacking(): boolean {
            return this._state === 'attack'
        }

        isGuarding(): boolean {
            return this._state === 'guard'
        }

        isSelecting(): boolean {
            return this._state === 'select'
        }

        isCasting(): boolean {
            return this._state === 'cast'
        }
        isWaiting(): boolean {
            return this._state === 'wait'
        }


        setState(state: string): void {
            this._state = state
        }
    
        async setAttributes(): Promise<void> {
            this._vit = Random.int(2, 8)
            this._str = Random.int(2, 8)
            this._dex = Random.int(2, 8)
            this._int = Random.int(2, 8)
            this._fth = Random.int(2, 8)
            this._wei = 20
        }

        getAllAttributes(): Array<number> {
            return [this._vit,this._str,this._dex,this._int,this._fth]
        }

        getAllStats(): Array<number> {
            return [this.mhp,this.hp,this.mmp,this.mp,this.wdmg,this.mdmg,this.qt]
        }

        //NOTE Mockups
        getWeight(): number {
            return this._wei * (this._str/100)
        }

        setHp(value: number): void {
            this._hp = Utils.clamp(value, 0, this.mhp)          
        }
        
        setMp(value: number): void {
            this._mp = Utils.clamp(value, 0, this.mmp)
        }

        setQt(value: number): void {
            this._qt = this.getWeight() + value
        }

        revive(): void {
            this._hp = 1;
            this._qt = this.getWeight()
        }

        updateCurrentQt(value: number): void {
            this._qt = this._qt + value
        }

        updateDead(): void {
            if(!this.isAlive()){
                this._hp = 0
                this._qt = 0
                Graphics(`\n^W${this.name}^ died!`)
                //break casting
                //remove buffs debuffs
            }
        }

        recoverAll(): void {
            this._hp = this.mhp
            this._mp = this.mmp
        }

        isAlive(): boolean {
            return this.mhp > 0 && this.hp > 0
        }

        getFriends(): Array<Battler> {
            return (this instanceof Hero) ? Game.Heroes : Game.Enemies;
        }
        
        getOpponents(): Array<Battler> {
            return (this instanceof Enemy) ? Game.Heroes : Game.Enemies;
        }

        makeAction(id: number): Action {
            return new Action(this, id)
        }

        getSkillsFromCommand(command: string): Array<number> {  
            switch (command) {
                case 'attack':
                   
                    break;
            
                default:
                    break;
            }
        }

    }

    export class Hero extends Battler {
        _exp?: number
        _level?: number
    }

    export class Enemy extends Battler {
        setName(input: string): void {
            this.name = input
        }
    }

    export class Action {
        _user: Battler
        _skill: Skill
        _targets: Array<Battler>

        constructor(user: Battler, id: number) {
            this._user = user
            this._skill = new Skill(this.fetchSkillFromID(id))
            this._targets = []
            
        }

        fetchSkillFromID(id: number): Skill {
            //FIXME  Placeholder
            switch (id) {
                case 0:
                    return {id: 0, name: 'Attack', damage: {type: 1, formular: 'a.wdmg* 1.0', element: 1, variance: 10}, rt: 50, scope: 1, cost: 0, costType: 'Mana', tooltip: '', state: 'attack'}
                    break;
            
                default:
                    return {id: 1, name: 'Guard', damage: {type: 0, formular: '', element: 1, variance: 10}, rt: 25, scope: 0, cost: 0, costType: 'Mana', tooltip: '', state: 'guard'}
                    break;
            }
        }
        
        async getTargets(): Promise<any> {
            let possibleTargetsNames: Array<string> = this.getPossibleTargets().map(target => target.name)
            let targets = await this.openTargetSelection(possibleTargetsNames) 
            //console.log(targets[0].isAliv;
            if(targets){
                if(targets[0].isAlive()) return targets;
                return await this.getTargets()
            }         
        }

        setTargets(targets: Array<Battler>): void {
           this._targets = targets;      
        }

        getPossibleTargets(): Array<Battler> {
            switch (this._skill.scope) {
                //FIXME only 2 for testing
                case 0:
                    return [this._user]
                    break;
                
                default:
                    return this._user.getOpponents()
                    break;
            }
        }

        async openTargetSelection(names: Array<string>): Promise<Array<Battler>> {
            //FIXME only single selection atm
            let name = await Graphics.gridMenu(names).promise;
            return [this.getPossibleTargets()[name.selectedIndex]]
        }

        async targetIsValid(): Promise<boolean> {
           return this._targets[0].isAlive() == true
        }

        isCriticalHit(): boolean {
            return Random.float() < 0.2
        }

        isDamageAbility(): boolean {
           return this._skill.damage.type !== 0
        }

        perform(): void {
            let user = this._user
            user.setState(this._skill.state)
            let critical = this.isCriticalHit()
            let targetCount = this._targets.length
            user.setQt(this._skill.rt)
            if(this.isDamageAbility()){
                for (let i = 0; i < targetCount; i++) {
                    let target = this._targets[i]
                    let result: number = this.evalSkillFormular(user, target);       
                    result *= this.calcDamageVariance();
                    (critical)? result *= 1.5 : null;
                    (target.isGuarding())? result *= 0.5: null;
                    result = Math.round(result)
                    this.applyDamage(target, result, critical)
                }   
            }            
        }

        applyDamage(target: Battler, damage: number, crit: boolean = false): void {
            target.setHp(target.hp - damage)
            this.makeDamageMessage(target, damage, crit)
            target.updateDead()
        }

        makeDamageMessage(target: Battler, dmg: number, crit: boolean = false): void {
            let usr = '^G' + this._user.name
            let trg = '^R' + target.name
            let cri = (crit)? '^Ycritcal^ ': '';
            Graphics(`\n${usr}^ deals ${cri}^W${dmg}^ Damage to ${trg}^`).nextLine(1)
        }

        evalSkillFormular(a?: Battler, b?: Battler): number {
            return eval(this._skill.damage.formular)
        }

        calcDamageVariance(): number {
           let int = this._skill.damage.variance
           return Random.int(-int, int)/100 + 1
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
        state: string

        constructor(data: Skill){
            this.id = data.id
            this.name = data.name
            this.damage = data.damage
            this.rt = data.rt
            this.scope = data.scope
            this.cost = data.cost
            this.costType = data.costType
            this.tooltip = data.tooltip
            this.state = data.state
        }
    }
}

//export = Objects
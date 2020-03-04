import { Game, Graphics } from "./game"
import { Battle} from "./battle"
import { Utils } from "./game"
import { Random } from "./game"
import { Data } from "./data"


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
        private _skills: Array<number> = [0,1,2]
        
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

        skills(): Array<Skill> {
            return this._skills.map(skill => Data.Skills[skill])
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

        async makeAction(): Promise<Action> {
            let action = new Action(this)
            await this.selectCommand(action)   
            return action
        }

        async selectCommand(action: Action): Promise<void> {
            let commands = this.getCommands()
            let options = {}
            let command = await Graphics.singleLineMenu(commands, options).promise
            let skillIDs = this.getSkillsFromCommand(command.selectedText)
            await this.selectSkill(skillIDs, action)       
        }

        async selectSkill(list: Array<number>, action: Action): Promise<void> {      
            let id = list[0]
            if(!this.isBasicCommand(list)){
                let items = this.createSkillSelectItems(list)
                let options = {
                    cancelable: true,
                    itemMaxWidth: Graphics.width / 2
                }
                let result = await Graphics.gridMenu(items, options).promise
                result.selectedIndex != undefined ? id =list[result.selectedIndex]: 
                result.canceled === true ? await this.selectCommand(action): null;
            }    
            action.setSkillId(id)
            await this.selectTarget(list, action); 
        }

        isBasicCommand(ids: Array<number>): boolean {
            return ids[0] === 0 ? true : ids[0] === 1 ? true : false;
        }

        createSkillSelectItems(list: Array<number>): Array<string> {
            return list.map(id => {
                let skill = Data.Skills[id]
                return Graphics.str(`^b${skill.name}^ MP: ^m${skill.cost}^`)
            })
        }
        
        getCommands(): Array<string> {
            let commands = [Graphics.str('Attack')]
            this.hasUsableSpells() ? commands.push('Spells'): null; 
            this.hasUsableItems() ? commands.push('Items'): null;
            commands.push('Guard');
            return commands  
        }

        async selectTarget(list: Array<number>, action: Action): Promise<void> {
            let targets = this.getScopeTargets(action)
            let targetNames = this.createTargetSelectItems(targets)
            
            let options = {
                cancelable: true, 
                selectedStyle: Graphics.bgDefaultColor()
            }
            
            let result = await Graphics.singleColumnMenu(targetNames, options).promise;
            result.canceled == true    ?    !this.isBasicCommand(list) ? 
            await this.selectSkill(list, action): await this.selectCommand(action): null;
            
            let index = result.selectedIndex;
            if(index != undefined) action.setTargets([this.getOpponents()[index]])         
        }

        getScopeTargets(action: Action): Array<Battler> {
            return  Math.sign(action.skill().scope) < 0 ? action.user().getFriends(): 
                    Math.sign(action.skill().scope) > 0 ? action.user().getOpponents():
                    [action.user()];
        }

        createTargetSelectItems(list: Array<Battler>): Array<string> {
            return list.map(target => {
                return (target.isAlive() == true) ? 
                Graphics.str(`${target.name} HP: ^g${target.hp}^`):
                Graphics.str(`${target.name} ^rDEAD^`);
            })
        }

        hasUsableItems(): boolean {
            return false
        }

        hasUsableSpells(): boolean {     
            return this.spells().length > 0;
        }

        spells(): Array<Skill> {
            return this.skills().filter(skill => skill.type === 'spell')
        }

        spellIDs(): Array<number> {
            return this.spells().map(skill => skill.id)
        }

        getSkillsFromCommand(command: string): Array<number> {  
            switch (command.toUpperCase()) {
                case 'GUARD':
                    return [0];
                case 'ATTACK':
                    return [1];  
                case 'SPELLS':
                    return this.spellIDs()
                // case 'ITEMS':
                //     return [0,9]    
                default:
                    return [0]
                    break;
            }
        }
    }

    export class Hero extends Battler {
        _exp?: number
        _level?: number

        async makeAction(): Promise<Action> {
            let action = new Action(this)
            await this.selectCommand(action)   
            return action
        }

        async selectCommand(action: Action): Promise<void> {
            let commands = this.getCommands()
            let options = {}
            let command = await Graphics.singleLineMenu(commands, options).promise
            let skillIDs = this.getSkillsFromCommand(command.selectedText)
            await this.selectSkill(skillIDs, action)       
        }

        async selectSkill(list: Array<number>, action: Action): Promise<void> {      
            let id = list[0]
            if(!this.isBasicCommand(list)){
                let items = this.createSkillSelectItems(list)
                let options = {
                    cancelable: true,
                    itemMaxWidth: Graphics.width / 2
                }
                let result = await Graphics.gridMenu(items, options).promise
                result.selectedIndex != undefined ? id =list[result.selectedIndex]: 
                result.canceled === true ? await this.selectCommand(action): null;
            }    
            action.setSkillId(id)
            await this.selectTarget(list, action); 
        }

        isBasicCommand(ids: Array<number>): boolean {
            return ids[0] === 0 ? true : ids[0] === 1 ? true : false;
        }

        createSkillSelectItems(list: Array<number>): Array<string> {
            return list.map(id => {
                let skill = Data.Skills[id]
                return Graphics.str(`^b${skill.name}^ MP: ^m${skill.cost}^`)
            })
        }
        
        getCommands(): Array<string> {
            let commands = [Graphics.str('Attack')]
            this.hasUsableSpells() ? commands.push('Spells'): null; 
            this.hasUsableItems() ? commands.push('Items'): null;
            commands.push('Guard');
            return commands  
        }

        async selectTarget(list: Array<number>, action: Action): Promise<void> {
            let targets = this.getScopeTargets(action)
            let targetNames = this.createTargetSelectItems(targets)
            
            let options = {
                cancelable: true, 
                selectedStyle: Graphics.bgDefaultColor()
            }
            
            let result = await Graphics.singleColumnMenu(targetNames, options).promise;
            result.canceled == true    ?    !this.isBasicCommand(list) ? 
            await this.selectSkill(list, action): await this.selectCommand(action): null;
            
            let index = result.selectedIndex;
            if(index != undefined) action.setTargets([this.getOpponents()[index]])         
        }

        getScopeTargets(action: Action): Array<Battler> {
            return  Math.sign(action.skill().scope) < 0 ? action.user().getFriends(): 
                    Math.sign(action.skill().scope) > 0 ? action.user().getOpponents():
                    [action.user()];
        }

        createTargetSelectItems(list: Array<Battler>): Array<string> {
            return list.map(target => {
                return (target.isAlive() == true) ? 
                Graphics.str(`${target.name} HP: ^g${target.hp}^`):
                Graphics.str(`${target.name} ^rDEAD^`);
            })
        }

        hasUsableItems(): boolean {
            return false
        }

        hasUsableSpells(): boolean {     
            return this.spells().length > 0;
        }

        spells(): Array<Skill> {
            return this.skills().filter(skill => skill.type === 'spell')
        }

        spellIDs(): Array<number> {
            return this.spells().map(skill => skill.id)
        }

        getSkillsFromCommand(command: string): Array<number> {  
            switch (command.toUpperCase()) {
                case 'GUARD':
                    return [0];
                case 'ATTACK':
                    return [1];  
                case 'SPELLS':
                    return this.spellIDs()
                // case 'ITEMS':
                //     return [0,9]    
                default:
                    return [0]
                    break;
            }
        }
    }
    
    export class Enemy extends Battler {
        setName(input: string): void {
            this.name = input
        }

        async makeAction(): Promise<Action> {
            let action = new Action(this) 
            console.log(this.makeTargetRatings())
            return action
        }

        makeTargetRatings(): Array<number> {
            return this.getOpponents().map(target => {
                return this.getHPRating(target) + this.getStatusRating(target) + this.getEquipRating(target) + this.getCasterRating(target)
            })

        }

        getHPRating(target: Battler): number {
            let x = target.hp * 128 / target.mhp
            console.log(x);     
            return x
        }
        
        getStatusRating(target: Battler): number {  
            return 0
        }
        
        getEquipRating(target: Battler): number {  
            return 0
        }

        getCasterRating(target: Battler): number {
            let x = (target.mmp / target.mp)
            x /= 16
            x *= target.spells().length
            x *= target.spells().filter(skill => skill.cost < target.mp).length > 0 ? 1: 0;
            console.log(x);     
            return x
        }
    }

    export class Action {
        private _user: Battler
        private _skillId: number = 0
        private _targets: Array<Battler> = []

        constructor(user: Battler) {
            this._user = user        
        }

        skill(): Skill {
            return Data.Skills[this._skillId]
        };

        user(): Battler {
            return this._user;
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

        setSkillId(id: number): void {
            this._skillId = id
        }

        setTargets(targets: Array<Battler>): void {
           this._targets = targets;      
        }

        getPossibleTargets(): Array<Battler> {
            switch (this.skill().scope) {
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

        perform(): void {
            let user = this._user
            user.setState(this.skill().state)
            user.setQt(this.skill().rt)  
            this.applySkillCosts()  
            if(this.isDamageAbility()){
                let targetCount = this._targets.length
                for (let i = 0; i < targetCount; i++) {
                    let target = this._targets[i]
                    let critical = this.isCriticalHit() 
                    let result: number = this.evalSkillFormular(user, target);      
                    result *= this.getDamageVariance();  
                    critical ? result *= 1.5 : null;
                    if(target.isGuarding() && this.skill().isPhysical()) result *= 0.5;            
                    this.applyDamage(target, Math.round(result), critical)
                }   
            }  
        }

        isCriticalHit(): boolean {
            return Random.float() < 0.2
        }

        isDamageAbility(): boolean {
           return this.skill().damage.type !== 0
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
            return eval(this.skill().damage.formular)
        }

        applySkillCosts(): void {
            let cost = this.skill().cost
            let type = this.skill().costType
            type === 'mp' ? this.user().setMp(this.user().mp - cost):
            type === 'hp' ? this.user().setMp(this.user().hp - cost): 
            null;
        }

        getDamageVariance(): number {
           let int = this.skill().damage.variance
           return Random.int(-int, int)/100 + 1;
        }
    }

    interface _damage {
        type: number
        formular: string
        element: number
        variance: number
    }

    export interface _dataSkill {
        name?: string
        type?: string
        damage?: _damage
        rt?: number
        scope?: number
        cost?: number
        costType?: string
        tooltip?: string
        state?: string
    }

    export class Skill {
        id: number = 0
        type: string = ''
        name: string = ''
        damage: _damage = {type: 0, formular: '', element: 0, variance: 0}
        rt: number = 0
        scope: number = 0
        cost: number = 0
        costType: string = ''
        tooltip: string = ''
        state: string = ''

        constructor(id: number, data: _dataSkill){
            this.id = id
            for (let key in data) {
                //@ts-ignore
                this[key] = data[key]
            }
        }

        isPhysical(): boolean {
            return this.damage.type === Data.Config.damageTypes.physical
        }

        isMagical(): boolean {
            return this.damage.type === Data.Config.damageTypes.magical
        }
    }
}

//export = Objects
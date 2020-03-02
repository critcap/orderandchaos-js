import {Game} from './game'
import {Objects} from './objects'
import {Graphics} from './game'
import {PARTY_SIZE} from './game'

export class Battle {
    private static _status: string = ''
    private static _turnCount: number = 0
    private static _subject: Objects.Battler
    private static _actionStack: Array<Objects.Action> = []

    static get active(): Objects.Battler {return this.subject() }

    static inProgress(): boolean {
        return this._status !== '';
    }

    static setup(): void {
        this._status = 'setup'
        this._turnCount = 0
        this._actionStack = []
        //@ts-ignore
        this._subject = undefined
        this._status = 'Start'
        this.Start()
    }

    static Start(): void {
        console.log('Battle Commences');
        this._status = 'Start'
    }

    static onStart(): void {
        this.refreshAllQt()
        this.getAllBattlersAlive().forEach(battler => {
            battler.setState('wait')            
        })
        this.setNextSubject()
        //on Start effects
        //on Start events
        this._status = 'TurnStart'
    }

    static getAllBattlers(): Array<Objects.Battler> {
        return Game.Heroes.concat(Game.Enemies)
    }

    static getAllBattlersAlive(): Array<Objects.Battler> {
        return  this.getAllHeroesAlive().concat(this.getAllEnemiesAlive())
    }

    static getHeroesBattlemember(): Array<Objects.Hero> {
        return Game.Heroes.slice(0, PARTY_SIZE)
    }

    static getAllHeroesAlive(): Array<Objects.Hero> {
        return this.getHeroesBattlemember().filter(hero => {
            return hero.isAlive() === true
        })
    }

    static getAllEnemies(): Array<Objects.Enemy> {
        return Game.Enemies
    }

    static getAllEnemiesAlive(): Array<Objects.Battler>{
        return this.getAllEnemies().filter(enemy => {
            return enemy.isAlive() === true
        })
    }

    static refreshAllQt(): void {
        this.getAllBattlersAlive().forEach(battler => {
            battler.setQt(0)
        })
    }

    static subject(): Objects.Battler {
        if(!this._subject){
            this.setNextSubject()
            return this._subject
        }
        return this._subject
    }

    static setNextSubject(): void {
        let allBattler = this.getAllBattlersAlive().sort((a, b) => a.qt - b.qt)
        let nextBattler = allBattler[0]
        this.getAllBattlersAlive().forEach(battler =>{
            battler.updateCurrentQt(-nextBattler.qt)
        })
        nextBattler.updateCurrentQt((nextBattler.qt + 1) * -1)
        nextBattler.setState('select');
        this._subject = nextBattler
    }

    static updateTurn(): void {
        if(!this.checkBattleEvent()){    
            switch (this._status) {
                case 'Start':
                    this.onStart()
                    break;
                case 'TurnStart':
                    this.onTurnStart()
                    break;
                case 'PerformActions':
                    this.processActionStack()
                case 'TurnEnd':
                    this.onTurnEnd()
                    break;
                case 'BattleEnd':
                    this.onBattleEnd()
                    break;       
            }
        }
    }

    static checkBattleEvent(): boolean {
        switch (this._status) {
            case 'Start':
            case 'TurnStart':
            case 'TurnEnd':
                if(this.checkBattleEnd()) return true;        
        }
        return false
    }

    static checkBattleEnd(): boolean {
        if(this._status){
            if(this.checkAllDead(Game.Heroes)){
                this.processDefeat()
                return true;
            }
            if(this.checkAllDead(Game.Enemies)){
                this.processVictory()
                return true;
            }
        }
        return false
    }


    //placeholder

    static checkAllDead(unit: Array<Objects.Battler>): boolean {
        let dead = unit.filter(battler => {
            return !battler.isAlive() == true
        })
        return (dead.length === unit.length)? true: false;
    }

    static onTurnStart(): void {
        Graphics.clear()
        Graphics(`\nIts ${this.subject().name}'s turn`);
        Graphics(`\n${this.active.name}|HP: ${this.active.hp}/${this.active.mhp}|MP: ${this.active.mp}/${this.active.mmp}`);
        //buff debuffs
        //death check
        //check AP
        //when negativ AP skip turn
        this.onActionSelect()
    }

    static async onActionSelect(): Promise<any> {
        this._status = 'input'
        try {
            let action = await this.subject().makeAction()
            console.log(action);
            
            this.startActionStack([action])
        } catch (error) {
            console.log(error);
            Game.shutdown()
        }  
    }    

    static startActionStack(actions: Array<Objects.Action>): void {
        this._status = 'PerformActions'
        this._actionStack = actions
    }

    static processActionStack(): void {
        if(this._actionStack.length > 0) {
            this._actionStack[0].perform()
            this._actionStack.pop()
            
            Game.requestWait(90000)
        }
        else if(this._actionStack.length === 0) {
            this._status = 'TurnEnd'
        }
    }

    static onTurnEnd(): void {
        // buffs debuffs
        // bleeding 
        if(!this.subject().isGuarding) this.subject().setState('wait');
        this.setNextSubject()
        this._status = 'TurnStart'
    }

    static onBattleEnd(): void {
        this.getAllBattlers().forEach(battler => {
            battler.setState('')
        })
        Game.shutdown()   
    }

    static processVictory(): void {
        //remove all buffs and statuses
        //gain exp
        //gain items
        Graphics('\n^WYOUR TEAM WAS^ ^GVICTORIOUS^')
        this._status = 'BattleEnd'
    }
    static processDefeat(): void {
        //remove all buffs and statuses
        //gain exp
        //gain items
        Graphics('\n^WYOUR TEAM WAS^ ^RDEFEATED^')
        this._status = 'BattleEnd'
        
    }

    static close(): void {
        this._status = "standby"
        Game.shutdown()
    }

}


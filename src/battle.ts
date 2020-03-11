import {Game} from './game'
import {Objects} from './objects'
import {Graphics} from './graphics'
import {Terminal} from './graphics'
import {PARTY_SIZE} from './game'
import { BattleLog } from "./battlelog"

export class Battle {
    private static _status: string = ''
    private static _turnCount: number = 0
    private static _subject: number = -1
    private static _actionStack: Array<Objects.Action> = []

    static get active(): Objects.Battler {return this.subject() }

    static inProgress(): boolean {
        return this._status !== '';
    }

    static setup(): void {
        this.initMembers()
        BattleLog.setup()
        this.Start()
    }

    static initMembers(): void {
        this._status = 'setup'
        this._turnCount = 0
        this._actionStack = []
        //@ts-ignore
        this._subject = undefined   
    }

    static Start(): void {
        Graphics.onBattleStart()
        this._status = 'Start'
    }

    static getAllBattlers(): Array<Objects.Battler> {
        //@ts-ignore
        return Game.Enemies.concat(Game.Heroes)
    }

    static getAllBattlersAlive(): Array<Objects.Battler> {
        //@ts-ignore
        return this.getAllHeroesAlive().concat(this.getAllEnemiesAlive())
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
            return Game.getEntityFromID(this._subject)
        }
        return Game.getEntityFromID(this._subject)
    }

    static getTurnQueue(): Array<Objects.Battler> {
        return this.getAllBattlersAlive().sort((a, b) => a.qt - b.qt)
    }

    static setNextSubject(): void {
        let newSubject = this.getTurnQueue()[0]
        this.updateBattlerQTs(newSubject.qt)     
        newSubject.setQtAbsolut(-1)
        newSubject.setState('select');
        this._subject = newSubject.entityID
    }

    static updateBattlerQTs(value: number): void {
        this.getTurnQueue().forEach(battler => battler.updateCurrentQt(-value))
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

    //placeholder cuz this is shit hehehehehhehe

    static checkAllDead(unit: Array<Objects.Battler>): boolean {
        let dead = unit.filter(battler => {
            return !battler.isAlive() == true
        })
        return (dead.length === unit.length)? true: false;
    }

    static onStart(): void {
        this.refreshAllQt()
        this.getAllBattlersAlive().forEach(battler => {
            battler.setState('wait')            
        });
        this.setNextSubject()
        //on Start effects;
        //on Start events;
        this._status = 'TurnStart'
    };

    static onTurnStart(): void {
        Terminal.clear()
        BattleLog.onTurnStart()
        Graphics.makeStatusBar(this.subject())
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
            this.startActionStack([action])
        } catch (error) {
            console.log(error);
            Game.shutdown()
            return
        }  
    }    

    static startActionStack(actions: Array<Objects.Action>): void {
        this._status = 'PerformActions'
        this._actionStack = actions
    }

    static async processActionStack(): Promise<void> {
        if(this._actionStack.length > 0) {
            this._actionStack[0].perform()
            this._actionStack.pop()
            Game.requestWait(1000)
        }
        else if(this._actionStack.length === 0) {
            this._status = 'TurnEnd'
        }
    }

    static onTurnEnd(): void {
        // buffs debuffs
        // bleeding 
        BattleLog.onTurnEnd()
        this.endTurn()
    }

    static endTurn(): void {
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
        Graphics.makeVictoryMessage()
        
        this._status = 'BattleEnd'
    }
    static processDefeat(): void {
        //remove all buffs and statuses
        //gain exp
        Graphics.makeDefeatMessage()
        
        this._status = 'BattleEnd'
        
    }

    static close(): void {
        this._status = "standby"
        Game.shutdown()
    }

}

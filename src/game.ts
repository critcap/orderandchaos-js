import {Objects} from './objects';
import {Scenes} from './scenes';
import {Battle} from './battle'
import {Data} from './data'
import { BattleLog } from './battlelog';

export class Utils{
    static clamp(input: number, min: number, max: number): number{
        return Math.min(Math.max(input, min), max);
    }
}

export const Random = require('random')

export const Graphics = require('terminal-kit').terminal
Graphics.grabInput(true)
Graphics.on('key', (name:any, data:any) => {
    switch (name) {
        case "z":
            Game.shutdown()
            break;
        case "#":
            //Graphics.eraseLine().previousLine(1).eraseLine()
            BattleLog.getAllTurns().forEach(turn => console.log(turn))
            break;
        default:     
            break;
    }
}) 


export const PARTY_SIZE: number = 3;
const TICK_RATE: number = 20;
const hrtimeMs = () => {let time = process.hrtime(); return time[0] * 1000 / TICK_RATE}

export class Game {
    private static _previousTick = hrtimeMs()
    private static _tickLengthMs = 1000 / TICK_RATE
    private static _waitingDurationMs: number = 0;
    
    static Heroes: Array<Objects.Hero> = []
    static Enemies: Array<Objects.Enemy> = []

    static async run(): Promise<void> {
        Graphics.clear() 
        await Data.loadDatabases()    
        let hero = this.startCharacterCreation()
        let enemy = this.createEncounter()   
        await Promise.all([hero, enemy])
        Battle.setup()  
        this.requestUpdate()       
    }

    static update(): void {
        if(!this.isStopped()){
            try {
                if(Battle.inProgress()){
                    Battle.updateTurn()
                }
            } catch (error) {
                Game.shutdown()        
            }
        }
    }

    static async startCharacterCreation(): Promise<void> {
        let names = await Data.fetchNames(PARTY_SIZE, 'heroes')
        for (let i = 0; i < PARTY_SIZE; i++) {
            try {
                let Hero = new Objects.Hero()
                let name = await Graphics.inputField({default: names[i]}).promise
                Hero.setName(name)
                Graphics.nextLine(1)
                await Hero.setAttributes()
                Graphics.nextLine(1)
                Hero.recoverAll()
                Hero.gainItems(0, 99)
                this.Heroes.push(Hero)
            } catch (error) {
               console.log(error);
               this.shutdown()         
            }
        }
    }

    static async createEncounter(): Promise<void> {
        let enemyCount = Random.int(2,4)
        let enemyNames = await Data.fetchNames(enemyCount, 'enemies')
        for (let i = 0; i < enemyCount; i++) {
            let Enemy = new Objects.Enemy()
            Enemy.setName(enemyNames[i])
            Enemy.setAttributes()
            Enemy.recoverAll()
            this.Enemies.push(Enemy)
        }
    }

    static requestUpdate(): void {
        let now = hrtimeMs()
        let delta = (now - this._previousTick) / 1000
        this._previousTick = now
        this.update();
        let wait = this._waitingDurationMs
        this.stopWait()
        setTimeout(() => this.requestUpdate(), this._tickLengthMs + wait)  
    }

    static isWaiting(): boolean {
        return this._waitingDurationMs > 0
    }

    static requestWait(duration: number): void {
        if(!this.isWaiting()) this._waitingDurationMs = duration;        
    }

    static stopWait(): void {
        this._waitingDurationMs = 0
    }

    static isStopped(): boolean {
        if(this.isWaiting()) return true;
        return false;
    }
   
    static shutdown(): void {
        Graphics.processExit()
    }
}

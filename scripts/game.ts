import Objects = require('./objects')

const ATTACK_TIME = 50;
const PARTY_SIZE: number = 2;
const TICK_RATE: number = 60;
const hrtimeMs = function () {
    let time = process.hrtime();
    return time[0] * 1000 / TICK_RATE
}

const readline = require('readline-sync')

class Game {
    private static _previousTick = hrtimeMs()
    private static _tick = 0;
    private static _tickLengthMs = 1000 / TICK_RATE

    static onetime: boolean = true

    static control: number = 0
    static message: string = "hallo"
    static inputing: boolean = false
    static heroes: Array<Objects.Character>
    static enemies: Array<Objects.Character>

    static run(): void {
        this.createGroup()
        //Battle.setup()
        this.requestUpdate()
    }

    static update(): void {
        if(this.onetime == true){
            Battle.setup()
            this.onetime = false
        }
        if(Battle.status !== 'standby'){
            Battle.updateTurn()
        }
    }


    static requestUpdate(): void {
        if (this.control >= 40) this.shutdown()
        setTimeout(() => this.requestUpdate(), this._tickLengthMs)
        let now = hrtimeMs()
        let delta = (now - this._previousTick) / 1000
        this._previousTick = now
        this._tick++
        this.control++
        if (!this.isInputActive()) {
            this.update();
        }
    }

    static requestInput(message: string): void {
        if (!this.isInputActive()) {
            this.inputing = true
            let input = readline.question(message)
            this.inputing = false;

        }
    }

    static startInput(): void {
        
    }

    static isInputActive(): boolean {
        return this.inputing
    }

    static createGroup(): void {
        this.heroes = this.createCharacter(PARTY_SIZE)
        this.enemies = this.createCharacter(PARTY_SIZE)
    }

    static createCharacter(size: number): Array<Objects.Character> {
        let party = []
        for (let i = 0; i < size; i++) {
            party.push(new Objects.Character())
        }
        return party
    }

    static clearManager(): void {

    }

    static reset(): void {

    }

    static output(...message: any): void {
        console.log(message);
    }

    static shutdown(): void {
        process.exit()
    }
}

class Battle {
    static status: string = "standby"
    static turnCount: number = 0
    static turnQueue: Array<number>
    static activeBattler?: Objects.Battler

    static heroes: Array<Objects.Battler>
    static enemies: Array<Objects.Battler>

    static isBusy(): boolean {
        return false
    }

    static setup(): void {
        this.turnCount = 0
        this.turnQueue = []
        this.heroes = []
        this.enemies = []
        this.activeBattler = undefined
        this.status = "setup"
        
        this.createBattlers();
        this.initBattlersQueueTime()
        this.checkBattlersAlive()
        this.start()
    }

    static createBattlers(): void {
        Game.heroes.forEach(hero => {
            this.heroes.push(new Objects.Battler(hero))
        })
        Game.enemies.forEach(enemie => {
            this.enemies.push(new Objects.Battler(enemie))
        })
    }

    static getTurnOrder(): string{
        if(!this.checkQueueTime()) this.initBattlersQueueTime()
        //@ts-ignore
        let qt = this.getAllBattlers().sort((a, b) => a.qt - b.qt)
        qt.map(ele => {
            `${ele.name} ${ele.qt}`
        })
        let qto: string = ""
        qt.forEach(ele => {
            qto = qto + ele.name + ' ' + ele.spd + ' ' + ele.qt + "; "
        })
        return qto
        
    }

    static getAllBattlers(): Array<Objects.Battler> {
        return this.heroes.concat(this.enemies)
    }

    static checkQueueTime(): boolean {
        let noqt = this.getAllBattlers().filter(battler => {
            return battler.qt == null
        })
        return (noqt.length > 0)? false: true 
    }

    static checkBattlersAlive(): void{
        let deadHeroes = this.heroes.filter(hero => {
            hero.alive == false
        });
        (deadHeroes.length > 0)? this.processDefeat() : null;
        let deadEnemies = this.enemies.filter(enemy => {
            enemy.alive == false
        });
        (deadEnemies.length > 0)? this.processVictory() : null;
    }

    static initBattlersQueueTime(): void {
        this.getAllBattlers().forEach(battler => {
            battler.qt = battler.spd
        })
    }
    static start(): void {
        this.status = "start"
    }

    static onStart(): void {
       this.activeBattler = this.getNextBattler()
       this.nextTurn()
    }

    static nextTurn(): void {
        this.turnCount++
        this.status = 'turnStart'
    }

    static updateTurn(): void {
        switch (this.status) {
            case 'start':
                this.onStart()
                break;
            case 'turnStart':
                console.log(`Its ${this.activeBattler.name}'s turn`);
                this.status = 'input'
                break;
            case 'input':
                Game.requestInput("Attack?")
                this.status = 'turnEnd'
                break;
            case 'turnEnd':
                this.activeBattler.qt = this.activeBattler.spd +1
                this.activeBattler = this.getNextBattler()
                this.status = 'turnStart'
                break;
            case 'End':
                break;
            default: console.log("default");
            
        }
    }

    static getNextBattler(): Objects.Battler{

        let qt = this.getAllBattlers().sort((a, b) => a.qt - b.qt)
        let qtqt = qt[0].qt
        this.getAllBattlers().forEach(ele =>{
            ele.qt -= qtqt
            console.log(ele.qt, qtqt;
            
        })

        return qt[0]

    }

    static processAttack(): void {

    }

    static processVictory(): void {
        console.log('Your Group was Victorious');
        this.close()
        
    }
    static processDefeat(): void {
        console.log('Your Group was Defeated');
        this.close()
        
    }
    static close(): void {
        this.status = "standby"
        Game.shutdown()
    }

}


export = Game
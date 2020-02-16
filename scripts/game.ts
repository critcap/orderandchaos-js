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
        this.heroes = this.createCharacter(PARTY_SIZE)
        this.enemies = this.createCharacter(PARTY_SIZE)
        Battle.setup()
        this.requestUpdate()
    }

    static update(): void {
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

    static isInputActive(): boolean {
        return this.inputing
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
    static activeBattler?: Objects.Battler 
    static heroes: Array<Objects.Battler> = []
    static enemies: Array<Objects.Battler> = []

    static isBusy(): boolean {
        return false
    }

    static setup(): void {
        this.status = "setup"   
        this.createBattlers();
        this.initBattlersQueueTime()
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

    static getAllBattlers(): Array<Objects.Battler> {
        return this.heroes.concat(this.enemies)
    }

    static getAllAliveBattlers(): Array<Objects.Battler> {
        return this.getAllBattlers().filter(battler => {
            return battler.alive == true
        })
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
                console.log(`Its ${this.getActiveBattler().name}'s turn`);
                this.status = 'input'
                break;
            case 'input':
                Game.requestInput("Attack?")
                this.processAttack()
                this.status = 'turnEnd'
                break;
            case 'turnEnd':
                this.getActiveBattler().qt = this.getActiveBattler().spd +1
                this.activeBattler = this.getNextBattler()
                this.status = 'turnStart'
                break;
            case 'End':
                break;
            default: console.log("default");
            
        }
    }

    static getActiveBattler(): Objects.Battler {
        if(!this.activeBattler) this.activeBattler = this.getNextBattler()
        return this.activeBattler
    }

    static getNextBattler(): Objects.Battler{
        let qt = this.getAllAliveBattlers().sort((a, b) => a.qt - b.qt)
        let qtqt = qt[0].qt
        this.getAllAliveBattlers().forEach(ele =>{
            ele.qt -= qtqt
        })
        qt[0].qt = -1;

        return qt[0]

    }

    static processAttack(): void {
        let attacker: Objects.Battler = this.getActiveBattler()
        let target: Objects.Battler = this.getAttackTarget(this.getBattlerOpponents(attacker))

        if(target.vit <= attacker.atk) {
            target.vit = 0
            target.alive = false
            console.log(`${attacker.name} defeats ${target.name}`);
            let opponents = this.getBattlerOpponents(attacker)
            if(this.checkIfDefeated(opponents)) {
                if(opponents == this.heroes) {
                    this.processDefeat()
                }
                if(opponents == this.enemies) {
                    this.processVictory()
                }
            }
        }
        else {        
            target.vit -= attacker.atk
            console.log(`${attacker.name} deals ${attacker.atk} damage to ${target.name}`);
        }     
    }

    static checkIfDefeated(group: Array<Objects.Battler>): boolean {
        let alive = group.filter(ele => {
            return ele.alive == true;
        })
        return (alive.length === 0) ? true : false ;
    }

    static getBattlerFriends(battler: Objects.Battler): Array<Objects.Battler> {
        return (this.heroes.includes(battler)) ? this.heroes : this.enemies;
    }     
    
    static getBattlerOpponents(battler: Objects.Battler): Array<Objects.Battler> {
        return (this.heroes.includes(battler)) ? this.enemies : this.heroes;
    }

    static getAttackTarget(group: Array<Objects.Battler>): Objects.Battler {
        let validTargets = group.filter(ele => {
            return ele.alive === true
        })
        return validTargets[Math.floor((Math.random() * validTargets.length))];
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
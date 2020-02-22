import {Game} from './game'
import {Objects} from './objects'
import {Graphics} from './game'

export class Battle {
    static status: string = ''
    static turnCount: number = 0
    static activeBattler?: Objects.Battler 
    static heroes: Array<Objects.Battler> = []
    static enemies: Array<Objects.Battler> = []

    static isBusy(): boolean {
        return false
    }

    static requestBattle(): void {
        if(this.status = '') this.setup();
        return 
    }

    static inProgress(): boolean {
        return (this.status === '')? false : true;
    }

    static setup(): void {
        this.turnCount = 0
        this.heroes = []
        this.enemies = []
        this.activeBattler = undefined
        this.createBattlers();

        this.status = 'start'
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
                //Game.requestInput("Attack?")   
                Game.inputing = true    

                    Graphics.singleLineMenu(['Attack', 'Guard'], (error:any, response:any) => {
                        if(response.selectedIndex === 0) {
                            this.processAttack()
                        }
                        else {
                            console.log(`${this.getActiveBattler().name} guards himself`);
                            
                        }
                        this.status = 'turnEnd'
                        Game.inputing = false
                    })

                //this.processAttack()
                //this.status = 'turnEnd'
                break;
            case 'turnEnd':
                this.getActiveBattler().qt = this.getActiveBattler().spd +1
                this.activeBattler = this.getNextBattler()
                this.status = 'turnStart'
                break;
            case 'cleanup':
                this.afterBattleCleanUp()
                break;
            default: console.log("default");
            
        }
    }

    static onStart(): void {
        this.activeBattler = this.getNextBattler()
        this.nextTurn()
     }

    static onTurnStart(): void {
        
    }
    static onPhaseStart(): void {

    }
    static onActionSelect(): void {

    }
    static onPhaseEnd(): void {

    }
    static onTurnEnd(): void {

    }
    static onBattleEnd(): void {}

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
        let attacker: Objects.Battler = this.getActiveBattler();
        let target: Objects.Battler = this.getAttackTarget(this.getBattlerOpponents(attacker));
        let damage: number = attacker.atk;
        let critical: boolean = this.isCriticalHit(); 
        (critical)? damage *= 2: null;

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
        else if(critical){
            target.vit -= damage
            console.log(`${attacker.name} CRITICALLY strikes ${target.name} for ${damage}`);
        } 
        else {        
            target.vit -= damage
            console.log(`${attacker.name} deals ${damage} damage to ${target.name}`);
        }     
    }

    static isCriticalHit(): boolean {
        return Math.random() < 0.2
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

    static afterBattleCleanUp(): void {

    }

    static close(): void {
        this.status = "standby"
        Game.shutdown()
    }

}
import { format } from 'url'

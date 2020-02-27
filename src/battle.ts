import {Game} from './game'
import {Objects} from './objects'
import {Graphics} from './game'
import {PARTY_SIZE} from './game'

export class Battle {
    private static _status: string = ''
    private static _turnCount: number = 0
    private static _activeBattler?: Objects.Battler 
    private static _actionStack: Array<Objects.Action>

    static get active(): Objects.Battler {return this.getActiveBattler() }

    static inProgress(): boolean {
        return this._status !== '';
    }

    static setup(): void {
        this._status = 'setup'
        this._turnCount = 0
        this._actionStack = []
        this._status = 'start'
        this.start()
    }

    static start(): void {
        console.log('Battle Commences');
        this._status = 'start'
    }

    static onStart(): void {
        this.initBattlersQt() 

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

    static initBattlersQt(): void {
        this.getAllBattlers().forEach(battler => {
            battler.setQt(0)
        })
    }


    static updateTurn(): void {
        switch (this._status) {
            case 'start':
                this.onStart()
                break;
            case 'turnStart':
                console.log(`Its ${this.getActiveBattler().name}'s turn`);
                this.startInput()
                break;
            case 'turnEnd':
                this.getActiveBattler().setQt(50)
                this._activeBattler = this.getNextBattler()
                this._status = 'turnStart'
                break;
            case 'cleanup':
                this.afterBattleCleanUp()
                break;       
        }
    }

    static async startInput(): Promise<any> {
        this._status = 'input'
        try {
            let command = await Graphics.singleLineMenu(['Attack', 'Guard']).promise;   
            let action = new Objects.Action(this.getActiveBattler(), command.selectedIndex)
            let targets = await action.getTargets()
            action.setTargets(targets)
            //console.log(`${action.user.name} uses ${action.skill.name} on ${action.targets[0].name}`);
            this.startActionStack([action])
        } catch (error) {
            Graphics.clear()
            console.log(error);
            Game.shutdown()
        }  
    }    

    static startActionStack(actions: Array<Objects.Action>): void {
        this._actionStack = actions
        this.startActionProcess()
    }

    static startActionProcess(): void{
        if(this._actionStack){
            let string = `3 ... 2 ... 1 ...`
            Graphics.slowTyping(string, {style: Graphics.white, flashStyle: false, delay: 100}, (end:any) => {
                this.processAttack()   
            });
               
        }
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
        let active = Game.Heroes.concat(Game.Enemies).filter(battler => {return battler.qt === -1})
        return (active.length > 0) ? active[0] : this.getNextBattler()
    }

    static getNextBattler(): Objects.Battler{
        let qt = this.getAllBattlersAlive().sort((a, b) => a.qt - b.qt)
        let qtqt = qt[0].qt
        this.getAllBattlersAlive().forEach(ele =>{
            ele.updateCurrentQt(-qtqt)
        })
        qt[0].updateCurrentQt(-(qt[0].qt + 1))

        return qt[0]
    }

    static processAttack(): void {
        let attacker: Objects.Battler = this.getActiveBattler();
        let target: Objects.Battler = this.getAttackTarget(this.getBattlerOpponents(attacker));
        let damage: number = attacker.wdmg;
        let critical: boolean = this.isCriticalHit(); 
        (critical)? damage *= 2: null;

        if(target.hp <= damage) {
            target.setHp(0)
            console.log(`${attacker.name} defeats ${target.name}`);
            let opponents = this.getBattlerOpponents(attacker)
            if(this.checkIfDefeated(opponents)) {
                if(opponents == Game.Heroes) {
                    this.processDefeat()
                }
                if(opponents == Game.Enemies) {
                    this.processVictory()
                }
            }
        }
        else if(critical){
            target.setHp(target.hp - damage)
            console.log(`${attacker.name} CRITICALLY strikes ${target.name} for ${damage}`);
            this._status = "turnEnd"
        } 
        else {        
            target.setHp(target.hp - damage)
            console.log(`${attacker.name} deals ${damage} damage to ${target.name}`);
            this._status = "turnEnd"
        }     
    }

    static isCriticalHit(): boolean {
        return Math.random() < 0.2
    }

    static checkIfDefeated(group: Array<Objects.Battler>): boolean {
        let alive = group.filter(ele => {
            return ele.isAlive() == true;
        })
        return (alive.length === 0) ? true : false ;
    }

    static getBattlerFriends(battler: Objects.Battler): Array<Objects.Battler> {
        return (Game.Heroes.includes(battler)) ? Game.Heroes : Game.Enemies;
    }     
    
    static getBattlerOpponents(battler: Objects.Battler): Array<Objects.Battler> {
        return (Game.Heroes.includes(battler)) ? Game.Enemies : Game.Heroes;
    }

    static getAttackTarget(group: Array<Objects.Battler>): Objects.Battler {
        let validTargets = group.filter(ele => {
            return ele.isAlive() === true
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
        this._status = "standby"
        Game.shutdown()
    }

}
import { format } from 'url'

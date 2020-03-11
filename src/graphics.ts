import {Objects} from './objects'
import {Game} from './game'
import {Battle} from './battle'
export const Terminal = require('terminal-kit').terminal

Terminal.grabInput(true)
Terminal.on('key', (name:any, data:any) => {
    switch (name) {
        case "z":
            Terminal.processExit()
            break;
        case "#":
            break;
        default:     
            break;
    }
}) 

export class Graphics {
    private static _heroColor: string = 'B'
    private static _enemyColor: string = 'r'
    private static _hpColor: string = 'y'
    private static _mpColor: string = 'b'
    private static _critColor: string = 'Y'
    private static _dmgColor: string = 'R'
    private static _healColor: string = 'G'

    static get spc(): string {return '||'}
    static get crit(): string {return `^${this._critColor}critically^`}

    static formatHP(battler: Objects.Battler): string {
        return `^${this._hpColor}${battler.hp}/${battler.mhp}^`
    }
    static formatMP(battler: Objects.Battler): string {
        return `^${this._mpColor}${battler.mp}/${battler.mmp}^`
    }
    static formatName(battler: Objects.Battler): string {
        let color = battler instanceof Objects.Hero ? this._heroColor: this._enemyColor;
        return `^${color}${battler.name}^`
    }

    static formatDmg(damage: number): string {
        return this.isHPDamage(damage) ? `^${this._dmgColor}${damage}` : `^${this._healColor}${damage}`
    }

    static makeStatusBar(battler: Objects.Battler): void {
        let name = this.formatName(battler)
        let hp = this.formatHP(battler)
        let mp = this.formatMP(battler)
        Terminal(`\n${name} ${this.spc} HP: ${hp} ${this.spc} MP: ${mp}`)
    }

    static onBattleStart(): void {
        Terminal(`\nBattle Commences`)
    }

    static async makeNameInput(name: string): Promise<string> {
        Terminal('^yPlease tell me your name: ^')
        let input = await Terminal.inputField({default: name}).promise
        name = input.length > 0 ? input: name;
        Terminal(`\nMy name is ${name}`).nextLine(1)
        return name;
    }

    static async makeCommandSelection(items: Array<string>): Promise<any> {
        let options = {}
        return Terminal.singleLineMenu(items, options).promise
    }

    static async makeSkillSelection(skills: Array<Objects.Skill>, subject: Objects.Battler): Promise<any> {
        let items = this.createSkillSelectItems(skills, subject)
        let options = {
            cancelable: true,
            itemMaxWidth: Terminal.width / 2
        }
        return Terminal.gridMenu(items, options).promise
    }

    static createSkillSelectItems(skills: Array<Objects.Skill>, subject: Objects.Battler): Array<string> {
        return skills.map(obj => {
            let extra = obj instanceof Objects.Item ? ` #:^g${subject._inventory[obj.id]}^`: ` MP:^${this._mpColor}${obj.cost}^`
            return Terminal.str(`^b${obj.name}^`+extra)
        })
    }

    static async makeTargetSelection(targets: Array<Objects.Battler>): Promise<any> {
        let items = this.createTargetSelectItems(targets)
        let options = {
            cancelable: true, 
            selectedStyle: Terminal.bgDefaultColor()
        }        
        return Terminal.singleColumnMenu(items, options).promise;
    }

    static createTargetSelectItems(targets: Array<Objects.Battler>): Array<string> {
        return targets.map(target => {
            return (target.isAlive() == true) ? 
            Terminal.str(`${this.formatName(target)} HP: ${this.formatHP(target)}`):
            Terminal.str(`${this.formatName(target)} ^rDEAD^`);
        })
    }

    static makeDamageMessage(subject: Objects.Battler, target: Objects.Battler, damage: number, crit: boolean = false): void {
        let sub = this.formatName(subject);
        let tar = this.formatName(target);
        let dmg = this.formatDmg(damage);
        let cri = crit === true ? this.crit : ''
        let text = this.isHPDamage(damage) ? `${cri} deals ${dmg} Damage`: `${cri} restores ${dmg} Life`;
        Terminal(`${sub} ${text} to ${tar}`).nextLine(1)

    }

    static isHPDamage(damage: number): boolean {
        return Math.sign(damage) < 0
    }

    static makeDeathMessage(battler: Objects.Battler): void {
        Terminal(`\n${this.formatName(battler)} died!`)
    }

    static makeVictoryMessage(): void {
        Terminal('\n^WYOUR TEAM WAS^ ^GVICTORIOUS^!');
    }

    static makeDefeatMessage(): void {
        Terminal('\n^WYOUR TEAM WAS^ ^RDEFEATED^!')
    }


}
   



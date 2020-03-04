import { Battle } from './battle'
import { Objects } from './objects'

interface _hit {
    target: number
    missed: boolean
    critical: boolean 
    result: number
}

class Turn {
    private _subjectID: number = 0
    private _targetIDs: Array<number> = []
    private _action: any = {
        skillID: 0,
        hits: []
    }

    get dmg(): number { 
        return this._action.hits.reduce((a: number, b: number) => a + b, 0)
    }

    setSubjectID(subject: number): void {
        this._subjectID = subject
    }

    setTargetIDs(targets: Array<number>): void {
        this._targetIDs = targets
    }

    setSkill(skill: number): void {
        this._action.skill = skill
    }

    addHit(hit: _hit): void {
        this._action.hits.push(hit)
    }

}

export class BattleLog {
    private static _battler: Array<number> = [];
    private static _turns: Array<any> = []
    private static _currentTurn: Array<Turn> = []

    static setup(): void {
        this.initMembers()
        this.setBattlers()
    }

    static initMembers(): void {
        this._battler = []
        this._turns = []
        this._currentTurn = []
    }

    static currentTurn(): Turn {
        return this._currentTurn[0]
    }

    static setBattlers(): void {
        this._battler = this.getGroupIDs(Battle.getAllBattlers())
    }

    static onTurnStart(): void {
        let turn = new Turn()
        turn.setSubjectID(Battle.subject().id)
        this._currentTurn.push(new Turn())
    }

    static onTurnEnd(): void {
        this._turns.push(this.currentTurn())
        this._currentTurn.pop()
    }

    static setTargets(targets: Array<Objects.Battler>): void {
        let ids = this.getGroupIDs(targets)
        this.currentTurn().setTargetIDs(ids)
    }

    static setSkill(skill: number): void {
        this.currentTurn().setSkill(skill)
    }

    static getGroupIDs(group: Array<Objects.Battler>): Array<number> {
        return group.map(member => member.id)
    }

    static addHit(hit: _hit): void {
        this.currentTurn().addHit(hit)
    }

    // Battle metrics stuff for enemy ai

    static getTurn(id: number): Turn {
        return this._turns[id]
    }

    static getTurnXToY(x: number, y: number): Array<Turn> {   
        return this._turns.slice(x--, y--)
    }

    static getAllTurns(): Array<Turn> {   
        return this._turns;
    }
}
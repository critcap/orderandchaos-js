import { Battle } from './battle'
import { Objects } from './objects'


class Turn {
    subjectID: number = 0
    targetIDs: Array<number> = []
    action: any = {
        skillId: 0,
        hit: []
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
        turn.subjectID = Battle.subject().id
        this._currentTurn.push(new Turn())
    }

    static onTurnEnd(): void {
        this._turns.push(this.currentTurn())
        this._currentTurn.pop()
    }

    static setTargets(targets: Array<Objects.Battler>): void {
        this.currentTurn().targetIDs = this.getGroupIDs(targets);
    }

    static setSkill(skill: number): void {
        this.currentTurn().action = {skillId: skill, hit: []}
    }

    static getGroupIDs(group: Array<Objects.Battler>): Array<number> {
        return group.map(member => member.id)
    }

    static addHit(tar: number, miss: boolean, crit: boolean, res: number): void {
        let hit = {target: tar, missed: miss, critical: crit, result: res}
        this.currentTurn().action.hit.push(hit);
    }
}
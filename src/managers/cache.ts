import { query } from '../utils/query';
import { cache } from '../typings/db';

export class Cache {
    private _marks: string[] = [];
    private _works: string[] = [];
    private messages: string[] = []
    private _cours: {id: string; away: boolean; canceled: boolean; duplicated: boolean;}[] = [];

    constructor() {
        this.start();
    }
    public isMarkCached(id: string) {
        return this._marks.includes(id);
    }
    public addMark(id: string) {
        if (this.isMarkCached(id)) return this;
        this._marks.push(id);

        return this;
    }
    public get marks() {
        return this._marks;
    }

    public isWorkCached(id: string) {
        return this._works.includes(id)
    }
    public addWork(id: string) {
        if (this.isWorkCached(id)) return this;
        this._works.push(id);

        return this;
    }
    public get works() {
        return this._works;
    }

    public isInfoCached(id: string) {
        return this.messages.includes(id);
    }
    public addInfo(id: string) {
        if (!this.isInfoCached(id)) return this;
        this.messages.push(id)

        return this;
    }
    public get infos() {
        return this.messages;
    }
    
    public isCoursCached(id: string) {
        return this._cours.find(x => x.id === id);
    }
    public addCours({ id, isAway, isCancelled, hasDuplicate }: { id: string; isAway: boolean; isCancelled: boolean; hasDuplicate: boolean; }) {
        if (this.isCoursCached(id)) return this;
        this._cours.push({
            id,
            away: isAway,
            canceled: isCancelled,
            duplicated: hasDuplicate
        })

        return this;
    }
    public updateCours({ id, away, cancelled, duplicated }: { id: string; away?: boolean; cancelled?: boolean; duplicated?: boolean; }) {
        if (!this.isCoursCached(id)) return this;
        const cours = this._cours.find(x => x.id);
        const index = this._cours.indexOf(cours);

        const isNull = (x: unknown) => [undefined, null].includes(x);
        this._cours[index] = {
            ...cours,
            away: isNull(away) ? cours.away : away,
            canceled: isNull(cancelled) ? cours.canceled : cancelled,
            duplicated: isNull(duplicated) ? cours.duplicated : duplicated
        };

        return this;
    }
    public get cours() {
        return this._cours;
    }

    private start() {
        this.fillCache();

        setInterval(() => {
            query(`UPDATE cache SET notes='${JSON.stringify(this._marks)}', devoirs='${JSON.stringify(this._works)}', messages='${JSON.stringify(this.messages)}', cours='${JSON.stringify(this._cours)}'`);
        }, 300000)
    }
    private async fillCache() {
        const results = await query<cache>(`SELECT * FROM cache`);
        if (!results) {
            throw new Error("Erreur avec la base de données")
        }

        this._marks = JSON.parse(results[0].notes);
        this._works = JSON.parse(results[0].devoirs);
        this.messages = JSON.parse(results[0].messages);
        this._cours = JSON.parse(results[0].cours)
    }
}
import { If } from "discord.js";

export type DefaultQueryResult = {
    fieldCount: number;
    affectedRows: number;
    insertId: number;
    serverStatus: number;
    warningCount: number;
    message: string;
    protocol41: boolean;
    changedRows: number;
};
export type QueryResult<T> = T extends DefaultQueryResult ? DefaultQueryResult : T[];

export type cache<Raw extends boolean = true> = {
    notes: If<Raw, string, string[]>;
    devoirs: If<Raw, string, string[]>;
    messages: If<Raw, string, string[]>;
    cours: If<Raw, string, { id: string; away: boolean; canceled: boolean; duplicated: boolean; }[]>;
}
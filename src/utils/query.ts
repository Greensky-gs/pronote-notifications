import { createConnection } from "mysql";
import { DefaultQueryResult, QueryResult } from "../typings/db";
import { config } from 'dotenv'

config()

const database = createConnection({
    user: process.env.dbu,
    database: process.env.db,
    password: process.env.dbp,
    host: process.env.host
})
export const query = <R = DefaultQueryResult>(query: string): Promise<QueryResult<R>> => {
    return new Promise((resolve, reject) => {
        database.query(query, (error, request) => {
            if (error) return reject(error);
            return resolve(request);
        })        
    })
}
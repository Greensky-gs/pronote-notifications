declare global {
    namespace NodeJS {
        interface ProcessEnv {
            token: string;
            prnusername: string;
            password: string;
            db: string;
            dbu: string;
            dbp: string;
            dbh: string;
            channelId: string;
        }
    }
}

export {};
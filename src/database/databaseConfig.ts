import { parse } from 'dotenv';
import 'dotenv/config';
import mysql from 'mysql';

/**----------------------------------------------------------------------- */
        const hostname = process.env.HOST ;
        const portdb = process.env.PORT_DB;
        const username = process.env.USER;
        const dbpassword = process.env.PASSWORD;
        
        export const db_api = process.env.DB_API

        let port:any | undefined;

        if(portdb !== undefined){
            port  = parseInt(portdb);
        }

       export const conn =   mysql.createPool({
            connectionLimit : 10,
            host: hostname,
            user: username,
            port: port,
            password: dbpassword,
        })
	
console.log(hostname)
console.log(portdb)
console.log(dbpassword)
console.log(db_api)
console.log(username)

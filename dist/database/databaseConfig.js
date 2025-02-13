"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.conn = exports.db_api = void 0;
require("dotenv/config");
const mysql_1 = __importDefault(require("mysql"));
/**----------------------------------------------------------------------- */
const hostname = process.env.HOST;
const portdb = process.env.PORT_DB;
const username = process.env.USER;
const dbpassword = process.env.PASSWORD;
exports.db_api = process.env.DB_API;
let port;
if (portdb !== undefined) {
    port = parseInt(portdb);
}
exports.conn = mysql_1.default.createPool({
    connectionLimit: 10,
    host: hostname,
    user: username,
    port: port,
    password: dbpassword,
});
console.log(hostname);
console.log(portdb);
console.log(dbpassword);
console.log(exports.db_api);
console.log(username);

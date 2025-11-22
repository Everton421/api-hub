import { registerDados } from "../database/seeds/dados-teste/dadosTeste";

    let empresa = '12264558911'
        let  dbName = `\`${empresa}\``;

  registerDados(dbName)
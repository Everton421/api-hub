import { registerDados } from "../services/dadosTeste/dadosTeste";

    let empresa = '12264558911'
        let  dbName = `\`${empresa}\``;

  registerDados(dbName)
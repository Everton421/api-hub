
export class FormatString {

     /**
      *     Substitui aspas duplas por aspas simples
      * @param str 
      * @returns retorna string formatada com aspas simples
      */
      replaceAspasDuplas(str:string){
        return str.replaceAll(`"`,`'`);
    }
}


    /**
     * 
     * @param ms Valor inteiro Ex: [ 2 segundos ]
     * @returns 
     */
export function delay(ms: number) {   
      return new Promise((resolve) => {
         console.log(`aguardando ${ms} segundos ...`) ;
        setTimeout(resolve, (ms * 1000 )) 
    } );
}

export function delay(ms: number) {
    return new Promise((resolve) => {
        console.log(`Aguardando ${ms} segundos...`)
        setTimeout(resolve, (ms / 1000));
    })
}
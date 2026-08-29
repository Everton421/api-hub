export class GetMlUserCode {
    private client_id: string;
    private redirect_uri: string;

    constructor(client_id: string, redirect_uri: string) {
        this.client_id = client_id;
        this.redirect_uri = redirect_uri;
    }

    getMlUserCode(state: string, codeChallenge: string): string {
        const base_uri = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${this.client_id}&redirect_uri=${this.redirect_uri}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`
        return base_uri
    }
}
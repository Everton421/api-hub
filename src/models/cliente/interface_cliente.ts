export interface Cliente {
  id:any,
  codigo :number, 
  celular:string, 
  nome :string,
  cep :string,
  endereco :string,
  ie :string,
  numero :string,
  cnpj :string,
  cidade :string,
  data_cadastro :string,
  data_recadastro :string | null,
  vendedor:number,
  estado:string,
  bairro:string
  ativo:string
}
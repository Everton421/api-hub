pipeline {
    agent any
    stages {
       stage('Prepare Env') {
            steps {
                // Isso recupera o arquivo do Jenkins e cria um arquivo temporário
                withCredentials([file(credentialsId: 'meu-projeto-env', variable: 'ENV_FILE')]) {
                    // Copia o arquivo temporário para o nome .env real na pasta do projeto
                    sh "cp \$ENV_FILE .env"
                }
            }
        }
        stage('Deploy with Compose') {
            steps {
                sh 'docker compose up -d'
            }
        }
    }
}

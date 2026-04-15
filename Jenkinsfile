pipeline {
    agent any
    stages {
       stage('Prepare Env') {
            steps {
                withCredentials([file(credentialsId: 'api-mobile.env', variable: 'ENV_FILE')]) {
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

import * as fs from 'fs';
import * as path from 'path';

/**
 * Script para compilar a documentação Swagger modular em um único arquivo swagger.json
 * 
 * Uso:
 *   npm run build:swagger
 *   ou
 *   tsx src/swagger/build-swagger.ts
 */

interface SwaggerConfig {
  openapi: string;
  info: any;
  servers: any[];
  tags?: any[];
  security?: any[];
  paths: any;
  components: any;
}

function loadJsonFile(filePath: string): any {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Erro ao carregar arquivo ${filePath}:`, error);
    return null;
  }
}

function mergeSchemas(schemasDir: string): any {
  const schemas: any = {};
  const files = fs.readdirSync(schemasDir);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(schemasDir, file);
      const schemaContent = loadJsonFile(filePath);
      if (schemaContent) {
        Object.assign(schemas, schemaContent);
      }
    }
  }
  
  return schemas;
}

function mergePaths(pathsDir: string): any {
  const paths: any = {};
  const files = fs.readdirSync(pathsDir);
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      const filePath = path.join(pathsDir, file);
      const pathContent = loadJsonFile(filePath);
      if (pathContent) {
        Object.assign(paths, pathContent);
      }
    }
  }
  
  return paths;
}

function buildSwagger(): void {
  const swaggerDir = path.join(__dirname);
  const basePath = path.join(swaggerDir, 'base.json');
  const componentsDir = path.join(swaggerDir, 'components');
  const schemasDir = path.join(componentsDir, 'schemas');
  const pathsDir = path.join(swaggerDir, 'paths');
  const outputPath = path.join(__dirname, '..', 'swagger.json');

  console.log('🔨 Compilando documentação Swagger...');

  // Carregar arquivo base
  const base = loadJsonFile(basePath);
  if (!base) {
    console.error('❌ Erro: Não foi possível carregar base.json');
    process.exit(1);
  }

  // Carregar componentes
  const security = loadJsonFile(path.join(componentsDir, 'security.json'));
  const componentsBase = loadJsonFile(path.join(componentsDir, 'schemas.json'));
  
  // Carregar schemas de domínios
  const domainSchemas = mergeSchemas(schemasDir);
  
  // Mesclar schemas
  const allSchemas = {
    ...(componentsBase?.schemas || {}),
    ...domainSchemas
  };

  // Construir objeto components
  const components: any = {
    ...security,
    ...componentsBase
  };
  
  if (Object.keys(allSchemas).length > 0) {
    components.schemas = allSchemas;
  }

  // Carregar paths
  const paths = mergePaths(pathsDir);

  // Construir documento Swagger final
  const swaggerDoc: SwaggerConfig = {
    ...base,
    paths,
    components
  };

  // Salvar arquivo
  fs.writeFileSync(outputPath, JSON.stringify(swaggerDoc, null, 2), 'utf-8');
  
  const stats = fs.statSync(outputPath);
  const fileSizeInKB = (stats.size / 1024).toFixed(2);
  
  console.log(`✅ Documentação Swagger compilada com sucesso!`);
  console.log(`📄 Arquivo: ${outputPath}`);
  console.log(`📊 Tamanho: ${fileSizeInKB} KB`);
  console.log(`🔗 Paths: ${Object.keys(paths).length}`);
  console.log(`📦 Schemas: ${Object.keys(allSchemas).length}`);
}

// Executar se chamado diretamente
if (require.main === module) {
  buildSwagger();
}

export { buildSwagger };


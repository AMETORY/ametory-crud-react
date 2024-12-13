const fs = require('fs-extra');
const ejs = require('ejs');
const path = require('path');
const xlsx = require('xlsx');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const mapToTsType = (dbType) => {
    if (!dbType) {
        return "any";
    }
    switch (dbType.toLowerCase()) {
        case "string":
        case "varchar":
        case "text":
            return "string";
        case "int":
        case "float64":
        case "float32":
        case "integer":
        case "float":
        case "double":
        case "decimal":
            return "number";
        case "boolean":
        case "bool":
            return "boolean";
        case "date":
        case "datetime":
        case "timestamp":
            return "Date";
        case "uuid":
            return "string";
        default:
            return "any"; // Fallback for unknown types
    }
};

const toPascalCase = (str) => str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map((x) => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase())
    .join("")
// CLI Argument Parsing
const argv = yargs(hideBin(process.argv))
    .option('file', {
        alias: 'f',
        describe: 'Path to the definitions.xlsx file',
        type: 'string',
        demandOption: true,
    })
    .help()
    .argv;

const toSnakeCase = (str) => str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(s => s.toLowerCase()).join('_');
// Parse Excel File
function parseExcel(filePath) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    const entities = {};
    data.forEach((row) => {
        const entity = row['Model Name'];
        if (!entities[entity]) {
            entities[entity] = [];
        }
        entities[entity].push({
            name: row['Field Name'],
            type: row["Field Type"],
            formInput: mapToTsType(row["Field Type"]) == "number" ? "Number(e.target.value)" : "e.target.value",
            required: row.Required === 'Yes',
            defaultValue: row['Default Value'] || null,
        });
    });

    return entities;
}

// CRUD Generator
const generateCrud = async (entity, fields) => {
    const templatesDir = './templates';
    const outputDir = './src';

    const entityCamelCase = entity.charAt(0).toLowerCase() + entity.slice(1);
    const entitySnakeCase = entity.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(s => s.toLowerCase()).join('_');
    // const toPascalCase = (str) => str.replace(/\w+/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase());

    const componentsDir = path.join(outputDir, 'components', entity);
    await fs.ensureDir(componentsDir);

    const templates = ['List.ejs', 'Form.ejs', 'Api.ejs'];
    console.log("toPascalCase", toPascalCase(entity))
    for (const template of templates) {
        const templatePath = path.join(templatesDir, template);
        const outputFileName = template.replace('List', `${toPascalCase(entity)}List`)
            .replace('Form', `${toPascalCase(entity)}Form`)
            .replace('Api', `${entity.toLowerCase()}Api`);

        const newDir = path.join(componentsDir, template.replaceAll(".ejs", ""));
        await fs.ensureDir(newDir);
        console.log("newDir", newDir)
        const outputPath = path.join(
            newDir,
            outputFileName.replace('.ejs', template.includes('Api') ? '.ts' : '.tsx')
        );



        const content = await ejs.renderFile(templatePath, { entity, entityCamelCase, fields, entitySnakeCase, toPascalCase, toSnakeCase });
        await fs.writeFile((outputPath), content, 'utf-8');
    }

    console.log(`CRUD for ${entity} generated successfully.`);
};

// Main Process
(async () => {
    try {
        const filePath = argv.file;

        if (!fs.existsSync(filePath)) {
            console.error(`Error: File "${filePath}" not found.`);
            process.exit(1);
        }

        const entities = parseExcel(filePath);

        for (const entity in entities) {
            const fields = entities[entity];
            await generateCrud(entity, fields);
            await generateModel(entity, fields, "./src");
            await generatePage(entity, fields, "./src");
            await updateAppFile(entity, "./src");

        }
    } catch (error) {
        console.error('Error generating CRUD:', error.message);
        process.exit(1);
    }
})();


const generatePage = async (featureName, fields, outputDir) => {
    const pageDir = path.join(outputDir, "pages");
    const pageFile = path.join(pageDir, `${toPascalCase(featureName)}Page.tsx`);

    // Ensure models directory exists
    await fs.ensureDir(pageDir);

    // Create TypeScript interface content
    const interfaceContent = `import type { FC } from 'react';
import Layout from '../components/Layout';

interface ${toPascalCase(featureName)}PageProps {}

const ${toPascalCase(featureName)}Page: FC<${toPascalCase(featureName)}PageProps> = ({}) => {
        return (
            <Layout>
                <h1>${toPascalCase(featureName)} Page</h1>
            </Layout>
        );
}
export default ${toPascalCase(featureName)}Page;`;

    // Write to file
    await fs.writeFile(pageFile, interfaceContent, "utf-8");
    console.log(`✅ Page created: ${pageFile}`);
};
const generateModel = async (featureName, fields, outputDir) => {
    const modelDir = path.join(outputDir, "models");
    const modelFile = path.join(modelDir, `${toPascalCase(featureName)}.ts`);

    // Ensure models directory exists
    await fs.ensureDir(modelDir);

    // Create TypeScript interface content
    const interfaceContent = `// Auto-generated Model for ${toPascalCase(featureName)}
  export interface ${capitalize(toPascalCase(featureName))} {
  id: string
  ${fields.map((field) => `  ${field.name.toLowerCase().replace(/_/g, '')}: ${mapToTsType(field.type)};`).join("\n")}
}
    `;

    // Write to file
    await fs.writeFile(modelFile, interfaceContent, "utf-8");
    console.log(`✅ Model created: ${modelFile}`);
};

// Helper function to capitalize feature name

// Helper function to map database types to TypeScript types


const updateAppFile = async (featureName, outputDir) => {

    const appFilePath = path.join(outputDir, "AppRoutes.tsx");
    const routePath = `/${featureName.toLowerCase()}`;
    const componentImport = `import ${toPascalCase(featureName)}Page from './pages/${toPascalCase(featureName)}Page';`;
    // console.log(appFilePath)
    // Check if App.tsx exists
    if (!fs.existsSync(appFilePath)) {
        console.error("Error: App.tsx not found. Please ensure it exists in src/.");
        return;
    }

    // Read existing content of App.tsx
    const appFileContent = await fs.readFile(appFilePath, "utf-8");

    // Check if the route already exists
    if (appFileContent.includes(componentImport)) {
        console.log(`Route for ${featureName} already exists in App.tsx`);
        return;
    }

    // Add import statement for the new page
    const updatedImports = appFileContent.replace(
        /(import.*from.*react.*;\n)/,
        `$1${componentImport}\n`
    );

    // Add new route to the router
    const updatedRoutes = updatedImports.replace(
        /(<Routes>[\s\S]*?)(<\/Routes>)/,
        `$1  <Route path="${toSnakeCase(routePath)}" element={<${toPascalCase(featureName)}Page />} />\n$2`
    );

    // Write updated content back to App.tsx
    await fs.writeFile(appFilePath, updatedRoutes, "utf-8");
    console.log(`✅ App.tsx updated with route: ${toSnakeCase(routePath)}`);
};

// Helper function to capitalize feature name
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);




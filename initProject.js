const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const ejs = require('ejs');
// Proses sinkronisasi perintah CLI
const runCommand = (command) => {
  try {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(`Failed to run command: ${command}`, error.message);
    process.exit(1);
  }
};

// Konfigurasi TailwindCSS
const setupTailwind = async (projectDir) => {
  console.log("Configuring TailwindCSS...");

  // Tambahkan konfigurasi dasar untuk TailwindCSS
  const tailwindConfig = `
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
  `;
  const indexCSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;


@tailwind base;
@tailwind components;
@tailwind utilities;


.rs-sidebar {
    @apply bg-gradient-to-br from-red-500 to-purple-500
}
.rs-sidebar .rs-sidenav-item:hover, .rs-sidebar .rs-dropdown-item:hover {
    @apply !text-gray-800
}
.rs-sidebar .rs-sidenav-item, .rs-sidebar .rs-dropdown-item {
    @apply !text-white
}

.page-brand, .page-brand .rs-text {
    @apply p-4 text-white
}

.rs-stack-item button {
    @apply !text-white
}
.rs-stack-item button:hover {
    @apply !text-gray-800
}
    
  `;

  await fs.writeFile(path.join(projectDir, "tailwind.config.js"), tailwindConfig, "utf-8");
  await fs.writeFile(path.join(projectDir, "src/index.css"), indexCSS, "utf-8");

  console.log("TailwindCSS configured successfully.");
};

// Main process
(async () => {
  const projectName = process.argv[2];

  if (!projectName) {
    console.error("Please provide a project name, e.g., node initProject.js my-project");
    process.exit(1);
  }

  console.log(`Initializing React project: ${projectName}`);

  // Step 1: Create React App with TypeScript

  runCommand(`yarn create react-app ${projectName}  --template typescript`);

  // Change directory to project
  const projectDir = path.resolve(process.cwd(), projectName);
  process.chdir(projectDir);

  // Step 2: Install additional dependencies
  console.log("Installing additional dependencies...");
  runCommand("yarn add xlsx fs-extra ejs yargs axios react-router-dom rsuite typescript react-icons crypto-js");

  // Step 3: Install TailwindCSS
  console.log("Installing TailwindCSS...");
  runCommand("yarn add -D tailwindcss postcss autoprefixer");
  runCommand("yarn tailwindcss init");
  runCommand("yarn add react@18.0.0 ");
  runCommand("yarn add react-dom@18.0.0");

  // Setup TailwindCSS
  await setupTailwind(projectDir);

  // Step 4: Update project structure
  console.log("Setting up project structure...");
  const templatesDir = path.join(projectDir, "templates");
  await fs.ensureDir(templatesDir);
  console.log("Templates directory created successfully.");

  // await generateAuth(projectDir);
  await copyAdditionalFiles(projectDir);

  await createAppFile(projectDir);
  await createEnvFile(projectDir);
  await generateHome(projectDir);


  console.log("\n✅ Project initialization completed successfully!");
  console.log("Next steps:");
  console.log(`  cd ${projectName}`);
  console.log("  node crudGenerator.js --file ./data.xlsx");
})();



const copyAdditionalFiles = async (projectDir) => {
  const sourceUtilsDir = path.join(__dirname, "utils");
  const sourceTemplatesDir = path.join(__dirname, "templates");
  const sourceGeneratorFile = path.join(__dirname, "crudGenerator.js");
  const sourceExcelFile = path.join(__dirname, "data.xlsx");

  console.log("Copying additional files...");

  try {
    await fs.ensureDir(path.join(projectDir, "templates"))
    await fs.ensureDir(path.join(projectDir, "src", "components", "Login", "Api"));
    await fs.ensureDir(path.join(projectDir, "src", "pages"));
    await fs.copy(sourceUtilsDir, path.join(projectDir, "src/utils"));
    await fs.copy(path.join(sourceTemplatesDir, "Api.ejs"), path.join(projectDir, "templates/Api.ejs"));
    await fs.copy(path.join(sourceTemplatesDir, "Form.ejs"), path.join(projectDir, "templates/Form.ejs"));
    await fs.copy(path.join(sourceTemplatesDir, "List.ejs"), path.join(projectDir, "templates/List.ejs"));
    await fs.copy(path.join(sourceTemplatesDir, "Layout.ejs"), path.join(projectDir, "src/components/Layout.tsx"));
    await fs.copy(path.join(sourceTemplatesDir, "auth", "loginApi.ejs"), path.join(projectDir, "src/components/Login/Api/loginApi.ts"));
    await fs.copy(path.join(sourceTemplatesDir, "auth", "LoginPage.ejs"), path.join(projectDir, "src/pages/LoginPage.tsx"));
    await fs.copy(path.join(sourceTemplatesDir, "auth", "RegistrationPage.ejs"), path.join(projectDir, "src/pages/RegistrationPage.tsx"));
    await fs.copy(path.join(sourceTemplatesDir, "auth", "VerificationPage.ejs"), path.join(projectDir, "src/pages/VerificationPage.tsx"));
    await fs.copy(sourceGeneratorFile, path.join(projectDir, "crudGenerator.js"));
    await fs.copy(sourceExcelFile, path.join(projectDir, "data.xlsx"));
    console.log("\n✅ Additional files copied successfully.");
  } catch (error) {
    console.error("Failed to copy additional files:", error.message);
    process.exit(1);
  }
};


const createAppFile = async (outputDir) => {
  const appFilePath = path.join(outputDir, "src/App.tsx");


  // Struktur App.tsx
  const appContent = `import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import 'rsuite/dist/rsuite-no-reset.min.css';
import AppRoutes from './AppRoutes';
import LoginPage from "./pages/LoginPage";
import RegistrationPage from './pages/RegistrationPage';
import VerificationPage from './pages/VerificationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registration" element={<RegistrationPage />} />
        <Route path="/verification/:id" element={<VerificationPage />} />
        {localStorage.getItem("token") && <Route path="/*" element={<AppRoutes />} />} 
        <Route path='*' element={<Navigate to='/login' replace />} />
      </Routes>
    </Router>
  );
}

export default App;`;

  // Membuat file App.tsx
  await fs.promises.mkdir(path.join(outputDir, "src"), { recursive: true });
  await fs.promises.writeFile(appFilePath, appContent, "utf-8");
  console.log("✅ File App.tsx telah dibuat di src/.");


  const appRouteFilePath = path.join(outputDir, "src/AppRoutes.tsx");
  const appRouteContent = `import type { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';


interface AppRoutesProps {}

const AppRoutes: FC<AppRoutesProps> = ({}) => {
        return (<Routes>
            <Route path="/" element={<HomePage />} />
        </Routes>);
}
export default AppRoutes;`

  await fs.promises.writeFile(appRouteFilePath, appRouteContent, "utf-8");
  console.log("✅ File AppRoutes.tsx telah dibuat di src/.");
};
const createEnvFile = async (outputDir) => {
  const appFilePath = path.join(outputDir, ".env");


  // Struktur App.tsx
  const appContent = `REACT_APP_API_URL=http://localhost:8080
REACT_APP_EDITOR_KEY=
REACT_APP_GOOGLE_API_CLIENT_API=
REACT_APP_SECRET_KEY="secretKey"`;

  // Membuat file App.tsx
  await fs.promises.mkdir(path.join(outputDir, "src"), { recursive: true });
  await fs.promises.writeFile(appFilePath, appContent, "utf-8");
  console.log("✅ File .env telah dibuat di src/.");
};



const generateHome = async (outputDir) => {
  let featureName = "Home"
  const homeDir = path.join(outputDir, "src", "pages");
  const homeFile = path.join(homeDir, `${featureName}Page.tsx`);

  // Ensure models directory exists
  await fs.ensureDir(homeDir);

  // Create TypeScript interface content
  const interfaceContent = `import type { FC } from 'react';
import Layout from '../components/Layout';

interface ${featureName}PageProps {}

const ${featureName}Page: FC<${featureName}PageProps> = ({}) => {
      return (
          <Layout>
              <h1>${featureName} Page</h1>
          </Layout>
      );
}
export default ${featureName}Page;`;

  // Write to file
  await fs.writeFile(homeFile, interfaceContent, "utf-8");
  console.log(`✅ Page created: ${homeFile}`);
};

// const generateAuth = async (outputDir) => {
//   const templatesDir = '../templates';

//   const loginPage = path.join(templatesDir, "auth", "LoginPage.ejs");
//   const regPage = path.join(templatesDir, "auth", "RegistrationPage.ejs");
//   const loginApi = path.join(templatesDir, "auth", "loginApi.ejs");

//   const srcDir = path.join(outputDir, "src");
//   await fs.ensureDir(srcDir);

//   const loginPageOutput = path.join(srcDir, "pages", "LoginPage.tsx");
//   await fs.ensureDir(path.dirname(loginPageOutput));

//   const regPageOutput = path.join(srcDir, "pages", "RegistrationPage.tsx");
//   await fs.ensureDir(path.dirname(regPageOutput));

//   const loginApiOutput = path.join(srcDir, "components", "Login", "Api", "loginApi.ts");
//   await fs.ensureDir(path.dirname(loginApiOutput));

//   const contentLoginPage = await ejs.renderFile(loginPage);
//   await fs.writeFile(loginPageOutput, contentLoginPage, 'utf-8');

//   const contentRegPage = await ejs.renderFile(regPage);
//   await fs.writeFile(regPageOutput, contentRegPage, 'utf-8');

//   const contentLoginApi = await ejs.renderFile(loginApi);
//   await fs.writeFile(loginApiOutput, contentLoginApi, 'utf-8');
// }
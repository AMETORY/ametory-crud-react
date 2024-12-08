# React CRUD Generator

A CLI tool for generating CRUD functionality in React (using TypeScript and TailwindCSS) based on a provided Excel file.

---

## Features

- **React + TypeScript**: Fully supports React projects with TypeScript.
- **TailwindCSS**: Pre-configured TailwindCSS for styling.
- **Excel-Based Configuration**: Define features, fields, and database column types in an Excel file.
- **Dynamic Routes**: Automatically generate components, APIs, and routes.
- **EJS Templates**: Uses customizable templates to generate boilerplate code.

---

## Prerequisites

Before you start, ensure the following tools are installed:

- [Node.js](https://nodejs.org) (v14 or newer)
- [npm](https://www.npmjs.com/) (or `yarn`)

---

## Installation

### 1. Clone the Repository

Clone this repository to your local machine:

```bash
git clone https://github.com/your-repo/react-crud-generator.git
cd react-crud-generator
```

### 2. Install Dependencies
Run the following command to install the required dependencies:

```bash
npm install
```

## Usage
### 1. Initialize a New React Project
Use the built-in project initializer to set up a new React project with TypeScript and TailwindCSS:

```bash
node initProject.js <project-name>
```
Replace <project-name> with the desired project folder name. This will:

- Create a new React project using ```create-react-app```.
- Configure TailwindCSS for styling.
- Install all required dependencies.


### 2. Prepare the Input Excel File
Prepare an Excel file (e.g., definitions.xlsx) that defines the features, fields, and database columns. Here is an example structure:

| Model Name | Field Name | Field Type | DB Type |
|------------|------------|------------|---------|
| User       | Name       | string     | varchar(255) |
| User       | Age        | int        | int     |
| Product    | Name       | string     | varchar(255) |
| Product    | Price      | float      | decimal(10,2) |

### 3. Run the CRUD Generator
Generate CRUD functionality for the features defined in the Excel file:

```bash
node crudGenerator.js --file ./definitions.xlsx
```
This will create the following directory structure inside your React project:

```css
src/
├── components/
│   ├── User/
│   │   ├── UserList.tsx
│   │   ├── UserForm.tsx
│   │   ├── userApi.ts
│   ├── Product/
│       ├── ProductList.tsx
│       ├── ProductForm.tsx
│       ├── productApi.ts
```

### 4. Update src/App.tsx
Integrate the generated routes into your application. Edit the src/App.tsx file as follows:

```tsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserList from './components/User/UserList';
import UserForm from './components/User/UserForm';
import ProductList from './components/Product/ProductList';
import ProductForm from './components/Product/ProductForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/users" element={<UserList />} />
        <Route path="/users/new" element={<UserForm />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/new" element={<ProductForm />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### 5. Start the Development Server
Run the following command to start the React development server:

```bash
npm start
```
Visit ```http://localhost:3000``` in your browser to see the generated features.

## Advanced Configuration
Custom Templates
You can customize the templates for components, APIs, and routes by modifying the files inside the templates/ directory. These templates are written in EJS format.

Adding Additional Features
Simply update the Excel file (definitions.xlsx) with new features and fields, then re-run the generator:

```bash
node crudGenerator.js --file ./definitions.xlsx
```
The new features will be generated without affecting existing files.

License
This project is licensed under the MIT License.

Copyright (c) 2022 Amet Suramet

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

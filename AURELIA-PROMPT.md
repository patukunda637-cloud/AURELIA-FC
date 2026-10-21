\# AURELIA FC — COMPLETE FULL-STACK PROJECT



Act as a senior full-stack developer. Build my complete AURELIA FC project using my actual Figma design as the source of truth.



\## Figma references



Design:

https://www.figma.com/design/aqLl1r8aqhfN0vJ1suFWv1/AURELIA-FC?node-id=201-2\&t=h4WNVIyNxszEiZvG-1



Prototype:

https://www.figma.com/proto/aqLl1r8aqhfN0vJ1suFWv1/AURELIA-FC?node-id=201-2\&t=h4WNVIyNxszEiZvG-1



\## Technology stack



\- Frontend: React, TypeScript, and Vite unless the existing requirements indicate otherwise.

\- Backend: ASP.NET Core Web API using C#.

\- Database: MySQL 8.

\- API communication: JSON over HTTP.



\## 1. Inspect before coding



First inspect the available Figma design, assets, prototype, development environment, and installed tools.



Identify every accessible screen, layout, color, font, image, form, button, table, navigation flow, and interaction.



The Figma design is the source of truth. Do not invent a generic football website or substitute a different UI.



If Figma access fails, explain that clearly and ask for screenshots or exported frames. Do not claim to have inspected screens you cannot access.



Create a screen inventory and feature plan before implementing the UI.



\## 2. Frontend



Recreate the actual Figma screens as closely as possible.



Match:

\- Layout, spacing, typography, colors, borders, and shadows.

\- Logos, images, icons, and other available assets.

\- Navigation, cards, forms, tables, modals, and responsive layouts.

\- All visible interaction states and navigation flows.



Use reusable components and clean styling. Implement appropriate loading indicators, validation errors, empty states, and success messages.



Every visible interactive control must work as intended. Do not leave decorative buttons that do nothing.



Use actual backend data instead of hardcoded demo records in the finished application.



\## 3. ASP.NET Core Web API



Build a complete C# backend using a supported stable .NET version available in the environment.



Implement the endpoints, models, DTOs, validation, business logic, and data access required by the real project features.



Use asynchronous operations, dependency injection, proper HTTP methods and status codes, structured JSON responses, Swagger/OpenAPI, and appropriate error handling.



Configure CORS for the frontend development server.



\## 4. MySQL 8 database



Design the database based on the actual screens and confirmed project requirements.



Create the necessary:

\- Tables and columns.

\- Primary keys and foreign keys.

\- Relationships and indexes.

\- Constraints and validation rules.

\- Migrations or a complete SQL initialization script.

\- Optional seed data clearly identified as test data.



Do not invent unnecessary tables or features.



\## 5. Real database connectivity



Connect the ASP.NET Core API to the actual MySQL 8 database using a compatible maintained .NET provider.



Store connection settings in configuration or environment variables. Never hardcode real passwords or commit secrets.



Provide a safe example configuration, database initialization instructions, and exact commands to run migrations or execute the SQL script.



Test the connection if MySQL is available. Do not claim it works unless verified.



\## 6. Fully working features



Implement all features that are actually required by the design.



Where applicable, support creating, reading, updating, deleting, viewing, searching, filtering, and validating records.



Connect each relevant frontend form and action to its real API endpoint. Ensure successful database changes appear in the UI.



Do not fake database operations using browser alerts, local arrays, or simulated responses.



Implement authentication and authorization if required by the actual project. Hash passwords securely if accounts are implemented.



\## 7. Project structure



Keep the frontend, backend, and database setup organized in the workspace. Include appropriate files for:



\- Frontend pages, components, styles, and API client.

\- ASP.NET Core API, business logic, models, and data access.

\- Database schema, migrations, and seed data where appropriate.

\- Environment examples and configuration.

\- README and setup documentation.

\- API endpoint documentation.

\- Database schema documentation.



Adapt the structure to the actual project size rather than creating unnecessary abstractions.



\## 8. Build and test



Run the available dependency installation, build, and test commands.



Test the API, database connection, validation, frontend integration, and applicable CRUD operations.



Compare the implemented UI against the Figma reference when browser or screenshot tools are available.



Fix errors and visual mismatches you can verify. Report anything that cannot be tested and explain why.



Never claim an unverified build, connection, test, or visual match succeeded.



\## 9. Work in phases



Phase 1: Inspect the Figma reference and development environment.



Phase 2: Inventory screens, interactions, features, database entities, and API endpoints.



Phase 3: Identify critical missing requirements.



Phase 4: Implement the frontend, API, and database.



Phase 5: Connect the frontend to the API and MySQL.



Phase 6: Build, test, compare the UI, and fix issues.



Phase 7: Deliver the complete source code and instructions.



Do not stop at a plan or sample files. Continue implementation as far as the available tools and permissions allow. Inspect existing files before overwriting them.



\## 10. Final deliverables



Provide:

1\. Complete source code.

2\. Database SQL script or migrations.

3\. Frontend and backend setup instructions.

4\. Safe example environment configuration.

5\. Exact commands to initialize and run everything.

6\. List of API endpoints.

7\. Database schema documentation.

8\. Build and test results.

9\. Any unresolved issues or remaining Figma differences.



\## Success criteria



The frontend matches the actual Figma design as closely as possible; required interactions work; the ASP


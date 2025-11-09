/**
 * CLEAN ARCHITECTURE TESTS
 * Validates that the code follows Clean Architecture principles
 */

const fs = require('fs');
const path = require('path');

describe('Clean Architecture Rules - Users Microservice', () => {

  describe('Layer Dependency Rules', () => {
    it('Domain layer should not depend on any other layer', () => {
      const domainFiles = getFilesInDirectory(path.join(__dirname, '../../src/domain'));

      domainFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');

        // Domain should not import from application, infrastructure, or presentation
        expect(content).not.toMatch(/require\(['"].*\/application\//);
        expect(content).not.toMatch(/require\(['"].*\/infrastructure\//);
        expect(content).not.toMatch(/require\(['"].*\/presentation\//);

        // Domain should not depend on external frameworks
        expect(content).not.toMatch(/require\(['"]mongoose['"]\)/);
        expect(content).not.toMatch(/require\(['"]express['"]\)/);
        expect(content).not.toMatch(/require\(['"]bcryptjs['"]\)/);
        expect(content).not.toMatch(/require\(['"]jsonwebtoken['"]\)/);
      });
    });

    it('Application layer should only depend on Domain layer', () => {
      const appFiles = getFilesInDirectory(path.join(__dirname, '../../src/application'));

      appFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');

        // Application can import from domain
        // But NOT from infrastructure or presentation
        expect(content).not.toMatch(/require\(['"].*\/infrastructure\//);
        expect(content).not.toMatch(/require\(['"].*\/presentation\//);

        // Application should not depend directly on frameworks
        expect(content).not.toMatch(/require\(['"]mongoose['"]\)/);
        expect(content).not.toMatch(/require\(['"]express['"]\)/);
      });
    });

    it('Infrastructure layer should depend on Domain and Application (via interfaces)', () => {
      const infraFiles = getFilesInDirectory(path.join(__dirname, '../../src/infrastructure'));

      infraFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');

        // Infrastructure should NOT depend on Presentation
        expect(content).not.toMatch(/require\(['"].*\/presentation\//);
      });
    });

    it('Presentation layer can depend on Application and Infrastructure (DI only)', () => {
      // Controllers should not access database directly
      const controllersPath = path.join(__dirname, '../../src/presentation/controllers');

      if (fs.existsSync(controllersPath)) {
        const controllerFiles = getFilesInDirectory(controllersPath);

        controllerFiles.forEach(file => {
          const content = fs.readFileSync(file, 'utf-8');

          // Controllers should not import Mongoose models directly
          expect(content).not.toMatch(/require\(['"].*\/models\/User['"]\)/);
          expect(content).not.toMatch(/require\(['"].*\/models\/Friendship['"]\)/);
        });
      }
    });
  });

  describe('Naming Conventions', () => {
    it('Repository interfaces should start with I', () => {
      const repoPath = path.join(__dirname, '../../src/domain/repositories');

      if (fs.existsSync(repoPath)) {
        const files = fs.readdirSync(repoPath);
        files.forEach(file => {
          expect(file).toMatch(/^I[A-Z]/); // Should start with I (IUserRepository)
        });
      }
    });

    it('Use cases should end with UseCase', () => {
      const useCasesPath = path.join(__dirname, '../../src/application/use-cases');

      if (fs.existsSync(useCasesPath)) {
        const files = getAllFiles(useCasesPath);
        files.forEach(file => {
          if (file.endsWith('.js')) {
            expect(path.basename(file)).toMatch(/UseCase\.js$/);
          }
        });
      }
    });

    it('Service interfaces should start with I and end with Service', () => {
      const servicesPath = path.join(__dirname, '../../src/application/services');

      if (fs.existsSync(servicesPath)) {
        const files = fs.readdirSync(servicesPath);
        files.forEach(file => {
          if (file.endsWith('.js')) {
            expect(file).toMatch(/^I.*Service\.js$/);
          }
        });
      }
    });
  });

  describe('Dependency Inversion Principle', () => {
    it('Use cases should receive dependencies via constructor (DI)', () => {
      const useCasesPath = path.join(__dirname, '../../src/application/use-cases');

      if (fs.existsSync(useCasesPath)) {
        const files = getAllFiles(useCasesPath);

        files.forEach(file => {
          const content = fs.readFileSync(file, 'utf-8');

          // Use cases should have constructor with dependencies
          if (content.includes('class ')) {
            expect(content).toMatch(/constructor\s*\([^)]+\)/);
          }

          // Use cases should not instantiate repositories directly
          expect(content).not.toMatch(/new\s+MongoUserRepository/);
          expect(content).not.toMatch(/new\s+BcryptPasswordService/);
        });
      }
    });

    it('Repositories should implement interfaces', () => {
      const repoImplPath = path.join(__dirname, '../../src/infrastructure/database/mongodb/repositories');

      if (fs.existsSync(repoImplPath)) {
        const files = fs.readdirSync(repoImplPath);

        files.forEach(file => {
          const content = fs.readFileSync(path.join(repoImplPath, file), 'utf-8');

          // Should extend the interface
          expect(content).toMatch(/extends\s+I\w+Repository/);
        });
      }
    });
  });

  describe('Entity Purity', () => {
    it('Entities should not have framework dependencies', () => {
      const entitiesPath = path.join(__dirname, '../../src/domain/entities');

      if (fs.existsSync(entitiesPath)) {
        const files = fs.readdirSync(entitiesPath);

        files.forEach(file => {
          const content = fs.readFileSync(path.join(entitiesPath, file), 'utf-8');

          // Entities should be pure JavaScript classes
          expect(content).not.toMatch(/require\(['"]mongoose['"]\)/);
          expect(content).not.toMatch(/require\(['"]express['"]\)/);
          expect(content).not.toMatch(/mongoose\.Schema/);
        });
      }
    });
  });
});

// Helper functions
function getFilesInDirectory(dir) {
  if (!fs.existsSync(dir)) return [];
  return getAllFiles(dir);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith('.js')) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

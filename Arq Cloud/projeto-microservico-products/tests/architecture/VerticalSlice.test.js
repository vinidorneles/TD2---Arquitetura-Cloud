/**
 * VERTICAL SLICE ARCHITECTURE TESTS
 * Validates that the code follows Vertical Slice principles
 */

const fs = require('fs');
const path = require('path');

describe('Vertical Slice Architecture Rules - Events Microservice', () => {

  describe('Feature Organization', () => {
    it('Each feature should be in its own directory', () => {
      const featuresPath = path.join(__dirname, '../../src/features');

      if (fs.existsSync(featuresPath)) {
        const features = fs.readdirSync(featuresPath).filter(f => {
          const stat = fs.statSync(path.join(featuresPath, f));
          return stat.isDirectory();
        });

        expect(features.length).toBeGreaterThan(0);

        // Each feature should have its own directory
        features.forEach(feature => {
          const featurePath = path.join(featuresPath, feature);
          const subFeatures = fs.readdirSync(featurePath);

          // Should have at least one sub-feature
          expect(subFeatures.length).toBeGreaterThan(0);
        });
      }
    });

    it('Each slice should have handler, endpoint, and index files', () => {
      const featuresPath = path.join(__dirname, '../../src/features/events');

      if (fs.existsSync(featuresPath)) {
        const slices = fs.readdirSync(featuresPath).filter(f => {
          const stat = fs.statSync(path.join(featuresPath, f));
          return stat.isDirectory();
        });

        slices.forEach(slice => {
          const slicePath = path.join(featuresPath, slice);
          const files = fs.readdirSync(slicePath);

          // Should have handler
          const hasHandler = files.some(f => f.includes('.handler.js'));
          expect(hasHandler).toBe(true);

          // Should have endpoint
          const hasEndpoint = files.some(f => f.includes('.endpoint.js'));
          expect(hasEndpoint).toBe(true);

          // Should have index
          const hasIndex = files.includes('index.js');
          expect(hasIndex).toBe(true);
        });
      }
    });
  });

  describe('Feature Independence', () => {
    it('Features should not import from other features', () => {
      const featuresPath = path.join(__dirname, '../../src/features/events');

      if (fs.existsSync(featuresPath)) {
        const slices = fs.readdirSync(featuresPath).filter(f => {
          const stat = fs.statSync(path.join(featuresPath, f));
          return stat.isDirectory();
        });

        slices.forEach(slice => {
          const slicePath = path.join(featuresPath, slice);
          const files = getAllFiles(slicePath);

          files.forEach(file => {
            const content = fs.readFileSync(file, 'utf-8');

            // Should not import from sibling features
            slices.forEach(otherSlice => {
              if (slice !== otherSlice) {
                const importPattern = new RegExp(`require\\(['"].*/${otherSlice}/`);
                expect(content).not.toMatch(importPattern);
              }
            });
          });
        });
      }
    });
  });

  describe('Handler Rules', () => {
    it('Handlers should be classes with handle method', () => {
      const featuresPath = path.join(__dirname, '../../src/features');

      if (fs.existsSync(featuresPath)) {
        const handlers = getAllFiles(featuresPath).filter(f => f.includes('.handler.js'));

        handlers.forEach(handler => {
          const content = fs.readFileSync(handler, 'utf-8');

          // Should be a class
          expect(content).toMatch(/class\s+\w+Handler/);

          // Should have handle method
          expect(content).toMatch(/async\s+handle\s*\(/);

          // Should export the class
          expect(content).toMatch(/module\.exports\s*=\s*\w+Handler/);
        });
      }
    });

    it('Handlers should contain business logic and data access', () => {
      const featuresPath = path.join(__dirname, '../../src/features');

      if (fs.existsSync(featuresPath)) {
        const handlers = getAllFiles(featuresPath).filter(f => f.includes('.handler.js'));

        expect(handlers.length).toBeGreaterThan(0);

        handlers.forEach(handler => {
          const content = fs.readFileSync(handler, 'utf-8');

          // Should have database access (SQL or similar)
          const hasDataAccess =
            content.includes('getPool') ||
            content.includes('query') ||
            content.includes('SELECT') ||
            content.includes('INSERT');

          expect(hasDataAccess).toBe(true);
        });
      }
    });
  });

  describe('Endpoint Rules', () => {
    it('Endpoints should be thin adapters', () => {
      const featuresPath = path.join(__dirname, '../../src/features');

      if (fs.existsSync(featuresPath)) {
        const endpoints = getAllFiles(featuresPath).filter(f => f.includes('.endpoint.js'));

        endpoints.forEach(endpoint => {
          const content = fs.readFileSync(endpoint, 'utf-8');

          // Should require the handler
          expect(content).toMatch(/require\(['"].*\.handler/);

          // Should export async function with req, res
          expect(content).toMatch(/module\.exports\s*=\s*async\s*\(\s*req\s*,\s*res\s*\)/);

          // Should call handler.handle
          expect(content).toMatch(/handler\.handle/);

          // Should not have SQL queries (that's in handler)
          expect(content).not.toMatch(/SELECT|INSERT|UPDATE|DELETE/);
        });
      }
    });
  });

  describe('Naming Conventions', () => {
    it('Feature directories should use PascalCase', () => {
      const featuresPath = path.join(__dirname, '../../src/features/events');

      if (fs.existsSync(featuresPath)) {
        const slices = fs.readdirSync(featuresPath).filter(f => {
          const stat = fs.statSync(path.join(featuresPath, f));
          return stat.isDirectory();
        });

        slices.forEach(slice => {
          // Should start with capital letter (PascalCase)
          expect(slice).toMatch(/^[A-Z]/);
        });
      }
    });

    it('Handler files should match pattern FeatureName.handler.js', () => {
      const featuresPath = path.join(__dirname, '../../src/features/events');

      if (fs.existsSync(featuresPath)) {
        const slices = fs.readdirSync(featuresPath).filter(f => {
          const stat = fs.statSync(path.join(featuresPath, f));
          return stat.isDirectory();
        });

        slices.forEach(slice => {
          const slicePath = path.join(featuresPath, slice);
          const files = fs.readdirSync(slicePath);

          const handlerFile = files.find(f => f.includes('.handler.js'));
          if (handlerFile) {
            expect(handlerFile).toBe(`${slice}.handler.js`);
          }
        });
      }
    });
  });

  describe('Minimal Coupling', () => {
    it('Each feature should be independently testable', () => {
      const featuresPath = path.join(__dirname, '../../src/features/events');

      if (fs.existsSync(featuresPath)) {
        const slices = fs.readdirSync(featuresPath).filter(f => {
          const stat = fs.statSync(path.join(featuresPath, f));
          return stat.isDirectory();
        });

        slices.forEach(slice => {
          const slicePath = path.join(featuresPath, slice);

          // Feature should have all necessary files
          const files = fs.readdirSync(slicePath);
          const hasHandler = files.some(f => f.includes('.handler.js'));
          const hasEndpoint = files.some(f => f.includes('.endpoint.js'));

          // Can test handler without endpoint (unit test)
          // Can test endpoint without other features (integration test)
          expect(hasHandler && hasEndpoint).toBe(true);
        });
      }
    });
  });
});

// Helper function
function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;

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

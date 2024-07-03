# Express.js with TypeScript Data Extraction Project

This project is an Express.js server written in TypeScript, providing an API to run data extractors from websites. The project includes dynamic module loading and uses the Playwright library for web scraping.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Itterum/parser0.0.1
   cd parser0.0.1
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   yarn playwrifght install
   ```

3. **Run in development mode:** (make sure to start MongoDB container)
   ```bash
   yarn dev
   ```

4. **Environment setup:**
   Create a `.env` file based on `.env.example` and specify the necessary environment variables.

### Running the Project

1. **Local setup:** (make sure to start MongoDB container)
   ```bash
   yarn build
   yarn start
   ```
   The server will be accessible at http://localhost:3000.

2. **Running with Docker:**
   ```bash
   docker-compose up --build
   ```
   This will build and run containers for your application and MongoDB.

### API Routes

- **GET `/api/extractors`**
  Returns a list of available extractors based on files in the `dist/extractors` directory.

- **POST `/api/extractors`**
  Runs a data extractor based on the provided URLs and extractor name.

### Creating a New Extractor

To add a new extractor:

1. Create a file in `src/extractors/` with a name and content similar to `GitHubExtractor.ts`.
2. Define an extractor class that extends `BaseExtractor` and implement the `parseEntity` method for data extraction.

### Example Extractor

```typescript
import { BaseExtractor } from './baseExtractor';
import { BaseEntity } from '../baseEntity';
import { ElementHandle } from 'playwright';

class RepositoryEntity extends BaseEntity {}

export default class GitHubExtractor extends BaseExtractor<RepositoryEntity> {
    domain = 'github.com';
    waitSelector = '.Box-row';
    pager = {
        end: '.footer',
    };

    async parseEntity(element: ElementHandle): Promise<RepositoryEntity> {
        // Logic to extract data
    }
}
```

### Configuration `.env`

Example `.env` file:
```dotenv
DB_USER=admin
DB_PASSWORD=admin
DB_HOST=mongo
DB_PORT=27017
DB_NAME=testdb
APP_HOST=localhost
APP_PORT=3000
```

This project is designed for easy setup and addition of new data extractors using TypeScript and Express.js.

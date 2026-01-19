# Check for required arguments
if [ $# -ne 2 ]; then
    echo "Usage: $0 <app-name> <lib-name>"
    exit 1
fi

APP_NAME=$1
LIB_NAME=$2

# Initialize project in empty directory
mkdir -p "apps/$APP_NAME" "libraries/$LIB_NAME"
pnpm init

# Initialize pnpm workspaces
cat > pnpm-workspace.yaml << EOL
packages:
  - 'apps/*'
  - 'libraries/*'
EOL

# Create root tsconfig
pnpm add -Dw typescript @tsconfig/strictest
npx tsc --init --target es2020 --module esnext --strict --declaration --skipLibCheck

# Update root tsconfig.json
cat > tsconfig.json << EOL
{
  "extends": "@tsconfig/strictest/tsconfig.json",
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@${LIB_NAME}/*": ["./libraries/${LIB_NAME}/src/*"]
    }
  },
  "exclude": ["**/*.spec.ts"]
}
EOL

# Install common dev dependencies with ESLint >= 8
pnpm add -Dw eslint@latest prettier vitest @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-prettier eslint-plugin-gb

# Setup ESLint with flat config
cat > eslint.config.js << EOL
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import gbPlugin from 'eslint-plugin-gb';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['**/dist/**', '**/node_modules/**']
  },
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: {
      '@typescript-eslint': tseslint,
      'gb': gbPlugin
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...gbPlugin.configs.recommended.rules,
      ...prettier.rules
    }
  }
];
EOL

# Setup Prettier
cat > .prettierrc << EOL
{
  "singleQuote": false,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
EOL

# Create and set up app (Vite)
cd "apps/$APP_NAME"
# pnpm init
# pnpm add -D vite typescript
pnpm create vite . --template vanilla-ts
pnpm add victor

# Update bakery package.json to add workspace dependency
# cat > package.json << EOL
# {
#   "name": "bakery",
#   "private": true,
#   "version": "0.0.0",
#   "type": "module",
#   "scripts": {
#     "dev": "vite",
#     "build": "tsc && vite build",
#     "preview": "vite preview",
#     "test": "vitest run",
#     "lint": "eslint src",
#     "format": "prettier --write src"
#   },
#   "dependencies": {
#     "victor": "^1.1.0",
#     "@appliances": "workspace:*"
#   },
#   "devDependencies": {
#     "typescript": "^5.0.2",
#     "vite": "^4.4.5",
#     "vitest": "^0.34.4"
#   }
# }
# EOL

# Create tsconfig for bakery
cat > tsconfig.json << EOL
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@${LIB_NAME}/*": ["../../libraries/${LIB_NAME}/src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["**/*.spec.ts"]
}
EOL

# Create vite.config.ts for bakery
cat > vite.config.ts << EOL
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  resolve: {
    "alias": {
      "@": resolve(__dirname, "./src"),
      "@${LIB_NAME}": resolve(__dirname, "../../libraries/${LIB_NAME}/src")
    }
  },
  build: {
    sourcemap: true
  }
});
EOL

# Create vitest.config.ts for bakery
cat > vitest.config.ts << EOL
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["**/*.spec.ts"]
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@appliances": resolve(__dirname, "../../libraries/appliances/src")
    }
  }
});
EOL

# Create example main.ts for bakery
cat > src/main.ts << EOL
import "./style.css";
import Victor from "victor";
import { Oven } from "@${LIB_NAME}/oven";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = \`
  <div>
    <h1>Bakery App</h1>
    <div id="svg-container"></div>
    <div id="oven-status"></div>
  </div>
\`;

// Create a random rectangle using Victor
function createRandomRectangle() {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", "200");
  svg.setAttribute("height", "200");
  
  const position = new Victor(
    Math.random() * 100, 
    Math.random() * 100
  );
  
  const size = new Victor(
    50 + Math.random() * 50,
    50 + Math.random() * 50
  );
  
  const rect = document.createElementNS(svgNS, "rect");
  rect.setAttribute("x", position.x.toString());
  rect.setAttribute("y", position.y.toString());
  rect.setAttribute("width", size.x.toString());
  rect.setAttribute("height", size.y.toString());
  rect.setAttribute("fill", \`rgb(\${Math.floor(Math.random() * 255)},\${Math.floor(Math.random() * 255)},\${Math.floor(Math.random() * 255)})\`);
  
  svg.appendChild(rect);
  document.getElementById("svg-container")!.appendChild(svg);
}

createRandomRectangle();

// Use the Oven
const oven = new Oven(180);
document.getElementById("oven-status")!.textContent = \`Oven temperature: \${oven.getTemperature()}°C\`;
EOL

# Create library
cd "../../libraries/$LIB_NAME"
pnpm init
pnpm add -D typescript vitest @tsconfig/strictest
pnpm add victor

# Update package.json for appliances
cat > package.json << EOL
{
  "name": "@${LIB_NAME}",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "lint": "eslint src",
    "format": "prettier --write src"
  },
  "dependencies": {
    "victor": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.8.2",
    "vitest": "^3.0.7",
    "@tsconfig/strictest": "^2.0.5"
  }
}
EOL

# Create tsconfig for appliances
cat > tsconfig.json << EOL
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["**/*.spec.ts"]
}
EOL

# Create vitest.config.ts for appliances
cat > vitest.config.ts << EOL
import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    include: ["**/*.spec.ts"]
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  }
});
EOL

# Create Oven class
mkdir -p src
cat > src/oven.ts << EOL
import Victor from "victor";

export class Oven {
  private temperature: number;
  private position: Victor;

  constructor(temperature: number) {
    this.temperature = temperature;
    this.position = new Victor(0, 0);
  }

  setTemperature(temperature: number): void {
    this.temperature = temperature;
  }

  getTemperature(): number {
    return this.temperature;
  }

  setPosition(x: number, y: number): void {
    this.position = new Victor(x, y);
  }

  getPosition(): Victor {
    return this.position.clone();
  }
}
EOL

# Create index.ts for appliances
cat > src/index.ts << EOL
export * from "./oven";
EOL

# Create Oven test
cat > src/oven.spec.ts << EOL
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Oven } from "./oven";
import Victor from "victor";

// Mock Victor
vi.mock("victor", () => {
  return {
    default: vi.fn().mockImplementation((x, y) => {
      return {
        x,
        y,
        clone: () => ({ x, y, clone: () => ({ x, y }) })
      };
    })
  };
});

describe("Oven", () => {
  let oven: Oven;
  
  beforeEach(() => {
    oven = new Oven(180);
  });
  
  it("should be initialized with correct temperature", () => {
    expect(oven.getTemperature()).toBe(180);
  });
  
  it("should change temperature", () => {
    oven.setTemperature(220);
    expect(oven.getTemperature()).toBe(220);
  });
  
  it("should set and get position using Victor", () => {
    oven.setPosition(10, 20);
    const position = oven.getPosition();
    expect(position.x).toBe(10);
    expect(position.y).toBe(20);
    
    // Verify Victor was called
    expect(Victor).toHaveBeenCalledWith(10, 20);
  });
});
EOL

# Return to project root
cd ../../

# Update root package.json with workspace scripts
cat > package.json << EOL
{
  "name": "project-root",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm --filter $APP_NAME dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint",
    "format": "pnpm -r format"
  },
  "devDependencies": {
    "@tsconfig/strictest": "^2.0.5",
    "@typescript-eslint/eslint-plugin": "^8.0.0",
    "@typescript-eslint/parser": "^8.0.0",
    "eslint": "^9.0.0",
    "eslint-config-prettier": "^9.0.0",
    "eslint-plugin-gb": "^9.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.4",
    "vitest": "^0.34.4"
  }
}
EOL

# Install all dependencies
pnpm install

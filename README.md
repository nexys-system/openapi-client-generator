# openapi-client-generator

A TypeScript-based library to generate client code from an OpenAPI specification. This library parses an OpenAPI JSON file and produces TypeScript enums, interfaces, and client functions that can be used to interact with an API.

## Features

- **Load OpenAPI Specification**: Load and parse an OpenAPI JSON file.
- **Generate Enums**: Automatically generate TypeScript enums for `string` types with defined `enum` values in the OpenAPI spec.
- **Generate Types**: Create TypeScript interfaces for API request and response objects based on the OpenAPI schema.
- **Generate Client Functions**: Generate reusable, typed client functions to interact with the API.

## Installation

Install the package via npm:

```bash
npm install openapi-client-generator
```

## Usage

### 1. Load the OpenAPI Specification

Start by loading your OpenAPI JSON file using the `loadOpenAPISpec` function:

```typescript
import { loadOpenAPISpec } from "openapi-client-generator";

const specs = loadOpenAPISpec("./openapi.json");
```

### 2. Generate TypeScript Client Code

You can generate the entire client code (enums, types, and functions) by passing the loaded specification to the `generateClientCode` function:

```typescript
import { generateClientCode } from "openapi-client-generator";

const clientCode = generateClientCode(specs);
console.log(clientCode);
```

### 3. Generate Enums Only

If you only need to generate TypeScript enums for your OpenAPI spec, use the `generateEnums` function:

```typescript
import { generateEnums } from "openapi-client-generator";

const enums = generateEnums(specs.components?.schemas || {});
console.log(enums);
```

### 4. Generate Types Only

To generate TypeScript interfaces for your API objects, use the `generateTypes` function:

```typescript
import { generateTypes } from "openapi-client-generator";

const types = generateTypes(specs.components?.schemas || {});
console.log(types);
```

### 5. Generate Client Functions Only

To generate client functions for interacting with the API, use the `generateClientFunctions` function:

```typescript
import { generateClientFunctions } from "openapi-client-generator";

const functions = generateClientFunctions(specs.paths);
console.log(functions);
```

## Example Output

Given an OpenAPI specification, the output will include:

1. **Enums** for any `string` schemas with `enum` values.
2. **Interfaces** for all object schemas in the OpenAPI spec.
3. **Typed client functions** for each path and operation in the OpenAPI spec.

For example, the following OpenAPI spec:

```json
{
  "components": {
    "schemas": {
      "User": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" },
          "age": { "type": "integer" }
        },
        "required": ["id", "name"]
      },
      "Role": {
        "type": "string",
        "enum": ["Admin", "User", "Guest"]
      }
    }
  },
  "paths": {
    "/users": {
      "get": {
        "operationId": "getUsers",
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/User" }
              }
            }
          }
        }
      }
    }
  }
}
```

Would generate:

```typescript
export enum Role {
  Admin = "Admin",
  User = "User",
  Guest = "Guest",
}

export interface User {
  id: string;
  name: string;
  age?: number;
}

export const getUsers = async (): Promise<User> => {
  const url = host + "/users";
  return genericJSONRequest(url, "GET");
};
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue to discuss improvements or new features.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

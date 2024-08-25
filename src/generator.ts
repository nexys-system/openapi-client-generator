import fs from "fs";
import { OpenAPISpec, SchemaObject, PathItemObject } from "./openapiTypes";
import { pre } from "./utils.js";

const loadOpenAPISpec = (filePath: string): OpenAPISpec => {
  try {
    const rawData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(rawData) as OpenAPISpec;
  } catch (error) {
    console.error("Error loading OpenAPI spec:", error);
    process.exit(1);
  }
};

const generateEnums = (schemas: {
  [schemaName: string]: SchemaObject;
}): string => {
  let enums = "";

  for (const [name, schema] of Object.entries(schemas)) {
    if (schema.type === "string" && schema.enum) {
      enums += `export enum ${name} {\n`;
      schema.enum.forEach((value: string) => {
        enums += `  ${value} = '${value}',\n`;
      });
      enums += "}\n\n";
    }
  }

  return enums;
};

const generateTypes = (schemas: {
  [schemaName: string]: SchemaObject;
}): string => {
  let types = "";

  for (const [name, schema] of Object.entries(schemas)) {
    if (schema.type === "object" && schema.properties) {
      types += `export interface ${name} {\n`;
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const tsType = getTSType(propSchema);
        const isRequired = schema.required?.includes(propName);
        types += `  ${propName}${isRequired ? "" : "?"}: ${tsType};\n`;
      }
      types += "}\n\n";
    }
  }

  return types;
};

const getTSType = (schema: SchemaObject): string => {
  switch (schema.type) {
    case "string":
      return "string";
    case "integer":
    case "number":
      return "number";
    case "boolean":
      return "boolean";
    case "array":
      return `${
        schema.items ? getTSType(schema.items as SchemaObject) : "any"
      }[]`;
    case "object":
      return schema.properties
        ? `{ ${Object.entries(schema.properties)
            .map(
              ([key, value]) => `${key}: ${getTSType(value as SchemaObject)}`
            )
            .join("; ")} }`
        : "Record<string, any>";
    default:
      return schema.$ref ? schema.$ref.split("/").pop() || "any" : "any";
  }
};

const generateClientFunctions = (paths: OpenAPISpec["paths"]): string => {
  let functions = "";

  for (const [path, methods] of Object.entries(paths)) {
    for (const [method, details] of Object.entries(methods)) {
      const pathItem = details as PathItemObject;
      if (pathItem.operationId) {
        const { operationId } = pathItem;
        const requestBodyContent =
          pathItem.requestBody && "content" in pathItem.requestBody
            ? pathItem.requestBody.content?.["application/json"]
            : undefined;
        const requestBodySchema = requestBodyContent?.schema;

        const responseObject = pathItem.responses["200"];
        const responseContent =
          responseObject && "content" in responseObject
            ? responseObject.content?.["application/json"]
            : undefined;
        const responseSchema = responseContent?.schema;

        const requestType = requestBodySchema?.$ref
          ? requestBodySchema.$ref.split("/").pop() ?? "any"
          : "any";
        const responseType = responseSchema?.$ref
          ? responseSchema.$ref.split("/").pop() ?? "any"
          : "any";

        const hasQueryParams = pathItem.parameters?.some(
          (p) => "in" in p && p.in === "query"
        );
        const queryParam = hasQueryParams
          ? ", query?: Record<string, string>"
          : "";

        functions += `export const ${operationId} = async (${
          requestType !== "any" ? `data: ${requestType}` : ""
        }${queryParam}): Promise<${responseType}> => {\n`;
        functions += `  const url = host + '${path}';\n`;
        functions += `  return genericJSONRequest(url, '${method.toUpperCase()}', { ${
          requestType !== "any" ? "data" : ""
        }${
          hasQueryParams ? (requestType !== "any" ? ", query" : "query") : ""
        } });\n`;
        functions += "};\n\n";
      }
    }
  }

  return functions;
};

const generateClientCode = (openAPISpec: OpenAPISpec): string => {
  const enums = generateEnums(openAPISpec.components?.schemas || {});
  const types = generateTypes(openAPISpec.components?.schemas || {});
  const functions = generateClientFunctions(openAPISpec.paths);

  return `${pre}\n\n${enums}${types}${functions}`;
};

export {
  loadOpenAPISpec,
  generateEnums,
  generateTypes,
  generateClientFunctions,
  generateClientCode,
};

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateClientCode = exports.generateClientFunctions = exports.generateTypes = exports.generateEnums = exports.loadOpenAPISpec = void 0;
const fs_1 = __importDefault(require("fs"));
const utils_js_1 = require("./utils.js");
const loadOpenAPISpec = (filePath) => {
    try {
        const rawData = fs_1.default.readFileSync(filePath, "utf-8");
        return JSON.parse(rawData);
    }
    catch (error) {
        console.error("Error loading OpenAPI spec:", error);
        process.exit(1);
    }
};
exports.loadOpenAPISpec = loadOpenAPISpec;
const generateEnums = (schemas) => {
    let enums = "";
    for (const [name, schema] of Object.entries(schemas)) {
        if (schema.type === "string" && schema.enum) {
            enums += `export enum ${name} {\n`;
            schema.enum.forEach((value) => {
                enums += `  ${value} = '${value}',\n`;
            });
            enums += "}\n\n";
        }
    }
    return enums;
};
exports.generateEnums = generateEnums;
const generateTypes = (schemas) => {
    var _a;
    let types = "";
    for (const [name, schema] of Object.entries(schemas)) {
        if (schema.type === "object" && schema.properties) {
            types += `export interface ${name} {\n`;
            for (const [propName, propSchema] of Object.entries(schema.properties)) {
                const tsType = getTSType(propSchema);
                const isRequired = (_a = schema.required) === null || _a === void 0 ? void 0 : _a.includes(propName);
                types += `  ${propName}${isRequired ? "" : "?"}: ${tsType};\n`;
            }
            types += "}\n\n";
        }
    }
    return types;
};
exports.generateTypes = generateTypes;
const getTSType = (schema) => {
    switch (schema.type) {
        case "string":
            return "string";
        case "integer":
        case "number":
            return "number";
        case "boolean":
            return "boolean";
        case "array":
            return `${schema.items ? getTSType(schema.items) : "any"}[]`;
        case "object":
            return schema.properties
                ? `{ ${Object.entries(schema.properties)
                    .map(([key, value]) => `${key}: ${getTSType(value)}`)
                    .join("; ")} }`
                : "Record<string, any>";
        default:
            return schema.$ref ? schema.$ref.split("/").pop() || "any" : "any";
    }
};
const generateClientFunctions = (paths) => {
    var _a, _b, _c, _d, _e;
    let functions = "";
    for (const [path, methods] of Object.entries(paths)) {
        for (const [method, details] of Object.entries(methods)) {
            const pathItem = details;
            if (pathItem.operationId) {
                const { operationId } = pathItem;
                const requestBodyContent = pathItem.requestBody && "content" in pathItem.requestBody
                    ? (_a = pathItem.requestBody.content) === null || _a === void 0 ? void 0 : _a["application/json"]
                    : undefined;
                const requestBodySchema = requestBodyContent === null || requestBodyContent === void 0 ? void 0 : requestBodyContent.schema;
                const responseObject = pathItem.responses["200"];
                const responseContent = responseObject && "content" in responseObject
                    ? (_b = responseObject.content) === null || _b === void 0 ? void 0 : _b["application/json"]
                    : undefined;
                const responseSchema = responseContent === null || responseContent === void 0 ? void 0 : responseContent.schema;
                const requestType = (requestBodySchema === null || requestBodySchema === void 0 ? void 0 : requestBodySchema.$ref)
                    ? (_c = requestBodySchema.$ref.split("/").pop()) !== null && _c !== void 0 ? _c : "any"
                    : "any";
                const responseType = (responseSchema === null || responseSchema === void 0 ? void 0 : responseSchema.$ref)
                    ? (_d = responseSchema.$ref.split("/").pop()) !== null && _d !== void 0 ? _d : "any"
                    : "any";
                const hasQueryParams = (_e = pathItem.parameters) === null || _e === void 0 ? void 0 : _e.some((p) => "in" in p && p.in === "query");
                const queryParam = hasQueryParams
                    ? ", query?: Record<string, string>"
                    : "";
                functions += `export const ${operationId} = async (${requestType !== "any" ? `data: ${requestType}` : ""}${queryParam}): Promise<${responseType}> => {\n`;
                functions += `  const url = host + '${path}';\n`;
                functions += `  return genericJSONRequest(url, '${method.toUpperCase()}', { ${requestType !== "any" ? "data" : ""}${hasQueryParams ? (requestType !== "any" ? ", query" : "query") : ""} });\n`;
                functions += "};\n\n";
            }
        }
    }
    return functions;
};
exports.generateClientFunctions = generateClientFunctions;
const generateClientCode = (openAPISpec) => {
    var _a, _b;
    const enums = generateEnums(((_a = openAPISpec.components) === null || _a === void 0 ? void 0 : _a.schemas) || {});
    const types = generateTypes(((_b = openAPISpec.components) === null || _b === void 0 ? void 0 : _b.schemas) || {});
    const functions = generateClientFunctions(openAPISpec.paths);
    return `${utils_js_1.pre}\n\n${enums}${types}${functions}`;
};
exports.generateClientCode = generateClientCode;

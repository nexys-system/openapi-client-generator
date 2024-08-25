import { beforeEach, describe, expect, test } from "bun:test";
import { generateEnums, generateTypes, generateClientFunctions, generateClientCode, } from "./generator";
describe("OpenAPI Generator", () => {
    let mockOpenAPISpec;
    beforeEach(() => {
        mockOpenAPISpec = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/test": {
                    get: {
                        operationId: "getTest",
                        responses: {
                            "200": {
                                description: "Successful response",
                                content: {
                                    "application/json": {
                                        schema: { $ref: "#/components/schemas/TestResponse" },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            components: {
                schemas: {
                    TestEnum: {
                        type: "string",
                        enum: ["VALUE1", "VALUE2"],
                    },
                    TestObject: {
                        type: "object",
                        properties: {
                            id: { type: "integer" },
                            name: { type: "string" },
                        },
                        required: ["id"],
                    },
                    TestResponse: {
                        type: "object",
                        properties: {
                            result: { $ref: "#/components/schemas/TestObject" },
                        },
                    },
                },
            },
        };
    });
    test("generateEnums should create enum definitions", () => {
        const result = generateEnums(mockOpenAPISpec.components.schemas);
        expect(result).toContain("export enum TestEnum {");
        expect(result).toContain("VALUE1 = 'VALUE1'");
        expect(result).toContain("VALUE2 = 'VALUE2'");
    });
    test("generateTypes should create interface definitions", () => {
        const result = generateTypes(mockOpenAPISpec.components.schemas);
        expect(result).toContain("export interface TestObject {");
        expect(result).toContain("id: number;");
        expect(result).toContain("name?: string;");
    });
    test("generateClientFunctions should create function declarations", () => {
        const result = generateClientFunctions(mockOpenAPISpec.paths);
        expect(result).toContain("export const getTest = async (): Promise<TestResponse>");
        expect(result).toContain("return genericJSONRequest(url, 'GET',");
    });
    test("generateClientCode should combine all generated code", () => {
        const result = generateClientCode(mockOpenAPISpec);
        expect(result).toContain("export enum TestEnum");
        expect(result).toContain("export interface TestObject");
        expect(result).toContain("export const getTest = async");
    });
});

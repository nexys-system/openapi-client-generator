"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bun_test_1 = require("bun:test");
const generator_1 = require("./generator");
(0, bun_test_1.describe)("OpenAPI Generator", () => {
    let mockOpenAPISpec;
    (0, bun_test_1.beforeEach)(() => {
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
    (0, bun_test_1.test)("generateEnums should create enum definitions", () => {
        const result = (0, generator_1.generateEnums)(mockOpenAPISpec.components.schemas);
        (0, bun_test_1.expect)(result).toContain("export enum TestEnum {");
        (0, bun_test_1.expect)(result).toContain("VALUE1 = 'VALUE1'");
        (0, bun_test_1.expect)(result).toContain("VALUE2 = 'VALUE2'");
    });
    (0, bun_test_1.test)("generateTypes should create interface definitions", () => {
        const result = (0, generator_1.generateTypes)(mockOpenAPISpec.components.schemas);
        (0, bun_test_1.expect)(result).toContain("export interface TestObject {");
        (0, bun_test_1.expect)(result).toContain("id: number;");
        (0, bun_test_1.expect)(result).toContain("name?: string;");
    });
    (0, bun_test_1.test)("generateClientFunctions should create function declarations", () => {
        const result = (0, generator_1.generateClientFunctions)(mockOpenAPISpec.paths);
        (0, bun_test_1.expect)(result).toContain("export const getTest = async (): Promise<TestResponse>");
        (0, bun_test_1.expect)(result).toContain("return genericJSONRequest(url, 'GET',");
    });
    (0, bun_test_1.test)("generateClientCode should combine all generated code", () => {
        const result = (0, generator_1.generateClientCode)(mockOpenAPISpec);
        (0, bun_test_1.expect)(result).toContain("export enum TestEnum");
        (0, bun_test_1.expect)(result).toContain("export interface TestObject");
        (0, bun_test_1.expect)(result).toContain("export const getTest = async");
    });
});

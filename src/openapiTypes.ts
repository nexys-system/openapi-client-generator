// openapiTypes.ts

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: {
    [path: string]: {
      [method in
        | "get"
        | "post"
        | "put"
        | "delete"
        | "patch"
        | "options"
        | "head"
        | "trace"]?: PathItemObject;
    };
  };
  components?: {
    schemas?: { [key: string]: SchemaObject };
    responses?: { [key: string]: ResponseObject };
    parameters?: { [key: string]: ParameterObject };
    requestBodies?: { [key: string]: RequestBodyObject };
    securitySchemes?: { [key: string]: SecuritySchemeObject };
  };
}

export interface PathItemObject {
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: Array<ParameterObject | ReferenceObject>;
  requestBody?: RequestBodyObject | ReferenceObject;
  responses: {
    [statusCode: string]: ResponseObject | ReferenceObject;
  };
  tags?: string[];
  security?: SecurityRequirementObject[];
}

export interface ParameterObject {
  name: string;
  in: "query" | "header" | "path" | "cookie";
  description?: string;
  required?: boolean;
  schema?: SchemaObject | ReferenceObject;
}

export interface RequestBodyObject {
  description?: string;
  content: {
    [mediaType: string]: {
      schema: SchemaObject | ReferenceObject;
    };
  };
  required?: boolean;
}

export interface ResponseObject {
  description: string;
  content?: {
    [mediaType: string]: {
      schema: SchemaObject | ReferenceObject;
    };
  };
}

export interface SchemaObject {
  type?: "string" | "number" | "integer" | "boolean" | "array" | "object";
  format?: string;
  items?: SchemaObject | ReferenceObject;
  properties?: { [propertyName: string]: SchemaObject | ReferenceObject };
  required?: string[];
  enum?: any[];
  $ref?: string;
}

export interface ReferenceObject {
  $ref: string;
}

export interface SecuritySchemeObject {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect";
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsObject;
  openIdConnectUrl?: string;
}

export interface OAuthFlowsObject {
  implicit?: OAuthFlowObject;
  password?: OAuthFlowObject;
  clientCredentials?: OAuthFlowObject;
  authorizationCode?: OAuthFlowObject;
}

export interface OAuthFlowObject {
  authorizationUrl?: string;
  tokenUrl?: string;
  refreshUrl?: string;
  scopes: { [scope: string]: string };
}

export interface SecurityRequirementObject {
  [name: string]: string[];
}

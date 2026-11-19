/** OpenAPIを正式なパーサーで検証し、UI・APIで共有する型を同じ仕様から作ります。 */
import SwaggerParser from '@apidevtools/swagger-parser';
import openapiTS, { astToString } from 'openapi-typescript';
import { writeGenerated } from './lib/generated.mjs';
const source = new URL('../api/openapi.json', import.meta.url);
await SwaggerParser.validate(source.pathname, { resolve: { external: false } });
await writeGenerated('shared/api-schema.d.ts', astToString(await openapiTS(source)));

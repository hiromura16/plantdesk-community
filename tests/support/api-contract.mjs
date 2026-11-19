/** 実際のAPI応答と成功した要求をOpenAPIと照合し、仕様と実装のずれをテスト失敗にします。 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import SwaggerParser from '@apidevtools/swagger-parser';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
const root = fileURLToPath(new URL('../../', import.meta.url));
const spec = await SwaggerParser.dereference(path.join(root, 'api/openapi.json'), {
  resolve: { external: false },
});
const ajv = new Ajv({ allErrors: true, strict: false, validateFormats: true });
addFormats(ajv);
ajv.addFormat('binary', true);
const validators = new WeakMap();
const operations = Object.entries(spec.paths)
  .map(([template, methods]) => ({
    template,
    methods,
    expression: new RegExp(
      '^' +
        template
          .split('/')
          .map((p) => (p.startsWith('{') ? '[^/]+' : p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
          .join('/') +
        '/?$',
    ),
  }))
  .sort(
    (a, b) =>
      a.template.includes('{') - b.template.includes('{') || b.template.length - a.template.length,
  );
const observed = new Map();
function assertSchema(schema, value, label) {
  if (!schema) {
    return;
  }
  let validate = validators.get(schema);
  if (!validate) {
    validate = ajv.compile(schema);
    validators.set(schema, validate);
  }
  if (!validate(value)) {
    throw new Error('OpenAPI契約違反: ' + label + '\n' + JSON.stringify(validate.errors, null, 2));
  }
}
export function contractWorker(implementation) {
  return {
    ...implementation,
    async fetch(request, env, ...args) {
      const url = new URL(request.url);
      const relevant = url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/v1/');
      const route = relevant ? operations.find((x) => x.expression.test(url.pathname)) : null;
      const method = request.method.toLowerCase();
      const operation = route?.methods[method];
      const copy = operation?.requestBody ? request.clone() : null;
      const response = await implementation.fetch(request, env, ...args);
      if (!relevant) {
        return response;
      }
      if (!operation) {
        if (response.ok) {
          throw new Error('仕様にないAPIが成功しました: ' + request.method + ' ' + url.pathname);
        }
        return response;
      }
      const label = request.method + ' ' + route.template;
      const contract = operation.responses[String(response.status)] || operation.responses.default;
      if (!contract) {
        throw new Error('仕様にない応答状態です: ' + label + ' ' + response.status);
      }
      const media = response.headers.get('content-type')?.split(';')[0];
      const expected = contract.content?.[media] || contract.content?.['*/*'];
      if (!expected && response.status !== 204) {
        throw new Error('仕様にない応答形式です: ' + label + ' ' + media);
      }
      if (expected?.schema && media === 'application/json') {
        assertSchema(
          expected.schema,
          await response.clone().json(),
          label + ' 応答 ' + response.status,
        );
      }
      if (response.ok && copy) {
        const contentType = copy.headers.get('content-type')?.split(';')[0];
        const content = operation.requestBody.content?.[contentType];
        if (!content) {
          throw new Error('仕様にない要求形式です: ' + label + ' ' + contentType);
        }
        if (contentType === 'application/json') {
          assertSchema(content.schema, await copy.json(), label + ' 要求');
        }
      }
      const key = label + ' ' + response.status;
      observed.set(key, (observed.get(key) || 0) + 1);
      return response;
    },
  };
}
process.once('exit', () => {
  const dir = path.join(root, '.runtime/qa/contracts');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, process.pid + '.json'),
    JSON.stringify(Object.fromEntries(observed), null, 2),
  );
});

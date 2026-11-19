export interface paths {
  '/api/health': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 接続確認 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              ok: boolean;
              database: string;
              version: string;
              billing: string;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/capabilities': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 対応機能・制限 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              version: string;
              authentication: string;
              billing: string;
              webmcp: boolean;
              tools?: number;
              profile?: string;
              plan?: string;
              limits?: components['schemas']['PlanLimits'];
              fileLimitBytes?: number;
              snapshotLimitBytes?: number;
              features: string[];
            } & {
              [key: string]: unknown;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/stats': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 件数・工事状態別集計
     * @description 未ログインの場合は工事・お知らせ・付箋に公開範囲を限定します。設備情報・設備専用資料は認証後に取得できます。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Statistics'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/works': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 工事一覧・絞り込み */
    get: {
      parameters: {
        query?: {
          q?: string;
          drawingId?: string;
          status?: string;
          from?: string;
          to?: string;
          propertyId?: string;
          value?: string;
          limit?: number;
          offset?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['Work'][];
              total: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /** 工事登録 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "title": "試験工事",
           *       "drawingId": "site",
           *       "start": "2026-11-13",
           *       "end": "2026-11-14",
           *       "status": "planned",
           *       "points": [
           *         [
           *           100,
           *           100
           *         ],
           *         [
           *           200,
           *           100
           *         ],
           *         [
           *           200,
           *           200
           *         ]
           *       ],
           *       "impacts": [],
           *       "assetIds": [],
           *       "attachments": []
           *     }
           */
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Work'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/works/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 工事詳細 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Work'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /** 工事削除 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Work'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /** 工事部分更新 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "title": "変更後の工事名"
           *     }
           */
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Work'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/assets': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 設備一覧・絞り込み */
    get: {
      parameters: {
        query?: {
          q?: string;
          drawingId?: string;
          status?: string;
          from?: string;
          to?: string;
          propertyId?: string;
          value?: string;
          limit?: number;
          offset?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['Asset'][];
              total: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['Locked'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /** 設備登録 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "name": "追加ポンプ",
           *       "code": "DEMO-NEW-001",
           *       "drawingId": "site",
           *       "location": "動力棟",
           *       "point": [
           *         900,
           *         400
           *       ],
           *       "properties": {},
           *       "history": [],
           *       "attachments": []
           *     }
           */
          'application/json': {
            /** @enum {string} */
            icon?:
              | 'auto'
              | 'generic'
              | 'aircon'
              | 'fan'
              | 'pipe'
              | 'valve'
              | 'pump'
              | 'electric'
              | 'water'
              | 'fire'
              | 'boiler'
              | 'compressor'
              | 'chiller'
              | 'building'
              | 'crane'
              | 'safety'
              | 'drain';
            locks?: {
              position?: boolean;
              attributes?: boolean;
            };
            /** @description 添付した写真のfileId。ホバー表示の先頭画像。 */
            coverPhotoId?: string;
          } & {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Asset'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['Locked'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/assets/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 設備詳細 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Asset'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['Locked'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /** 設備削除 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Asset'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['Locked'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /** 設備部分更新 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "name": "変更後の名称"
           *     }
           */
          'application/json': {
            /** @enum {string} */
            icon?:
              | 'auto'
              | 'generic'
              | 'aircon'
              | 'fan'
              | 'pipe'
              | 'valve'
              | 'pump'
              | 'electric'
              | 'water'
              | 'fire'
              | 'boiler'
              | 'compressor'
              | 'chiller'
              | 'building'
              | 'crane'
              | 'safety'
              | 'drain';
            locks?: {
              position?: boolean;
              attributes?: boolean;
            };
            /** @description 添付した写真のfileId。ホバー表示の先頭画像。 */
            coverPhotoId?: string;
          } & {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Asset'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['Locked'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/drawings': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 図面一覧・絞り込み
     * @description 未ログインの場合は工事・お知らせ・付箋に公開範囲を限定します。設備情報・設備専用資料は認証後に取得できます。
     */
    get: {
      parameters: {
        query?: {
          q?: string;
          drawingId?: string;
          status?: string;
          from?: string;
          to?: string;
          propertyId?: string;
          value?: string;
          limit?: number;
          offset?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['Drawing'][];
              total: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /** 図面登録 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "name": "追加図面",
           *       "type": "sample",
           *       "asset": "assets/site-plan.svg",
           *       "bounds": [
           *         [
           *           0,
           *           0
           *         ],
           *         [
           *           1100,
           *           2000
           *         ]
           *       ],
           *       "metres": true
           *     }
           */
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Drawing'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/drawings/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 図面詳細
     * @description 未ログインの場合は工事・お知らせ・付箋に公開範囲を限定します。設備情報・設備専用資料は認証後に取得できます。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Drawing'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /** 図面削除 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Drawing'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /** 図面部分更新 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "name": "変更後の名称"
           *     }
           */
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Drawing'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/properties': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** プロパティ定義一覧・絞り込み */
    get: {
      parameters: {
        query?: {
          q?: string;
          drawingId?: string;
          status?: string;
          from?: string;
          to?: string;
          propertyId?: string;
          value?: string;
          limit?: number;
          offset?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['PropertyDefinition'][];
              total: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /** プロパティ定義登録 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "name": "圧力",
           *       "type": "number",
           *       "unit": "MPa",
           *       "required": false,
           *       "options": []
           *     }
           */
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['PropertyDefinition'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/properties/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** プロパティ定義詳細 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['PropertyDefinition'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /** プロパティ定義削除 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['PropertyDefinition'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /** プロパティ定義部分更新 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "name": "変更後の名称"
           *     }
           */
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['PropertyDefinition'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/state': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 一貫した共有状態とリビジョン
     * @description 未ログインの場合は工事・お知らせ・付箋に公開範囲を限定します。設備情報・設備専用資料は認証後に取得できます。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              state: components['schemas']['WorkspaceState'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    /** 状態の一括保存（リビジョン競合を検出） */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            state: {
              [key: string]: unknown;
            };
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['RevisionResponse'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['Locked2'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 工事・設備・図面・付箋を横断検索
     * @description 未ログインの場合は工事・お知らせ・付箋に公開範囲を限定します。設備情報・設備専用資料は認証後に取得できます。
     */
    get: {
      parameters: {
        query?: {
          q?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: {
                [key: string]: unknown;
              }[];
              total: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/auth/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** ログイン状態 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              editor: boolean;
              role?: string;
              sso?: boolean;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/auth/login': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** SSO認証済み利用者が施設担当モードに切り替える */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': Record<string, never>;
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              editor: boolean;
              role?: string;
              sso?: boolean;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/auth/logout': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** ログアウト */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              editor: boolean;
              role?: string;
              sso?: boolean;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/batch': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** 最大100件の操作を原子的に反映 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "operations": [
           *         {
           *           "kind": "assets",
           *           "op": "update",
           *           "id": "a1",
           *           "record": {
           *             "location": "A棟 北側"
           *           }
           *         }
           *       ]
           *     }
           */
          'application/json': {
            operations: (
              | {
                  /** @enum {string} */
                  kind:
                    | 'works'
                    | 'assets'
                    | 'drawings'
                    | 'properties'
                    | 'notes'
                    | 'layers'
                    | 'drawingLinks'
                    | 'layerSets'
                    | 'tasks'
                    | 'teamMembers'
                    | 'inspectionPlans'
                    | 'projects';
                  id?: string;
                  record?: {
                    [key: string]: unknown;
                  };
                  /** @enum {string} */
                  method: 'POST' | 'PATCH' | 'DELETE';
                }
              | {
                  /** @enum {string} */
                  kind?:
                    | 'works'
                    | 'assets'
                    | 'drawings'
                    | 'properties'
                    | 'notes'
                    | 'layers'
                    | 'drawingLinks'
                    | 'layerSets'
                    | 'tasks'
                    | 'teamMembers'
                    | 'inspectionPlans'
                    | 'projects';
                  id?: string;
                  record?: {
                    [key: string]: unknown;
                  };
                  /** @enum {string} */
                  method?: 'POST' | 'PATCH' | 'DELETE';
                  /** @enum {string} */
                  collection:
                    | 'works'
                    | 'assets'
                    | 'drawings'
                    | 'properties'
                    | 'notes'
                    | 'layers'
                    | 'drawingLinks'
                    | 'layerSets'
                    | 'tasks'
                    | 'teamMembers'
                    | 'inspectionPlans'
                    | 'projects';
                  /** @enum {string} */
                  operation: 'create' | 'update' | 'delete';
                }
              | {
                  /** @enum {string} */
                  kind:
                    | 'works'
                    | 'assets'
                    | 'drawings'
                    | 'properties'
                    | 'notes'
                    | 'layers'
                    | 'drawingLinks'
                    | 'layerSets'
                    | 'tasks'
                    | 'teamMembers'
                    | 'inspectionPlans'
                    | 'projects';
                  id?: string;
                  record?: {
                    [key: string]: unknown;
                  };
                  /** @enum {string} */
                  method?: 'POST' | 'PATCH' | 'DELETE';
                  /** @enum {string} */
                  collection?:
                    | 'works'
                    | 'assets'
                    | 'drawings'
                    | 'properties'
                    | 'notes'
                    | 'layers'
                    | 'drawingLinks'
                    | 'layerSets'
                    | 'tasks'
                    | 'teamMembers'
                    | 'inspectionPlans'
                    | 'projects';
                  /** @enum {string} */
                  operation: 'create' | 'update' | 'delete';
                }
            )[];
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              results: {
                [key: string]: unknown;
              }[];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['Locked3'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/assets/{id}/maintenance': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 設備の点検履歴 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['MaintenanceRecord'][];
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /** 点検・保守履歴を追加 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "date": "2026-11-13",
           *       "text": "外観・運転状態を確認。",
           *       "inspector": "施設担当",
           *       "result": "normal"
           *     }
           */
          'application/json': {
            /** Format: date */
            date: string;
            text: string;
            kind?: string;
            inspector?: string;
            /** Format: date */
            nextDate?: string;
            /** @enum {string} */
            result?: 'normal' | 'attention' | 'repaired';
            attachments?: {
              [key: string]: unknown;
            }[];
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['MaintenanceRecord'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/assets/{id}/maintenance/{history_id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** 点検履歴を削除 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
          history_id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['MaintenanceRecord'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /** 点検履歴を編集 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
          history_id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['MaintenanceRecord'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/files': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 資料・写真・アイコンの一覧 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description ファイルと参照状況 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: {
                id: string;
                name: string;
                mime: string;
                size: number;
                created_at?: string;
                referenced: boolean;
                historyReferenced: boolean;
              }[];
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['BadRequest'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['BadRequest'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /** 複数資料アップロード（各20MB） */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'multipart/form-data': {
            file: string[];
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              files: components['schemas']['FileReference'][];
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/files/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 登録済み資料をダウンロード / PDF・画像をプレビュー
     * @description 未ログインの場合は工事・お知らせ・付箋に公開範囲を限定します。設備情報・設備専用資料は認証後に取得できます。
     */
    get: {
      parameters: {
        query?: {
          inline?: '0' | '1';
        };
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 資料本体（バイナリ） */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/octet-stream': string;
            'application/pdf': string;
            'image/png': string;
            'image/jpeg': string;
            'image/webp': string;
            'image/gif': string;
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /** 未使用のファイルを削除 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 削除結果 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              deleted: boolean;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict2'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['BadRequest'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/export': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 図面と登録データのJSON出力（添付は参照ID） */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              state: components['schemas']['WorkspaceState'];
              revision: number;
              exportedAt: string;
              format: string;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/notes': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 付箋一覧・絞り込み */
    get: {
      parameters: {
        query?: {
          q?: string;
          drawingId?: string;
          limit?: number;
          offset?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['Note'][];
              total: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /** 付箋登録 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "drawingId": "site",
           *       "point": [
           *         850,
           *         500
           *       ],
           *       "text": "こちらの通路をご利用ください。",
           *       "color": "#fff2ad",
           *       "size": 100,
           *       "referenceZoom": -1.5
           *     }
           */
          'application/json': components['schemas']['Note'];
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Note'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/notes/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 付箋詳細 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Note'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /** 付箋削除 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Note'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /** 付箋部分更新 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "text": "案内を更新しました。",
           *       "color": "#d9eeff",
           *       "size": 150
           *     }
           */
          'application/json': {
            id?: string;
            drawingId?: string;
            /** @description 図面上の [X, Y] 座標 */
            point?: number[];
            text?: string;
            /** Format: date-time */
            updatedAt?: string;
            /**
             * @description 付箋紙の色（#RRGGBB）
             * @default #fff2ad
             */
            color?: string;
            /**
             * @description 付箋と文字のサイズ（%）
             * @default 100
             */
            size?: number;
            /** @description 100%時に幅204pxとなる地図のズーム値。画面では貼付時のズームを保存し、以後は図面と同じ倍率で拡大・縮小します。省略時は既存図面の幅から基準を決めます。 */
            referenceZoom?: number;
            /** @description 付箋の幅（サイズ100%時の基準ピクセル）。縁・角のドラッグで保存します。省略時は既定幅・本文に合わせた高さ。 */
            width?: number;
            /** @description 付箋の高さ（サイズ100%時の基準ピクセル）。縁・角のドラッグで保存します。省略時は既定幅・本文に合わせた高さ。 */
            height?: number;
            /**
             * @default sans
             * @enum {string}
             */
            fontFamily?: 'sans' | 'serif' | 'mono';
            /**
             * @description サイズ100%時の文字サイズ(px)
             * @default 13
             */
            fontSize?: number;
            /** @description 文字色。nullは背景色に合わせた自動調整 */
            fontColor?: string | null;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['Note'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/files/{id}/thumbnail': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 写真のサムネイル（最大320×240、DBキャッシュ）
     * @description 原本と同じ閲覧権限を適用。設備専用写真は施設グループの認証が必要。JPEG・PNG・GIF・WebP対応。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description PNGサムネイル */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/octet-stream': string;
            'application/pdf': string;
            'image/png': string;
            'image/jpeg': string;
            'image/webp': string;
            'image/gif': string;
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['BadRequest'];
        404: components['responses']['NotFound'];
        405: components['responses']['BadRequest'];
        409: components['responses']['BadRequest'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity2'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/session': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** SSOと現在のデモアカウント */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Session'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized2'];
        403: components['responses']['Forbidden'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict3'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['BadRequest'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/preferences': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 保存した表示設定と独自アイコン */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              preferences: components['schemas']['Preferences'];
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized2'];
        403: components['responses']['Forbidden'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict3'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['BadRequest'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    /**
     * 表示設定と独自アイコンを保存
     * @description 表示サイズ・ズーム連動・背景・色・パネル・操作・プリセット・任意レイヤーの表示・設備/工事台帳の列順やフィルターを保存。部分更新ではなく現在の設定とマージして送信してください。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          /**
           * @example {
           *       "appearance": {
           *         "iconSize": 32,
           *         "iconScale": "gentle",
           *         "workLabelSize": 12,
           *         "workScale": "fixed"
           *       },
           *       "hiddenLayerIds": [],
           *       "tableViews": {
           *         "equipment": {
           *           "columns": [
           *             "code",
           *             "name",
           *             "category",
           *             "prop:manufacturer"
           *           ],
           *           "sort": "name",
           *           "descending": false,
           *           "filters": {
           *             "category": "hvac"
           *           }
           *         }
           *       }
           *     }
           */
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              preferences: components['schemas']['Preferences'];
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized2'];
        403: components['responses']['Forbidden'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict3'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity3'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/dashboard': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 設備・点検・容量と利用枠 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              works?: number;
              assets?: number;
              drawings?: number;
              notes?: number;
              properties?: number;
              active?: number;
              planned?: number;
              done?: number;
              upcoming?: number;
              overdueInspections?: number;
              attention?: number;
              usage: {
                storage: number;
                files: number;
                drawings: number;
                assets: number;
              };
              limits: components['schemas']['PlanLimits'];
              plan: string;
            } & {
              [key: string]: unknown;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized2'];
        403: components['responses']['Forbidden'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict3'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['BadRequest'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/import-preview': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** JSON取り込みの事前検証 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              canApply: boolean;
              mode: string;
              existing: number;
              created?: number;
              updated?: number;
              counts?: {
                [key: string]: number;
              };
              errors?: string[];
            } & {
              [key: string]: unknown;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized2'];
        403: components['responses']['Forbidden'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict3'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['BadRequest'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/import': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** 確認したJSONを取り込む */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            [key: string]: unknown;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['RevisionResponse'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized2'];
        403: components['responses']['Forbidden'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict3'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['BadRequest'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/layers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * レイヤー詳細・一覧
     * @description 施設担当モードで編集できます。閲覧モードでは公開されたレイヤー・図面リンクのみ返します。レイヤー削除は項目を標準へ戻します。ロック中の設備が属するレイヤーの削除は拒否されます。
     */
    get: {
      parameters: {
        query?: {
          q?: string;
          drawingId?: string;
          limit?: number;
          offset?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['MapLayer'][];
              total: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /**
     * レイヤー登録
     * @description 施設担当モードで編集できます。閲覧モードでは公開されたレイヤー・図面リンクのみ返します。レイヤー削除は項目を標準へ戻します。ロック中の設備が属するレイヤーの削除は拒否されます。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['MapLayer'];
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['MapLayer'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/layers/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * レイヤー詳細・一覧
     * @description 施設担当モードで編集できます。閲覧モードでは公開されたレイヤー・図面リンクのみ返します。レイヤー削除は項目を標準へ戻します。ロック中の設備が属するレイヤーの削除は拒否されます。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['MapLayer'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /**
     * レイヤー削除
     * @description 施設担当モードで編集できます。閲覧モードでは公開されたレイヤー・図面リンクのみ返します。レイヤー削除は項目を標準へ戻します。ロック中の設備が属するレイヤーの削除は拒否されます。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['MapLayer'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /**
     * レイヤー更新
     * @description 施設担当モードで編集できます。閲覧モードでは公開されたレイヤー・図面リンクのみ返します。レイヤー削除は項目を標準へ戻します。ロック中の設備が属するレイヤーの削除は拒否されます。
     */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['MapLayerPatch'];
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['MapLayer'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/drawingLinks': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 図面リンク詳細・一覧
     * @description 施設担当モードで編集できます。閲覧モードでは公開されたレイヤー・図面リンクのみ返します。レイヤー削除は項目を標準へ戻します。ロック中の設備が属するレイヤーの削除は拒否されます。
     */
    get: {
      parameters: {
        query?: {
          q?: string;
          drawingId?: string;
          limit?: number;
          offset?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['DrawingLink'][];
              total: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /**
     * 図面リンク登録
     * @description 施設担当モードで編集できます。閲覧モードでは公開されたレイヤー・図面リンクのみ返します。レイヤー削除は項目を標準へ戻します。ロック中の設備が属するレイヤーの削除は拒否されます。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['DrawingLink'];
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['DrawingLink'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/drawingLinks/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 図面リンク詳細・一覧
     * @description 施設担当モードで編集できます。閲覧モードでは公開されたレイヤー・図面リンクのみ返します。レイヤー削除は項目を標準へ戻します。ロック中の設備が属するレイヤーの削除は拒否されます。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['DrawingLink'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /**
     * 図面リンク削除
     * @description 施設担当モードで編集できます。閲覧モードでは公開されたレイヤー・図面リンクのみ返します。レイヤー削除は項目を標準へ戻します。ロック中の設備が属するレイヤーの削除は拒否されます。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['DrawingLink'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /**
     * 図面リンク更新
     * @description 施設担当モードで編集できます。閲覧モードでは公開されたレイヤー・図面リンクのみ返します。レイヤー削除は項目を標準へ戻します。ロック中の設備が属するレイヤーの削除は拒否されます。
     */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['DrawingLinkPatch'];
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['DrawingLink'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/work-register': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 施設担当用の工事一覧・削除済み一覧
     * @description 現在の工事と削除済み工事を取得。削除済み一覧はnextOffsetでページングします。
     */
    get: {
      parameters: {
        query?: {
          offset?: number;
          limit?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['Work'][];
              deleted: components['schemas']['Work'][];
              nextOffset: number | null;
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized3'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['NotFound2'];
        405: components['responses']['BadRequest'];
        409: components['responses']['BadRequest'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['BadRequest'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/works/{id}/history': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 工事の変更履歴
     * @description 登録・変更・削除の前後の内容、実行者、日時、リビジョンを返します。導入前の過去変更は復元できず、導入時点をbaselineとして残します。nextCursorをbeforeに渡すと以前の履歴を取得できます。履歴中の添付資料は削除から保護します。
     */
    get: {
      parameters: {
        query?: {
          before?: number;
          limit?: number;
        };
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: {
                [key: string]: unknown;
              }[];
              nextCursor: number | null;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized3'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['NotFound2'];
        405: components['responses']['BadRequest'];
        409: components['responses']['BadRequest'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['BadRequest'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/layerSets': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * レイヤーセット詳細・一覧
     * @description 同じ追加レイヤーを複数セットへ登録できます。rulesでレイヤーごとの表示・非表示を保存。mergeは対象だけ変更し、replaceは他の追加レイヤーを非表示にします。閲覧モードは公開セットの公開レイヤーだけを返します。レイヤー削除時は各セットの参照を除去します。
     */
    get: {
      parameters: {
        query?: {
          q?: string;
          drawingId?: string;
          limit?: number;
          offset?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['LayerSet'][];
              total: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /**
     * レイヤーセット登録
     * @description 同じ追加レイヤーを複数セットへ登録できます。rulesでレイヤーごとの表示・非表示を保存。mergeは対象だけ変更し、replaceは他の追加レイヤーを非表示にします。閲覧モードは公開セットの公開レイヤーだけを返します。レイヤー削除時は各セットの参照を除去します。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['LayerSet'];
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['LayerSet'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/layerSets/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * レイヤーセット詳細・一覧
     * @description 同じ追加レイヤーを複数セットへ登録できます。rulesでレイヤーごとの表示・非表示を保存。mergeは対象だけ変更し、replaceは他の追加レイヤーを非表示にします。閲覧モードは公開セットの公開レイヤーだけを返します。レイヤー削除時は各セットの参照を除去します。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['LayerSet'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /**
     * レイヤーセット削除
     * @description 同じ追加レイヤーを複数セットへ登録できます。rulesでレイヤーごとの表示・非表示を保存。mergeは対象だけ変更し、replaceは他の追加レイヤーを非表示にします。閲覧モードは公開セットの公開レイヤーだけを返します。レイヤー削除時は各セットの参照を除去します。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['LayerSet'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /**
     * レイヤーセット更新
     * @description 同じ追加レイヤーを複数セットへ登録できます。rulesでレイヤーごとの表示・非表示を保存。mergeは対象だけ変更し、replaceは他の追加レイヤーを非表示にします。閲覧モードは公開セットの公開レイヤーだけを返します。レイヤー削除時は各セットの参照を除去します。
     */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': components['schemas']['LayerSetPatch'];
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['LayerSet'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['Unauthorized'];
        403: components['responses']['BadRequest'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/layer-sets/apply': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * レイヤーセットの表示を適用
     * @description savedは入力順に保存ルールを適用。show/hideは全メンバー、isolateは表示ルールの和集合、intersectionは共通部分だけ表示。標準・CAD背景は変更しません。ユーザーの表示設定だけを変更し、公開範囲は変更しません。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            ids: string[];
            /**
             * @default saved
             * @enum {string}
             */
            operation?: 'saved' | 'show' | 'hide' | 'isolate' | 'intersection';
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              preferences: components['schemas']['Preferences'];
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict4'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity4'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/assets/import-preview': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 設備JSONの追加・更新を事前確認
     * @description 保存せず行別のエラー・追加数・更新数とrevisionを返します。新規はnameとpointが必要。drawingIdは既定図面を指定できます。propertiesは登録済みIDで指定します。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            assets: components['schemas']['EquipmentImportRecord'][];
            /**
             * @default add
             * @enum {string}
             */
            mode?: 'add' | 'upsert';
            drawingId?: string;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ImportPreview'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict4'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity4'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/assets/import': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 設備JSONを一括追加・更新
     * @description プレビューのrevisionを指定。全件成功時のみ保存します。更新はcodeで照合し、省略フィールドとpropertiesの省略キーを保持。既存のhistory・attachments・locksを入力すると拒否。ロックとプラン上限と添付ファイルの所有権を検証します。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            assets: components['schemas']['EquipmentImportRecord'][];
            /**
             * @default add
             * @enum {string}
             */
            mode?: 'add' | 'upsert';
            drawingId?: string;
            revision: number;
            /** @enum {string} */
            confirm: 'IMPORT_ASSETS';
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ImportPreview'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict4'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity4'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/tasks': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 作業一覧 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['TeamTask'][];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /**
     * 作業を登録
     * @description 案件・親作業・先行作業・依頼元・完了条件を指定できます。循環参照、先行作業が未完了の状態での開始、未完了の子作業がある親の完了を拒否します。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            record: components['schemas']['TeamTaskInput'];
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamTask'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/tasks/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 作業詳細 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamTask'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /** 作業を削除 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamTask'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /** 作業を更新 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            record: components['schemas']['TeamTaskInputPatch'];
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamTask'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/teamMembers': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 担当者名簿一覧
     * @description 作業の割り振り用名簿です。ログインアカウントの作成・SSO招待・権限変更は行いません。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['TeamMember'][];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /**
     * 担当者名簿を登録
     * @description 作業の割り振り用名簿です。ログインアカウントの作成・SSO招待・権限変更は行いません。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            record: components['schemas']['TeamMemberInput'];
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamMember'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/teamMembers/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 担当者名簿詳細 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamMember'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /** 担当者名簿を削除 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamMember'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /** 担当者名簿を更新 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            record: components['schemas']['TeamMemberInputPatch'];
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamMember'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/inspectionPlans': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 点検計画一覧 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['InspectionPlan'][];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /** 点検計画を登録 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            record: components['schemas']['InspectionPlanInput'];
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['InspectionPlan'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/inspectionPlans/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** 点検計画詳細 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['InspectionPlan'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /** 点検計画を削除 */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['InspectionPlan'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /** 点検計画を更新 */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            record: components['schemas']['InspectionPlanInputPatch'];
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['InspectionPlan'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/tasks/{id}/history': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 作業の変更・引き継ぎ履歴
     * @description 組織ごとの追記専用履歴。削除後も残ります。beforeでリビジョンのカーソル指定が可能。
     */
    get: {
      parameters: {
        query?: {
          before?: number;
        };
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: {
                [key: string]: unknown;
              }[];
              nextCursor: number | null;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/tasks/{id}/comments': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** 引き継ぎコメントを保存 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            text: string;
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['RevisionResponse'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/tasks/{id}/complete': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 作業を完了し点検結果を台帳へ記録
     * @description 全チェック項目の確認が必要。点検は対象設備・実施日・結果・内容を必須とし履歴を一度だけ追加。次回日プロパティの更新はupdateNextDateで指定しロックを尊重。要対応時はcreateFollowupとfollowupDueDateで修理作業も同じ保存内で追加。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            record?: components['schemas']['TeamTaskInput'];
            checklist?: {
              id?: string;
              done?: boolean;
            }[];
            /** Format: date */
            date?: string;
            /** @enum {string} */
            result?: 'normal' | 'attention' | 'repaired';
            text?: string;
            nextDate?: string;
            updateNextDate?: boolean;
            createFollowup?: boolean;
            /** Format: date */
            followupDueDate?: string;
            inspector?: string;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamTask'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/inspectionPlans/{id}/generate': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** 今回の点検作業をまとめ起票 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            /** Format: date */
            cycleDate: string;
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              planId: string;
              cycleDate: string;
              nextDue?: string;
              items: {
                [key: string]: unknown;
              }[];
              created?: number;
              skipped?: number;
              revision?: number;
            } & {
              [key: string]: unknown;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/inspectionPlans/{id}/preview': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 今回起票する点検の内容確認
     * @description cycleDate、次回日、設備ごとの起票済み判定、revisionを返します。起票はgenerateを明示的に呼び出す方式です。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              planId: string;
              cycleDate: string;
              nextDue?: string;
              items: {
                [key: string]: unknown;
              }[];
              created?: number;
              skipped?: number;
              revision?: number;
            } & {
              [key: string]: unknown;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/team/report': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 朝会・引き継ぎレポート
     * @description 現在の作業から期限超過・未割り当て・手配待ち・担当者別見積時間・直近7日完了とMarkdown本文を生成。過去時点の状態復元ではありません。
     */
    get: {
      parameters: {
        query?: {
          date?: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              revision: number;
              totals?: {
                [key: string]: number;
              };
              members?: {
                [key: string]: unknown;
              }[];
              overdue?: number;
              unassigned?: number;
              waiting?: number;
              dueToday?: number;
              upcoming?: number;
              completedWeek?: number;
              loads?: Record<string, never>[];
              date?: string;
              markdown?: string;
            } & {
              [key: string]: unknown;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/team/demo': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * チーム管理のサンプルを追加
     * @description 作業・担当者・点検計画がすべて空の場合だけ、担当者4名・作業8件・計画1件を追加。既存の設備や工事は保持します。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              revision: number;
            } & {
              [key: string]: unknown;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/notion/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Notion同期の設定・状態・進捗
     * @description トークンや暗号文は返しません。状態と組織のrevisionを返します。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NotionStatus'];
          };
        };
        /** @description スケジューラーで実行待ち */
        202: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NotionStatus'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict6'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity6'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['ServiceUnavailable'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/notion/config': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * Notion接続を暗号化して保存
     * @description トークンは内部接続のものを使用。指定ページと権限を確認後、AES-GCMで組織ごとに暗号化。初回は専用DBの作成と同期を予約します。
     */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            homePageId: string;
            /** Format: password */
            token?: string;
            /** @enum {integer} */
            intervalMinutes: 5 | 15 | 30 | 60;
            /** @enum {string} */
            direction: 'both' | 'push' | 'pull';
            enabled: boolean;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NotionStatus'];
          };
        };
        /** @description スケジューラーで実行待ち */
        202: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NotionStatus'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict6'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity6'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['ServiceUnavailable'];
      };
    };
    post?: never;
    /**
     * Notion接続を切断
     * @description 両側のレコードは削除しません。接続情報とリンクを除去します。同期処理中は停止後に実行してください。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              disconnected: boolean;
            };
          };
        };
        /** @description スケジューラーで実行待ち */
        202: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              disconnected: boolean;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict6'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity6'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['ServiceUnavailable'];
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/notion/run': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Notion同期を実行待ちにする
     * @description Cronで処理します。fullで削除候補を含め全件照合。大量データは複数回に分けて再開します。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            full?: boolean;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NotionStatus'];
          };
        };
        /** @description スケジューラーで実行待ち */
        202: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NotionStatus'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict6'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity6'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['ServiceUnavailable'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/notion/pause': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Notion同期を停止 */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': Record<string, never>;
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NotionStatus'];
          };
        };
        /** @description スケジューラーで実行待ち */
        202: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NotionStatus'];
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict6'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity6'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['ServiceUnavailable'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/notion/issues': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Notion同期の競合・削除候補・入力エラー
     * @description 最新100件。設備ロック・入力型・履歴整合性エラーも含みます。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              revision: number;
              items: {
                [key: string]: unknown;
              }[];
            };
          };
        };
        /** @description スケジューラーで実行待ち */
        202: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              revision: number;
              items: {
                [key: string]: unknown;
              }[];
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict6'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity6'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['ServiceUnavailable'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/notion/runs': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Notion同期の最近20回の履歴 */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: {
                [key: string]: unknown;
              }[];
            };
          };
        };
        /** @description スケジューラーで実行待ち */
        202: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: {
                [key: string]: unknown;
              }[];
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict6'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity6'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['ServiceUnavailable'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/notion/resolve': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 同期競合・削除確認を解決
     * @description 同時変更は自動上書きせず明示的な採用待ちにします。削除を反映する選択にはconfirmが必要で、設備ロックと参照を再検証します。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            /** @enum {string} */
            kind: 'teamMembers' | 'assets' | 'works' | 'inspectionPlans' | 'tasks' | 'inspections';
            localId: string;
            /** @enum {string} */
            source: 'local' | 'notion';
            revision: number;
            updatedAt: string;
            /** @enum {string} */
            confirm?: 'DELETE_REVIEWED';
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              resolved?: boolean;
              queued?: boolean;
            };
          };
        };
        /** @description スケジューラーで実行待ち */
        202: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              resolved?: boolean;
              queued?: boolean;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict6'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity6'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['ServiceUnavailable'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/projects': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 案件一覧
     * @description 施設担当モード専用。未完了作業のある案件は完了できません。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: components['schemas']['TeamProject'][];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    /**
     * 案件を登録
     * @description 施設担当モード専用。未完了作業のある案件は完了できません。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            record: components['schemas']['TeamProjectInput'];
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamProject'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/projects/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 案件詳細
     * @description 施設担当モード専用。未完了作業のある案件は完了できません。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamProject'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    /**
     * 案件を削除
     * @description 施設担当モード専用。未完了作業のある案件は完了できません。
     */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamProject'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    options?: never;
    head?: never;
    /**
     * 案件を更新
     * @description 施設担当モード専用。未完了作業のある案件は完了できません。
     */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          id: string;
        };
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
            record: components['schemas']['TeamProjectInputPatch'];
          };
        };
      };
      responses: {
        /** @description 成功 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              record: components['schemas']['TeamProject'];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    trace?: never;
  };
  '/api/team/projects': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 案件の進捗と先行作業待ち
     * @description 施設担当モード専用。中止を除く作業の完了率・期限超過・見積時間を返します。
     */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description 案件ごとのstatsと、先行作業待ちの作業IDを返します。 */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              items: {
                [key: string]: unknown;
              }[];
              blocked: string[];
              revision: number;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['BadRequest'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['BadRequest'];
        423: components['responses']['BadRequest'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/api/team/workflow-demo': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 案件と工程のサンプルを追加
     * @description 案件・作業・担当者・点検計画がすべて空の場合だけ、案件3件・作業16件・担当者4名・計画1件を追加します。設備・工事は保持します。
     */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody: {
        content: {
          'application/json': {
            revision: number;
          };
        };
      };
      responses: {
        /** @description 成功 */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              revision: number;
            } & {
              [key: string]: unknown;
            };
          };
        };
        400: components['responses']['BadRequest'];
        401: components['responses']['BadRequest'];
        403: components['responses']['Forbidden2'];
        404: components['responses']['BadRequest'];
        405: components['responses']['BadRequest'];
        409: components['responses']['Conflict5'];
        413: components['responses']['BadRequest'];
        415: components['responses']['BadRequest'];
        422: components['responses']['UnprocessableEntity5'];
        423: components['responses']['Locked4'];
        429: components['responses']['BadRequest'];
        500: components['responses']['BadRequest'];
        503: components['responses']['BadRequest'];
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    PropertyDefinition: {
      id?: string;
      name?: string;
      /** @enum {string} */
      type?: 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'multiselect' | 'url';
      required?: boolean;
      unit?: string;
      options?: {
        id: string;
        label: string;
      }[];
    };
    Note: {
      id?: string;
      drawingId: string;
      /** @description 図面上の [X, Y] 座標 */
      point: number[];
      text: string;
      /** Format: date-time */
      updatedAt?: string;
      /**
       * @description 付箋紙の色（#RRGGBB）
       * @default #fff2ad
       */
      color: string;
      /**
       * @description 付箋と文字のサイズ（%）
       * @default 100
       */
      size: number;
      /** @description 100%時に幅204pxとなる地図のズーム値。画面では貼付時のズームを保存し、以後は図面と同じ倍率で拡大・縮小します。省略時は既存図面の幅から基準を決めます。 */
      referenceZoom?: number;
      /** @description 付箋の幅（サイズ100%時の基準ピクセル）。縁・角のドラッグで保存します。省略時は既定幅・本文に合わせた高さ。 */
      width?: number;
      /** @description 付箋の高さ（サイズ100%時の基準ピクセル）。縁・角のドラッグで保存します。省略時は既定幅・本文に合わせた高さ。 */
      height?: number;
      /**
       * @default sans
       * @enum {string}
       */
      fontFamily: 'sans' | 'serif' | 'mono';
      /**
       * @description サイズ100%時の文字サイズ(px)
       * @default 13
       */
      fontSize: number;
      /** @description 文字色。nullは背景色に合わせた自動調整 */
      fontColor?: string | null;
      /** @description 任意の配置レイヤーID。省略時は標準。 */
      layerId?: string;
    };
    AssetPresentation: {
      /** @enum {string} */
      icon?:
        | 'auto'
        | 'generic'
        | 'aircon'
        | 'fan'
        | 'pipe'
        | 'valve'
        | 'pump'
        | 'electric'
        | 'water'
        | 'fire'
        | 'boiler'
        | 'compressor'
        | 'chiller'
        | 'building'
        | 'crane'
        | 'safety'
        | 'drain';
      locks?: {
        position?: boolean;
        attributes?: boolean;
      };
      /** @description 添付した写真のfileId。ホバー表示の先頭画像。 */
      coverPhotoId?: string;
      /** @description 任意の配置レイヤーID。省略時は標準。 */
      layerId?: string;
    };
    MapLayer: {
      id?: string;
      name: string;
      color: string;
      /** @enum {string} */
      audience: 'facility' | 'public';
    };
    DrawingLink: {
      id?: string;
      name: string;
      drawingId: string;
      /** @description 循環しない別図面のID */
      targetDrawingId: string;
      points: number[][];
      layerId?: string;
      /** @enum {string} */
      audience: 'facility' | 'public';
    };
    LayerSet: {
      id?: string;
      name: string;
      description: string;
      color: string;
      /** @enum {string} */
      audience: 'facility' | 'public';
      /** @enum {string} */
      mode: 'merge' | 'replace';
      rules: {
        layerId: string;
        visible: boolean;
      }[];
    };
    EquipmentImportRecord: {
      id?: string;
      code: string;
      name?: string;
      drawingId?: string;
      point?: number[];
      location?: string;
      properties?: {
        [key: string]: unknown;
      };
      layerId?: string;
      icon?: string;
      iconId?: string;
      locks?: Record<string, never>;
      attachments?: Record<string, never>[];
      history?: Record<string, never>[];
    };
    TeamTask: {
      id: string;
      title: string;
      description: string;
      /** @enum {string} */
      kind: 'task' | 'inspection' | 'repair' | 'coordination';
      /** @enum {string} */
      status: 'open' | 'in_progress' | 'waiting' | 'done' | 'cancelled';
      /** @enum {string} */
      priority: 'urgent' | 'high' | 'normal' | 'low';
      dueDate: string;
      assigneeId: string;
      assetId: string;
      workId: string;
      drawingId: string;
      estimatedMinutes: number;
      blocker: string;
      checklist: {
        id: string;
        text: string;
        done?: boolean;
      }[];
      attachments: {
        [key: string]: unknown;
      }[];
      projectId?: string;
      parentId?: string;
      requestor?: string;
      acceptanceCriteria?: string;
      /** @description 着手予定。空文字またはYYYY-MM-DD。 */
      startDate?: string;
      /** @description 先行作業のID。すべて完了すると開始・完了できる。 */
      dependsOnIds?: string[];
      /** @description 完了条件を確認したか。完了条件がある作業の完了時に必須。 */
      acceptanceConfirmed?: boolean;
      createdAt?: string;
      updatedAt?: string;
      completedAt?: string;
      inspectionId?: string;
      followupTaskId?: string;
      followupFor?: string;
      origin?: {
        planId?: string;
        planName?: string;
        cycleDate?: string;
      };
      completionOptions?: {
        updateNextDate?: boolean;
        createFollowup?: boolean;
        followupDueDate?: string;
      };
    };
    TeamMember: {
      name: string;
      specialty?: string;
      contact?: string;
      color?: string;
      active?: boolean;
      id: string;
      createdAt?: string;
      updatedAt?: string;
    };
    InspectionPlan: {
      name: string;
      description?: string;
      assetIds?: string[];
      assigneeId?: string;
      /** Format: date */
      nextDue?: string;
      intervalDays?: number;
      active?: boolean;
      /** @enum {string} */
      priority?: 'urgent' | 'high' | 'normal' | 'low';
      estimatedMinutes?: number;
      checklist?: {
        id: string;
        text: string;
        done?: boolean;
      }[];
      id: string;
      createdAt?: string;
      updatedAt?: string;
    };
    TeamProject: {
      name: string;
      description?: string;
      goal?: string;
      ownerId?: string;
      startDate?: string;
      dueDate?: string;
      color?: string;
      /** @enum {string} */
      status: 'planning' | 'active' | 'on_hold' | 'done' | 'cancelled';
      id: string;
      createdAt?: string;
      updatedAt?: string;
    };
    ErrorResponse: {
      error: string;
    };
    RevisionResponse: {
      revision: number;
    };
    Point: number[];
    FileReference: {
      id?: string;
      fileId?: string;
      name: string;
      mime: string;
      size?: number;
      thumbnail?: boolean;
      createdAt?: string;
      created_at?: string;
      url?: string;
    } & {
      [key: string]: unknown;
    };
    MaintenanceRecord: {
      id: string;
      date: string;
      text: string;
      kind?: string;
      /** @enum {string} */
      result?: 'normal' | 'attention' | 'repaired';
      inspector?: string;
      nextDate?: string;
      attachments?: components['schemas']['FileReference'][];
      taskId?: string;
      checklist?: {
        id: string;
        text: string;
        done?: boolean;
      }[];
    } & {
      [key: string]: unknown;
    };
    Drawing: {
      id: string;
      name: string;
      type: string;
      asset?: string;
      bounds: components['schemas']['Point'][];
      metres?: boolean;
      parentId?: string;
      geojson?: {
        [key: string]: unknown;
      };
    } & {
      [key: string]: unknown;
    };
    Work: {
      id: string;
      code?: string;
      drawingId: string;
      title: string;
      location?: string;
      start?: string;
      end?: string;
      /** @enum {string} */
      status: 'planned' | 'active' | 'done';
      impacts?: string[];
      notes?: string;
      contact?: string;
      phone?: string;
      points: components['schemas']['Point'][];
      attachments?: components['schemas']['FileReference'][];
      assetIds?: string[];
      updatedAt?: string;
      layerId?: string;
      coverPhotoId?: string;
      deleted?: boolean;
      deletedAt?: string;
    } & {
      [key: string]: unknown;
    };
    Asset: {
      id: string;
      name: string;
      code?: string;
      location?: string;
      drawingId: string;
      point: components['schemas']['Point'];
      properties: {
        [key: string]: unknown;
      };
      history: components['schemas']['MaintenanceRecord'][];
      attachments: components['schemas']['FileReference'][];
      locks?: {
        position?: boolean;
        attributes?: boolean;
      };
      icon?: string;
      coverPhotoId?: string;
      layerId?: string;
      updatedAt?: string;
    } & {
      [key: string]: unknown;
    };
    TeamTaskInput: {
      id?: string;
      title?: string;
      description?: string;
      /** @enum {string} */
      kind?: 'task' | 'inspection' | 'repair' | 'coordination';
      /** @enum {string} */
      status?: 'open' | 'in_progress' | 'waiting' | 'done' | 'cancelled';
      /** @enum {string} */
      priority?: 'urgent' | 'high' | 'normal' | 'low';
      dueDate?: string;
      assigneeId?: string;
      assetId?: string;
      workId?: string;
      drawingId?: string;
      estimatedMinutes?: number;
      blocker?: string;
      checklist?: {
        id: string;
        text: string;
        done?: boolean;
      }[];
      attachments?: {
        [key: string]: unknown;
      }[];
      projectId?: string;
      parentId?: string;
      requestor?: string;
      acceptanceCriteria?: string;
      /** @description 着手予定。空文字またはYYYY-MM-DD。 */
      startDate?: string;
      /** @description 先行作業のID。すべて完了すると開始・完了できる。 */
      dependsOnIds?: string[];
      /** @description 完了条件を確認したか。完了条件がある作業の完了時に必須。 */
      acceptanceConfirmed?: boolean;
    };
    TeamMemberInput: {
      name?: string;
      specialty?: string;
      contact?: string;
      color?: string;
      active?: boolean;
    };
    InspectionPlanInput: {
      name?: string;
      description?: string;
      assetIds?: string[];
      assigneeId?: string;
      /** Format: date */
      nextDue?: string;
      intervalDays?: number;
      active?: boolean;
      /** @enum {string} */
      priority?: 'urgent' | 'high' | 'normal' | 'low';
      estimatedMinutes?: number;
      checklist?: {
        id: string;
        text: string;
        done?: boolean;
      }[];
    };
    TeamProjectInput: {
      name?: string;
      description?: string;
      goal?: string;
      ownerId?: string;
      startDate?: string;
      dueDate?: string;
      color?: string;
      /** @enum {string} */
      status?: 'planning' | 'active' | 'on_hold' | 'done' | 'cancelled';
    };
    WorkspaceState: {
      /** @enum {integer} */
      version: 2;
      drawings: components['schemas']['Drawing'][];
      works: components['schemas']['Work'][];
      assets: components['schemas']['Asset'][];
      propertyDefinitions: components['schemas']['PropertyDefinitionRecord'][];
      notes: components['schemas']['NoteRecord'][];
      layers: components['schemas']['MapLayerRecord'][];
      drawingLinks: components['schemas']['DrawingLinkRecord'][];
      layerSets: components['schemas']['LayerSetRecord'][];
      teamMembers: components['schemas']['TeamMember'][];
      tasks: components['schemas']['TeamTask'][];
      inspectionPlans: components['schemas']['InspectionPlan'][];
      projects: components['schemas']['TeamProject'][];
    };
    MapAppearance: {
      iconSize: number;
      /** @enum {string} */
      iconScale: 'fixed' | 'gentle' | 'map';
      /** @enum {string} */
      equipmentLabels: 'hover' | 'always' | 'none';
      /** @enum {string} */
      equipmentLabelContent: 'name' | 'code' | 'both';
      equipmentLabelSize: number;
      equipmentOpacity: number;
      /** @enum {string} */
      equipmentColors: 'type' | 'layer' | 'single';
      equipmentColor: string;
      /** @enum {string} */
      equipmentShape: 'rounded' | 'circle' | 'square';
      lockBadges: boolean;
      equipmentDrag: boolean;
      workLabelSize: number;
      /** @enum {string} */
      workScale: 'fixed' | 'gentle' | 'map';
      /** @enum {string} */
      workLabels: 'always' | 'hover' | 'none';
      /** @enum {string} */
      workLabelContent: 'title' | 'code' | 'dates';
      workLabelWidth: number;
      workLabelOpacity: number;
      /** @enum {string} */
      workColors: 'status' | 'layer';
      workFill: number;
      workStroke: number;
      plannedDashed: boolean;
      showCompleted: boolean;
      activeColor: string;
      plannedColor: string;
      doneColor: string;
      background: string;
      /** @enum {string} */
      grid: 'dots' | 'lines' | 'none';
      gridSize: number;
      drawingOpacity: number;
      north: boolean;
      scaleBar: boolean;
      legend: boolean;
      coordinates: boolean;
      noteOpacity: number;
      noteShadow: boolean;
      summary: boolean;
      footer: boolean;
      leftWidth: number;
      rightWidth: number;
      wheelZoom: boolean;
      doubleClickZoom: boolean;
      zoomButtons: boolean;
      /** @enum {string} */
      zoomPosition: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
      minimumScale: number;
      linkAreas: boolean;
    };
    Preferences: {
      appearance: components['schemas']['MapAppearance'];
      left: boolean;
      right: boolean;
      focus: boolean;
      density: string;
      theme: string;
      accent: string;
      brandName: string;
      icons: {
        id: string;
        name: string;
        fileId: string;
      }[];
      hiddenLayerIds: string[];
      mapTypes: {
        [key: string]: boolean;
      } | null;
      teamBoard: {
        [key: string]: unknown;
      };
      tableViews: {
        [key: string]: {
          [key: string]: unknown;
        };
      };
      displayPresets: {
        id: string;
        name: string;
        appearance: components['schemas']['MapAppearance'];
      }[];
      categoryIcons: {
        [key: string]: string;
      };
    };
    PlanLimits: {
      name: string;
      drawings: number;
      assets: number;
      icons: number;
      storage: number;
      snapshots: number;
      customization: boolean;
    };
    Session: {
      saas: boolean;
      sso: string;
      /** @enum {string} */
      profile: 'free';
      editor: boolean;
      /** @enum {string} */
      role: 'owner' | 'editor' | 'viewer';
      organization: {
        id: string;
        name: string;
      };
      /** @enum {string} */
      plan: 'free';
      limits: components['schemas']['PlanLimits'];
      /** @enum {boolean} */
      mockBilling: false;
      profiles: {
        /** @enum {string} */
        id: 'free';
        name: string;
        /** @enum {string} */
        plan: 'free';
        role: string;
      }[];
      preferences: components['schemas']['Preferences'];
    };
    NotionStatus: {
      revision: number;
      serverReady: boolean;
      configured: boolean;
      homePageId: string;
      homeUrl: string | null;
      intervalMinutes: number;
      /** @enum {string} */
      direction: 'both' | 'push' | 'pull';
      enabled: boolean;
      status: string;
      running: boolean;
      requested: boolean;
      lastRunAt?: string | null;
      lastSuccessAt?: string | null;
      nextRunAt?: string | null;
      lastError: string;
      sources: {
        kind: string;
        name: string;
        id: string;
        url: string | null;
      }[];
      counts: {
        [key: string]: number;
      };
      counters: {
        [key: string]: number;
      };
      progress: {
        kind: string;
        phase: string;
        startedAt: string;
      } | null;
      queued?: boolean;
      updatePending?: boolean;
    };
    ImportPreview: {
      created: number;
      updated: number;
      total: number;
      mode: string;
      canApply: boolean;
      revision: number;
      items: ({
        row: number;
        code: string;
        name: string;
        action: string;
      } & {
        [key: string]: unknown;
      })[];
      errors: {
        row: number | null;
        code: string;
        message: string;
      }[];
    };
    Statistics: {
      works?: number;
      assets?: number;
      drawings?: number;
      notes?: number;
      properties?: number;
      active?: number;
      planned?: number;
      done?: number;
      upcoming?: number;
      overdueInspections?: number;
      attention?: number;
    } & {
      [key: string]: unknown;
    };
    NoteRecord: {
      id: string;
      drawingId: string;
      /** @description 図面上の [X, Y] 座標 */
      point: number[];
      text: string;
      /** Format: date-time */
      updatedAt?: string;
      /**
       * @description 付箋紙の色（#RRGGBB）
       * @default #fff2ad
       */
      color: string;
      /**
       * @description 付箋と文字のサイズ（%）
       * @default 100
       */
      size: number;
      /** @description 100%時に幅204pxとなる地図のズーム値。画面では貼付時のズームを保存し、以後は図面と同じ倍率で拡大・縮小します。省略時は既存図面の幅から基準を決めます。 */
      referenceZoom?: number;
      /** @description 付箋の幅（サイズ100%時の基準ピクセル）。縁・角のドラッグで保存します。省略時は既定幅・本文に合わせた高さ。 */
      width?: number;
      /** @description 付箋の高さ（サイズ100%時の基準ピクセル）。縁・角のドラッグで保存します。省略時は既定幅・本文に合わせた高さ。 */
      height?: number;
      /**
       * @default sans
       * @enum {string}
       */
      fontFamily: 'sans' | 'serif' | 'mono';
      /**
       * @description サイズ100%時の文字サイズ(px)
       * @default 13
       */
      fontSize: number;
      /** @description 文字色。nullは背景色に合わせた自動調整 */
      fontColor?: string | null;
      /** @description 任意の配置レイヤーID。省略時は標準。 */
      layerId?: string;
    };
    MapLayerRecord: {
      id: string;
      name: string;
      color: string;
      /** @enum {string} */
      audience: 'facility' | 'public';
    };
    DrawingLinkRecord: {
      id: string;
      name: string;
      drawingId: string;
      /** @description 循環しない別図面のID */
      targetDrawingId: string;
      points: number[][];
      layerId?: string;
      /** @enum {string} */
      audience: 'facility' | 'public';
    };
    LayerSetRecord: {
      id: string;
      name: string;
      description: string;
      color: string;
      /** @enum {string} */
      audience: 'facility' | 'public';
      /** @enum {string} */
      mode: 'merge' | 'replace';
      rules: {
        layerId: string;
        visible: boolean;
      }[];
    };
    PropertyDefinitionRecord: {
      id: string;
      name?: string;
      /** @enum {string} */
      type?: 'text' | 'number' | 'date' | 'checkbox' | 'select' | 'multiselect' | 'url';
      required?: boolean;
      unit?: string;
      options?: {
        id: string;
        label: string;
      }[];
    };
    MapLayerPatch: {
      id?: string;
      name?: string;
      color?: string;
      /** @enum {string} */
      audience?: 'facility' | 'public';
    };
    DrawingLinkPatch: {
      id?: string;
      name?: string;
      drawingId?: string;
      /** @description 循環しない別図面のID */
      targetDrawingId?: string;
      points?: number[][];
      layerId?: string;
      /** @enum {string} */
      audience?: 'facility' | 'public';
    };
    LayerSetPatch: {
      id?: string;
      name?: string;
      description?: string;
      color?: string;
      /** @enum {string} */
      audience?: 'facility' | 'public';
      /** @enum {string} */
      mode?: 'merge' | 'replace';
      rules?: {
        layerId: string;
        visible: boolean;
      }[];
    };
    TeamTaskInputPatch: {
      id?: string;
      title?: string;
      description?: string;
      /** @enum {string} */
      kind?: 'task' | 'inspection' | 'repair' | 'coordination';
      /** @enum {string} */
      status?: 'open' | 'in_progress' | 'waiting' | 'done' | 'cancelled';
      /** @enum {string} */
      priority?: 'urgent' | 'high' | 'normal' | 'low';
      dueDate?: string;
      assigneeId?: string;
      assetId?: string;
      workId?: string;
      drawingId?: string;
      estimatedMinutes?: number;
      blocker?: string;
      checklist?: {
        id: string;
        text: string;
        done?: boolean;
      }[];
      attachments?: {
        [key: string]: unknown;
      }[];
      projectId?: string;
      parentId?: string;
      requestor?: string;
      acceptanceCriteria?: string;
      /** @description 着手予定。空文字またはYYYY-MM-DD。 */
      startDate?: string;
      /** @description 先行作業のID。すべて完了すると開始・完了できる。 */
      dependsOnIds?: string[];
      /** @description 完了条件を確認したか。完了条件がある作業の完了時に必須。 */
      acceptanceConfirmed?: boolean;
    };
    TeamMemberInputPatch: {
      name?: string;
      specialty?: string;
      contact?: string;
      color?: string;
      active?: boolean;
    };
    InspectionPlanInputPatch: {
      name?: string;
      description?: string;
      assetIds?: string[];
      assigneeId?: string;
      /** Format: date */
      nextDue?: string;
      intervalDays?: number;
      active?: boolean;
      /** @enum {string} */
      priority?: 'urgent' | 'high' | 'normal' | 'low';
      estimatedMinutes?: number;
      checklist?: {
        id: string;
        text: string;
        done?: boolean;
      }[];
    };
    TeamProjectInputPatch: {
      name?: string;
      description?: string;
      goal?: string;
      ownerId?: string;
      startDate?: string;
      dueDate?: string;
      color?: string;
      /** @enum {string} */
      status?: 'planning' | 'active' | 'on_hold' | 'done' | 'cancelled';
    };
  };
  responses: {
    /** @description 要求を処理できませんでした。エラー内容を確認してください。 */
    BadRequest: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 施設担当ログインが必要 */
    Unauthorized: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 競合・参照中 */
    Conflict: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 入力・型・日付・参照エラー */
    UnprocessableEntity: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 設備の位置または属性がロックされています。解除だけを先に保存してから編集します。 */
    Locked: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description ロック中の設備の移動・属性変更・削除は拒否されます。 */
    Locked2: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description ロックに反する変更がある場合、一括操作全体を取り消します。 */
    Locked3: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 使用中のファイル */
    Conflict2: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 参照権限がない、または存在しない */
    NotFound: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 画像の形式・大きさを処理できない */
    UnprocessableEntity2: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description SSOログインが必要 */
    Unauthorized2: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description モード・プラン・権限の制限 */
    Forbidden: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 競合・利用枠 */
    Conflict3: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 型・サイズ・色などの設定が不正 */
    UnprocessableEntity3: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description SSO認証が必要 */
    Unauthorized3: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 施設担当モードが必要 */
    Forbidden2: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description このアカウントに対象が存在しない */
    NotFound2: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 競合・プラン上限 */
    Conflict4: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 入力エラー */
    UnprocessableEntity4: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 同時更新・使用中の参照 */
    Conflict5: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 入力・チェック・参照エラー */
    UnprocessableEntity5: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 設備がロック中 */
    Locked4: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 同期中・競合状態の更新・別ワークスペースの同期先 */
    Conflict6: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description 設定・入力のエラー */
    UnprocessableEntity6: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
    /** @description トークン暗号化キー未設定 */
    ServiceUnavailable: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorResponse'];
      };
    };
  };
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;

/** API・台帳・画面で共用する型。外部入出力の仕様から作る型と、内部コンテキストを分けます。 */
import type { components } from './api-schema';
export type Schemas = components['schemas'];
export type Point = [number, number];
export type Asset = Schemas['Asset'] & { point: Point };
export type Task = Schemas['TeamTask'];
export type Work = Schemas['Work'];
export type Note = Schemas['NoteRecord'] & { point: Point };
export type WorkspaceState = Schemas['WorkspaceState'] & { assets: Asset[]; notes: Note[] };
export type Preferences = Schemas['Preferences'];
export type Appearance = Schemas['MapAppearance'];
export type Session = Schemas['Session'];
export type NotionStatus = Schemas['NotionStatus'];
export type Plan = 'free';
export interface Organization {
  id: string;
  name: string;
  role: 'owner' | 'editor' | 'viewer';
  plan: Plan;
  revision: number;
  state_json: string;
  updated_at: string;
}
export interface MapContext {
  user: { id: string; identity: { issuer: string; subject: string } };
  profile: 'free';
  org: Organization;
  state: WorkspaceState;
  editor: boolean;
  limits: Schemas['PlanLimits'];
}
export interface SyncLink {
  organization_id: string;
  kind: string;
  local_id: string;
  page_id: string;
  base_json: string | null;
  system_json: string | null;
  remote_edited_at: string | null;
  state: string;
  issue_json: string | null;
  resolution: string | null;
  updated_at: string;
}
export interface SyncOptions {
  commit: (...args: unknown[]) => Promise<number>;
  origin?: string;
}
export type AppearanceField = { section: string; key: string; label: string } & (
  | { type: 'number'; value: number; min: number; max: number; unit?: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'select'; value: string; choices: Record<string, string> }
  | { type: 'color'; value: string }
);
export interface EditState<RecordType> {
  record?: RecordType;
  initial?: Partial<RecordType>;
  complete?: boolean;
  editorKey?: string;
}
export type ImportPreview = Schemas['ImportPreview'];
/** 同期差分の確認画面に返す公開要約。トークンは含めません。 */
export interface NotionIssue {
  kind: string;
  local_id: string;
  name: string;
  pageUrl?: string;
  message: string;
  fields?: string[];
  local?: Record<string, unknown>;
  notion?: Record<string, unknown>;
}
export interface NotionRun {
  id: string;
  started_at: string;
  status: string;
  error?: string;
  counters: { pushed?: number; pulled?: number; conflicts?: number; errors?: number };
}
export interface HistoryEvent<T> {
  id: string;
  action: string;
  actor: string;
  revision: number;
  createdAt: string;
  reason?: string;
  created_at?: string;
  comment?: string;
  before: T | null;
  after: T | null;
}
export interface StoredFile {
  id: string;
  name: string;
  size: number;
  mime: string;
  referenced: boolean;
  historyReferenced: boolean;
  created_at: string;
}
export interface Snapshot {
  id: string;
  name: string;
  created_at: string;
}
export interface AuditEvent {
  id: string;
  action: string;
  actor_id: string;
  revision: number;
  created_at: string;
}
export interface WorkspaceImportPreview {
  history: number;
  counts: { assets: number };
  warnings: string[];
  canApply: boolean;
}
export type TeamReport = ReturnType<typeof import('../cloudflare/team.mjs').teamReport>;
export interface SyncRecord {
  id: string;
  locks?: { position?: boolean; attributes?: boolean };
  [key: string]: unknown;
}

export interface CustomIcon {
  id: string;
  name: string;
  data?: string;
  fileId?: string;
}
export type PreferenceInput = Partial<
  Omit<Preferences, 'icons' | 'appearance' | 'displayPresets' | 'theme' | 'density'>
> & {
  theme?: string;
  density?: string;
  plan?: string;
  icons?: CustomIcon[];
  appearance?: Partial<Appearance>;
  displayPresets?: Array<{ id: string; name: string; appearance: Partial<Appearance> }>;
};

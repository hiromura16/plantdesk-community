CREATE TABLE demo_profiles (
  user_id TEXT NOT NULL REFERENCES users(id),
  profile TEXT NOT NULL CHECK(profile = 'free'),
  organization_id TEXT NOT NULL UNIQUE REFERENCES organizations(id),
  PRIMARY KEY(user_id,profile)
);
CREATE TABLE map_preferences (
  user_id TEXT NOT NULL REFERENCES users(id),
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  value_json TEXT NOT NULL DEFAULT '{}',
  PRIMARY KEY(user_id,organization_id)
);
CREATE TABLE map_files (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL CHECK(size > 0),
  thumbnail TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX map_files_org ON map_files(organization_id);
CREATE TABLE map_file_chunks (
  file_id TEXT NOT NULL REFERENCES map_files(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL,
  data TEXT NOT NULL,
  PRIMARY KEY(file_id,ordinal)
);

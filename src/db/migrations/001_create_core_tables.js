const { Client } = require('pg');
const { env } = require('../config/env');

exports.up = async (pgm) => {
  pgm.createTable('organizations', {
    id: 'id',
    name: { type: 'varchar(255)', notNull: true },
    slug: { type: 'varchar(255)', notNull: true, unique: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('users', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: 'organizations',
      onDelete: 'CASCADE'
    },
    email: { type: 'varchar(255)', notNull: true, unique: true },
    password_hash: { type: 'text', notNull: true },
    full_name: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(32)', notNull: true, default: 'member' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('invitations', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: 'organizations',
      onDelete: 'CASCADE'
    },
    email: { type: 'varchar(255)', notNull: true },
    role: { type: 'varchar(32)', notNull: true, default: 'member' },
    token: { type: 'text', notNull: true, unique: true },
    status: { type: 'varchar(32)', notNull: true, default: 'pending' },
    invited_by: {
      type: 'integer',
      references: 'users',
      onDelete: 'SET NULL'
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('assessments', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: 'organizations',
      onDelete: 'CASCADE'
    },
    name: { type: 'varchar(255)', notNull: true },
    status: { type: 'varchar(32)', notNull: true, default: 'draft' },
    created_by: {
      type: 'integer',
      references: 'users',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('practice_statuses', {
    id: 'id',
    assessment_id: {
      type: 'integer',
      notNull: true,
      references: 'assessments',
      onDelete: 'CASCADE'
    },
    domain_code: { type: 'varchar(64)', notNull: true },
    practice_code: { type: 'varchar(64)', notNull: true },
    status: { type: 'varchar(32)', notNull: true },
    source: { type: 'varchar(16)', notNull: true },
    notes: { type: 'text' },
    last_reviewed_by: {
      type: 'integer',
      references: 'users',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('evidence', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: 'organizations',
      onDelete: 'CASCADE'
    },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    file_url: { type: 'text' },
    source_type: { type: 'varchar(32)', notNull: true, default: 'manual' },
    created_by: {
      type: 'integer',
      references: 'users',
      onDelete: 'SET NULL'
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('poam_items', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: 'organizations',
      onDelete: 'CASCADE'
    },
    title: { type: 'varchar(255)', notNull: true },
    owner: { type: 'varchar(255)', notNull: true },
    due_date: { type: 'timestamptz' },
    status: { type: 'varchar(32)', notNull: true, default: 'open' },
    progress_pct: { type: 'integer', notNull: true, default: 0 },
    description: { type: 'text' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('documents', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: 'organizations',
      onDelete: 'CASCADE'
    },
    document_type: { type: 'varchar(64)', notNull: true },
    title: { type: 'varchar(255)', notNull: true },
    content: { type: 'text' },
    status: { type: 'varchar(32)', notNull: true, default: 'draft' },
    created_by: {
      type: 'integer',
      references: 'users',
      onDelete: 'SET NULL'
    },
    reviewed_by: {
      type: 'integer',
      references: 'users',
      onDelete: 'SET NULL'
    },
    reviewed_at: { type: 'timestamptz' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('connector_tokens', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: 'organizations',
      onDelete: 'CASCADE'
    },
    connector_type: { type: 'varchar(64)', notNull: true },
    provider: { type: 'varchar(64)', notNull: true },
    encrypted_token: { type: 'text', notNull: true },
    refresh_token: { type: 'text' },
    expires_at: { type: 'timestamptz' },
    metadata: { type: 'jsonb', default: '{}' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('audit_log', {
    id: 'id',
    organization_id: {
      type: 'integer',
      notNull: true,
      references: 'organizations',
      onDelete: 'CASCADE'
    },
    user_id: {
      type: 'integer',
      references: 'users',
      onDelete: 'SET NULL'
    },
    event_type: { type: 'varchar(128)', notNull: true },
    entity_type: { type: 'varchar(128)' },
    entity_id: { type: 'integer' },
    details: { type: 'jsonb', default: '{}' },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createIndex('users', 'organization_id');
  pgm.createIndex('invitations', 'organization_id');
  pgm.createIndex('assessments', 'organization_id');
  pgm.createIndex('practice_statuses', 'assessment_id');
  pgm.createIndex('audit_log', 'organization_id');
};

exports.down = (pgm) => {
  pgm.dropTable('audit_log');
  pgm.dropTable('connector_tokens');
  pgm.dropTable('documents');
  pgm.dropTable('poam_items');
  pgm.dropTable('evidence');
  pgm.dropTable('practice_statuses');
  pgm.dropTable('assessments');
  pgm.dropTable('invitations');
  pgm.dropTable('users');
  pgm.dropTable('organizations');
};

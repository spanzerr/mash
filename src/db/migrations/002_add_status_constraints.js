const { query } = require('../config/database');

exports.up = (pgm) => {
  pgm.addConstraint('practice_statuses', 'source_must_be_valid', {
    check: "source IN ('ai', 'connector', 'manual')"
  });

  pgm.addConstraint('documents', 'status_must_be_valid', {
    check: "status IN ('draft', 'reviewed', 'final')"
  });

  pgm.addConstraint('assessments', 'status_must_be_valid', {
    check: "status IN ('draft', 'active', 'completed')"
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('practice_statuses', 'source_must_be_valid');
  pgm.dropConstraint('documents', 'status_must_be_valid');
  pgm.dropConstraint('assessments', 'status_must_be_valid');
};

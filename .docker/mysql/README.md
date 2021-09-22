# Setup

This contains data migrations for integration testing with a mysql database. If your application does not need to use a database, you can remove this folder.

1. Update `00_schema.sql` to create required database(s), tables, procedures, etc.
2. Create additional db migration scripts to insert data or make changes as needed (note that files will be executed in ASCII order, so helpful to name scripts with 0-padded numeric prefix)
3. Ensure db is set up in circleci `test_integrations` job in `config.yml` (see example)
4. Ensure .circleci/scripts are configured appropriately (`setup_db.sh`, `setup_hosts.sh`, `setup.sh`)
4. (Optional) Delete this file

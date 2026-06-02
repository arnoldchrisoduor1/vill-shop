import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateUsers1000000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE user_role AS ENUM ('customer', 'admin')`);
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'gen_random_uuid()' },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'role', type: 'user_role', default: "'customer'" },
          { name: 'is_banned', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamptz', default: 'now()' },
          { name: 'updated_at', type: 'timestamptz', default: 'now()' },
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
    await queryRunner.query(`DROP TYPE user_role`);
  }
}

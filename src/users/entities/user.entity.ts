import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    nullable: false,
  })
  name: string;

  @Column('text', {
    unique: true,
    nullable: false,
  })
  email: string;

  @Column('boolean', {
    nullable: false,
    default: true,
  })
  isActive: boolean;

  @BeforeInsert()
  @BeforeUpdate()
  checkFields() {
    this.name = this.name ? this.name.toLowerCase() : this.name;
    this.email = this.email ? this.email.toLowerCase() : this.email;
  }
}

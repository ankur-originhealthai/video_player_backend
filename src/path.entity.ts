import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
@Entity({ name: 'path' })
export class Path {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  url: string;
}
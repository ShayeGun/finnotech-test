import { Exclude } from 'class-transformer';
import { User } from '../../user/schema/user.schema';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, Index, } from 'typeorm';

@Entity()
export class Post {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ type: 'varchar', length: 300 })
    @Index({ unique: true })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createDateTime: Date;

    @ManyToOne(() => User, (user) => user.post)
    @JoinColumn({ name: "userId" })
    @Exclude()
    user: User;
}
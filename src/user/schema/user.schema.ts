import { Entity, Column, PrimaryGeneratedColumn, Index, BeforeInsert, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { genSalt, hash } from 'bcrypt';
import { Post } from '../../post/schema/post.schema';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({ type: 'varchar', length: 100 })
    @Index({ unique: true })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @OneToMany(() => Post, (post) => post.user, { cascade: true })
    post: Post[];

    @BeforeInsert()
    async hashPassword() {
        const salt = await genSalt(8);
        const hashedPass = await hash(this.password, salt);
        this.password = hashedPass;
    }


}
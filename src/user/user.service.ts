import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './schema/user.schema';
import { CreateUserDto } from './Dtos/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    addOne(data: CreateUserDto): Promise<User> {
        try {
            const newUser = this.usersRepository.create(data);
            return this.usersRepository.save(newUser);
        } catch (err) {
            throw new BadRequestException(err.message);
        }

    }

    findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    findOne(email: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ email });
    }

    findOneById(id: number): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
    }
}
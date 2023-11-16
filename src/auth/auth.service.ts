import { Body, Injectable, UnauthorizedException, BadRequestException, Inject } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../user/user.service";
import { CreateUserDto } from "../user/Dtos/create-user.dto";
import { compare } from "bcrypt";
import { ConfigService } from "@nestjs/config";
import { EmailDto } from "./Dtos/email.dto";
import { Transporter } from "nodemailer";
import { NODEMAILER_CLIENT } from "../mail/constants";
import { v4 as uuidv4 } from 'uuid';
import { REDIS_CLIENT } from "../redis/constants";
import { Redis } from "ioredis";

@Injectable()
export class AuthService {
    private JWT_PAYLOAD_FILTER = ['password'];

    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @Inject(REDIS_CLIENT) private readonly cacheService: Redis,
        @Inject(NODEMAILER_CLIENT) private readonly mailService: Transporter
    ) { };

    async preSignup(@Body() body: EmailDto) {
        const uuid = uuidv4();
        // console.log(uuid);

        this.cacheService.set(uuid, body.email, 'EX', this.configService.get<number>('REDIS_TTL'));

        await this.mailService.sendMail({
            from: `"test 🫥" <${this.configService.get<string>('MAIL_USER')}>`,
            to: body.email,
            subject: 'TEST VALIDATION',
            html: `<p>Dear User,</p>
            <p>Thank you for registering. Please insert this code :\n</p>
            <h3 style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;"> ${uuid}</h3>`,
        });

        return {
            data: "email was sent 😁"
        };
    }

    async signup(@Body() body: CreateUserDto, uuid: string) {
        try {
            const existedUser = await this.userService.findOne(body.email);
            if (existedUser) throw new BadRequestException('email already exist');

            const cashedEmail = await this.cacheService.get(uuid);

            if (!cashedEmail) {
                throw new BadRequestException('please verify your email');
            };

            if (cashedEmail !== body.email) {
                await this.cacheService.del(uuid);
                throw new BadRequestException('who are you? 🤔');
            }

            const newUser = await this.userService.addOne(body);

            const { accessToken } = await this.generateTokens(newUser);

            return {
                user: newUser,
                accessToken
            };
        } catch (err) {
            throw err;
        }

    };

    async login(@Body() body: CreateUserDto) {
        const existedUser = await this.userService.findOne(body.email);

        if (!existedUser) throw new BadRequestException('no such user');

        if (!await compare(body.password, existedUser.password)) throw new UnauthorizedException("incorrect password");

        const { accessToken } = await this.generateTokens(existedUser);

        return {
            user: existedUser,
            accessToken,
        };
    };

    private async generateTokens(payload: Record<string, any>) {

        const accessToken = await this.jwtService.signAsync(this.jwtPayloadFilter(payload, this.JWT_PAYLOAD_FILTER), {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_EXPIRATION'),
        });

        return { accessToken };
    }

    private jwtPayloadFilter(payload: Record<string, any>, filter: string[] = []) {
        const result: Record<string, any> = { ...payload };

        for (let f of filter) {
            if (result[f]) delete result[f];
        }

        return result;
    }


}
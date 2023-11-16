import { DynamicModule, Module, Provider } from '@nestjs/common';
import { NODEMAILER_CLIENT } from './constants';

interface OptionInterface {
    useFactory: (...args) => any;

    inject?: any[];
}

@Module({})
export class MailModule {
    static async register(otp: OptionInterface): Promise<DynamicModule> {

        const MailProvider: Provider = {
            provide: NODEMAILER_CLIENT,
            ...otp
        };

        return {
            module: MailModule,
            providers: [MailProvider],
            exports: [MailProvider],
            global: true
        };
    }
}

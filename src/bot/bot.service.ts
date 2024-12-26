import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import TelegramBot, * as telegram from 'node-telegram-bot-api'
import { UserService } from 'src/user/user.service'
import { CallbackService, GreetingService, HelpService } from './services'

@Injectable()
export class BotService implements OnModuleInit {
    constructor(
        private readonly callbackService: CallbackService,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly helpService: HelpService,
        private readonly greetingService: GreetingService
    ) {}

    async onModuleInit() {
        const telegramToken = this.configService.get('TELEGRAM_TOKEN')
        const bot: TelegramBot = new telegram(telegramToken, {
            polling: true,
        })
        await this.initBot(bot)
    }

    async initBot(bot: TelegramBot) {
        global.bot = bot
        await bot.setMyCommands([
            {
                command: '/start',
                description: 'Начать',
            },
            {
                command: '/startinterview',
                description: 'Начать собеседование',
            },
            {
                command: '/editme',
                description: 'Редактировать данные',
            },
            {
                command: '/help',
                description: 'Помощь с командами',
            },
        ])

        bot.on('message', async (msg: TelegramBot.Message) => {
            if (msg.chat.type !== 'private') return
            const chatId = msg.chat.id
            const text = msg.text
            global.msg = msg
            switch (text) {
                case '/start':
                    return this.greetingService.greeting(msg)
                case '/help':
                    return this.helpService.help(chatId)
                default:
                    break
            }
            if (!global.user) {
                const user = await this.userService.findOne(msg.chat.id)
                global.user = user
            }
            if (global.profession) {
                await this.greetingService.profession()
            } else if (global.skills) {
                await this.greetingService.skills()
            }
        })
        bot.on('callback_query', async (callbackQuery) => {
            await this.callbackService.callback(callbackQuery)
        })
    }
}

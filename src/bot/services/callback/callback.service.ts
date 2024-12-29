import { Injectable } from '@nestjs/common'
import TelegramBot from 'node-telegram-bot-api'
import { BadCommandService, StartinterviewService } from '../handling'
import { EditLevelService } from './editLevel.service'
import { EditUserService } from './editUser.service'
import { GetUsersService } from './getUsers.service'

@Injectable()
export class CallbackService {
    constructor(
        private readonly editLevelService: EditLevelService,
        private readonly editUserService: EditUserService,
        private readonly getUsersService: GetUsersService,
        private readonly badCommandService: BadCommandService,
        private readonly startinterviewService: StartinterviewService
    ) {}
    async callback(callbackQuery: TelegramBot.CallbackQuery) {
        const data = callbackQuery.data.split('_')
        const bot: TelegramBot = global.bot
        const msg = callbackQuery.message
        global.msg = msg
        const type = data[0]
        const action = data[1]
        switch (type) {
            case 'level':
                return await this.editLevelService.editLevel(
                    action,
                    callbackQuery
                )
            case 'edit':
                return await this.editUserService.editUser(
                    action,
                    callbackQuery
                )
            case 'get':
                return await this.getUsersService.start(
                    action,
                    callbackQuery.id
                )
            case 'startinterview':
                await bot.answerCallbackQuery(callbackQuery.id, {
                    text: 'Вы начали собеседование!',
                })
                return await this.startinterviewService.startinterview()
            default:
                return await this.badCommandService.badQuery()
        }
    }
}

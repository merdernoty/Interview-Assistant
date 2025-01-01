import { Injectable } from '@nestjs/common'
import TelegramBot from 'node-telegram-bot-api'
import { BadCommandService } from '../handling'
import { GetInfoService } from './getInfo.service'
import { InterviewService } from './interview'
import { EditLevelService, EditReviewService, EditUserService } from './user'

@Injectable()
export class CallbackService {
    constructor(
        private readonly editLevelService: EditLevelService,
        private readonly editUserService: EditUserService,
        private readonly getInfoService: GetInfoService,
        private readonly editReviewService: EditReviewService,
        private readonly badCommandService: BadCommandService,
        private readonly interviewService: InterviewService
    ) {}
    async callback(callbackQuery: TelegramBot.CallbackQuery) {
        const data = callbackQuery.data.split('_')
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
                return await this.getInfoService.start(action, callbackQuery.id)
            case 'review':
                return await this.editReviewService.editReview(
                    action,
                    callbackQuery.id
                )
            case 'interview':
                return await this.interviewService.start(
                    action,
                    callbackQuery.id
                )
            default:
                return await this.badCommandService.badQuery()
        }
    }
}

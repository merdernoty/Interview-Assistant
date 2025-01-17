import { Injectable } from '@nestjs/common'
import TelegramBot from 'node-telegram-bot-api'
import { User } from 'src/user/entities/user.entity'
import { UserService } from 'src/user/user.service'
import {
    BadCommandService,
    GenerateContentService,
    GreetingService,
    HelpService,
    InfoService,
    LevelService,
    MeService,
    ProfessionService,
    ReviewService,
    SkillsService,
    StartinterviewService,
} from './handling'
import { SpeechToTextService } from './handling/speechToText/speech-to-text.service'

@Injectable()
export class HandleService {
    constructor(
        private readonly userService: UserService,
        private readonly startinterviewService: StartinterviewService,
        private readonly helpService: HelpService,
        private readonly reviewService: ReviewService,
        private readonly levelService: LevelService,
        private readonly professionService: ProfessionService,
        private readonly skillsService: SkillsService,
        private readonly infoService: InfoService,
        private readonly generateContentService: GenerateContentService,
        private readonly meService: MeService,
        private readonly badCommandService: BadCommandService,
        private readonly greetingService: GreetingService,
        private readonly sttService: SpeechToTextService
    ) {}
    async handleMessage(msg: TelegramBot.Message) {
        if (msg.chat.type !== 'private') return

        const bot: TelegramBot = global.bot
        const chatId = msg.chat.id
        global.msg = msg
        if (msg.voice) {
            await bot.sendChatAction(chatId, 'typing')
            const fileLink = await bot.getFileLink(msg.voice.file_id)
            const recognizedText = await this.sttService.transcribeOgg(fileLink)

            if (recognizedText && recognizedText.length > 0) {
                return this.processTextMessage(recognizedText, msg)
            } else {
                return bot.sendMessage(chatId, 'Не удалось распознать голос.')
            }
        }
        if (!msg.text) {
            return this.badCommandService.onlyText()
        }
        return this.processTextMessage(msg.text, msg)
    }

    private async processTextMessage(text: string, msg: TelegramBot.Message) {
        const bot: TelegramBot = global.bot
        const chatId = msg.chat.id

        await bot.sendChatAction(chatId, 'typing')

        switch (text) {
            case '/start':
                return this.greetingService.greeting(msg)
            case '/help':
                return this.helpService.help(chatId)
            case '/info':
                return this.infoService.info(chatId)
            default:
                break
        }

        const user = await this.userService.findOne(chatId)
        if (
            !user?.professionExist ||
            !user?.skillsExist ||
            !user?.level ||
            user.startedReview ||
            global.id
        ) {
            if (msg?.entities && msg.entities[0]?.type === 'bot_command') {
                return this.badCommandService.noCommands()
            } else {
                return this.setUserInfo(user)
            }
        }

        return this.endOptions(text, msg, user)
    }

    async setUserInfo(user: User) {
        if (!user?.professionExist) {
            await this.professionService.getProfession()
            if (!user?.skillsExist) {
                return this.skillsService.startSkills()
            }
        } else if (!user?.skillsExist) {
            await this.skillsService.getSkills()
            if (!user.level) {
                return this.levelService.level()
            }
            return
        } else if (!user?.level) {
            return this.levelService.level()
        } else if (user?.startedReview) {
            return this.reviewService.newReview()
        } else if (global.id) {
            return this.reviewService.answerEndReview()
        }
    }

    async endOptions(text: string, msg: TelegramBot.Message, user: User) {
        switch (text) {
            case '/startinterview':
                if (user.startedInterview) {
                    return this.badCommandService.alreadyStarted()
                } else {
                    return this.startinterviewService.startinterview()
                }
            case '/endinterview':
                if (user.startedInterview) {
                    return this.startinterviewService.endinterview()
                } else {
                    return this.badCommandService.notStarted()
                }
            case '/me':
                return this.meService.getMe(msg)
            case '/review':
                return this.reviewService.getReview()
            default:
                if (msg?.entities && msg.entities[0]?.type === 'bot_command') {
                    return this.badCommandService.badCommand()
                } else if (user.startedInterview) {
                    return this.generateContentService.generateQuetion(
                        text,
                        user
                    )
                } else {
                    return this.badCommandService.badText()
                }
        }
    }
}

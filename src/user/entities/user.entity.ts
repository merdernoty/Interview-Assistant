import { Content } from '@google/generative-ai'
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: false, unique: true })
    tgId: number

    @Column({ nullable: false, default: false })
    admin: boolean

    @Column({ nullable: true, type: 'json' })
    localhistory: Content[]

    @Column({ nullable: false })
    name: string

    @Column({ nullable: true })
    nickname: string

    @Column({ nullable: true })
    profession: string

    @Column({ nullable: true, array: true, default: [], type: 'text' })
    skills: string[]

    @Column({ nullable: true })
    level: 'Intern' | 'Junior' | 'Middle' | 'Senior' | 'Lead'

    @Column({ nullable: false, default: false })
    startedReview: boolean

    @Column({ nullable: true })
    review: string

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

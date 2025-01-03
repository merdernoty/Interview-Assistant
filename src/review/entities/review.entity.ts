import { User } from 'src/user/entities/user.entity'
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'

@Entity()
export class Review {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ nullable: true })
    text: string

    @Column({ nullable: true })
    answer: string

    @Column({ nullable: false, default: false })
    watched: boolean

    @OneToOne(() => User, (user) => user.review)
    user: User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}

import {BadRequestException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {UserEntity} from "../entities/user.entity";
import {Repository} from "typeorm";
import {JwtService} from "@nestjs/jwt";
import {AuthDto} from "./dto/auth.dto";
import * as bcryptjs from 'bcryptjs'

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: AuthDto) {
    const existUser = await this.userRepository.findOneBy({email: dto.email})
    if (existUser) throw new BadRequestException('User already exist!')
    const newUser = await this.userRepository.create({
      email: dto.email,
      password: await bcryptjs.hash(dto.password, 10),
      isVerified: true
    })
    const user = await this.userRepository.save(newUser)
    return {user: this.returnUserFields(user), accessToken: await this.getAccessToken(user.id)}
  }

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto)
    return {user: this.returnUserFields(user), accessToken: await this.getAccessToken(user.id)}
  }

  async validateUser(dto: AuthDto) {
    const user = await this.userRepository.findOne({
      where: {email: dto.email},
      select: ['id', 'email', 'password']
    })
    if (!user) throw new NotFoundException('User was not found!')
    const isValidPassword = await bcryptjs.compare(dto.password, user.password)
    if (!isValidPassword) throw new NotFoundException('Invalid credentials!')
    return user
  }

  async getAccessToken(userId: number) {
    const data = {
      id: userId
    }
    return await this.jwtService.signAsync(data, {expiresIn: '7d', secret: process.env.JWT_SECRET})
  }

  returnUserFields(user: UserEntity) {
    return {id: user.id, email: user.email}
  }
}

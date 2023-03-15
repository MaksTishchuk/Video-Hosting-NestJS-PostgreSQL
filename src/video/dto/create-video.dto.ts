import {IsBoolean, IsOptional, IsString} from "class-validator";

export class CreateVideoDto {
  @IsString()
  name: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean

  @IsString()
  description: string

  @IsOptional()
  video: any

  @IsOptional()
  thumbnail: any
}
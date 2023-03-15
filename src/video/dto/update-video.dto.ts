import {IsBoolean, IsOptional, IsString} from "class-validator";

export class UpdateVideoDto {
  @IsString()
  @IsOptional()
  name?: string

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @IsOptional()
  videoPath?: string

  @IsString()
  @IsOptional()
  thumbnailPath?: string
}
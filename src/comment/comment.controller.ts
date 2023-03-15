import {
  Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards
} from '@nestjs/common';
import { CommentService } from './comment.service';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {GetUser} from "../auth/decorators/get-user.decorator";
import {CommentDto} from "./dto/comment.dto";

@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  createComment(
    @GetUser('id') id: number,
    @Body() dto: CommentDto
  ) {
    return this.commentService.createComment(id, dto)
  }

  @Get('')
  getAllComments() {
    return this.commentService.getAllComments()
  }

  @Get(':id')
  getCommentById(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.getCommentById(id)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CommentDto
  ) {
    return this.commentService.updateComment(id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.commentService.deleteComment(id)
  }
}

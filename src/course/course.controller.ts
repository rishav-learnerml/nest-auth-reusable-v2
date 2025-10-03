import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/auth/role.types';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async create(@Body() createCourseDto: CreateCourseDto) {
    const course = await this.courseService.create(createCourseDto);
    return {
      message: 'Course created successfully',
      data: course,
    };
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll() {
    const courses = await this.courseService.findAll();
    return {
      message: 'Courses fetched successfully',
      data: courses,
    };
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.courseService.findOne(id);
    return {
      message: 'Course fetched successfully',
      data: course,
    };
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const updatedCourse = await this.courseService.update(id, updateCourseDto);
    return {
      message: 'Course updated successfully',
      data: updatedCourse,
    };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.Admin)
  async remove(@Param('id') id: string) {
    await this.courseService.remove(id);
    return {
      message: 'Course deleted successfully',
    };
  }
}

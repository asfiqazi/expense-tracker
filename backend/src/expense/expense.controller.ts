import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto, ExpenseFilterDto, UpdateExpenseDto } from './dto/expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(userId, createExpenseDto);
  }

  @Get()
  findAll(@GetUser('id') userId: string, @Query() filters: ExpenseFilterDto) {
    return this.expenseService.findAll(userId, filters);
  }

  @Get('analytics')
  getAnalytics(
    @GetUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.expenseService.getExpenseAnalytics(userId, startDate, endDate);
  }

  @Get(':id')
  findOne(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.expenseService.findOne(userId, id);
  }

  @Patch(':id')
  update(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expenseService.update(userId, id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id') id: string) {
    return this.expenseService.remove(userId, id);
  }
}

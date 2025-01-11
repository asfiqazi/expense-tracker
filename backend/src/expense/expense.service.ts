import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExpenseDto, ExpenseFilterDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        ...dto,
        amount: Number(dto.amount),
        userId,
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(userId: string, filters: ExpenseFilterDto) {
    const where: any = { userId };

    if (filters.startDate) {
      where.date = {
        ...where.date,
        gte: new Date(filters.startDate),
      };
    }

    if (filters.endDate) {
      where.date = {
        ...where.date,
        lte: new Date(filters.endDate),
      };
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.expense.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, userId },
      include: {
        category: true,
      },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return expense;
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    await this.findOne(userId, id);

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...dto,
        amount: Number(dto.amount),
      },
      include: {
        category: true,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.expense.delete({
      where: { id },
    });
  }

  async getExpenseAnalytics(userId: string, startDate: string, endDate: string) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        category: true,
      },
    });

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const categoryName = expense.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += expense.amount;
      return acc;
    }, {});

    const expensesByMonth = expenses.reduce((acc, expense) => {
      const month = expense.date.toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = 0;
      }
      acc[month] += expense.amount;
      return acc;
    }, {});

    return {
      totalExpenses,
      expensesByCategory,
      expensesByMonth,
    };
  }
}

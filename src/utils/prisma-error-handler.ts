import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

function getFieldFromMeta(meta: any): string {
  if (meta && meta.target) {
    return Array.isArray(meta.target) ? meta.target.join(', ') : meta.target;
  }
  return 'unknown field';
}

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        throw new BadRequestException(
          `Duplicate field: ${getFieldFromMeta(error.meta)}`,
        );
      case 'P2003':
        throw new BadRequestException('Invalid foreign key reference.');
      case 'P2025':
        throw new NotFoundException('The requested resource does not exist.');
      case 'P2004':
        throw new ForbiddenException('Constraint violation detected.');
      default:
        throw new InternalServerErrorException(
          `Database error: ${error.message}`,
        );
    }
  } else if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    throw new InternalServerErrorException(
      'An unknown database error occurred.',
    );
  } else if (error instanceof Prisma.PrismaClientRustPanicError) {
    throw new InternalServerErrorException('A database panic occurred.');
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    throw new InternalServerErrorException('Database initialization failed.');
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    throw new BadRequestException('Validation error in database request.');
  }
  throw new InternalServerErrorException('An unexpected error occurred.');
}

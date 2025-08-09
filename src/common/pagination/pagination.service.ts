import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseResponse, PaginationMeta } from '@sopwise/common/pagination/pagination.inteface';

import { Prisma } from '@prisma/client';
import { PaginationQueryDto } from '@sopwise/common/pagination/pagination.dto';
import { SopPaginationDto } from '@sopwise/common/pagination/sop.pagination.dto';
import { PrismaService } from '@sopwise/prisma/prisma.service';

@Injectable()
export class PaginationService {
  constructor(private prisma: PrismaService) {}

  // in all cases --> search
  async paginate<T>(
    model: keyof typeof Prisma.ModelName,
    query: PaginationQueryDto,
    select?: Prisma.SelectSubset<any, any>,
  ): Promise<BaseResponse<{ data: T[]; meta: PaginationMeta }>> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        searchFields = [],
        sortBy = 'createdAt',
        sortOrder = 'desc',
        filter = {},
      } = query;

      if (!this.prisma[model]) {
        throw new BadRequestException(`Invalid model: ${model}`);
      }

      const skip = (page - 1) * limit;
      const where: any = { ...filter };

      if (search && searchFields.length > 0) {
        where.OR = searchFields.map((field) => {
          const fields = field.split('.');
          const searchCondition: any = {};
          let current = searchCondition;

          fields.forEach((f, index) => {
            if (index === fields.length - 1) {
              current[f] = { contains: search, mode: 'insensitive' };
            } else {
              current[f] = {};
              current = current[f];
            }
          });

          return searchCondition;
        });
      }

      const modelFields = Object.keys(Prisma[`${model}ScalarFieldEnum`]);
      if (!modelFields.includes(sortBy)) {
        throw new BadRequestException(`Invalid sort field: ${sortBy}`);
      }

      const [total, items] = await Promise.all([
        this.prisma[model].count({ where }),
        this.prisma[model].findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          data: items,
          meta: {
            items: {
              totalItems: total,
              limit,
              begins: skip + 1,
              ends: Math.min(skip + limit, total),
            },
            page: {
              current: page,
              previous: page > 1 ? page - 1 : null,
              next: page < totalPages ? page + 1 : null,
              total: totalPages,
              size: limit,
            },
          },
        },
      };
    } catch (error) {
      console.error('PaginationService Error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to paginate data');
    }
  }

  // homepage --> advancedSearch
  async paginateWithTransforms<T>(
    model: keyof typeof Prisma.ModelName,
    query: SopPaginationDto,
    select?: Prisma.SelectSubset<any, any>,
  ): Promise<BaseResponse<{ data: T[]; meta: PaginationMeta }>> {
    try {
      const {
        page = 1,
        limit = 10,
        search, // Object: { fieldName: { value, operator?, mode? }, ... }
        advanceSearch,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        filter = {},
      } = query;

      if (!this.prisma[model]) {
        throw new BadRequestException(`Invalid model: ${model}`);
      }

      const skip = (page - 1) * limit;
      const where: any = { ...filter };

      if (search || advanceSearch) {
        const searchConditions: any[] = [];

        if (advanceSearch) {
          // New advanced object-based search
          const objectSearchConditions = this.buildAdvancedSearchConditions(advanceSearch);
          searchConditions.push(...objectSearchConditions);
        } else if (typeof search === 'string') {
          return this.paginate(model, query, select);
        }

        if (searchConditions.length > 0) {
          where.AND = searchConditions;
        }
      }

      const modelFields = Object.keys(Prisma[`${model}ScalarFieldEnum`]);
      if (!modelFields.includes(sortBy)) {
        throw new BadRequestException(`Invalid sort field: ${sortBy}`);
      }

      const [total, items] = await Promise.all([
        this.prisma[model].count({ where }),
        this.prisma[model].findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          select,
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        data: {
          data: items,
          meta: {
            items: {
              totalItems: total,
              limit,
              begins: skip + 1,
              ends: Math.min(skip + limit, total),
            },
            page: {
              current: page,
              previous: page > 1 ? page - 1 : null,
              next: page < totalPages ? page + 1 : null,
              total: totalPages,
              size: limit,
            },
          },
        },
      };
    } catch (error) {
      console.error('PaginationService Error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException('Failed to paginate data');
    }
  }

  /**
   * Build advanced search conditions with multiple operators and modes
   * @param searchObject - Advanced search object with operators and modes
   */
  private buildAdvancedSearchConditions(searchObject: Record<string, any>): any[] {
    const conditions: any[] = [];

    for (const [fieldName, searchConfig] of Object.entries(searchObject)) {
      try {
        if (!searchConfig) continue;

        let searchValue: any;
        let operator: string = 'contains';
        let mode: string = 'insensitive';
        let logicalOperator: string = 'AND'; // For array values

        // Handle different input formats
        if (typeof searchConfig === 'string' || typeof searchConfig === 'number' || typeof searchConfig === 'boolean') {
          // Simple format: { fieldName: "searchValue" }
          searchValue = searchConfig;
        } else if (typeof searchConfig === 'object') {
          // Advanced format: { fieldName: { value, operator, mode, logicalOperator } }
          searchValue = searchConfig.value;
          operator = searchConfig.operator || 'contains';
          mode = searchConfig.mode || 'insensitive';
          logicalOperator = searchConfig.logicalOperator || 'OR';
        }

        if (searchValue === undefined || searchValue === null) continue;

        const fieldCondition = this.buildFieldCondition(fieldName, searchValue, operator, mode, logicalOperator);
        if (fieldCondition) {
          conditions.push(fieldCondition);
        }
      } catch (error) {
        console.warn(`Failed to process search for field ${fieldName}:`, error.message);
      }
    }

    return conditions;
  }

  /**
   * Build condition for a specific field with advanced operators
   * @param fieldPath - Field path (supports dot notation)
   * @param value - Search value(s)
   * @param operator - Search operator
   * @param mode - Search mode (for string operations)
   * @param logicalOperator - Logical operator for array values
   */
  private buildFieldCondition(
    fieldPath: string,
    value: any,
    operator: string,
    mode: string,
    logicalOperator: string,
  ): any {
    const fields = fieldPath.split('.');

    // Handle array values
    if (Array.isArray(value)) {
      const arrayConditions = value
        .map((v) => this.buildSingleFieldCondition(fields, v, operator, mode))
        .filter(Boolean);

      if (arrayConditions.length === 0) return null;
      if (arrayConditions.length === 1) return arrayConditions[0];

      return logicalOperator === 'AND' ? { AND: arrayConditions } : { OR: arrayConditions };
    }

    return this.buildSingleFieldCondition(fields, value, operator, mode);
  }

  /**
   * Build condition for a single field value
   * @param fields - Array of field parts (from dot notation split)
   * @param value - Search value
   * @param operator - Search operator
   * @param mode - Search mode
   */
  private buildSingleFieldCondition(fields: string[], value: any, operator: string, mode: string): any {
    const condition: any = {};
    let current = condition;

    // Navigate to the target field
    fields.forEach((field, index) => {
      if (index === fields.length - 1) {
        // Apply the condition at the target field
        current[field] = this.getOperatorCondition(value, operator, mode);
      } else {
        current[field] = {};
        current = current[field];
      }
    });

    return condition;
  }

  /**
   * Get the appropriate Prisma condition based on operator
   * @param value - Search value
   * @param operator - Search operator
   * @param mode - Search mode
   */
  private getOperatorCondition(value: any, operator: string, mode: string): any {
    const isCaseInsensitive = mode === 'insensitive' && typeof value === 'string';

    switch (operator.toLowerCase()) {
      case 'equals':
      case 'eq':
        return { equals: value };

      case 'not':
      case 'ne':
        return { not: value };

      case 'contains':
        return isCaseInsensitive ? { contains: value, mode: 'insensitive' } : { contains: value };

      case 'startswith':
      case 'starts':
        return isCaseInsensitive ? { startsWith: value, mode: 'insensitive' } : { startsWith: value };

      case 'endswith':
      case 'ends':
        return isCaseInsensitive ? { endsWith: value, mode: 'insensitive' } : { endsWith: value };

      case 'gt':
      case 'greaterthan':
        return { gt: value };

      case 'gte':
      case 'greaterthanorequal':
        return { gte: value };

      case 'lt':
      case 'lessthan':
        return { lt: value };

      case 'lte':
      case 'lessthanorequal':
        return { lte: value };

      case 'in':
        return Array.isArray(value) ? { in: value } : { in: [value] };

      case 'notin':
        return Array.isArray(value) ? { notIn: value } : { notIn: [value] };

      case 'null':
      case 'isnull':
        return { equals: null };

      case 'notnull':
      case 'isnotnull':
        return { not: null };

      case 'empty':
      case 'isempty':
        return { equals: '' };

      case 'notempty':
      case 'isnotempty':
        return { not: '' };

      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          return { gte: value[0], lte: value[1] };
        }
        throw new BadRequestException('Between operator requires array with exactly 2 values');

      case 'regex':
      case 'regexp':
        // Note: Prisma doesn't support regex directly, but some databases do
        // You might need to use raw queries for complex regex
        return { contains: value, mode: 'insensitive' };

      default:
        // Default to contains for unknown operators
        return isCaseInsensitive ? { contains: value, mode: 'insensitive' } : { contains: value };
    }
  }

  // Legacy method - kept for backward compatibility
  private buildTextSearchConditions(searchFields: string[], search: string): any[] {
    return searchFields.map((field) => {
      return this.buildSingleFieldCondition(field.split('.'), search, 'contains', 'insensitive');
    });
  }

  /**
   * Validate advanced search object structure
   * @param searchObject - Search object to validate
   * @param model - Model name for validation
   */
  async validateAdvancedSearch(
    searchObject: Record<string, any>,
    model: keyof typeof Prisma.ModelName,
  ): Promise<string[]> {
    const errors: string[] = [];
    const modelFields = Object.keys(Prisma[`${model}ScalarFieldEnum`]);
    const validOperators = [
      'equals',
      'eq',
      'not',
      'ne',
      'contains',
      'startswith',
      'starts',
      'endswith',
      'ends',
      'gt',
      'greaterthan',
      'gte',
      'greaterthanorequal',
      'lt',
      'lessthan',
      'lte',
      'lessthanorequal',
      'in',
      'notin',
      'null',
      'isnull',
      'notnull',
      'isnotnull',
      'empty',
      'isempty',
      'notempty',
      'isnotempty',
      'between',
      'regex',
      'regexp',
    ];

    for (const [fieldName, searchConfig] of Object.entries(searchObject)) {
      // Validate field exists (basic validation - you might want to enhance this for relations)
      const rootField = fieldName.split('.')[0];
      if (!modelFields.includes(rootField)) {
        console.warn(`Field ${rootField} not found in model ${model}. This might be a relation field.`);
      }

      // Validate operator if provided
      if (typeof searchConfig === 'object' && searchConfig.operator) {
        const operator = searchConfig.operator.toLowerCase();
        if (!validOperators.includes(operator)) {
          errors.push(
            `Invalid operator '${
              searchConfig.operator
            }' for field '${fieldName}'. Valid operators: ${validOperators.join(', ')}`,
          );
        }

        // Validate between operator
        if (operator === 'between' && (!Array.isArray(searchConfig.value) || searchConfig.value.length !== 2)) {
          errors.push(`Between operator for field '${fieldName}' requires an array with exactly 2 values`);
        }
      }

      // Validate mode if provided
      if (typeof searchConfig === 'object' && searchConfig.mode) {
        const validModes = ['default', 'insensitive'];
        if (!validModes.includes(searchConfig.mode)) {
          errors.push(
            `Invalid mode '${searchConfig.mode}' for field '${fieldName}'. Valid modes: ${validModes.join(', ')}`,
          );
        }
      }

      // Validate logicalOperator if provided
      if (typeof searchConfig === 'object' && searchConfig.logicalOperator) {
        const validLogicalOperators = ['OR', 'AND'];
        if (!validLogicalOperators.includes(searchConfig.logicalOperator)) {
          errors.push(
            `Invalid logicalOperator '${
              searchConfig.logicalOperator
            }' for field '${fieldName}'. Valid operators: ${validLogicalOperators.join(', ')}`,
          );
        }
      }
    }

    return errors;
  }

  /**
   * Get supported search operators
   */
  getSupportedOperators(): string[] {
    return [
      'equals',
      'eq',
      'not',
      'ne',
      'contains',
      'startswith',
      'starts',
      'endswith',
      'ends',
      'gt',
      'greaterthan',
      'gte',
      'greaterthanorequal',
      'lt',
      'lessthan',
      'lte',
      'lessthanorequal',
      'in',
      'notin',
      'null',
      'isnull',
      'notnull',
      'isnotnull',
      'empty',
      'isempty',
      'notempty',
      'isnotempty',
      'between',
      'regex',
      'regexp',
    ];
  }
}

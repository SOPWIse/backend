import { Transform, Type } from 'class-transformer';
import { IsArray, IsEnum, IsNumber, IsObject, IsOptional, IsString, Min, ValidateIf } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

export class SopPaginationDto {
  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    description: 'Page number for pagination',
    example: 1,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    minimum: 1,
    default: 10,
    description: 'Number of items per page',
    example: 10,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Simple text search string (legacy support)',
    example: 'john doe',
    type: String,
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: `
Advanced, field-specific search filter.  

Supports the following operators:  
- \`equals\` / \`not\` — exact match / not equal  
- \`contains\` / \`startswith\` / \`endswith\` — partial string matching  
- \`gt\` / \`gte\` / \`lt\` / \`lte\` — numeric/date comparisons  
- \`in\` / \`notin\` — match against a list of values  
- \`between\` — range queries (numeric/date)  
- \`null\` / \`notnull\` — check for null values  
- \`empty\` / \`notempty\` — check for empty strings/arrays  

**Additional options:**  
- \`mode\`: "insensitive" for case-insensitive text matching  
- \`logicalOperator\`: "AND" / "OR" for combining multiple values  

**Usage formats:**  
1. **Simple:**  
\`\`\`json
{ "name": "john", "status": "active" }
\`\`\`  

2. **Advanced:**  
\`\`\`json
{
  "name": { "value": "john", "operator": "startswith", "mode": "insensitive" },
  "age": { "value": 25, "operator": "gte" },
  "tags": { "value": ["tag1", "tag2"], "operator": "in", "logicalOperator": "OR" }
}
\`\`\`  

**For query params:** send as a JSON string.
  `,
    type: 'object',
    examples: [
      {
        summary: 'Simple search',
        value: { name: 'john', status: 'active' },
      },
      {
        summary: 'Advanced search',
        value: {
          name: { value: 'john', operator: 'startswith', mode: 'insensitive' },
          age: { value: 25, operator: 'gte' },
          tags: { value: ['tag1', 'tag2'], operator: 'in', logicalOperator: 'OR' },
        },
      },
    ],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    }
    return value;
  })
  advanceSearch?: Record<string, any>;

  @ApiPropertyOptional({
    type: [String],
    description: 'Fields to search in for text search (legacy support). Supports dot notation for nested fields.',
    example: ['name', 'description', 'user.email', 'profile.address.city'],
    isArray: true,
  })
  @ValidateIf((o) => o.searchFields !== undefined)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value];
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  searchFields?: string[];

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
    type: String,
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiPropertyOptional({
    enum: ['asc', 'desc'],
    default: 'desc',
    description: 'Sort order direction',
    example: 'desc',
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Additional filter conditions as key-value pairs',
    type: 'object',
    example: {
      status: 'active',
      isDeleted: false,
      'user.role': 'admin',
    },
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  filter?: Record<string, any>;
}

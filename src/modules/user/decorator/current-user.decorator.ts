import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SopWiseUser } from '@prisma/client';

export const GetCurrentUser = createParamDecorator((data: keyof SopWiseUser | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user = request.user;

  return data ? user?.[data] : user;
});

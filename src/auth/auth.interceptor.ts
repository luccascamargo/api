import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response: Response = ctx.getResponse<Response>();

    return next.handle().pipe(
      tap((data) => {
        if (data.accessToken) {
          response.cookie('accessToken', data.accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/',
          });
          // response.cookie('refreshToken', data.refreshToken, {
          //   httpOnly: true,
          //   sameSite: 'strict',
          //   path: '/',
          // });
        }
      }),
    );
  }
}

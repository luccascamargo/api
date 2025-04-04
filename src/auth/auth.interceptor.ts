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
            secure: true,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            path: '/',
          });
        }
        if (data.refreshToken) {
          response.cookie('refreshToken', data.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            path: '/',
          });
        }
      }),
    );
  }
}

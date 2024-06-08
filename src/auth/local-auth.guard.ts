import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log('Ativando LocalAuthGuard...');
    const result = (await super.canActivate(context)) as boolean;
    return result;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      console.log(
        'Erro ou usuário não autenticado:',
        err || 'Usuário não encontrado',
      );
      throw err || new UnauthorizedException();
    }
    console.log('Usuário autenticado:', user);
    return user;
  }
}

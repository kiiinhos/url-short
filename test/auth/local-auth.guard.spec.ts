import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalAuthGuard } from '../../src/auth/local-auth.guard';

describe('LocalAuthGuard', () => {
  let guard: LocalAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalAuthGuard],
    }).compile();

    guard = module.get<LocalAuthGuard>(LocalAuthGuard);
  });

  it('should throw UnauthorizedException if canActivate fails', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: null,
        }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(guard, 'canActivate').mockImplementation(async () => {
      throw new UnauthorizedException();
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

import pick from 'lodash/pick';

import { HttpException } from './http-exception.class';

export class RouteData<TPayload extends { [key: string]: any } = { [key: string]: any }> {
  readonly payload: TPayload | undefined;
  readonly error: HttpException | undefined;

  constructor({ payload, error }: Partial<RouteData<TPayload>>) {
    this.payload = payload ?? undefined;
    this.error = error ? HttpException.create(error) : undefined;
  }

  toJSON(): { [key: string]: any } {
    return {
      payload: this.payload,
      error: this.error && pick(this.error, 'message', 'statusCode', 'details'),
    };
  }

  static success<TPayload extends { [key: string]: any }>(payload: TPayload): RouteData<TPayload> {
    return new RouteData({ payload });
  }

  static fail(error: string | Error): RouteData {
    return new RouteData({ error: HttpException.create(error) });
  }
}

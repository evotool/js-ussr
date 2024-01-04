import { type FunctionComponent } from 'preact';

import { type HttpException } from '../classes/http-exception.class';
import { RESPONSE } from '../constants';
import { useInjection } from '../hooks/use-injection.hook';

const MESSAGES = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  504: 'Gateway Timeout',
};

export const ErrorPage: FunctionComponent<RouteErrorProps> = (props) => {
  const { error } = props;

  const res = useInjection<import('http').ServerResponse>(RESPONSE);

  const statusCode = (error as HttpException).statusCode || 500;

  if (res) {
    res.statusCode = statusCode;
  }

  const message = MESSAGES[statusCode];

  return (
    <div style="margin:0 auto;max-width:100%;width:700px;padding:3rem 2rem">
      <h1>
        {statusCode} {message}
      </h1>
      <p style="white-space:pre;font-family:monospace">{error.message}</p>
    </div>
  );
};

export interface RouteErrorProps {
  error: Error;
}

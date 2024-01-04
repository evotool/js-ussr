
import { useInjection } from './use-injection.hook';
import { Router } from '../classes/router.class';

export function useRouter(): Router {
  const router = useInjection(Router);

  void router.snapshot;

  return router;
}

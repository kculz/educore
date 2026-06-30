import { SetMetadata } from '@nestjs/common';

export const PUBLIC_ROUTE_KEY = 'educore:public-route';
export const ANONYMOUS_ROUTE_KEY = 'educore:anonymous-route';
export const ACCESS_SCOPE_KEY = 'educore:access-scope';

export interface PlatformAccessScope {
  productCode?: string;
  permission?: string;
  featureFlag?: string;
}

export const PublicRoute = () => SetMetadata(PUBLIC_ROUTE_KEY, true);
export const AnonymousRoute = () => SetMetadata(ANONYMOUS_ROUTE_KEY, true);
export const AccessScope = (scope: PlatformAccessScope) => SetMetadata(ACCESS_SCOPE_KEY, scope);


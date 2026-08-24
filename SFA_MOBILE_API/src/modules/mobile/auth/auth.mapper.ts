import type { AppVersionRow, CompanyIdByDeviceResponseItem } from './auth.types';

export function mapCompanyDeviceResponse(
  appVersion: AppVersionRow | null
): CompanyIdByDeviceResponseItem[] {
  return [
    {
      status: '1',
      url: appVersion?.url ?? null,
      ver: appVersion?.verno ?? null
    }
  ];
}

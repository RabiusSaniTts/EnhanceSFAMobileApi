import type { AppVersionRow, CompanyIdByDeviceResponseItem } from './index.types';

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

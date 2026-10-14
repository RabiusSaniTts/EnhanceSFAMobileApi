interface AppVersionRow {
  url: string | null;
  verno: string | null;
}

interface CompanyIdByDeviceResponseItem {
  status: string;
  url: string | null;
  ver: string | null;
}

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

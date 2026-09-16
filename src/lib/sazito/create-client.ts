import {
  createSazitoClient as createSdkSazitoClient,
  type SazitoClient,
  type SazitoConfig,
} from "@sazito/client-sdk";

const PREFERRED_REGION_NAME = "تهران";
const PREFERRED_CITY_NAME = "تهران";

function prioritizeLocation<T extends { name: string }>(
  locations: readonly T[],
  preferredName: string,
) {
  return [...locations].sort(
    (left, right) =>
      Number(right.name.trim() === preferredName) -
      Number(left.name.trim() === preferredName),
  );
}

function prioritizeRegions(client: SazitoClient) {
  const listRegions = client.regions.list.bind(client.regions);

  client.regions.list = async (...args) => {
    const response = await listRegions(...args);
    if (!response.data) return response;

    return {
      ...response,
      data: prioritizeLocation(response.data, PREFERRED_REGION_NAME).map(
        (region) => ({
          ...region,
          cities: prioritizeLocation(region.cities, PREFERRED_CITY_NAME),
        }),
      ),
    };
  };
}

function defaultDebugValue() {
  const configuredValue =
    process.env.SAZITO_DEBUG ?? process.env.NEXT_PUBLIC_SAZITO_DEBUG;

  if (configuredValue === undefined) return true;
  return configuredValue.trim() === "true";
}

/** Create an SDK client with the storefront defaults applied consistently. */
export function createSazitoClient(
  initialProps: SazitoConfig,
): SazitoClient {
  const client = createSdkSazitoClient({
    debug: defaultDebugValue(),
    ...initialProps,
  });
  prioritizeRegions(client);
  return client;
}

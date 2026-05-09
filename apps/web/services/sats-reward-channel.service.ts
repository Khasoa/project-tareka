import { apiClient } from "@/lib/api";
import type {
  RecyclerSatsParticipationSummary,
  RecyclerSatsPayoutPreferences,
  SatsRewardRailsReference,
} from "@/types";

export async function getSatsPreferences(): Promise<RecyclerSatsPayoutPreferences> {
  const { data } = await apiClient.get<RecyclerSatsPayoutPreferences>(
    "/reward-channels/sats/me/preferences",
  );
  return data;
}

export async function putSatsPreferences(
  body: RecyclerSatsPayoutPreferences,
): Promise<RecyclerSatsPayoutPreferences> {
  const { data } = await apiClient.put<RecyclerSatsPayoutPreferences>(
    "/reward-channels/sats/me/preferences",
    body,
  );
  return data;
}

export async function getSatsSummary(): Promise<RecyclerSatsParticipationSummary> {
  const { data } = await apiClient.get<RecyclerSatsParticipationSummary>(
    "/reward-channels/sats/me/summary",
  );
  return data;
}

export async function getSatsRailsReference(): Promise<SatsRewardRailsReference> {
  const { data } = await apiClient.get<SatsRewardRailsReference>("/reward-channels/sats/rails");
  return data;
}

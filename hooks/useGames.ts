// import { Match } from "@/model/match";

import useSWR from 'swr';

// async function createGames(scheduleId: string, match: Match[]) {
//   return fetch(`/api/games/${scheduleId}`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json'},
//     body: JSON.stringify({ scheduleId, match})
//   }).then((res) => res.json());
// }

export default function useGame(scheduleId: string) {
  const {
    data: game,
    isLoading,
    error,
  } = useSWR(`/api/games/${scheduleId}`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    game,
    isLoading,
    error,
  };
}

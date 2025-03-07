// import { Match } from "@/model/match";

import useSWR from 'swr';

type GameProps = {
  courtName: string;
};

export default function useGame(scheduleId: string) {
  const {
    data: game,
    isLoading,
    error,
  } = useSWR<GameProps>(`/api/games/${scheduleId}`, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return {
    game,
    isLoading,
    error,
  };
}

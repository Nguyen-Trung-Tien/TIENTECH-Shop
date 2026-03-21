import { useQuery } from "@tanstack/react-query";
import { getUserApi } from "../api/userApi";
import { useSelector } from "react-redux";

export const useCurrentUser = () => {
  const userRedux = useSelector((state) => state.user.user);
  return useQuery({
    queryKey: ["me", userRedux?.id],
    queryFn: () => getUserApi(userRedux.id),
    enabled: !!userRedux?.id,
    staleTime: Infinity,
    cacheTime: Infinity,
    retry: false,
  });
};

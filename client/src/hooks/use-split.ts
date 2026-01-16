import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ProcessRequest, type ProcessResponse } from "@shared/routes";

// Hook for processing names
export function useSplitNames() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProcessRequest) => {
      // Client-side validation using Zod
      const validated = api.split.process.input.parse(data);
      
      const res = await fetch(api.split.process.path, {
        method: api.split.process.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.split.process.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error('Failed to process names');
      }

      return api.split.process.responses[200].parse(await res.json());
    },
    // Invalidate history so the sidebar updates automatically
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.split.history.path] });
    }
  });
}

// Hook for fetching history
export function useHistory() {
  return useQuery({
    queryKey: [api.split.history.path],
    queryFn: async () => {
      const res = await fetch(api.split.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.split.history.responses[200].parse(await res.json());
    }
  });
}

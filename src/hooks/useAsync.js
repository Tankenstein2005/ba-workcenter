import { useCallback, useEffect, useState } from "react";

export function useAsync(loader) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await loader();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    execute().catch(() => null);
  }, [execute]);

  return { data, error, loading, execute, setData };
}

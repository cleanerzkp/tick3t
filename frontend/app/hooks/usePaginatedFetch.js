// hooks/usePaginatedFetch.js
import { useState } from "react";

export const usePaginatedFetch = (baseUrl, initialParams) => {
  const [data, setData] = useState([]);
  const [pageKey, setPageKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNextPage = async (additionalParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL(baseUrl);
      const params = { ...initialParams, pageKey, ...additionalParams };

      Object.entries(params).forEach(([key, value]) => {
        if (value) url.searchParams.append(key, value);
      });

      const response = await fetch(url.toString());
      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Failed to fetch");

      setData((prev) => [...prev, ...result.ownedNfts]);
      setPageKey(result.pageKey || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, fetchNextPage, loading, error, hasMore: !!pageKey };
};
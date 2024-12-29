let apiUsageExceeded = false;
let resetTimeout: NodeJS.Timeout | null = null;

/**
 * Handles rate limit headers from the third-party API.
 */
export const handleApiRateLimit = (headers: any) => {
  const remainingRequests = parseInt(
    headers['x-ratelimit-requests-remaining'],
    10
  );

  console.log('Performing API call. Remaining requests:', remainingRequests);

  const resetTime = parseInt(headers['x-ratelimit-requests-reset'], 10);

  // Requests in transit could eat up, use a buffer to avoid the race condition
  if (remainingRequests <= 100) {
    apiUsageExceeded = true;

    if (resetTimeout) clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
      apiUsageExceeded = false;
      console.log('API quota reset. Resuming requests.');
    }, resetTime * 1000);
  }
};

/**
 * Checks if the API usage limit has been exceeded.
 * @returns Boolean indicating if API usage is currently blocked.
 */
export const isApiUsageExceeded = (): boolean => {
  return apiUsageExceeded;
};

import axios from 'axios';

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

const MAX_REQUESTS_PER_SECOND = 20;
const MAX_RETRIES = 1;
let requestQueue: (() => void)[] = [];
let isProcessingQueue = false;

/**
 * Processes the request queue at a controlled rate.
 */
const processQueue = () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  const interval = setInterval(() => {
    if (requestQueue.length === 0) {
      clearInterval(interval);
      isProcessingQueue = false;
      return;
    }

    const nextRequest = requestQueue.shift();
    if (nextRequest) nextRequest();
  }, 1000 / MAX_REQUESTS_PER_SECOND);
};

/**
 * A wrapper around Axios to handle rate-limiting and retries.
 * @param config Axios request configuration.
 * @returns A promise resolving to the Axios response.
 */
export const rateLimitedAxios = (config: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    const executeRequest = async (retryCount: number) => {
      try {
        const response = await axios(config);
        resolve(response);
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          console.warn(
            `Retrying request... (${retryCount + 1}/${MAX_RETRIES})`
          );
          requestQueue.push(() => executeRequest(retryCount + 1));
          processQueue();
        } else {
          console.error('Request failed after retries:', error);
          reject(error);
        }
      }
    };

    requestQueue.push(() => executeRequest(0));
    processQueue();
  });
};

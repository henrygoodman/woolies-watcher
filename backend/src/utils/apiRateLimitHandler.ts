import axios from 'axios';

export class ApiRateLimitExceededError extends Error {
  constructor(message = 'API rate limit exceeded') {
    super(message);
    this.name = 'ApiRateLimitExceededError';
  }
}

class RateLimiter {
  private apiUsageExceeded: boolean;
  private resetTimeout: NodeJS.Timeout | null;
  private maxRequestsPerSecond: number;
  private maxRetries: number;
  private requestQueue: (() => void)[];
  private isProcessingQueue: boolean;

  constructor(maxRequestsPerSecond = 20, maxRetries = 1) {
    this.apiUsageExceeded = false;
    this.resetTimeout = null;
    this.maxRequestsPerSecond = maxRequestsPerSecond;
    this.maxRetries = maxRetries;
    this.requestQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Handles rate limit headers from the third-party API.
   */
  private handleApiRateLimit(headers: any) {
    const remainingRequests = parseInt(
      headers['x-ratelimit-requests-remaining'],
      10
    );

    const dailyLimit = parseInt(headers['x-ratelimit-requests-limit'], 10);

    if (remainingRequests <= dailyLimit / 10) {
      console.warn(
        'Reaching RapidAPI request limit:',
        remainingRequests,
        ' remaining'
      );
    }

    const resetTime = parseInt(headers['x-ratelimit-requests-reset'], 10);

    if (remainingRequests <= 100) {
      this.apiUsageExceeded = true;

      if (this.resetTimeout) clearTimeout(this.resetTimeout);
      this.resetTimeout = setTimeout(() => {
        this.apiUsageExceeded = false;
        console.log('API quota reset. Resuming requests.');
      }, resetTime * 1000);
    }
  }

  /**
   * Checks if the API usage limit has been exceeded.
   */
  isApiUsageExceeded(): boolean {
    return this.apiUsageExceeded;
  }

  /**
   * Processes the request queue at a controlled rate.
   */
  private processQueue() {
    if (this.isProcessingQueue) return;
    this.isProcessingQueue = true;

    const interval = setInterval(() => {
      if (this.requestQueue.length === 0) {
        clearInterval(interval);
        this.isProcessingQueue = false;
        return;
      }

      const nextRequest = this.requestQueue.shift();
      if (nextRequest) nextRequest();
    }, 1000 / this.maxRequestsPerSecond);
  }

  /**
   * A wrapper around Axios to handle rate-limiting and retries.
   */
  async fetch(config: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const executeRequest = async (retryCount: number) => {
        if (this.apiUsageExceeded) {
          console.warn('API usage limit exceeded. Blocking request.');
          return reject(new ApiRateLimitExceededError());
        }

        try {
          const response = await axios(config);

          if (response.headers) {
            this.handleApiRateLimit(response.headers);
          }

          resolve(response);
        } catch (error: any) {
          if (retryCount < this.maxRetries) {
            console.warn(
              `Retrying request (${retryCount + 1}/${this.maxRetries})`
            );
            this.requestQueue.push(() => executeRequest(retryCount + 1));
            this.processQueue();
          } else {
            console.error(`Request failed after ${this.maxRetries} retries`, {
              method: config.method,
              url: config.url,
              params: config.params,
              headers: config.headers,
            });
            reject(error);
          }
        }
      };

      this.requestQueue.push(() => executeRequest(0));
      this.processQueue();
    });
  }
}

export const rateLimiter = new RateLimiter();

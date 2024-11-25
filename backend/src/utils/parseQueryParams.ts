import { Request } from 'express';

interface SearchQueryParams {
  query: string;
  page: number;
  size: number;
}

export const parseQueryParams = (req: Request): SearchQueryParams | null => {
  const query = req.query.query as string;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const size = req.query.size ? parseInt(req.query.size as string, 10) : 20;

  if (!query) {
    return null;
  }

  return { query, page, size };
};

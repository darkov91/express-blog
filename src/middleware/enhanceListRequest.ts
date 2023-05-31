import { Request, Response } from "express";
import { Model, Query } from "mongoose";

type Page = { page: number; limit: number };
type PaginationDescriptor = { next?: Page; prev?: Page };

export type EnhancedListResponse<ResultType> = Response<ResultType[]> & {
  enhancedListResult: {
    count: number;
    pagination: PaginationDescriptor;
    data: ResultType[];
    success: boolean;
  };
};

/**
 * Middleware that adds the functionality to:
 * 1. Select particular fields by passing the `select` query param (`&select=name,email`)
 * 2. Sort by particular field(s) (sort=name for asc, sort=-name for desc)
 * 3. Pagination by providing the page and limit parameters (`&page=1&limit=20`)
 *
 * @param model The model that is queried
 * @param populate Populate the given model fields
 */
const enhanceListRequest =
  <DocType, ResultType>(model: Model<DocType>, populate?: string | string[]) =>
  async (req: Request, res: EnhancedListResponse<ResultType>, next) => {
    type QueryType = Query<ResultType[], DocType>;
    let query: QueryType;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resources
    query = model.find(JSON.parse(queryStr)) as QueryType;

    // Select Fields
    if (req.query.select) {
      const fields = (req.query.select as string).split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = (req.query.sort as string).split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    if (populate) {
      query = query.populate(populate) as QueryType;
    }
    // Executing query
    const results = await query;

    // Pagination result
    const pagination: PaginationDescriptor = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.enhancedListResult = {
      success: true,
      count: results.length,
      pagination,
      data: results,
    };

    next();
  };

export default enhanceListRequest;

import mongoose from "mongoose";

// *************** Query Helpers ************ //
// this >>> query
// helper method should return a query

// *************** Pagination ************ //
mongoose.Query.prototype.paginate = function (page) {
  if (!page) return this;
  page = page < 1 || isNaN(page) ? 1 : page;
  const limit = 2;
  const skip = limit * (page - 1);

  return this.skip(skip).limit(limit);
};

// *************** Selection ************ //
// select >>> don't return the virtual populate
mongoose.Query.prototype.customSelect = function (modelKeys, fields) {
  if (!fields) return this;

  // query keys
  const queryKeys = fields.split(" ");

  // matched keys
  const matchedKeys = queryKeys.filter((key) => modelKeys.includes(key));

  return this.select(matchedKeys);
};

// *************** Filter ************ //
export const search = function (modelKeys, queryParams) {
  // query keys
  const queryKeys = Object.keys(queryParams);

  // matched keys
  const matchedKeys = queryKeys.filter((key) => modelKeys.includes(key));
  if (!matchedKeys.length) return;

  const options =
    matchedKeys.map((key) => {
      const option = {};
      option[key] = { $regex: queryParams[key], $options: "i" };
      return option;
    }) || "";

  return { $or: options };
};

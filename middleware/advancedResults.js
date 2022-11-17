const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // copy the request query
  const reqQuery = { ...req.query };

  // fields to exclude from the query
  const removeFields = ["select", "sort", "page", "limit"];

  // loop over removeFields and delete them from the request query
  removeFields.forEach((param) => delete reqQuery[param]);
  // console.log(reqQuery);

  // create the query string
  let queryStr = JSON.stringify(reqQuery);

  // format operators
  // gt -> $gt
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  console.log(queryStr);

  // find resource
  query = model.find(JSON.parse(queryStr));

  // select only relevant fields if the request param has the select option
  if (req.query.select) {
    // split fields into an array then join into a string separated by spaces
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    // default sort by date
    query = query.sort("-createdAt");
  }

  // pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // populate
  if (populate) {
    query = query.populate(populate);
  }

  // execute query
  const results = await query;

  // pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination: pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;

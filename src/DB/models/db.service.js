// src/DB/db.service.js

export const findOne = async ({
  model,
  filter = {},
  select = "",
  populate = [],
} = {}) => {
  return await model.findOne(filter).select(select).populate(populate);
};

export const findById = async ({
  model,
  id,
  select = "",
  populate = [],
} = {}) => {
  return await model.findById(id).select(select).populate(populate);
};

export const create = async ({
  model,
  data = [{}],
  options = { validateBeforeSave: true },
} = {}) => {
  return await model.create(data, options);
};

export const findByIdAndUpdate = async ({
  model,
  id,
  data = {},
  options = {},
  select = "",
  populate = [],
} = {}) => {
  return await model
    .findByIdAndUpdate(id, data, { new: true, runValidators: true, ...options })
    .select(select)
    .populate(populate);
};

export const findOneAndUpdate = async ({
  model,
  filter = {},
  data = {},
  options = {},
  select = "",
  populate = [],
} = {}) => {
  return await model
    .findOneAndUpdate(filter, data, { new: true, runValidators: true, ...options })
    .select(select)
    .populate(populate);
};

export const updateOne = async ({
  model,
  filter = {},
  data = {},
  options = {},
  select = "",
  populate = [],
} = {}) => {
  const result = await model.updateOne(
    filter,
    data,
    { runValidators: true, ...options }
  );

  // مفيش chaining للـ updateOne زي findOneAndUpdate → فبنشيل select/populate
  return result;
};

export const deleteOne = async ({ model, filter = {} } = {}) => {
  return await model.deleteOne(filter);
};
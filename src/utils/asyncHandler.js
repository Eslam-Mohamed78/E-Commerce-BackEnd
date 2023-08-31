const asyncHandler = (controller) => {
  return (req, res, next) => {
    controller(req, res, next).catch((error) => next(error));
  };
};

export default asyncHandler
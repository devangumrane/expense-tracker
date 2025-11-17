export default function responseFormatter(req, res, next) {
  res.success = (data = null, message = "OK", status = 200) => {
    return res.status(status).json({
      success: true,
      message,
      data,
    });
  };

  res.fail = (message = "Bad request", status = 400, data = null) => {
    return res.status(status).json({
      success: false,
      message,
      data,
    });
  };

  next();
}

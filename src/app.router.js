import authRouter from "./modules/auth/auth.router.js";
import categoryRouter from "./modules/category/category.router.js";
import subcategoryRouter from "./modules/subcategory/subcategory.router.js";
import brandRouter from "./modules/brand/brand.router.js";
import productRouter from "./modules/product/product.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js";
import morgan from "morgan";
import cors from "cors";

export const appRouter = (app, express) => {
  // morgan >> information about each request
  if (process.env.NODE_ENV === "dev") {
    app.use(morgan("dev"));
  }

  //************** CORS Policy ****************//
  // const whiteList = ["http://127.0.0.1:3000"];

  // app.use((req, res, next) => {
  //   // prints the address who try to access the server
  //   console.log("header-origin", req.header("origin"));

  //   // activate account api (endPoint)
  //   if (req.originalUrl.includes("/auth/confirmEmail")) {
  //     res.setHeader("Access-Control-Allow-Origin", "*");
  //     res.setHeader("Access-Control-Allow-Methods", "GET");
  //     return next();
  //   }

  //   if (!whiteList.includes(req.header("origin"))) {
  //     return next(new Error("Blocked By CORS Policy!"));
  //   }

  //   // * will be in whiteList >> passed condition
  //   res.setHeader("Access-Control-Allow-Origin", "*"); // origins (urls)
  //   res.setHeader("Access-Control-Allow-Headers", "*"); // Headers (like content-type ....)
  //   res.setHeader("Access-Control-Allow-Methods", "*"); // Methods (like get/ post/...)
  //   res.setHeader("Access-Control-Allow-Private-Network", true);
  //   return next();
  // });

  // cors package
  app.use(cors());

  // Global middleware
  app.use(express.json());

  // Routes
  app.use("/auth", authRouter);

  app.use("/category", categoryRouter);

  app.use("/subcategory", subcategoryRouter);

  app.use("/brand", brandRouter);

  app.use("/product", productRouter);

  app.use("/coupon", couponRouter);

  app.use("/cart", cartRouter);

  app.use("/order", orderRouter);

  // for all methods if the input path not equal any of previous.
  app.all("*", (req, res, next) => {
    return next(new Error("Page Not Found!", { cause: 404 }));
  });

  // Global  error handler
  app.use((error, req, res, next) => {
    return res.status(error.cause || 500).json({
      success: false,
      message: error.message,
      error,
      stack: error.stack,
    });
  });
};

import asyncHandler from "../../utils/asyncHandler.js";
import couponModel from "../../../DB/models/coupon.model.js";
import cartModel from "../../../DB/models/cart.model.js";
import productModel from "../../../DB/models/product.model.js";
import orderModel from "../../../DB/models/order.model.js";
import sendEmail from "../../utils/sendEmail.js";
import cloudinary from "../../utils/cloud.js";
import createInvoice from "../../utils/createInvoice.js";
import { clearCart, updateStock } from "./order.services.js";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import Stripe from "stripe";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createOrder = asyncHandler(async (req, res, next) => {
  // data
  const { address, phone, coupon, payment } = req.body;
  const user = req.user;

  // check coupon
  let checkCoupon;

  if (coupon) {
    checkCoupon = await couponModel.findOne({
      name: coupon,
      expiredAt: { $gt: Date.now() },
    });

    if (!checkCoupon) return next(new Error("Invalid coupon!"));
  }

  // check cart empty
  const cart = await cartModel.findOne({ user: user._id });

  if (cart.products.length === 0) return next(new Error("Cart is empty!"));

  // check stock then - calculate price - update stock
  let orderProducts = [];
  let orderPrice = 0;

  for (const cartProduct of cart.products) {
    const product = await productModel.findById(cartProduct.productId);

    // check product existence
    if (!product)
      return next(
        new Error(`product ${cartProduct.productId} not found!`, { cause: 404 })
      );

    // check stock
    if (!product.inStock(cartProduct.quantity))
      return next(
        new Error(
          `Sorry, only ${product.availableItems} items of ${product.name} left in the stock!`
        )
      );

    // make products of order model
    orderProducts.push({
      productId: cartProduct.productId,
      quantity: cartProduct.quantity,
      name: product.name,
      itemPrice: product.finalPrice,
      totalPrice: product.finalPrice * cartProduct.quantity,
    });

    // calculate price
    orderPrice += product.finalPrice * cartProduct.quantity;
  }

  // create order
  const order = await orderModel.create({
    user: user._id,
    products: orderProducts,
    address,
    phone,
    price: orderPrice,
    payment,
    coupon: {
      couponId: checkCoupon?._id,
      name: checkCoupon?.name,
      discount: checkCoupon?.discount,
    },
  });

  //************** generate invoice **************//
  // check invoice folder existence
  const invoicesPath = path.join(__dirname, `./../../../invoiceTemporary`);
  if (!fs.existsSync(invoicesPath)) {
    fs.mkdirSync(invoicesPath, { recursive: true });
  }

  const invoice = {
    shipping: {
      name: user.userName,
      address: order.address,
      country: "Egypt",
    },
    items: order.products,
    subtotal: order.price, // before coupon
    paid: order.finalPrice,
    invoice_nr: order._id,
  };

  console.log("price", order.price);
  console.log("final price", order.finalPrice);

  const pdfPath = path.join(
    __dirname,
    `./../../../invoiceTemporary/${order._id}.pdf`
  );

  createInvoice(invoice, pdfPath);

  // upload invoice to cloudinary
  // allow pdf option at cloudinary
  const { public_id, secure_url } = await cloudinary.uploader.upload(pdfPath, {
    folder: `${process.env.FOLDER_CLOUD_NAME}/order/invoice/${user._id}`,
  });

  // add invoice to order
  order.invoice = { id: public_id, url: secure_url };
  await order.save();

  // delete invoice from filesystem
  fs.unlinkSync(pdfPath);

  // send email
  const isSent = await sendEmail({
    to: user.email,
    subject: "Order Invoice",
    text: "Order has been placed successfully!",
    attachments: [
      {
        path: secure_url,
        contentType: "application/pdf",
      },
    ],
  });

  if (isSent) {
    // update stock
    updateStock(order.products, true);

    // clear cart
    clearCart(user._id);
  }

  //*************** stripe payment *****************//
  // can be in separate endpoint
  if (payment == "visa") {
    const stripe = new Stripe(process.env.STRIPE_KEY);

    let generateCoupon;
    if (order.coupon.name !== undefined) {
      generateCoupon = await stripe.coupons.create({
        percent_off: order.coupon.discount,
        duration: "once",
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      metadata: { order_id: order._id.toString() }, // to get that data at webhook (event triggered)
      success_url: process.env.SUCCESS_URL,
      cancel_url: process.env.CANCEL_URL,
      line_items: order.products.map((product) => {
        return {
          price_data: {
            currency: "egp",
            product_data: {
              name: product.name,
              // images: [product.productId.defaultImage.url],
            },
            unit_amount: product.itemPrice * 100,
          },
          quantity: product.quantity,
        };
      }),
      discounts: checkCoupon ? [{ coupon: generateCoupon.id }] : [],
      // ...(checkCoupon && { discounts: [{ coupon: generateCoupon.id }] }), // only if coupon exists (error)
    });

    // response
    return res.status(201).json({
      success: true,
      message: "Order placed successfully! check your email",
      payUrl: session.url,
    });
  }

  // send response
  return res.status(201).json({
    success: true,
    message: "Order placed successfully! check your email",
  });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
  // data
  const { orderId } = req.params;

  // check order existence
  const order = await orderModel.findById(orderId);
  if (!order) return next(new Error("Order not found!", { cause: 404 }));

  // check order status
  if (order.status === "shipped" || order.status === "delivered")
    return next(new Error("Can not cancel order!"));

  // cancel order
  order.status = "canceled";
  await order.save();

  // update stock
  updateStock(order.products, false);

  // send response
  return res.json({ success: true, message: "order canceled successfully!" });
});

export const orderWebhook = asyncHandler(async (request, response) => {
  // This is your Stripe CLI webhook secret for testing your endpoint locally.
  const sig = request.headers["stripe-signature"];
  let event;
  const stripe = new Stripe(process.env.STRIPE_KEY);

  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.ENDPOINT_SECRET
    );
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the complete event (you can handle the other events)
  const orderId = event.data.object.metadata.order_id;

  if (event.type === "checkout.session.completed") {
    // change order status
    await orderModel.findOneAndUpdate(
      { _id: orderId },
      { status: "visa payed" }
    );
    return response.send();
  }

  // else
  await orderModel.findOneAndUpdate(
    { _id: orderId },
    { status: "failed to pay" }
  );
  return response.send();
});

import mongoose from "mongoose";
import "../src/utils/QueryHelpers.js"

const connectDB = async () => {
  await mongoose
    .connect(process.env.CONNECTION_URL)
    .then((result) => {
      console.log("DB Connected Successfully");
    //   console.log(result);
    })
    .catch((err) => {
      console.log(`Fail to connect DB...${err}`);
    });
};

export default connectDB;

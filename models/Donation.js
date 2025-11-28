import mongoose from "mongoose";

const DonationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  location: String,
  amount: Number,
  paymentId: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Donation", DonationSchema);

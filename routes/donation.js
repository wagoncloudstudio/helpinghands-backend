import express from "express";
import Donation from "../models/Donation.js";
import { razorpay } from "../config/razorpay.js";
import { transporter } from "../config/mail.js";

const router = express.Router();

router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    return res.json({ success: true, order });
  } catch (err) {
    console.error("Order creation error:", err);
    return res.status(500).json({ success: false, message: "Order creation failed" });
  }
});

router.post("/save-donation", async (req, res) => {
  try {
    const { name, email, phone, location, amount, paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ success: false, message: "Missing payment ID" });
    }

    res.json({ success: true });


    Promise.resolve().then(async () => {
      const donation = await Donation.create({
        name,
        email,
        phone,
        location,
        amount,
        paymentId,
      });

      try {
        await transporter.sendMail({
          from: `Donations <${process.env.MAIL_USER}>`,
          to: email,
          subject: "Thank you for your donation ❤️",
          html: `
            <h2>Thank you, ${name}!</h2>
            <p>Your donation of <b>₹${amount}</b> has been successfully received.</p>
            <p><b>Payment ID:</b> ${paymentId}</p>
            <br/>
            <p>We truly appreciate your support.</p>
          `,
        });
      } catch (mailErr) {
        console.error("Email send error:", mailErr);
      }

      console.log("Donation saved:", donation._id);
    });

  } catch (err) {
    console.error("Save donation error:", err);
  }
});

export default router;

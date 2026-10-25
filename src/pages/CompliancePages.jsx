import React, { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const BUSINESS = {
  legalName: "HFS",
  brandName: "HFS BAZAAR",
  proprietor: "Mr. Mohammed Hammad Ejazul Haque Ansari",
  regNo: "891075989 / E Ward / COMMERCIAL II (BMC Form-G)",
  address: "25/M/95/, Behind F Block, 666, Municipal Transit Camp, Bapurao Jagtap Marg, Byculla (W), Mumbai - 400011, Maharashtra, India",
  primaryEmail: "support@hfsbazaar.in",
  secondaryEmail: "hfsplastic@gmail.com",
  hours: "Monday to Saturday, 10:00 AM to 6:00 PM IST"
};

const POLICIES = {
  about: {
    title: "About Us",
    content: `Welcome to ${BUSINESS.brandName} (operated by ${BUSINESS.legalName}), India's trusted Direct-to-Consumer (D2C) online store for home organization, wardrobe storage, saree covers, storage bags, and protective covers.

Who We Are:
${BUSINESS.brandName} is owned and managed directly by ${BUSINESS.legalName} (Sole Proprietorship of ${BUSINESS.proprietor}), headquartered in Byculla, Mumbai. Every product listed on hfsbazaar.in is sourced, quality-checked, packed, and dispatched directly from our own facility in Mumbai—we do not operate as a third-party multi-vendor marketplace.

Our Promise:
• Premium fabric, quilted satin, non-woven, and heavy-duty PVC protective organizers.
• Transparent pricing in Indian Rupees (INR) inclusive of applicable taxes.
• Secure online payments and reliable pan-India courier delivery.

Registered Business Details:
Legal Entity Name: ${BUSINESS.legalName}
Brand Name: ${BUSINESS.brandName}
Proprietor: ${BUSINESS.proprietor}
Intimation / Registration No.: ${BUSINESS.regNo}
Registered Address: ${BUSINESS.address}
Support Email: ${BUSINESS.primaryEmail} | ${BUSINESS.secondaryEmail}`
  },
  contact: {
    title: "Contact Us",
    content: `We are here to help you with product inquiries, order tracking, cancellations, returns, or any feedback.

Registered Business & Office Details:
Legal Entity Name: ${BUSINESS.legalName}
Operating Brand Name: ${BUSINESS.brandName}
Proprietor Name: ${BUSINESS.proprietor}
Registered Operational Address:
${BUSINESS.address}

Customer Support Channels:
• Primary Support Email: ${BUSINESS.primaryEmail}
• Alternate Business Email: ${BUSINESS.secondaryEmail}
• Support Hours: ${BUSINESS.hours}
• Standard Response Time: Within 24 business hours

Grievance Officer (As per Consumer Protection E-Commerce Rules):
Name: ${BUSINESS.proprietor}
Designation: Proprietor & Grievance Officer
Address: ${BUSINESS.address}
Email: ${BUSINESS.primaryEmail} / ${BUSINESS.secondaryEmail}
Note: Please mention your Order ID in the email subject line for faster resolution within 24–48 hours.`
  },
  privacy: {
    title: "Privacy Policy",
    content: `Effective Date: October 2026

This Privacy Policy describes how ${BUSINESS.legalName}, operating under the brand name ${BUSINESS.brandName} ("we", "us", or "our") on https://hfsbazaar.in, collects, uses, and protects your personal information in accordance with applicable Indian laws and the Information Technology Act, 2000.

1. Information We Collect
When you browse or place an order on ${BUSINESS.brandName}, we collect only essential information required to fulfill your order:
• Full Name, Delivery Address, Pin Code, Email Address, and Contact Details provided at checkout.
• Order history and delivery preferences.

2. Payment Security
All online payments on hfsbazaar.in are processed securely through RBI-authorized third-party payment gateways using industry-standard SSL/PCI-DSS encryption. We do NOT collect, store, or have access to your debit/credit card numbers, CVV, Net Banking passwords, or UPI PINs on our servers.

3. How We Use Your Information
• Processing, packing, and shipping your orders via our logistics partners.
• Sending order confirmations, tax invoices, dispatch updates, and support responses.
• Preventing fraud and complying with statutory tax and regulatory obligations.

4. Data Sharing & Third Parties
We never sell or rent customer data. Necessary shipping details (Name, Address, Contact info) are shared strictly with courier/logistics partners for order delivery and authorized payment processors for transaction verification.

5. Your Rights & Grievance Redressal
You may request correction or deletion of your account information at any time by writing to our Grievance Officer:
${BUSINESS.proprietor} (${BUSINESS.legalName})
Address: ${BUSINESS.address}
Email: ${BUSINESS.primaryEmail} | ${BUSINESS.secondaryEmail}`
  },
  terms: {
    title: "Terms & Conditions",
    content: `Effective Date: October 2026

Welcome to https://hfsbazaar.in. This website is owned and operated directly by ${BUSINESS.legalName} (Proprietor: ${BUSINESS.proprietor}), operating under the brand ${BUSINESS.brandName}, having its registered address at ${BUSINESS.address}.

By accessing this website or placing an order, you agree to be bound by the following Terms & Conditions:

1. Direct Retail Store (Non-Marketplace)
All products listed on hfsbazaar.in are sold directly by ${BUSINESS.legalName} from our own inventory. When you purchase a product, your contract of sale is strictly and directly with ${BUSINESS.legalName}.

2. Product Information & Pricing
• All prices are listed in Indian Rupees (INR / ₹) and are final at the time of checkout.
• We strive to display product colors, dimensions, and materials accurately; minor variations may occur due to lighting or screen settings.
• We reserve the right to cancel any order in case of pricing errors or stock unavailability, with a 100% immediate refund for prepaid orders.

3. Orders & Payments
• Orders are confirmed upon successful online payment via authorized payment modes (UPI, Cards, Net Banking) or verified Cash on Delivery (COD) selection.
• Customers must provide accurate and complete delivery addresses to avoid transit delays.

4. Intellectual Property
All logos, brand names (${BUSINESS.brandName}), product photographs, and website content belong exclusively to ${BUSINESS.legalName} and may not be reproduced without written consent.

5. Limitation of Liability & Governing Law
Our maximum liability for any order shall not exceed the total amount paid by the customer for that specific order. These terms are governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.

Contact Email: ${BUSINESS.primaryEmail} | ${BUSINESS.secondaryEmail}`
  },
  shipping: {
    title: "Shipping & Delivery Policy",
    content: `At ${BUSINESS.brandName} (${BUSINESS.legalName}), we ensure safe packaging and timely delivery of your orders across India.

1. Order Processing & Dispatch Time
• All confirmed orders are packed and dispatched from our Mumbai facility (${BUSINESS.address}) within 1 to 2 business days (excluding Sundays and public holidays).

2. Estimated Delivery Timeline
• Mumbai & Maharashtra: 2 to 4 business days after dispatch.
• Metro Cities: 3 to 5 business days after dispatch.
• Rest of India: 5 to 7 business days after dispatch.
(Note: Unforeseen weather conditions or courier operational delays in remote pin codes may occasionally add 1–2 extra days.)

3. Shipping Charges
• Free shipping is available on all eligible orders above ₹999.
• For orders below ₹999, exact nominal shipping charges (if applicable) are transparently displayed on the Checkout page before payment.

4. Order Tracking & Support
Once your order is shipped, tracking details are updated in your "My Account" dashboard and sent via email. For any delivery assistance, write to us at ${BUSINESS.primaryEmail} or ${BUSINESS.secondaryEmail}.`
  },
  returns: {
    title: "Cancellation, Return & Refund Policy",
    content: `At ${BUSINESS.brandName} (operated by ${BUSINESS.legalName}), customer satisfaction is our top priority. Please read our transparent Cancellation, Return, and Refund guidelines below:

1. Order Cancellation Policy
• Before Dispatch: You can cancel your order anytime before it is dispatched (or within 24 hours of placing the order) from your Account page or by emailing us at ${BUSINESS.primaryEmail} with your Order ID.
• For cancelled prepaid orders, 100% of the order amount is refunded with zero cancellation charges.
• Once an order has already been handed over to the courier partner, it cannot be cancelled mid-transit, but you may request a return after delivery.

2. 7-Day Easy Return & Replacement Policy
• Eligibility Window: You may raise a return or replacement request within 7 calendar days from the date of delivery.
• Valid Reasons: Damaged product received, manufacturing defect, wrong item/size delivered, or unused product in its original condition.
• Condition of Item: Returned products must be unused, unwashed, and packed in original packaging with tags/pouches intact.
• How to Request: Email ${BUSINESS.primaryEmail} or ${BUSINESS.secondaryEmail} with your Order ID and clear photos/unboxing video of the item within 7 days of delivery. Reverse pickup or return instructions will be arranged within 48 hours.

3. Refund Processing & Timelines
• Once your pre-dispatch cancellation is confirmed, OR once the returned product reaches our Mumbai facility and passes quality inspection (within 48 hours of receipt), your refund will be initiated immediately.
• Refund Credit Timeline: Approved refunds are credited within 5 to 7 business days.
• Refund Mode:
  - Prepaid Orders (UPI, Credit/Debit Card, Net Banking): Credited directly back to the original payment method used during checkout.
  - Cash on Delivery (COD) Orders: Credited via NEFT/IMPS/UPI to the bank account details shared by the customer over registered email.

Registered Return Address:
${BUSINESS.legalName} (${BUSINESS.brandName})
Prop. ${BUSINESS.proprietor}
${BUSINESS.address}
Support Email: ${BUSINESS.primaryEmail} | ${BUSINESS.secondaryEmail}`
  }
};

POLICIES.cancellation = POLICIES.returns;

export function LegalPage({ forcedSlug }) {
  const params = useParams();
  const slug = forcedSlug || params.slug || "about";
  const page = POLICIES[slug] || POLICIES.about;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
          Official Store Policy • {BUSINESS.brandName}
        </span>
        <h1 className="mt-3 font-heading text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {page.title}
        </h1>
        <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-slate-700 sm:text-base">
          {page.content}
        </div>
        <div className="mt-8 border-t border-slate-100 pt-5 text-xs text-slate-500">
          <strong>Legal Entity:</strong> {BUSINESS.legalName} (Proprietor: {BUSINESS.proprietor}) •{" "}
          <strong>Email:</strong> {BUSINESS.primaryEmail}
        </div>
      </div>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold text-emerald-700 hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}

export default LegalPage;

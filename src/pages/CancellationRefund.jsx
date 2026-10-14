import React from 'react';

const CancellationRefund = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '24px', fontFamily: 'sans-serif', lineHeight: '1.6', color: '#333' }}>
      <h1 style={{ fontSize: '28px', borderBottom: '2px solid #eee', paddingBottom: '12px', marginBottom: '24px' }}>
        Cancellation and Refund Policy
      </h1>
      
      <p>Last updated: October 2026</p>
      <p>Welcome to <strong>HFS Bazaar</strong>. We are committed to providing the highest quality wardrobe organizers and saree covers. Please review our policy regarding cancellations and refunds below.</p>

      <h2 style={{ fontSize: '20px', marginTop: '24px', color: '#111' }}>1. Order Cancellation</h2>
      <ul>
        <li>You can request to cancel your order within <strong>12 hours</strong> of placing it or before the order has been dispatched/shipped.</li>
        <li>Once the product is shipped from our warehouse, cancellations cannot be processed directly. You may reject the delivery or request a return upon arrival.</li>
        <li>To request a cancellation, please email us or reach out via our customer support details.</li>
      </ul>

      <h2 style={{ fontSize: '20px', marginTop: '24px', color: '#111' }}>2. Returns & Replacements</h2>
      <ul>
        <li>We offer a <strong>7-day return/replacement window</strong> from the date of delivery if the item received is damaged, defective, or incorrect.</li>
        <li>The item must be in its original condition, unused, with all tags, zippers intact, and inside the original packaging.</li>
      </ul>

      <h2 style={{ fontSize: '20px', marginTop: '24px', color: '#111' }}>3. Refund Process</h2>
      <ul>
        <li>Once your returned item is received and inspected, we will notify you of the approval or rejection of your refund.</li>
        <li>Approved refunds are processed automatically back to your original payment method (Bank/UPI/Card) within <strong>5 to 7 business days</strong>.</li>
      </ul>

      <h2 style={{ fontSize: '20px', marginTop: '24px', color: '#111' }}>4. Contact Us</h2>
      <p>If you have any questions about our Cancellation and Refund Policy, please contact us at:</p>
      <p>
        <strong>HFS Bazaar</strong><br />
        Support: Available via website contact form
      </p>
    </div>
  );
};

export default CancellationRefund;

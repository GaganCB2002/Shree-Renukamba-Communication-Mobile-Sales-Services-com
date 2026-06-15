const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

function generateInvoicePdf(invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - 50 * 2;
    const leftMargin = 50;

    doc.fontSize(22).font('Helvetica-Bold').text('INVOICE', leftMargin, 50);
    doc.fontSize(9).font('Helvetica').fillColor('#666')
      .text(`Invoice #: ${invoice.invoiceId}`, leftMargin, 78)
      .text(`Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, leftMargin, 92);

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333')
      .text('Shree Renukamba Communication', 350, 50);
    doc.fontSize(8).font('Helvetica').fillColor('#666')
      .text('Guttur Colony, Harihar', 350, 66)
      .text('Phone: +91 98765 43210', 350, 80)
      .text('Email: info@shreerenukamba.com', 350, 94);

    doc.moveTo(leftMargin, 115).lineTo(leftMargin + pageWidth, 115).stroke('#ddd');

    let y = 130;
    if (invoice.customer) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text('Bill To:', leftMargin, y);
      y += 16;
      doc.fontSize(9).font('Helvetica').fillColor('#555')
        .text(invoice.customer.name || invoice.customer.fullName || 'Customer', leftMargin, y)
        .text(invoice.customer.email || '', leftMargin, y + 14)
        .text(invoice.customer.phone || '', leftMargin, y + 28);
    }

    y = Math.max(y + 60, 175);
    const tableTop = y;
    doc.moveTo(leftMargin, tableTop - 8).lineTo(leftMargin + pageWidth, tableTop - 8).stroke('#ddd');

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#333');
    const col1 = leftMargin;
    const col2 = leftMargin + 220;
    const col3 = leftMargin + 340;
    const col4 = leftMargin + 410;
    const col5 = leftMargin + 480;
    doc.text('#', col1, tableTop, { width: 25 });
    doc.text('Description', col2, tableTop, { width: 110 });
    doc.text('Qty', col3, tableTop, { width: 30 });
    doc.text('Price', col4, tableTop, { width: 50 });
    doc.text('Total', col5, tableTop, { width: 60 });

    doc.moveTo(leftMargin, tableTop + 14).lineTo(leftMargin + pageWidth, tableTop + 14).stroke('#ddd');

    let rowY = tableTop + 22;
    const items = invoice.items || [];
    items.forEach((item, idx) => {
      const qty = item.quantity || item.qty || 1;
      const price = parseFloat(item.price || item.unitPrice || 0);
      const total = qty * price;
      doc.fontSize(9).font('Helvetica').fillColor('#333');
      doc.text(String(idx + 1), col1, rowY, { width: 25 });
      doc.text(item.name || item.description || item.serviceName || 'Item', col2, rowY, { width: 110 });
      doc.text(String(qty), col3, rowY, { width: 30 });
      doc.text('₹' + price.toFixed(2), col4, rowY, { width: 50 });
      doc.text('₹' + total.toFixed(2), col5, rowY, { width: 60 });
      rowY += 18;
    });

    doc.moveTo(leftMargin, rowY).lineTo(leftMargin + pageWidth, rowY).stroke('#ddd');
    rowY += 10;

    const subtotal = parseFloat(invoice.subtotal || invoice.totalAmount || 0);
    const cgst = parseFloat(invoice.cgst || 0);
    const sgst = parseFloat(invoice.sgst || 0);
    const discount = parseFloat(invoice.discount || 0);
    const grandTotal = parseFloat(invoice.grandTotal || invoice.total || subtotal + cgst + sgst - discount);

    const summaryX = leftMargin + 350;
    const summaryValX = leftMargin + 470;
    doc.fontSize(9).font('Helvetica').fillColor('#555');
    if (subtotal) {
      doc.text('Subtotal:', summaryX, rowY); doc.text('₹' + subtotal.toFixed(2), summaryValX, rowY); rowY += 16;
    }
    if (cgst) {
      doc.text('CGST (9%):', summaryX, rowY); doc.text('₹' + cgst.toFixed(2), summaryValX, rowY); rowY += 16;
    }
    if (sgst) {
      doc.text('SGST (9%):', summaryX, rowY); doc.text('₹' + sgst.toFixed(2), summaryValX, rowY); rowY += 16;
    }
    if (discount) {
      doc.text('Discount:', summaryX, rowY); doc.text('-₹' + discount.toFixed(2), summaryValX, rowY); rowY += 16;
    }
    doc.moveTo(summaryX, rowY).lineTo(summaryValX + 60, rowY).stroke('#ddd');
    rowY += 10;
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#333');
    doc.text('Total:', summaryX, rowY);
    doc.text('₹' + grandTotal.toFixed(2), summaryValX, rowY);

    rowY = Math.max(rowY + 60, 580);
    doc.moveTo(leftMargin, rowY).lineTo(leftMargin + pageWidth, rowY).stroke('#ddd');
    rowY += 12;
    doc.fontSize(8).font('Helvetica').fillColor('#999')
      .text('Thank you for your business!', leftMargin, rowY, { align: 'center' })
      .text('Shree Renukamba Communication | Guttur Colony, Harihar | +91 98765 43210', leftMargin, rowY + 12, { align: 'center' });

    doc.end();
  });
}

module.exports = { generateInvoicePdf };

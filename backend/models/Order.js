const { dbRun, dbAll, dbGet } = require('../config/db');

class Order {
  static async create(orderData) {
    const orderId = orderData.orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = orderData.trackingNumber || 'ATL-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const createdAt = new Date().toISOString();

    // Insert Order Record
    await dbRun(`
      INSERT INTO orders (
        order_id, customer_name, customer_email, shipping_address,
        subtotal, discount, shipping_fee, tax, total, status, tracking_number, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderId,
      orderData.customer.fullName,
      orderData.customer.email,
      orderData.customer.shippingAddress,
      orderData.pricing.subtotal,
      orderData.pricing.discount || 0,
      orderData.pricing.shipping || 0,
      orderData.pricing.tax || 0,
      orderData.pricing.total,
      'Processing',
      trackingNumber,
      createdAt
    ]);

    // Insert Each Order Item and deduct stock atomically
    for (const item of orderData.items) {
      await dbRun(`
        INSERT INTO order_items (
          order_id, product_id, product_name, color, size, price, quantity, image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        orderId,
        item.productId,
        item.name,
        item.color,
        item.size,
        item.price,
        item.quantity,
        item.image
      ]);

      // Deduct inventory in SQLite3
      const productRow = await dbGet('SELECT inventory FROM products WHERE id = ?', [item.productId]);
      if (productRow) {
        const inventory = JSON.parse(productRow.inventory || '{}');
        const key = `${item.color.toLowerCase()}-${item.size.toLowerCase()}`;
        if (inventory[key] !== undefined) {
          inventory[key] = Math.max(0, inventory[key] - item.quantity);
          await dbRun('UPDATE products SET inventory = ? WHERE id = ?', [
            JSON.stringify(inventory),
            item.productId
          ]);
        }
      }
    }

    return {
      orderId,
      createdAt,
      customer: orderData.customer,
      items: orderData.items,
      pricing: orderData.pricing,
      status: 'Processing',
      trackingNumber
    };
  }

  static async findAll() {
    const rows = await dbAll('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = [];

    for (const ord of rows) {
      const items = await dbAll('SELECT * FROM order_items WHERE order_id = ?', [ord.order_id]);
      orders.push({
        orderId: ord.order_id,
        customer: {
          fullName: ord.customer_name,
          email: ord.customer_email,
          shippingAddress: ord.shipping_address
        },
        pricing: {
          subtotal: ord.subtotal,
          discount: ord.discount,
          shipping: ord.shipping_fee,
          tax: ord.tax,
          total: ord.total
        },
        status: ord.status,
        trackingNumber: ord.tracking_number,
        createdAt: ord.created_at,
        items: items.map(it => ({
          id: it.id,
          productId: it.product_id,
          name: it.product_name,
          color: it.color,
          size: it.size,
          price: it.price,
          quantity: it.quantity,
          image: it.image
        }))
      });
    }

    return orders;
  }

  static async findById(orderId) {
    const ord = await dbGet('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    if (!ord) return null;

    const items = await dbAll('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    return {
      orderId: ord.order_id,
      customer: {
        fullName: ord.customer_name,
        email: ord.customer_email,
        shippingAddress: ord.shipping_address
      },
      pricing: {
        subtotal: ord.subtotal,
        discount: ord.discount,
        shipping: ord.shipping_fee,
        tax: ord.tax,
        total: ord.total
      },
      status: ord.status,
      trackingNumber: ord.tracking_number,
      createdAt: ord.created_at,
      items: items.map(it => ({
        id: it.id,
        productId: it.product_id,
        name: it.product_name,
        color: it.color,
        size: it.size,
        price: it.price,
        quantity: it.quantity,
        image: it.image
      }))
    };
  }
}

module.exports = Order;

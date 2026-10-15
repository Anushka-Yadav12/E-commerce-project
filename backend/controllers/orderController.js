const Order = require('../models/Order');

/**
 * Order Controller
 */
const createOrder = async (req, res, next) => {
  try {
    const { customer, items, pricing } = req.body;
    if (!customer || !items || !pricing) {
      return res.status(400).json({ error: 'Incomplete order payload' });
    }
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById
};

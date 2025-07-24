export function getOrderShares(data) {
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0);

  if (totalOrders === 0) return [];

  return data.map(item => ({
    app: item.app,
    orders: item.orders,
    share: item.orders / totalOrders,
  }));
}

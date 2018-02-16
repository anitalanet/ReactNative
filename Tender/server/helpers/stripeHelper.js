const stripe = require('stripe')('sk_test_B40bvBCus9RftZLEveSP0eSj');

function createCustomer(data) {
  return new Promise(
    (resolve, reject) => {
      stripe.customers.create({
        email: data.email,
        description: data.name
      })
        .then(customer => resolve(customer))
        .catch(err => reject(err));
    }
  );
}

function createCard(data) {
  return new Promise(
    (resolve, reject) => {
      stripe.customers.create({
        email: data.email,
        description: data.name
      })
        .then(customer => resolve(customer))
        .catch(err => reject(err));
    }
  );
}


export default { createCustomer, createCard };

var express = require('express');
const { default: mongoose } = require('mongoose');
const auth = require('../middleware/auth');
const Cart = require('../models/cart');
const Products = require('../models/products');
const Users = require('../models/users');
var router = express.Router();

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE);


// CREATE PAYMENT METHOD
router.post("/createPaymentMethod", auth, async (req, res) => {

    try {
        const { token } = req.body

        const userId = req.userId

        const data = await Users.findOne({
            _id: userId
        })

        if (token) {
            const paymentMethod = await stripe.paymentMethods.create({
                type: 'card',
                card: {
                    token: token
                },
            });

            if (paymentMethod) {
                const attachPaymentMethod = await stripe.paymentMethods.attach(
                    paymentMethod.id,
                    {
                        customer: data.customerId,
                    }
                );

                if (attachPaymentMethod) {
                    res.status(200).send({
                        message: "Card Added Successfully",
                        TokenId: token.id,
                        paymentMethodId: paymentMethod.id
                    })
                }
                else {
                    res.status(400).send({
                        message: "Failed to Add Card",
                    })
                }
            }
            else {
                res.status(400).send({
                    message: "Failed to Add Card"
                })
            }
        }
        else {
            res.status(400).send({
                message: "Failed to Add Card"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(400).send({
            message: "Failed to Add Card"
        })
    }
})

// GET PAYMENT METHODS LIST

router.get("/getCustomerPaymentMethods", auth, async (req, res) => {

    try {

        const userId = req.userId;

        const data = await Users.findOne({
            _id: new mongoose.Types.ObjectId(userId)
        })
        if (data) {
            const paymentMethods = await stripe.customers.listPaymentMethods(
                data.customerId, {
            }
            );

            if (paymentMethods) {
                return res.status(200).send({
                    message: "Payment Methods Found",
                    data: paymentMethods
                })
            }
            else {
                return res.status(400).send({
                    message: "You Have not Added a Payment Method"
                })
            }
        }
        else {
            res.status(400).send({
                message: "Failed to Get Payment Methods"
            })
        }
    } catch (error) {
        res.status(500).send({
            message: "Failed to Get Payment Methods"
            
        })
        console.log('error', error)
    }
})

// MAKE PAYMENT 

router.post("/makePayment", auth, async (req, res) => {
    try {

        const data = await Users.findOne({
            _id: req.userId
        })

        const { amount, paymentMethodId } = req.body

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: 'usd',
            automatic_payment_methods: {
                enabled: true,
            },
            customer: data.customerId,
            payment_method: paymentMethodId,
            confirm: true,
            return_url: "https://api.stripe.com/v1/tokens",
        });

        if (paymentIntent) {
            res.status(200).send({
                success: true,
                message: "Payment done successfully",
                data: paymentIntent,
            });
        }
        else {
            res.status(400).send({
                success: false,
                message: "Payment Failed",
            });
        }
    } catch (error) {
        console.error("Error while making payment:", error);
        res.status(400).send({
            success: false,
            message: "Payment Failed",
            error: error.message, // Sending the error message back to the client
        });
    }
});



module.exports = router;


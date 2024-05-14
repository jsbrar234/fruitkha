var express = require('express');
const { default: mongoose } = require('mongoose');
const auth = require('../middleware/auth');
const Cart = require('../models/cart');
const Order = require('../models/order');
const Products = require('../models/products');
var router = express.Router();


router.post('/addProducts', async (req, res, next) => {

    try {
        const { productName, price, description, image } = req.body

        const data = await Products.create({
            productName,
            price,
            description,
            image
        })

        if (data) {
            res.status(201).send({
                message: "Product Added Successfully",
                data: data
            })
        }

        else {
            res.status(400).send({
                message: "Failed to Add Product"
            })
        }
    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error"
        })
    }



});

// DELETE PRODUCT

router.delete('/deleteProduct', auth, async (req, res, next) => {

    try {
        const { productId } = req.body

        const data = await Products.findOneAndDelete({
            _id: productId
        })

        if (data) {
            res.status(200).send({
                message: "Product Deleted Successfully"
            })
        }

        else {
            res.status(404).send({
                message: "Product not Found"
            })
        }
    } catch (error) {
        console.log('error', error)
        res.status(500).send({
            message: "Internal Server Error"
        })

    }

});

// GET PRODUCTS DETAILS

router.get('/getProducts', async (req, res, next) => {


    
    const { query } = req.query

    console.log('query', query)

    try {
        if (!query) {
            const data = await Products.find({})

            if (data.length > 0) {
                res.status(200).send({
                    data
                })
            }
            else {
                res.status(400).send({
                    message: "No Products Found"
                })
            }
        }
        else {
            // if (!query) {
            //     return res.status(400).json({ error: 'Query parameter is required' });
            // }

            try {
                const data = await Products.find({ productName: { $regex: new RegExp(query, 'i') } });
                res.status(200).send({
                    data : data
                });
            } catch (error) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error"
        })
    }

})




// ADD TO CART

router.post('/addToCart', auth, async (req, res, next) => {


    try {
        const { productId, quantity } = req.body;

        console.log("USRE ID", req.userId)

        if (!productId || !quantity) {
            return res.status(400).send({
                message: "productId and quantity are required fields"
            });
        }

        const check = await Cart.findOne({
            userId: req.userId,
            productId: new mongoose.Types.ObjectId(productId)
        })

        if (check) {
            check.quantity = quantity;
            const data = await check.save();

            if (data) {
                res.status(200).send({
                    message: "Cart Updated Successfully",
                    data: data
                })
            }
            else {
                res.status(400).send({
                    messgae: "Failed to Add Prouct to the Cart"
                })
            }
        }

        else {
            const data = await Cart.create({
                productId: new mongoose.Types.ObjectId(productId),
                userId: req.userId,
                quantity: quantity
            })

            if (data) {
                res.status(200).send({
                    message: "Product Added to the Cart",
                    data: data
                })
            }
            else {
                res.status(400).send({
                    messgae: "Failed to Add Prouct to the Cart"
                })
            }
        }
    } catch (error) {
        console.log("ERROR", error)
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
});

// GET CART DETAILS

router.get('/getCart', auth, async (req, res, next) => {

    try {
        const userId = req.userId;


        const data = await Cart.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $lookup: {
                    from: "products",
                    let: { prodId: "$productId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$prodId"] }
                            }
                        }
                    ],
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            }
        ])

        if (data) {
            res.status(200).send({
                message: "Data Found",
                data: data
            })
        }
        else {
            res.status(400).send({
                message: "No Data Found"
            })
        }

    } catch (error) {
        console.log("ERROR", error)
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
});

// DELETE FROM CART 

router.delete('/deleteFromCart', auth, async (req, res, next) => {
    try {


        const { productId } = req.body;
        const userId = req.userId;

        console.log("UserID", userId)

        const data = await Cart.findOneAndDelete({
            userId: new mongoose.Types.ObjectId(userId),
            productId: new mongoose.Types.ObjectId(productId)
        })

        if (data) {
            res.status(202).send({
                message: "Removed from Cart"
            })
        }
        else {
            res.status(204).send({
                message: "No Data Found to Delete"
            })
        }
    } catch (error) {
        console.log('error', error)
        res.status(500).send({
            message: "Failed to Remove Product from Cart"
        })
    }
})

// PLACE ORDER


router.post('/placeOrder', auth, async (req, res, next) => {

    try {

        const userId = req.userId;

        const details = req.body

        details.userId = userId

        console.log("DETAILS", details.products)
        const data = await Order.create(details)

        if (data) {
            res.status(200).send({
                message: "Order Placed Successfully",
                data: data
            })
        }
        else {
            res.status(400).send({
                message: "No Order Placed",
            })
        }
    } catch (error) {
        console.log("ERROR", error)
        res.status(500).send({
            message: "Internal Server Error"
        })
    }


});
// CLEAR CART 

router.get('/clearCart', auth, async (req, res, next) => {

    try {
        const userId = req.userId;

        const data = await Cart.deleteMany({
            userId
        })

        if (data) {
            res.status(202).send({
                message: "Cart Cleared Successfully",
            })
        }
        else {
            res.status(204).send({
                message: "There are no products in cart clear",
            })
        }

    } catch (error) {
        console.log('error', error)
        res.status(500).send({
            message: "Internal Server Error"
        })

    }


});


// GET ORDER DETAILS

router.get('/getOrderDetails', auth, async (req, res, next) => {

    try {
        const userId = req.userId;
        const data = await Order.aggregate([
            {
                $match: { userId: new mongoose.Types.ObjectId(userId) }
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "products",
                    let: { pId: "$products.productId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$pId"] }
                            }
                        }
                    ],
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $lookup: {
                    from: "addresses",
                    let: { userAddressId: "$addressId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$userAddressId"] }
                            }
                        }
                    ],
                    as: "addressDetails"
                }
            },
            {
                $unwind: "$addressDetails"
            },
            {
                $sort: { createdAt: -1 }
            }
        ])

        if (data) {
            res.status(200).send({
                message: "Data Found",
                data: data
            })
        }
        else {
            res.status(400).send({
                message: "No Data Found"
            })
        }

    } catch (error) {
        console.log("ERROR", error)
        res.status(500).send({
            message: "Internal Server Error"
        })
    }
});


// GET ORDER DETAILS FOR ADMIN

router.get('/getAllOrders', auth, async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get the page number from the query parameters, default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 5; // Get the limit from the query parameters, default to 10 if not provided
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        console.log('page', page)
        console.log('limit', limit)

        const data = await Order.aggregate([
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "products",
                    let: { pId: "$products.productId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$pId"] }
                            }
                        }
                    ],
                    as: "productDetails"
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $lookup: {
                    from: "addresses",
                    let: { userAddressId: "$addressId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$userAddressId"] }
                            }
                        }
                    ],
                    as: "addressDetails"
                }
            },
            {
                $unwind: "$addressDetails"
            },
            {
                $lookup: {
                    from: "users",
                    let: { uid: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$uid"] }
                            }
                        }
                    ],
                    as: "userDetail"
                }
            },
            {
                $unwind: "$userDetail"
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: skip // Skip documents based on the page number and limit
            },
            {
                $limit: limit // Limit the number of documents returned per page
            }
        ]);

        if (data && data.length > 0) {
            res.status(200).send({ data });
        } else {
            res.status(404).send({ message: "Data not found" });
        }
    } catch (error) {
        console.log('error', error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});











module.exports = router;

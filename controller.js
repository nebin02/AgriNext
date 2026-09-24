
const Farmer = require("./farmerschema");
const Customer = require("./customerschema");
const Crop = require("./cropschema");
const sendOTPEmail = require("./emailService");
const PendingVerification = require("./pendingverificationschema");

// ===============================
// FARMER REGISTER
// ===============================

const registerFarmer = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password,
            address,
            farmLocation
        } = req.body;

        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !address ||
            !farmLocation
        ) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }

        const existingFarmer = await Farmer.findOne({ email });

        if (existingFarmer) {

            return res.status(400).json({
                message: "Email already registered"
            });

        }

        // Generate 6 digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // OTP expires after 5 minutes
        const otpExpires = new Date(
            Date.now() + 5 * 60 * 1000
        );

        const farmer = new Farmer({

            name,
            email,
            phone,
            password,
            address,
            farmLocation,

            otp,
            otpExpires,

            isVerified: false

        });

        await farmer.save();

        // Send OTP
        await sendOTPEmail(email, otp);

        res.status(201).json({

            message: "Registration successful. OTP sent to your email.",

            email: email,

            userType: "farmer"

        });

    } catch (error) {

        console.error("Farmer registration error:", error);

        res.status(500).json({
            message: "Registration failed"
        });

    }
};
// ===============================
// CUSTOMER REGISTER
// ===============================

const registerCustomer = async (req, res) => {

    try {

        const {
            name,
            email,
            phone,
            password,
            address
        } = req.body;

        if (!name || !email || !phone || !password || !address) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingCustomer = await Customer.findOne({ email });

        if (existingCustomer) {

            return res.status(400).json({
                message: "Email already registered"
            });
        }

        // Generate 6 digit OTP
        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // OTP valid for 5 minutes
        const otpExpires = new Date(
            Date.now() + 5 * 60 * 1000
        );

        const customer = new Customer({

            name,
            email,
            phone,
            password,
            address,

            otp,
            otpExpires,

            isVerified: false

        });

        await customer.save();

        // Send OTP
        await sendOTPEmail(email, otp);

        res.status(201).json({

            message: "Registration successful. OTP sent to your email.",

            email: email,

            userType: "customer"

        });

    } catch (error) {

        console.error("Customer registration error:", error);

        res.status(500).json({
            message: "Registration failed"
        });

    }
};

// ===============================
// ADD CROP
// ===============================

const addCrop = async (req, res) => {

    try {

        console.log("Received crop data:", req.body);

        const {
            farmerId,
            cropName,
            quantity,
            unit,
            price,
            location
        } = req.body;


        const newCrop = new Crop({

            farmerId: farmerId,
            cropName: cropName,
            quantity: quantity,
            unit: unit,
            price: price,
            location: location

        });


        await newCrop.save();


        console.log("Crop saved:", newCrop);


        return res.status(201).json({

            message: "Crop added successfully",

            crop: newCrop

        });

    } catch (error) {

        console.log("CROP ERROR:", error);

        return res.status(500).json({

            message: "Error adding crop",

            error: error.message

        });

    }

};
const getFarmerCrops = async (req, res) => {

    try {

        const { farmerId } = req.params;

        console.log("Getting crops for farmer:", farmerId);

        const crops = await Crop.find({
            farmerId: farmerId
        });

        return res.status(200).json({

            message: "Farmer crops fetched successfully",

            crops: crops

        });

    } catch (error) {

        console.log("FARMER CROPS ERROR:", error);

        return res.status(500).json({

            message: "Error fetching farmer crops",

            error: error.message

        });

    }

};
// const Crop = require("./cropschema");

const getCrops = async (req, res) => {
    try {

        const crops = await Crop.find()
            .populate("farmerId", "name phone");

        console.log("Crops from MongoDB:", crops);

        res.status(200).json({
            message: "Crops fetched successfully",
            crops: crops
        });

    } catch (error) {

        console.log("GET CROPS ERROR:", error);

        res.status(500).json({
            message: "Error getting crops",
            error: error.message
        });
    }
};




const Order = require("./orderschema");
const Notification = require("./notificationschema");
// const Customer = require("./customerschema");
// const Farmer = require("./farmerschema");
// const Crop = require("./cropschema");


// =====================================================
// PLACE ORDER
// =====================================================

const placeOrder = async (req, res) => {

    try {

        const {
            customerId,
            customerName,
            customerPhone,

            farmerId,
            cropId,
            quantity,
            address,
            paymentMethod
        } = req.body;


        // =====================================================
        // CHECK REQUIRED FIELDS
        // =====================================================

        if (
            !customerId ||
            !customerName ||
            !customerPhone ||
            !farmerId ||
            !cropId ||
            !quantity ||
            !address ||
            !paymentMethod
        ) {

            return res.status(400).json({
                message: "All order fields are required"
            });

        }


        // =====================================================
        // CHECK PHONE NUMBER
        // =====================================================

        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(customerPhone)) {

            return res.status(400).json({
                message: "Invalid phone number"
            });

        }


        // =====================================================
        // CHECK PAYMENT METHOD
        // =====================================================

        if (
            paymentMethod !== "COD" &&
            paymentMethod !== "UPI"
        ) {

            return res.status(400).json({
                message: "Invalid payment method"
            });

        }


        // =====================================================
        // FIND CUSTOMER
        // =====================================================

        const customer =
            await Customer.findById(customerId);

        if (!customer) {

            return res.status(404).json({
                message: "Customer not found"
            });

        }


        // =====================================================
        // FIND FARMER
        // =====================================================

        const farmer =
            await Farmer.findById(farmerId);

        if (!farmer) {

            return res.status(404).json({
                message: "Farmer not found"
            });

        }


        // =====================================================
        // FIND CROP
        // =====================================================

        const crop =
            await Crop.findById(cropId);

        if (!crop) {

            return res.status(404).json({
                message: "Crop not found"
            });

        }


        // =====================================================
        // CHECK CROP BELONGS TO FARMER
        // =====================================================

        if (
            crop.farmerId.toString() !==
            farmerId.toString()
        ) {

            return res.status(400).json({
                message: "This crop does not belong to this farmer"
            });

        }


        // =====================================================
        // CHECK ORDER QUANTITY
        // =====================================================

        const orderQuantity =
            Number(quantity);

        const availableQuantity =
            Number(crop.quantity);


        if (
            isNaN(orderQuantity) ||
            orderQuantity <= 0
        ) {

            return res.status(400).json({
                message: "Quantity must be greater than 0"
            });

        }


        // =====================================================
        // CHECK AVAILABLE QUANTITY
        // =====================================================

        if (
            orderQuantity >
            availableQuantity
        ) {

            return res.status(400).json({

                message:
                    `Only ${availableQuantity} ${crop.unit} available`

            });

        }


        // =====================================================
        // CALCULATE TOTAL PRICE
        // =====================================================

        const totalAmount =
            Number(crop.price) *
            orderQuantity;


        // =====================================================
        // CREATE ORDER
        // =====================================================

        const newOrder = new Order({

            customerId: customer._id,

            // Customer details
            customerName: customer.name,

            customerPhone: customer.phone,

            customerEmail: customer.email,

            // Farmer details
            farmerId: farmer._id,

            // Crop details
            cropId: crop._id,

            cropName: crop.cropName,

            quantity: orderQuantity,

            unit: crop.unit,

            price: Number(crop.price),

            totalAmount: totalAmount,

            address: address.trim(),

            paymentMethod: paymentMethod,

            paymentStatus: "Pending",

            orderStatus: "Pending"

        });


        // =====================================================
        // SAVE ORDER
        // =====================================================

        const savedOrder =
            await newOrder.save();


        // =====================================================
        // REDUCE CROP QUANTITY
        // =====================================================

        const remainingQuantity =
            availableQuantity -
            orderQuantity;


        crop.quantity =
            remainingQuantity;


        // Save updated quantity in MongoDB
        await crop.save();


        console.log("=================================");
        console.log("CROP QUANTITY UPDATED");
        console.log("Crop:", crop.cropName);
        console.log("Old Quantity:", availableQuantity);
        console.log("Ordered Quantity:", orderQuantity);
        console.log("Remaining Quantity:", remainingQuantity);
        console.log("=================================");


        // =====================================================
        // CREATE NOTIFICATION
        // =====================================================

        const notificationMessage =
            `New order received for ${crop.cropName}. ` +
            `Quantity: ${orderQuantity} ${crop.unit}. ` +
            `Total Amount: ₹${totalAmount}. ` +
            `Payment: ${paymentMethod}. ` +
            `Customer: ${customer.name}. ` +
            `Phone: ${customer.phone}.`;


        const newNotification =
            new Notification({

                farmerId: farmer._id,

                orderId: savedOrder._id,

                message: notificationMessage,

                isRead: false

            });


        await newNotification.save();


        // =====================================================
        // SEND RESPONSE
        // =====================================================

        return res.status(201).json({

            message: "Order placed successfully",

            order: savedOrder,

            notification: newNotification,

            remainingQuantity: remainingQuantity

        });


    } catch (error) {

        console.log(
            "PLACE ORDER ERROR:",
            error
        );


        return res.status(500).json({

            message: "Error placing order",

            error: error.message

        });

    }

};



// =====================================================
// GET FARMER NOTIFICATIONS
// =====================================================

const getFarmerNotifications = async (req, res) => {

    try {

        const { farmerId } = req.params;


        if (!farmerId) {

            return res.status(400).json({

                message: "Farmer ID is required"

            });
        }


        // Get notifications only for this farmer
        const notifications = await Notification
            .find({ farmerId: farmerId })

            .populate({
                path: "orderId",

                populate: {
                    path: "customerId",

                    select:
                        "name phone email address"
                }
            })

            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            message:
                "Farmer notifications fetched successfully",

            notifications: notifications

        });


    } catch (error) {

        console.log(
            "Get farmer notifications error:",
            error
        );


        return res.status(500).json({

            message:
                "Error getting farmer notifications",

            error: error.message

        });
    }
};



const getCustomerOrders = async (req, res) => {
    try {

        const { customerId } = req.params;

        console.log("================================");
        console.log("GET CUSTOMER ORDERS");
        console.log("Customer ID:", customerId);
        console.log("================================");

        if (!customerId) {
            return res.status(400).json({
                message: "Customer ID is required"
            });
        }

        // Check whether customer exists
        const customer = await Customer.findById(customerId);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        // Get customer's orders
        const orders = await Order.find({
            customerId: customerId
        }).sort({
            createdAt: -1
        });

        console.log("Number of orders:", orders.length);
        console.log("Customer orders:", orders);

        return res.status(200).json({
            message: "Customer orders fetched successfully",
            orders: orders
        });

    } catch (error) {

        console.log("================================");
        console.log("GET CUSTOMER ORDERS ERROR");
        console.log(error);
        console.log("================================");

        return res.status(500).json({
            message: "Error getting customer orders",
            error: error.message
        });
    }
};


// =====================================================
// GET ORDERS FOR FARMER
// =====================================================


const getFarmerOrders = async (req, res) => {

    try {

        const { farmerId } = req.params;

        console.log("=================================");
        console.log("FARMER ORDERS");
        console.log("Farmer ID:", farmerId);
        console.log("=================================");

        if (!farmerId) {
            return res.status(400).json({
                message: "Farmer ID is required"
            });
        }

        const orders = await Order.find({
            farmerId: farmerId
        }).sort({
            createdAt: -1
        });

        console.log("Number of orders:", orders.length);

        // Check every customer
        for (const order of orders) {

            console.log(
                "Order ID:",
                order._id
            );

            console.log(
                "Customer ID in order:",
                order.customerId
            );

            const customer = await Customer.findById(
                order.customerId
            );

            console.log(
                "Customer found:",
                customer
            );
        }

        return res.status(200).json({

            message: "Farmer orders fetched successfully",

            orders: orders

        });

    } catch (error) {

        console.log(
            "GET FARMER ORDERS ERROR:",
            error
        );

        return res.status(500).json({

            message: "Error getting farmer orders",

            error: error.message

        });

    }

};

const markOrderDelivered = async (req, res) => {
    try {
        const { orderId } = req.params;

        console.log("================================");
        console.log("MARK ORDER AS DELIVERED");
        console.log("Order ID:", orderId);
        console.log("================================");

        if (!orderId) {
            return res.status(400).json({
                message: "Order ID is required"
            });
        }

        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        order.orderStatus = "Delivered";

        await order.save();

        console.log("Order updated successfully");

        return res.status(200).json({
            message: "Order marked as Delivered",
            order: order
        });

    } catch (error) {
        console.log("MARK DELIVERED ERROR:", error);

        return res.status(500).json({
            message: "Error updating order",
            error: error.message
        });
    }
};
// =====================================
// SEND OTP
// =====================================
// =====================================================
// SEND OTP BEFORE ACCOUNT CREATION
// =====================================================

const sendOTP = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            address,
            farmLocation,
            userType
        } = req.body;

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (
            !name ||
            !email ||
            !phone ||
            !password ||
            !address ||
            !userType
        ) {
            return res.status(400).json({
                message: "All required fields must be filled"
            });
        }

        if (userType === "farmer" && !farmLocation) {
            return res.status(400).json({
                message: "Farm location is required"
            });
        }

        if (
            userType !== "customer" &&
            userType !== "farmer"
        ) {
            return res.status(400).json({
                message: "Invalid user type"
            });
        }

        // ---------------------------------------------
        // CHECK WHETHER EMAIL ALREADY EXISTS
        // ---------------------------------------------

        const existingCustomer = await Customer.findOne({
            email
        });

        const existingFarmer = await Farmer.findOne({
            email
        });

        if (existingCustomer || existingFarmer) {
            return res.status(400).json({
                message: "Email is already registered"
            });
        }

        // ---------------------------------------------
        // GENERATE 6 DIGIT OTP
        // ---------------------------------------------

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // OTP valid for 5 minutes
        const otpExpires = new Date(
            Date.now() + 5 * 60 * 1000
        );



        // ---------------------------------------------
        // SAVE TEMPORARY REGISTRATION DATA
        // ---------------------------------------------

        await PendingVerification.findOneAndUpdate(
            {
                email,
                userType
            },
            {
                name,
                email,
                phone,
                password: password,
                address,
                farmLocation:
                    userType === "farmer"
                        ? farmLocation
                        : "",
                userType,
                otp,
                otpExpires
            },
            {
                upsert: true,
                new: true
            }
        );

        // ---------------------------------------------
        // SEND OTP EMAIL
        // ---------------------------------------------

        await sendOTPEmail(email, otp);

        return res.status(200).json({
            message: "OTP sent successfully",
            email,
            userType
        });

    } catch (error) {

        console.error(
            "SEND OTP ERROR:",
            error
        );

        return res.status(500).json({
            message: "Failed to send OTP",
            error: error.message
        });
    }
};
// =====================================================
// VERIFY OTP AND CREATE ACCOUNT
// =====================================================

const verifyOTP = async (req, res) => {
    try {
        const {
            email,
            otp,
            userType
        } = req.body;

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (!email || !otp || !userType) {
            return res.status(400).json({
                message:
                    "Email, OTP and user type are required"
            });
        }

        // ---------------------------------------------
        // FIND TEMPORARY REGISTRATION
        // ---------------------------------------------

        const pendingUser =
            await PendingVerification.findOne({
                email,
                userType
            });

        if (!pendingUser) {
            return res.status(404).json({
                message:
                    "No pending verification found. Please signup again."
            });
        }

        // ---------------------------------------------
        // CHECK OTP
        // ---------------------------------------------

        if (pendingUser.otp !== otp) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        // ---------------------------------------------
        // CHECK OTP EXPIRY
        // ---------------------------------------------

        if (
            !pendingUser.otpExpires ||
            new Date() > new Date(pendingUser.otpExpires)
        ) {
            return res.status(400).json({
                message:
                    "OTP has expired. Please request a new OTP."
            });
        }

        // ---------------------------------------------
        // CHECK EMAIL AGAIN
        // ---------------------------------------------

        const existingCustomer =
            await Customer.findOne({
                email
            });

        const existingFarmer =
            await Farmer.findOne({
                email
            });

        if (existingCustomer || existingFarmer) {

            await PendingVerification.deleteOne({
                _id: pendingUser._id
            });

            return res.status(400).json({
                message:
                    "Email is already registered"
            });
        }

        // ---------------------------------------------
        // CREATE CUSTOMER
        // ---------------------------------------------

        let newUser;

        if (userType === "customer") {

            newUser = new Customer({
                name: pendingUser.name,
                email: pendingUser.email,
                phone: pendingUser.phone,
                password: pendingUser.password,
                address: pendingUser.address,

                // Account is verified immediately
                // because OTP was successfully verified
                isVerified: true,

                otp: null,
                otpExpires: null
            });

            await newUser.save();
        }

        // ---------------------------------------------
        // CREATE FARMER
        // ---------------------------------------------

        else if (userType === "farmer") {

            newUser = new Farmer({
                name: pendingUser.name,
                email: pendingUser.email,
                phone: pendingUser.phone,
                password: pendingUser.password,
                address: pendingUser.address,
                farmLocation: pendingUser.farmLocation,

                // Account is verified immediately
                isVerified: true,

                otp: null,
                otpExpires: null
            });

            await newUser.save();
        }

        // ---------------------------------------------
        // DELETE TEMPORARY DATA
        // ---------------------------------------------

        await PendingVerification.deleteOne({
            _id: pendingUser._id
        });

        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        return res.status(201).json({
            message:
                "Email verified and account created successfully",
            userId: newUser._id,
            userType
        });

    } catch (error) {

        console.error(
            "VERIFY OTP ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "OTP verification failed",
            error: error.message
        });
    }
};
// =====================================================
// FORGOT PASSWORD - SEND OTP
// =====================================================

const forgotPassword = async (req, res) => {
    try {

        const { email, userType } = req.body;

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (!email || !userType) {
            return res.status(400).json({
                message: "Email and user type are required"
            });
        }

        if (
            userType !== "customer" &&
            userType !== "farmer"
        ) {
            return res.status(400).json({
                message: "Invalid user type"
            });
        }

        // ---------------------------------------------
        // FIND USER
        // ---------------------------------------------

        let user;

        if (userType === "customer") {

            user = await Customer.findOne({ email });

        } else {

            user = await Farmer.findOne({ email });

        }

        // ---------------------------------------------
        // CHECK USER
        // ---------------------------------------------

        if (!user) {
            return res.status(404).json({
                message: "No account found with this email"
            });
        }

        // ---------------------------------------------
        // GENERATE OTP
        // ---------------------------------------------

        const otp = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // OTP valid for 5 minutes

        const otpExpires = new Date(
            Date.now() + 5 * 60 * 1000
        );

        // ---------------------------------------------
        // SAVE OTP
        // ---------------------------------------------

        user.otp = otp;
        user.otpExpires = otpExpires;

        await user.save();

        // ---------------------------------------------
        // SEND EMAIL
        // ---------------------------------------------

        await sendOTPEmail(email, otp);

        // ---------------------------------------------
        // RESPONSE
        // ---------------------------------------------

        return res.status(200).json({

            message: "Password reset OTP sent successfully",

            email: email,

            userType: userType

        });

    } catch (error) {

        console.error(
            "FORGOT PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            message: "Failed to send password reset OTP",

            error: error.message

        });

    }
};


// =====================================================
// VERIFY FORGOT PASSWORD OTP
// =====================================================

const verifyForgotPasswordOTP = async (req, res) => {

    try {

        const {
            email,
            otp,
            userType
        } = req.body;


        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (!email || !otp || !userType) {

            return res.status(400).json({

                message:
                    "Email, OTP and user type are required"

            });

        }


        // ---------------------------------------------
        // FIND USER
        // ---------------------------------------------

        let user;

        if (userType === "customer") {

            user = await Customer.findOne({
                email
            });

        } else if (userType === "farmer") {

            user = await Farmer.findOne({
                email
            });

        } else {

            return res.status(400).json({

                message: "Invalid user type"

            });

        }


        // ---------------------------------------------
        // CHECK USER
        // ---------------------------------------------

        if (!user) {

            return res.status(404).json({

                message:
                    "No account found with this email"

            });

        }


        // ---------------------------------------------
        // CHECK OTP
        // ---------------------------------------------

        if (user.otp !== otp) {

            return res.status(400).json({

                message: "Invalid OTP"

            });

        }


        // ---------------------------------------------
        // CHECK OTP EXPIRY
        // ---------------------------------------------

        if (
            !user.otpExpires ||
            new Date() > new Date(user.otpExpires)
        ) {

            return res.status(400).json({

                message:
                    "OTP has expired. Please request a new OTP."

            });

        }


        // ---------------------------------------------
        // OTP VERIFIED
        // ---------------------------------------------

        return res.status(200).json({

            message:
                "OTP verified successfully"

        });

    } catch (error) {

        console.error(
            "VERIFY FORGOT PASSWORD OTP ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "OTP verification failed",

            error: error.message

        });

    }

};


// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (req, res) => {

    try {

        const {
            email,
            otp,
            userType,
            newPassword
        } = req.body;


        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (
            !email ||
            !otp ||
            !userType ||
            !newPassword
        ) {

            return res.status(400).json({

                message:
                    "All fields are required"

            });

        }


        // ---------------------------------------------
        // PASSWORD LENGTH
        // ---------------------------------------------

        if (newPassword.length < 6) {

            return res.status(400).json({

                message:
                    "Password must be at least 6 characters"

            });

        }


        // ---------------------------------------------
        // FIND USER
        // ---------------------------------------------

        let user;

        if (userType === "customer") {

            user = await Customer.findOne({
                email
            });

        } else if (userType === "farmer") {

            user = await Farmer.findOne({
                email
            });

        } else {

            return res.status(400).json({

                message: "Invalid user type"

            });

        }


        // ---------------------------------------------
        // CHECK USER
        // ---------------------------------------------

        if (!user) {

            return res.status(404).json({

                message:
                    "No account found with this email"

            });

        }


        // ---------------------------------------------
        // CHECK OTP AGAIN
        // ---------------------------------------------

        if (user.otp !== otp) {

            return res.status(400).json({

                message: "Invalid OTP"

            });

        }


        // ---------------------------------------------
        // CHECK OTP EXPIRY
        // ---------------------------------------------

        if (
            !user.otpExpires ||
            new Date() > new Date(user.otpExpires)
        ) {

            return res.status(400).json({

                message:
                    "OTP has expired. Please request a new OTP."

            });

        }


        // ---------------------------------------------
        // UPDATE PASSWORD
        // ---------------------------------------------

        user.password = newPassword;

        // Clear OTP after successful password reset

        user.otp = null;
        user.otpExpires = null;

        await user.save();


        // ---------------------------------------------
        // SUCCESS
        // ---------------------------------------------

        return res.status(200).json({

            message:
                "Password reset successfully"

        });

    } catch (error) {

        console.error(
            "RESET PASSWORD ERROR:",
            error
        );

        return res.status(500).json({

            message:
                "Failed to reset password",

            error: error.message

        });

    }

};
module.exports = {

    registerFarmer, registerCustomer, addCrop,
    getFarmerCrops, getCrops, placeOrder,
    getFarmerNotifications, getCustomerOrders, getFarmerOrders,
    markOrderDelivered, verifyOTP, sendOTP,
    forgotPassword, verifyForgotPasswordOTP, resetPassword

};



const Farmer = require("./farmerschema");
const Customer = require("./customerschema");


const signin = async (req, res) => {

    try {

        const {
            email,
            password,
            userType
        } = req.body;


        // Check fields
        if (!email || !password || !userType) {

            return res.status(400).json({
                message: "Email, password and user type are required"
            });

        }


        let user;


        // =========================
        // FARMER LOGIN
        // =========================

        if (userType === "farmer") {

            user = await Farmer.findOne({
                email: email
            });

        }


        // =========================
        // CUSTOMER LOGIN
        // =========================

        else if (userType === "customer") {

            user = await Customer.findOne({
                email: email
            });

        }


        // Invalid user type
        else {

            return res.status(400).json({
                message: "Invalid user type"
            });

        }


        // User not found
        if (!user) {

            return res.status(401).json({
                message: "Incorrect email or password"
            });

        }


        // =========================
        // CHECK PASSWORD
        // =========================

        if (password !== user.password) {

            return res.status(401).json({
                message: "Incorrect email or password"
            });

        }


        // =========================
        // LOGIN SUCCESS
        // =========================

        return res.status(200).json({

            message: "Login successful",

            userId: user._id,

            userType: userType

        });


    } catch (error) {

        console.log("Signin error:", error);

        return res.status(500).json({

            message: "Signin failed",

            error: error.message

        });

    }

};


module.exports = {
    signin
};


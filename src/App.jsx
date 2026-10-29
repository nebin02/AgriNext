
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Signin from "./Signin";
import Signup from "./Signup";
import CustomerCrops from "./CustomerCrops";
import FarmerDashboard from "./FarmerDashboard";
import AddCrop from "./AddCrop";
import MyCrops from "./MyCrops";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Order from "./Order";
import FarmerOrders from "./FarmerOrders";


const App=()=> {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Home/>} />

                <Route path="/signin" element={<Signin/>} />

                <Route path="/signup" element={<Signup/>} />
                <Route path="/customer-crops" element={<CustomerCrops/>}/>
                <Route path="/farmer-dashboard" element={<FarmerDashboard/>}/>
                <Route path="/add-crop" element={<AddCrop/>}/>
                <Route path="/my-crops" element={<MyCrops/>}/>
                <Route path="/Cart" element={<Cart/>}/>
                <Route path="/checkout" element={<Checkout/>}/>
                <Route path="/orders" element={<Order/>}/>
                <Route path="/farmer-orders" element={<FarmerOrders/>}/>

            </Routes>
        </BrowserRouter>
    );
}

export default App;

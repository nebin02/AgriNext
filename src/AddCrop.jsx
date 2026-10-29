import React, { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import styles from "./AddCrop.module.css";

const AddCrop = () => {

    const navigate = useNavigate();

    // ================= CROP DETAILS =================

    const [crop, setCrop] = useState({
        cropName: "",
        quantity: "",
        unit: "kg",
        price: "",
        location: ""
    });

    // ================= IMAGE =================

    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // ================= MESSAGE =================

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // ================= HANDLE INPUT =================

    const handleChange = (e) => {

        setCrop({
            ...crop,
            [e.target.name]: e.target.value
        });

    };

    // ================= HANDLE IMAGE =================

    const handleImageChange = (e) => {

        const selectedImage = e.target.files[0];

        // No image selected
        if (!selectedImage) {

            setImage(null);
            setImagePreview("");

            return;
        }

        // ================= CHECK IMAGE TYPE =================

        const allowedTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
        ];

        if (!allowedTypes.includes(selectedImage.type)) {

            setMessage(
                "Please select JPG, JPEG, PNG or WEBP image"
            );

            setImage(null);
            setImagePreview("");

            return;
        }

        // ================= CHECK IMAGE SIZE =================

        const maxSize = 5 * 1024 * 1024;

        if (selectedImage.size > maxSize) {

            setMessage(
                "Image size must be less than 5 MB"
            );

            setImage(null);
            setImagePreview("");

            return;
        }

        // ================= SAVE IMAGE =================

        setImage(selectedImage);

        // ================= IMAGE PREVIEW =================

        const previewUrl = URL.createObjectURL(selectedImage);

        setImagePreview(previewUrl);

        // Clear previous message
        setMessage("");

    };

    // ================= ADD CROP =================

    const handleSubmit = async (e) => {

        e.preventDefault();

        // ================= GET FARMER ID =================

        const farmerId = localStorage.getItem("userId");

        console.log("========== ADD CROP START ==========");
        console.log("Farmer ID:", farmerId);
        console.log("Crop:", crop);
        console.log("Image:", image);

        // ================= CHECK LOGIN =================

        if (!farmerId) {

            setMessage(
                "Please login as a farmer first"
            );

            return;
        }

        // ================= CHECK IMAGE =================

        if (!image) {

            setMessage(
                "Crop image is required"
            );

            return;
        }

        // ================= CHECK CROP NAME =================

        if (!crop.cropName.trim()) {

            setMessage(
                "Crop name is required"
            );

            return;
        }

        // ================= CHECK QUANTITY =================

        if (!crop.quantity || Number(crop.quantity) <= 0) {

            setMessage(
                "Please enter a valid quantity"
            );

            return;
        }

        // ================= CHECK PRICE =================

        if (!crop.price || Number(crop.price) <= 0) {

            setMessage(
                "Please enter a valid price"
            );

            return;
        }

        // ================= CHECK LOCATION =================

        if (!crop.location.trim()) {

            setMessage(
                "Location is required"
            );

            return;
        }

        try {

            setLoading(true);
            setMessage("");

            // ================= CREATE FORM DATA =================

            const formData = new FormData();

            formData.append(
                "farmerId",
                farmerId
            );

            formData.append(
                "cropName",
                crop.cropName.trim()
            );

            formData.append(
                "quantity",
                Number(crop.quantity)
            );

            formData.append(
                "unit",
                crop.unit
            );

            formData.append(
                "price",
                Number(crop.price)
            );

            formData.append(
                "location",
                crop.location.trim()
            );

            // IMPORTANT:
            // This name must match upload.single("image")
            formData.append(
                "image",
                image
            );

            // ================= DEBUG FORM DATA =================

            console.log("========== FORM DATA ==========");

            for (const pair of formData.entries()) {

                console.log(
                    pair[0],
                    ":",
                    pair[1]
                );

            }

            console.log(
                "Sending request to backend..."
            );

            // ================= SEND TO BACKEND =================

            // IMPORTANT:
            // DO NOT manually set Content-Type here.
            // Axios will automatically set:
            // multipart/form-data + boundary

            const response = await api.post(
                "/crop/add",
                formData
            );

            // ================= SUCCESS RESPONSE =================

            console.log(
                "========== ADD CROP SUCCESS =========="
            );

            console.log(
                "Response:",
                response.data
            );

            setMessage(
                "Crop added successfully 🌱"
            );

            // ================= CLEAR CROP FORM =================

            setCrop({
                cropName: "",
                quantity: "",
                unit: "kg",
                price: "",
                location: ""
            });

            // ================= CLEAR IMAGE =================

            setImage(null);
            setImagePreview("");

            // ================= CLEAR FILE INPUT =================

            const fileInput =
                document.getElementById("cropImage");

            if (fileInput) {

                fileInput.value = "";

            }

            // ================= GO DASHBOARD =================

            setTimeout(() => {

                navigate(
                    "/farmer-dashboard"
                );

            }, 1500);

        } catch (error) {

            // ================= REAL ERROR =================

            console.log(
                "========== ADD CROP ERROR =========="
            );

            console.log(
                "FULL ERROR:",
                error
            );

            console.log(
                "ERROR MESSAGE:",
                error.message
            );

            console.log(
                "STATUS:",
                error.response?.status
            );

            console.log(
                "BACKEND RESPONSE:",
                error.response?.data
            );

            console.log(
                "BACKEND MESSAGE:",
                error.response?.data?.message
            );

            // ================= ERROR MESSAGE =================

            let errorMessage =
                "Error adding crop";

            if (
                error.response?.data?.message
            ) {

                const backendMessage =
                    error.response.data.message;

                if (
                    typeof backendMessage === "string"
                ) {

                    errorMessage =
                        backendMessage;

                } else {

                    errorMessage =
                        JSON.stringify(
                            backendMessage
                        );

                }

            } else if (error.message) {

                errorMessage =
                    error.message;

            }

            setMessage(errorMessage);

        } finally {

            setLoading(false);

        }

    };

    // ================= UI =================

    return (

        <div className={styles.container}>

            <div className={styles.card}>

                {/* ================= TITLE ================= */}

                <h1>
                    🌱 Add New Crop
                </h1>

                <p>
                    Add your crop to make it available
                    to customers.
                </p>

                {/* ================= FORM ================= */}

                <form onSubmit={handleSubmit}>

                    {/* ================= CROP NAME ================= */}

                    <label>
                        Crop Name
                    </label>

                    <input
                        type="text"
                        name="cropName"
                        value={crop.cropName}
                        onChange={handleChange}
                        placeholder="Example: Tomato"
                        required
                    />

                    {/* ================= QUANTITY ================= */}

                    <label>
                        Quantity
                    </label>

                    <input
                        type="number"
                        name="quantity"
                        value={crop.quantity}
                        onChange={handleChange}
                        placeholder="Example: 200"
                        min="1"
                        required
                    />

                    {/* ================= UNIT ================= */}

                    <label>
                        Unit
                    </label>

                    <select
                        name="unit"
                        value={crop.unit}
                        onChange={handleChange}
                    >

                        <option value="kg">
                            Kilogram (KG)
                        </option>

                        <option value="gram">
                            Gram
                        </option>

                        <option value="ton">
                            Ton
                        </option>

                        <option value="piece">
                            Piece
                        </option>

                    </select>

                    {/* ================= PRICE ================= */}

                    <label>
                        Price per Unit
                    </label>

                    <input
                        type="number"
                        name="price"
                        value={crop.price}
                        onChange={handleChange}
                        placeholder="Example: 40"
                        min="1"
                        required
                    />

                    {/* ================= LOCATION ================= */}

                    <label>
                        Location
                    </label>

                    <input
                        type="text"
                        name="location"
                        value={crop.location}
                        onChange={handleChange}
                        placeholder="Example: Nagercoil"
                        required
                    />

                    {/* ================= IMAGE ================= */}

                    <label>
                        Crop Image
                    </label>

                    <input
                        id="cropImage"
                        type="file"
                        accept="
                            image/jpeg,
                            image/jpg,
                            image/png,
                            image/webp
                        "
                        onChange={handleImageChange}
                        required
                    />

                    {/* ================= IMAGE PREVIEW ================= */}

                    {imagePreview && (

                        <div
                            className={
                                styles.imagePreviewContainer
                            }
                        >

                            <p>
                                Image Preview
                            </p>

                            <img
                                src={imagePreview}
                                alt="Crop Preview"
                                className={
                                    styles.imagePreview
                                }
                            />

                        </div>

                    )}

                    {/* ================= ADD CROP BUTTON ================= */}

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Uploading Crop..."
                            : "Add Crop 🌾"
                        }

                    </button>

                </form>

                {/* ================= MESSAGE ================= */}

                {message && (

                    <p
                        className={
                            styles.message
                        }
                    >

                        {message}

                    </p>

                )}

                {/* ================= BACK BUTTON ================= */}

                <button
                    type="button"
                    className={
                        styles.backButton
                    }
                    onClick={() =>
                        navigate(
                            "/farmer-dashboard"
                        )
                    }
                >

                    ← Back to Dashboard

                </button>

            </div>

        </div>

    );

};

export default AddCrop;
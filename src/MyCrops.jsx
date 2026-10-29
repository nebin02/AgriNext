import React, { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import styles from "./MyCrops.module.css";
import formatCurrency from "./formatCurrency";

const MyCrops = () => {

    const navigate = useNavigate();

    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);

    const [editingCrop, setEditingCrop] = useState(null);

    const [editForm, setEditForm] = useState({
        cropName: "",
        quantity: "",
        unit: "kg",
        price: "",
        location: "",
        farmerName: ""
    });

    const [saving, setSaving] = useState(false);

    const farmerId = localStorage.getItem("userId");


    // ==========================================
    // GET MY CROPS
    // ==========================================

    const getMyCrops = async () => {

        try {

            const response = await api.get(
                `/crops/farmer/${farmerId}`
            );

            console.log("My crops:", response.data);

            setCrops(response.data.crops || []);

        } catch (error) {

            console.log(
                "Error getting my crops:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        if (farmerId) {

            getMyCrops();

        } else {

            setLoading(false);

        }

    }, [farmerId]);


    // ==========================================
    // OPEN EDIT
    // ==========================================

    const openEdit = (crop) => {

        setEditingCrop(crop);

        setEditForm({

            cropName: crop.cropName || "",

            quantity: crop.quantity || "",

            unit: crop.unit || "kg",

            price: crop.price || "",

            location: crop.location || "",

            farmerName: crop.farmerId?.name || ""

        });

    };


    // ==========================================
    // CLOSE EDIT
    // ==========================================

    const closeEdit = () => {

        setEditingCrop(null);

        setEditForm({

            cropName: "",
            quantity: "",
            unit: "kg",
            price: "",
            location: "",
            farmerName: ""

        });

    };


    // ==========================================
    // HANDLE INPUT
    // ==========================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setEditForm((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    // ==========================================
    // SAVE CHANGES
    // ==========================================

    const saveChanges = async () => {

        try {

            setSaving(true);


            // ==================================
            // UPDATE CROP
            // ==================================

            await api.put(

                `/crop/update/${editingCrop._id}`,

                {
                    cropName: editForm.cropName,
                    quantity: editForm.quantity,
                    unit: editForm.unit,
                    price: editForm.price,
                    location: editForm.location
                }

            );


            // ==================================
            // UPDATE FARMER NAME
            // ==================================

            if (
                editForm.farmerName.trim() &&
                editForm.farmerName.trim() !==
                editingCrop.farmerId?.name
            ) {

                await api.put(

                    `/farmer/update/${farmerId}`,

                    {
                        name: editForm.farmerName.trim()
                    }

                );

            }


            // ==================================
            // REFRESH CROPS
            // ==================================

            await getMyCrops();


            alert("Changes saved successfully! âœ…");


            closeEdit();


        } catch (error) {

            console.log(
                "Update error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update changes"
            );

        } finally {

            setSaving(false);

        }
    };


    return (

        <div className={styles.container}>

            {/* ==================================
            HEADER
            ================================== */}

            <div className={styles.header}>

                <div>

                    <h1>
                        ðŸŒ± My Crops
                    </h1>

                    <p>
                        Manage the crops you have added.
                    </p>

                </div>


                <button
                    className={styles.addButton}
                    onClick={() =>
                        navigate("/add-crop")
                    }
                >
                    + Add Crop
                </button>

            </div>


            {/* ==================================
            LOADING
            ================================== */}

            {loading && (

                <p className={styles.loading}>
                    Loading crops...
                </p>

            )}


            {/* ==================================
            EMPTY
            ================================== */}

            {!loading &&
                crops.length === 0 && (

                    <div className={styles.empty}>

                        <div className={styles.emptyIcon}>
                            ðŸŒ¾
                        </div>

                        <h2>
                            No crops added yet
                        </h2>

                        <p>
                            Add your first crop to make it
                            available to customers.
                        </p>

                        <button
                            onClick={() =>
                                navigate("/add-crop")
                            }
                        >
                            + Add Your First Crop
                        </button>

                    </div>

                )}


            {/* ==================================
            CROP GRID
            ================================== */}

            <div className={styles.grid}>

                {crops.map((crop) => (

                    <div
                        className={styles.card}
                        key={crop._id}
                    >

                        <div className={styles.cardHeader}>

                            <h2>
                                {crop.cropName} ðŸŒ¾
                            </h2>

                            <button
                                className={styles.editButton}
                                onClick={() =>
                                    openEdit(crop)
                                }
                            >
                                âœï¸ Edit
                            </button>

                        </div>


                        <p>
                            <strong>
                                Quantity:
                            </strong>{" "}
                            {crop.quantity} {crop.unit}
                        </p>


                        <p>
                            <strong>
                                Price:
                            </strong>{" "}
                            {formatCurrency(crop.price)} / {crop.unit}
                        </p>


                        <p>
                            <strong>
                                Location:
                            </strong>{" "}
                            {crop.location}
                        </p>


                        <p>
                            <strong>
                                Farmer:
                            </strong>{" "}
                            {crop.farmerId?.name ||
                                "Farmer"}
                        </p>

                    </div>

                ))}

            </div>


            {/* ==================================
            EDIT MODAL
            ================================== */}

            {editingCrop && (

                <div className={styles.modalOverlay}>

                    <div className={styles.modal}>

                        <div className={styles.modalHeader}>

                            <h2>
                                âœï¸ Edit Crop
                            </h2>

                            <button
                                className={styles.closeButton}
                                onClick={closeEdit}
                            >
                                Ã—
                            </button>

                        </div>


                        {/* FARMER NAME */}

                        <label>
                            Farmer Name
                        </label>

                        <input
                            type="text"
                            name="farmerName"
                            value={editForm.farmerName}
                            onChange={handleChange}
                            placeholder="Farmer name"
                        />


                        {/* CROP NAME */}

                        <label>
                            Crop Name
                        </label>

                        <input
                            type="text"
                            name="cropName"
                            value={editForm.cropName}
                            onChange={handleChange}
                            placeholder="Crop name"
                        />


                        {/* QUANTITY */}

                        <label>
                            Quantity
                        </label>

                        <input
                            type="number"
                            name="quantity"
                            value={editForm.quantity}
                            onChange={handleChange}
                            min="1"
                        />


                        {/* UNIT */}

                        <label>
                            Unit
                        </label>

                        <select
                            name="unit"
                            value={editForm.unit}
                            onChange={handleChange}
                        >

                            <option value="kg">
                                kg
                            </option>

                            <option value="ton">
                                ton
                            </option>

                            <option value="gram">
                                gram
                            </option>

                            <option value="quintal">
                                quintal
                            </option>

                        </select>


                        {/* PRICE */}

                        <label>
                            Price
                        </label>

                        <input
                            type="number"
                            name="price"
                            value={editForm.price}
                            onChange={handleChange}
                            min="0"
                        />


                        {/* LOCATION */}

                        <label>
                            Location
                        </label>

                        <input
                            type="text"
                            name="location"
                            value={editForm.location}
                            onChange={handleChange}
                            placeholder="Location"
                        />


                        {/* BUTTONS */}

                        <div className={styles.modalButtons}>

                            <button
                                className={styles.cancelButton}
                                onClick={closeEdit}
                                disabled={saving}
                            >
                                Cancel
                            </button>


                            <button
                                className={styles.saveButton}
                                onClick={saveChanges}
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : "ðŸ’¾ Save Changes"}
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* ==================================
            BACK
            ================================== */}

            <button
                className={styles.backButton}
                onClick={() =>
                    navigate("/farmer-dashboard")
                }
            >
                â† Back to Dashboard
            </button>

        </div>

    );

};

export default MyCrops;
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function VerifyEmail() {
    const { id, hash } = useParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        axios
            .get(`http://localhost:8000/api/verify-email/${id}/${hash}`)
            .then(res => {
                setMessage(res.data.message);

                // Redirect after 3 seconds if successful
                if (res.data.status === "success") {
                    setTimeout(() => navigate("/auth"), 3000);
                }
            })
            .catch(err => {
                if (err.response) setMessage(err.response.data.message);
                else setMessage("Something went wrong.");
            });
    }, [id, hash, navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: "100px" }}>
            <h2>{message}</h2>
            <p>{message.includes("success") ? "Redirecting to login..." : ""}</p>
        </div>
    );
}

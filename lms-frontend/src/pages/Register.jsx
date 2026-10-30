import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
}
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

   const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await registerUser(formData);

    console.log("Registration successful:", response);

    alert("Account created successfully! Please log in.");
  } catch (error) {
    console.error("Registration error:", error.response?.data);

    alert(
      error.response?.data?.email?.[0] ||
      error.response?.data?.username?.[0] ||
      error.response?.data?.password?.[0] ||
      "Registration failed. Please try again."
    );
  }
};

export default Register;
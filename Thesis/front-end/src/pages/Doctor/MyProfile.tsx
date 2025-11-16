import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

interface Doctor {
  doctorId: number;
  userId: number;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNo: string;
}

export default function MyProfile() {
  const { userId } = useAuth(); // grab the logged-in user's ID
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchDoctor = async () => {
      try {
        const response = await api.get<Doctor[]>(`/Doctors`);
        // find the doctor record that matches this user's ID
        const myDoctor = response.data.find(d => d.userId === userId);
        if (myDoctor) setDoctor(myDoctor);
        else setError("No doctor profile found for this user.");
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!doctor) return;
    const { name, value } = e.target;
    setDoctor({ ...doctor, [name]: value });
  };

  const handleSave = async () => {
    if (!doctor) return;
    try {
      await api.put(`/Doctors/${doctor.doctorId}`, doctor);
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>My Profile</h2>
      <label>
        First Name:
        <input name="firstName" value={doctor?.firstName || ""} onChange={handleChange} />
      </label>
      <br />
      <label>
        Last Name:
        <input name="lastName" value={doctor?.lastName || ""} onChange={handleChange} />
      </label>
      <br />
      <label>
        Specialty:
        <input name="specialty" value={doctor?.specialty || ""} onChange={handleChange} />
      </label>
      <br />
      <label>
        License No:
        <input name="licenseNo" value={doctor?.licenseNo || ""} onChange={handleChange} />
      </label>
      <br />
      <button onClick={handleSave}>Save</button>
    </div>
  );
}
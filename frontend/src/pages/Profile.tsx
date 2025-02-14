// src/components/Profile.tsx
import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../api';
import EditProfileForm from './EditProfileForm';
import { Order, OrderItem } from '../api/orders';

export interface Profile {
  profile_uuid: string;
  gender: string;
  phone_number: string;
  address: string;
  date_of_birth: string;
  about: string;
  user: {
    uuid: string;
    email: string;
    name: string;
  };
}

const Profile: React.FC = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    if (user && user.profile_uuid) {
      fetchProfile(user.profile_uuid);
      fetchOrders(); // Fetch the orders after profile is fetched
    }
  }, [user]);

  const fetchProfile = async (profileUUID: string) => {
    try {
      const response = await api.get(`/user/profile/${profileUUID}/`);
      setProfile(response.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch profile details.');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/orders/');
      console.log('Orders fetched:', response.data);  // Log to verify the response
      if (response.data && Array.isArray(response.data.results)) {
      setOrders(response.data.results);  // Set the orders from response.data.results
    } else {
      setOrders([]);
      setError('Unexpected response format.');
    }
  } catch (err: any) {
    console.error(err);
    setError('Failed to fetch orders.');
  }
};

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleProfileUpdate = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="container text-center mt-5">
        <p>You must be logged in to view this page.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container text-center mt-5">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      {isEditing ? (
        <EditProfileForm
          profile={profile}
          onCancel={handleCancelEdit}
          onUpdate={handleProfileUpdate}
        />
      ) : (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Your Profile</h4>
                <div>
                  <button
                    className="btn btn-light btn-sm me-2"
                    onClick={handleEditClick}
                  >
                    Edit Profile
                  </button>
                  <Link to="/change-password" className="btn btn-secondary btn-sm">
                    Change Password
                  </Link>
                </div>
              </div>
              <div className="card-body">
                <h5 className="card-title">User Details</h5>
                <p className="card-text">
                  <strong>Name:</strong> {profile.user.name}
                </p>
                <p className="card-text">
                  <strong>Email:</strong> {profile.user.email}
                </p>
                <hr />
                <h5 className="card-title">Profile Information</h5>
                <p className="card-text">
                  <strong>Profile UUID:</strong> {profile.profile_uuid}
                </p>
                <p className="card-text">
                  <strong>Gender:</strong> {profile.gender || 'Not specified'}
                </p>
                <p className="card-text">
                  <strong>Phone Number:</strong> {profile.phone_number || 'Not provided'}
                </p>
                <p className="card-text">
                  <strong>Address:</strong> {profile.address || 'Not provided'}
                </p>
                <p className="card-text">
                  <strong>Date of Birth:</strong> {profile.date_of_birth || 'Not provided'}
                </p>
                <p className="card-text">
                  <strong>About:</strong> {profile.about || 'No additional information'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

       {/* Orders Section */}
      <div className="mt-5">
        <h5>Your Orders</h5>
        {Array.isArray(orders) && orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <ul className="list-group">
            {Array.isArray(orders) ? (
              orders.map((order) => (
                <li key={order.uuid} className="list-group-item">
                  <Link to={`/order/${order.uuid}`}>
                    <h6>Order #{order.uuid} - {order.status}</h6>
                    <p>Created on: {new Date(order.created).toLocaleDateString()}</p>
                  </Link>
                  <ul>
                      {order.items?.map((item) => (
                      <li key={item.id}>
                        {item.product.name} (x{item.quantity}) - ${item.price ? parseFloat(item.price.toString()).toFixed(2) : 'N/A'}
                      </li>
                    ))}
                  </ul>
                </li>
              ))
            ) : (
              <p>Loading orders...</p>  // Handle loading state
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Profile;



// // src/components/Profile.tsx
// import React, { useContext, useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
// import api from '../api';
// import EditProfileForm from './EditProfileForm';
//
// export interface Profile {
//   profile_uuid: string;
//   gender: string;
//   phone_number: string;
//   address: string;
//   date_of_birth: string;
//   about: string;
//   user: {
//     uuid: string;
//     email: string;
//     name: string;
//   };
// }
//
// const Profile: React.FC = () => {
//   const { user } = useContext(AuthContext);
//   const [profile, setProfile] = useState<Profile | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//
//   useEffect(() => {
//     if (user && user.profile_uuid) {
//       fetchProfile(user.profile_uuid);
//     }
//   }, [user]);
//
//   const fetchProfile = async (profileUUID: string) => {
//     try {
//       const response = await api.get(`/user/profile/${profileUUID}/`);
//       setProfile(response.data);
//     } catch (err: any) {
//       console.error(err);
//       setError('Failed to fetch profile details.');
//     }
//   };
//
//   const handleEditClick = () => {
//     setIsEditing(true);
//   };
//
//   const handleCancelEdit = () => {
//     setIsEditing(false);
//   };
//
//   const handleProfileUpdate = (updatedProfile: Profile) => {
//     setProfile(updatedProfile);
//     setIsEditing(false);
//   };
//
//   if (!user) {
//     return (
//       <div className="container text-center mt-5">
//         <p>You must be logged in to view this page.</p>
//       </div>
//     );
//   }
//
//   if (error) {
//     return (
//       <div className="container text-center mt-5">
//         <p className="text-danger">{error}</p>
//       </div>
//     );
//   }
//
//   if (!profile) {
//     return (
//       <div className="container text-center mt-5">
//         <div className="spinner-border text-primary" role="status">
//           <span className="visually-hidden">Loading profile...</span>
//         </div>
//       </div>
//     );
//   }
//
//   return (
//     <div className="container mt-5">
//       {isEditing ? (
//         <EditProfileForm
//           profile={profile}
//           onCancel={handleCancelEdit}
//           onUpdate={handleProfileUpdate}
//         />
//       ) : (
//         <div className="row justify-content-center">
//           <div className="col-md-8">
//             <div className="card">
//               <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
//                 <h4 className="mb-0">Your Profile</h4>
//                 <div>
//                   <button
//                     className="btn btn-light btn-sm me-2"
//                     onClick={handleEditClick}
//                   >
//                     Edit Profile
//                   </button>
//                   <Link to="/change-password" className="btn btn-secondary btn-sm">
//                     Change Password
//                   </Link>
//                 </div>
//               </div>
//               <div className="card-body">
//                 <h5 className="card-title">User Details</h5>
//                 <p className="card-text">
//                   <strong>Name:</strong> {profile.user.name}
//                 </p>
//                 <p className="card-text">
//                   <strong>Email:</strong> {profile.user.email}
//                 </p>
//                 <hr />
//                 <h5 className="card-title">Profile Information</h5>
//                 <p className="card-text">
//                   <strong>Profile UUID:</strong> {profile.profile_uuid}
//                 </p>
//                 <p className="card-text">
//                   <strong>Gender:</strong> {profile.gender || 'Not specified'}
//                 </p>
//                 <p className="card-text">
//                   <strong>Phone Number:</strong> {profile.phone_number || 'Not provided'}
//                 </p>
//                 <p className="card-text">
//                   <strong>Address:</strong> {profile.address || 'Not provided'}
//                 </p>
//                 <p className="card-text">
//                   <strong>Date of Birth:</strong> {profile.date_of_birth || 'Not provided'}
//                 </p>
//                 <p className="card-text">
//                   <strong>About:</strong> {profile.about || 'No additional information'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
//
// export default Profile;

import React from 'react';
import { useParams } from 'react-router-dom';

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();

  return (
    <div className="p-6">
      <div className="bg-primary-dark-gray rounded-xl p-8">
        <h1 className="text-2xl font-bold text-primary-shiny-silver mb-4">
          Profile: @{username}
        </h1>
        <p className="text-primary-silver">
          Profile page coming soon...
        </p>
      </div>
    </div>
  );
};

export default Profile;

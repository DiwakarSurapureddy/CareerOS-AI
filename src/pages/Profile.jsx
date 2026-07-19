import React, { useState, useRef } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'Diwakar',
    email: 'diwakar@example.com',
    jobTitle: 'Data Scientist',
    location: 'San Francisco, CA',
    bio: 'Passionate data scientist with 5 years of experience in machine learning and analytics.',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCarTJulv0u346vguiunsBsyM9dCBrrPCEgKCCQq9yV7ZT4pagbeVgvLUYq3NCVJ9a4EgLgA7beiwqdLTghTmoNcvc_2QaoYSpVqW7T2fSyqYDZJywfPsOG2Jufwf7K3P-WQfH6N08lk2dSbrBZBep8FjJTGA1CdX0AKcE3xGEkVw0YkDMg5uEwxhfc7O9oIKul7oYtzonMymz10hVFDP4FzgAuhhbis5La_hbE7YNTh2sVJgfI6EM9h8XPmslyGYvLrn1GN1BlO9w4'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(profile.photoUrl);
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    if (previewPhoto) {
      setProfile(prev => ({ ...prev, photoUrl: previewPhoto }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewPhoto(url);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="font-display-lg text-3xl font-extrabold text-on-surface">Profile</h2>
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 shadow-sm transition-all"
          >
            Edit Profile
          </button>
        ) : (
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-secondary text-white rounded-lg font-semibold hover:bg-secondary/90 shadow-sm transition-all"
          >
            Save Changes
          </button>
        )}
      </div>

      <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row gap-8 items-start">
        {/* Photo Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <img 
              src={isEditing ? previewPhoto : profile.photoUrl} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
            />
            {isEditing && (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-white text-3xl">add_a_photo</span>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
            />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-xl text-on-surface">{profile.name}</h3>
            <p className="text-on-surface-variant text-sm">{profile.jobTitle}</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 space-y-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Full Name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="name" 
                  value={profile.name} 
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              ) : (
                <p className="text-on-surface font-medium">{profile.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email</label>
              {isEditing ? (
                <input 
                  type="email" 
                  name="email" 
                  value={profile.email} 
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              ) : (
                <p className="text-on-surface font-medium">{profile.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Job Title</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="jobTitle" 
                  value={profile.jobTitle} 
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              ) : (
                <p className="text-on-surface font-medium">{profile.jobTitle}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Location</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="location" 
                  value={profile.location} 
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              ) : (
                <p className="text-on-surface font-medium">{profile.location}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Bio</label>
            {isEditing ? (
              <textarea 
                name="bio" 
                value={profile.bio} 
                onChange={handleChange}
                rows={4}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary/20 outline-none text-sm resize-none"
              />
            ) : (
              <p className="text-on-surface font-medium leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

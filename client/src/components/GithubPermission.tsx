import React, { useState } from 'react';
import type { UserInterface } from '../interface/user';

interface Permission {
  name: string;
  description: string;
  required?: boolean;
}

const GithubPermission: React.FC<{ user: UserInterface }> = ({ user }) => {
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      name: "Issues & Pull Requests",
      description: "Allow DevCheck to read and manage your issues and pull requests.",
      required: true
    },
    {
      name: "Webhooks",
      description: "Enable DevCheck to set up webhooks for real-time updates on repository activity.",
    },
    {
      name: "Workflow Status",
      description: "Grant DevCheck access to monitor your GitHub Actions workflow status and results.",
    }
  ]);

  const [enabledPermissions, setEnabledPermissions] = useState<Set<string>>(
    new Set(permissions.filter(p => p.required).map(p => p.name))
  );

  const togglePermission = (permissionName: string) => {
    setEnabledPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionName)) {
        newSet.delete(permissionName);
      } else {
        newSet.add(permissionName);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    console.log('Saving permissions:', Array.from(enabledPermissions));
    // API call to save permissions would go here
  };

  const handleReset = () => {
    setEnabledPermissions(new Set(permissions.filter(p => p.required).map(p => p.name)));
  };

  const allPermissionsEnabled = permissions.length === enabledPermissions.size;
  const somePermissionsEnabled = enabledPermissions.size > 0;

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 ">
            App Preferences
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configure what data DevCheck can access from your GitHub account
          </p>
        </div>
        {user?.github_connected && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800  ">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              Connected
            </span>
          </div>
        )}
      </div>

      {/* Permissions List */}
      <div className="space-y-4">
        {permissions.map((permission, index) => (
          <div
            key={index}
            className={`flex items-start justify-between p-4 rounded-lg border transition-colors ${
              enabledPermissions.has(permission.name)
                ? 'border-primary bg-primary/5 '
                : 'border-gray-200  hover:border-gray-300 '
            }`}
          >
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {permission.name}
                </h3>
                {permission.required && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 ">
                    Required
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500  mt-1">
                {permission.description}
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                role="switch"
                aria-checked={enabledPermissions.has(permission.name)}
                onClick={() => !permission.required && togglePermission(permission.name)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  permission.required
                    ? 'bg-primary cursor-not-allowed opacity-60'
                    : enabledPermissions.has(permission.name)
                    ? 'bg-primary'
                    : 'bg-gray-200 '
                }`}
                disabled={permission.required}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enabledPermissions.has(permission.name) ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {somePermissionsEnabled && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 ">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700  bg-white  border border-gray-300  rounded-md hover:bg-gray-50  transition-colors"
          >
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
          >
            Save Preferences
          </button>
        </div>
      )}

      {/* Info Message for Non-Connected Users */}
      {!user?.github_connected && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200  rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-600  mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800 ">
                GitHub Account Not Connected
              </h3>
              <p className="text-xs text-yellow-700  mt-1">
                Connect your GitHub account first to configure these permissions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Section */}
      {user?.github_connected && somePermissionsEnabled && (
        <div className="mt-4 p-3 bg-gray-50  rounded-lg">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600 ">
              {enabledPermissions.size} of {permissions.length} permissions enabled
            </span>
            {!allPermissionsEnabled && (
              <button
                onClick={() => setEnabledPermissions(new Set(permissions.map(p => p.name)))}
                className="text-primary  font-medium"
              >
                Enable All
              </button>
            )}
          </div>
          <div className="mt-2 w-full bg-gray-200  rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(enabledPermissions.size / permissions.length) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GithubPermission;
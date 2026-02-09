import { useState } from "react"
import { useSelector } from "react-redux"
import { FaCog, FaLock, FaBell, FaTrash, FaSave, FaMoneyBillWave } from "react-icons/fa"

export default function AdminSettings() {
  const { user } = useSelector((state) => state.profile)
  const [settings, setSettings] = useState({
    refundPolicy: {
      maxDays: 7,
      autoApproveAmount: 1000,
      requireApproval: true
    },
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: false,
      courseUpdates: true,
      adminAlerts: true
    },
    securitySettings: {
      twoFactorAuth: true,
      sessionTimeout: 120,
      maxLoginAttempts: 5
    }
  })
  const [isSaving, setIsSaving] = useState(false)

  if (user?.accountType !== "Admin") {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-richblack-200">Access Denied</h1>
        <p className="text-richblack-400 mt-2">You must be an admin to view this page.</p>
      </div>
    )
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    // TODO: Implement API call to save settings
    setTimeout(() => {
      setIsSaving(false)
      alert("Settings saved successfully!")
    }, 1000)
  }

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-richblack-50">Admin Settings</h1>
          <p className="text-richblack-300 mt-1">Configure platform settings and policies</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <FaSave />
          <span>{isSaving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Refund Policy Settings */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center space-x-3 mb-4">
            <FaMoneyBillWave className="text-yellow-400 text-xl" />
            <h2 className="text-xl font-semibold text-richblack-50">Refund Policy</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-richblack-300 mb-2">Maximum Refund Days</label>
              <input
                type="number"
                value={settings.refundPolicy.maxDays}
                onChange={(e) => updateSetting('refundPolicy', 'maxDays', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="block text-sm text-richblack-300 mb-2">Auto-approve Amount (₹)</label>
              <input
                type="number"
                value={settings.refundPolicy.autoApproveAmount}
                onChange={(e) => updateSetting('refundPolicy', 'autoApproveAmount', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-yellow-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.refundPolicy.requireApproval}
                onChange={(e) => updateSetting('refundPolicy', 'requireApproval', e.target.checked)}
                className="w-4 h-4 text-yellow-500 bg-richblack-600 border-richblack-500 rounded focus:ring-yellow-500"
              />
              <label className="text-sm text-richblack-300">Require admin approval for refunds</label>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center space-x-3 mb-4">
            <FaBell className="text-blue-400 text-xl" />
            <h2 className="text-xl font-semibold text-richblack-50">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm text-richblack-300">Email Notifications</label>
                <p className="text-xs text-richblack-400">Receive email updates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationSettings.emailNotifications}
                onChange={(e) => updateSetting('notificationSettings', 'emailNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-richblack-600 border-richblack-500 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm text-richblack-300">Push Notifications</label>
                <p className="text-xs text-richblack-400">Browser push notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationSettings.pushNotifications}
                onChange={(e) => updateSetting('notificationSettings', 'pushNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-richblack-600 border-richblack-500 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm text-richblack-300">Course Updates</label>
                <p className="text-xs text-richblack-400">Updates about courses</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationSettings.courseUpdates}
                onChange={(e) => updateSetting('notificationSettings', 'courseUpdates', e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-richblack-600 border-richblack-500 rounded focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm text-richblack-300">Admin Alerts</label>
                <p className="text-xs text-richblack-400">Important admin notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notificationSettings.adminAlerts}
                onChange={(e) => updateSetting('notificationSettings', 'adminAlerts', e.target.checked)}
                className="w-4 h-4 text-blue-500 bg-richblack-600 border-richblack-500 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center space-x-3 mb-4">
            <FaLock className="text-green-400 text-xl" />
            <h2 className="text-xl font-semibold text-richblack-50">Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm text-richblack-300">Two-Factor Authentication</label>
                <p className="text-xs text-richblack-400">Enhanced security for admin accounts</p>
              </div>
              <input
                type="checkbox"
                checked={settings.securitySettings.twoFactorAuth}
                onChange={(e) => updateSetting('securitySettings', 'twoFactorAuth', e.target.checked)}
                className="w-4 h-4 text-green-500 bg-richblack-600 border-richblack-500 rounded focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm text-richblack-300 mb-2">Session Timeout (minutes)</label>
              <select
                value={settings.securitySettings.sessionTimeout}
                onChange={(e) => updateSetting('securitySettings', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-green-500"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={120}>2 hours</option>
                <option value={240}>4 hours</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-richblack-300 mb-2">Maximum Login Attempts</label>
              <select
                value={settings.securitySettings.maxLoginAttempts}
                onChange={(e) => updateSetting('securitySettings', 'maxLoginAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-richblack-600 border border-richblack-500 rounded-md text-richblack-50 focus:outline-none focus:border-green-500"
              >
                <option value={3}>3 attempts</option>
                <option value={5}>5 attempts</option>
                <option value={10}>10 attempts</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-richblack-700 rounded-lg p-6 border border-richblack-600">
          <div className="flex items-center space-x-3 mb-4">
            <FaCog className="text-purple-400 text-xl" />
            <h2 className="text-xl font-semibold text-richblack-50">System Info</h2>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="text-richblack-400">Platform Version</span>
              <span className="text-richblack-200">v1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-richblack-400">Database Status</span>
              <span className="text-green-400">Connected</span>
            </div>
            <div className="flex justify-between">
              <span className="text-richblack-400">API Status</span>
              <span className="text-green-400">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-richblack-400">Last Backup</span>
              <span className="text-richblack-200">2 hours ago</span>
            </div>
            <div className="pt-4 border-t border-richblack-600">
              <button className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors">
                <FaTrash />
                <span>Clear Cache</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
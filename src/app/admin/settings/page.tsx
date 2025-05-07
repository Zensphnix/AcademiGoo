
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save, Lock } from 'lucide-react'; // Import Save and Lock icon

// Define keys for localStorage
const ADMIN_SETTINGS_GENERAL_KEY = 'adminGeneralSettings';
const ADMIN_SETTINGS_NOTIFICATIONS_KEY = 'adminNotificationSettings';
const ADMIN_SETTINGS_SECURITY_KEY = 'adminSecuritySettings'; // New key for security settings
const LOCAL_STORAGE_DEVICE_BINDING_ENABLED_KEY = 'deviceBindingEnabled'; // Use the same key as login pages

// Interfaces for setting structures
interface GeneralSettings {
    appName: string;
    adminEmail: string;
    maintenanceMode: boolean;
}

interface NotificationSettings {
    delayNotifications: boolean;
    renewalReminders: boolean;
}

// New interface for security settings
interface SecuritySettings {
    deviceBindingEnabled: boolean;
}

const AdminSettingsPage: FC = () => {
    const { toast } = useToast();
    const [isSavingGeneral, setIsSavingGeneral] = useState(false);
    const [isSavingNotifications, setIsSavingNotifications] = useState(false);
    const [isSavingSecurity, setIsSavingSecurity] = useState(false); // Saving state for security

    // State for general settings form
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
        appName: 'AcademiGo',
        adminEmail: 'admin@university.edu',
        maintenanceMode: false,
    });

    // State for notification settings form
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
        delayNotifications: true,
        renewalReminders: true,
    });

    // State for security settings form
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        deviceBindingEnabled: false, // Default to disabled
    });

    // Load settings from localStorage on initial mount
    useEffect(() => {
        try {
            const storedGeneral = localStorage.getItem(ADMIN_SETTINGS_GENERAL_KEY);
            if (storedGeneral) setGeneralSettings(JSON.parse(storedGeneral));

            const storedNotifications = localStorage.getItem(ADMIN_SETTINGS_NOTIFICATIONS_KEY);
            if (storedNotifications) setNotificationSettings(JSON.parse(storedNotifications));

            const storedSecurity = localStorage.getItem(ADMIN_SETTINGS_SECURITY_KEY);
            if (storedSecurity) setSecuritySettings(JSON.parse(storedSecurity));

            // Ensure the login pages use the same source of truth for the toggle
            const deviceBindingFlag = localStorage.getItem(LOCAL_STORAGE_DEVICE_BINDING_ENABLED_KEY);
            setSecuritySettings(prev => ({ ...prev, deviceBindingEnabled: deviceBindingFlag === 'true' }));

        } catch (error) {
            console.error("Failed to load settings from localStorage:", error);
            toast({ title: "Error", description: "Could not load saved settings.", variant: "destructive" });
        }
    }, [toast]); // Run only on mount

    // --- Handlers for General Settings ---
    const handleGeneralInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setGeneralSettings(prev => ({ ...prev, [id]: value }));
    };

    const handleMaintenanceModeChange = (checked: boolean) => {
        setGeneralSettings(prev => ({ ...prev, maintenanceMode: checked }));
    };

    const handleSaveGeneralSettings = async () => {
        setIsSavingGeneral(true);
        console.log("Saving General Settings:", generalSettings);
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            localStorage.setItem(ADMIN_SETTINGS_GENERAL_KEY, JSON.stringify(generalSettings));
            toast({ title: "Settings Saved", description: "General settings have been updated." });
        } catch (error) {
            console.error("Failed to save general settings:", error);
            toast({ title: "Error", description: "Could not save general settings.", variant: "destructive" });
        } finally {
            setIsSavingGeneral(false);
        }
    };

    // --- Handlers for Notification Settings ---
    const handleNotificationSwitchChange = (id: keyof NotificationSettings, checked: boolean) => {
        setNotificationSettings(prev => ({ ...prev, [id]: checked }));
    };

    const handleSaveNotificationSettings = async () => {
        setIsSavingNotifications(true);
        console.log("Saving Notification Settings:", notificationSettings);
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            localStorage.setItem(ADMIN_SETTINGS_NOTIFICATIONS_KEY, JSON.stringify(notificationSettings));
            toast({ title: "Settings Saved", description: "Notification settings have been updated." });
        } catch (error) {
            console.error("Failed to save notification settings:", error);
            toast({ title: "Error", description: "Could not save notification settings.", variant: "destructive" });
        } finally {
            setIsSavingNotifications(false);
        }
    };

    // --- Handlers for Security Settings ---
    const handleDeviceBindingChange = (checked: boolean) => {
        setSecuritySettings(prev => ({ ...prev, deviceBindingEnabled: checked }));
    };

    const handleSaveSecuritySettings = async () => {
        setIsSavingSecurity(true);
        console.log("Saving Security Settings:", securitySettings);
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            localStorage.setItem(ADMIN_SETTINGS_SECURITY_KEY, JSON.stringify(securitySettings));
            // Also update the specific flag used by login pages
            localStorage.setItem(LOCAL_STORAGE_DEVICE_BINDING_ENABLED_KEY, String(securitySettings.deviceBindingEnabled));
            toast({ title: "Settings Saved", description: "Security settings have been updated." });
        } catch (error) {
            console.error("Failed to save security settings:", error);
            toast({ title: "Error", description: "Could not save security settings.", variant: "destructive" });
        } finally {
            setIsSavingSecurity(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Application Settings</h2>

            {/* General Settings Section */}
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
                <div className="p-6 space-y-1.5">
                    <h3 className="text-lg font-semibold leading-none tracking-tight text-primary">General Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure general application parameters.</p>
                </div>
                <div className="p-6 pt-0 space-y-4">
                    {/* App Name, Admin Email, Maintenance Mode */}
                     <div className="grid gap-2">
                        <Label htmlFor="appName">Application Name</Label>
                        <Input
                            id="appName"
                            value={generalSettings.appName}
                            onChange={handleGeneralInputChange}
                            disabled={isSavingGeneral}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="adminEmail">Primary Admin Email</Label>
                        <Input
                            id="adminEmail"
                            type="email"
                            value={generalSettings.adminEmail}
                            onChange={handleGeneralInputChange}
                            disabled={isSavingGeneral}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                            <p className="text-xs text-muted-foreground">Temporarily disable access for non-admins.</p>
                        </div>
                        <Switch
                            id="maintenanceMode"
                            checked={generalSettings.maintenanceMode}
                            onCheckedChange={handleMaintenanceModeChange}
                            disabled={isSavingGeneral}
                        />
                    </div>
                </div>
                <div className="flex items-center p-6 pt-0 border-t mt-6">
                    <Button onClick={handleSaveGeneralSettings} disabled={isSavingGeneral}>
                         <Save className="mr-2 h-4 w-4" />
                        {isSavingGeneral ? 'Saving...' : 'Save General Settings'}
                    </Button>
                </div>
            </div>

            {/* Notification Settings Section */}
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
                <div className="p-6 space-y-1.5">
                    <h3 className="text-lg font-semibold leading-none tracking-tight text-primary">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground">Manage how notifications are sent.</p>
                </div>
                <div className="p-6 pt-0 space-y-4">
                    {/* Delay Notifications, Renewal Reminders */}
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="delayNotifications">Delay Notifications</Label>
                            <p className="text-xs text-muted-foreground">Send push notifications to students for bus delays.</p>
                        </div>
                        <Switch
                            id="delayNotifications"
                            checked={notificationSettings.delayNotifications}
                            onCheckedChange={(checked) => handleNotificationSwitchChange('delayNotifications', checked)}
                            disabled={isSavingNotifications}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="renewalReminders">Pass Renewal Reminders</Label>
                            <p className="text-xs text-muted-foreground">Automatically remind students before pass expiry.</p>
                        </div>
                        <Switch
                            id="renewalReminders"
                            checked={notificationSettings.renewalReminders}
                            onCheckedChange={(checked) => handleNotificationSwitchChange('renewalReminders', checked)}
                            disabled={isSavingNotifications}
                        />
                    </div>
                </div>
                <div className="flex items-center p-6 pt-0 border-t mt-6">
                    <Button onClick={handleSaveNotificationSettings} disabled={isSavingNotifications}>
                         <Save className="mr-2 h-4 w-4" />
                        {isSavingNotifications ? 'Saving...' : 'Save Notification Settings'}
                    </Button>
                </div>
            </div>

             {/* Security Settings Section */}
            <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
                <div className="p-6 space-y-1.5">
                    <h3 className="text-lg font-semibold leading-none tracking-tight text-primary flex items-center gap-2">
                       <Lock className="h-5 w-5" /> Security Settings
                    </h3>
                    <p className="text-sm text-muted-foreground">Configure application security features.</p>
                </div>
                <div className="p-6 pt-0 space-y-4">
                    {/* Device Binding Toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label htmlFor="deviceBindingEnabled">Enable Device Binding</Label>
                            <p className="text-xs text-muted-foreground">Limit user logins to one registered device for increased security.</p>
                        </div>
                        <Switch
                            id="deviceBindingEnabled"
                            checked={securitySettings.deviceBindingEnabled}
                            onCheckedChange={handleDeviceBindingChange}
                            disabled={isSavingSecurity}
                        />
                    </div>
                </div>
                <div className="flex items-center p-6 pt-0 border-t mt-6">
                    <Button onClick={handleSaveSecuritySettings} disabled={isSavingSecurity}>
                         <Save className="mr-2 h-4 w-4" />
                        {isSavingSecurity ? 'Saving...' : 'Save Security Settings'}
                    </Button>
                </div>
            </div>

        </div>
    );
};

export default AdminSettingsPage;

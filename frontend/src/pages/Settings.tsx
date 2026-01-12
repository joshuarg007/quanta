// Settings page with app preferences
import { useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import './Settings.css';

interface SettingsState {
  theme: 'dark' | 'light' | 'system';
  defaultShots: number;
  maxQubits: number;
  showMeasurementProbabilities: boolean;
  autoSaveCircuits: boolean;
  emailNotifications: {
    experimentComplete: boolean;
    weeklyProgress: boolean;
    productUpdates: boolean;
  };
}

const keyboardShortcuts = [
  { keys: ['Ctrl', 'S'], action: 'Save circuit' },
  { keys: ['Ctrl', 'Z'], action: 'Undo' },
  { keys: ['Ctrl', 'Shift', 'Z'], action: 'Redo' },
  { keys: ['Ctrl', 'D'], action: 'Duplicate gate' },
  { keys: ['Delete'], action: 'Remove selected' },
  { keys: ['Space'], action: 'Run simulation' },
  { keys: ['Escape'], action: 'Deselect / Close modal' },
  { keys: ['H'], action: 'Add Hadamard gate' },
  { keys: ['X'], action: 'Add X gate' },
  { keys: ['C'], action: 'Add CNOT gate' },
  { keys: ['M'], action: 'Add measurement' },
];

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'dark',
    defaultShots: 1024,
    maxQubits: 8,
    showMeasurementProbabilities: true,
    autoSaveCircuits: true,
    emailNotifications: {
      experimentComplete: true,
      weeklyProgress: false,
      productUpdates: false,
    },
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveStatus('saving');
    // Simulate save
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const updateEmailNotification = (key: keyof SettingsState['emailNotifications']) => {
    setSettings((prev) => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: !prev.emailNotifications[key],
      },
    }));
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 500);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const handleExportData = () => {
    const exportData = {
      user: { email: user?.email, plan: user?.organization?.plan },
      settings,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quanta-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div className="header-content">
          <h1>Settings</h1>
          <p>Customize your QUANTA experience</p>
        </div>
        {saveStatus !== 'idle' && (
          <span className={`save-status ${saveStatus}`}>
            {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
          </span>
        )}
      </div>

      <div className="settings-grid">
        {/* Appearance */}
        <section className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Theme</span>
              <span className="setting-description">Choose your preferred color scheme</span>
            </div>
            <div className="theme-options">
              {(['dark', 'light', 'system'] as const).map((theme) => (
                <button
                  key={theme}
                  className={`theme-btn ${settings.theme === theme ? 'active' : ''}`}
                  onClick={() => updateSetting('theme', theme)}
                >
                  {theme === 'dark' && '🌙'}
                  {theme === 'light' && '☀️'}
                  {theme === 'system' && '💻'}
                  <span>{theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Simulation Defaults */}
        <section className="settings-section">
          <h2>Simulation Defaults</h2>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Default Shots</span>
              <span className="setting-description">
                Number of measurements per simulation run
              </span>
            </div>
            <select
              value={settings.defaultShots}
              onChange={(e) => updateSetting('defaultShots', Number(e.target.value))}
            >
              <option value={100}>100</option>
              <option value={256}>256</option>
              <option value={512}>512</option>
              <option value={1024}>1,024</option>
              <option value={2048}>2,048</option>
              <option value={4096}>4,096</option>
              <option value={8192}>8,192</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Default Qubits</span>
              <span className="setting-description">
                Initial qubit count when creating new circuits
              </span>
            </div>
            <select
              value={settings.maxQubits}
              onChange={(e) => updateSetting('maxQubits', Number(e.target.value))}
            >
              {[2, 3, 4, 5, 6, 7, 8, 10, 12, 16].map((n) => (
                <option key={n} value={n}>
                  {n} qubits
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Show Probabilities</span>
              <span className="setting-description">
                Display measurement probabilities alongside histogram
              </span>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.showMeasurementProbabilities}
                onChange={() =>
                  updateSetting(
                    'showMeasurementProbabilities',
                    !settings.showMeasurementProbabilities
                  )
                }
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Auto-save Circuits</span>
              <span className="setting-description">
                Automatically save circuit changes as you work
              </span>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.autoSaveCircuits}
                onChange={() =>
                  updateSetting('autoSaveCircuits', !settings.autoSaveCircuits)
                }
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </section>

        {/* Notifications */}
        <section className="settings-section">
          <h2>Email Notifications</h2>
          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Experiment Complete</span>
              <span className="setting-description">
                Notify when long-running experiments finish
              </span>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.emailNotifications.experimentComplete}
                onChange={() => updateEmailNotification('experimentComplete')}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Weekly Progress</span>
              <span className="setting-description">
                Receive weekly learning progress summaries
              </span>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.emailNotifications.weeklyProgress}
                onChange={() => updateEmailNotification('weeklyProgress')}
              />
              <span className="toggle-slider" />
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <span className="setting-label">Product Updates</span>
              <span className="setting-description">
                News about new features and improvements
              </span>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={settings.emailNotifications.productUpdates}
                onChange={() => updateEmailNotification('productUpdates')}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </section>

        {/* Keyboard Shortcuts */}
        <section className="settings-section shortcuts-section">
          <h2>Keyboard Shortcuts</h2>
          <div className="shortcuts-grid">
            {keyboardShortcuts.map((shortcut, i) => (
              <div key={i} className="shortcut-item">
                <span className="shortcut-action">{shortcut.action}</span>
                <div className="shortcut-keys">
                  {shortcut.keys.map((key, j) => (
                    <span key={j}>
                      <kbd>{key}</kbd>
                      {j < shortcut.keys.length - 1 && <span className="key-plus">+</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Data Export */}
        <section className="settings-section">
          <h2>Data Export</h2>
          <p className="section-description">
            Download your settings and circuit data for backup or transfer.
          </p>
          <div className="export-actions">
            <button className="export-btn" onClick={handleExportData}>
              <span>&#x1F4BE;</span>
              Export Settings (JSON)
            </button>
            <button className="export-btn secondary">
              <span>&#x1F4C1;</span>
              Export All Circuits
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

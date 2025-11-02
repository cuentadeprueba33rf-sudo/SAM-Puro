import React from 'react';
import type { Settings } from './types';
import { XMarkIcon } from './components/icons';
import { PERSONALITIES } from './constants';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: Settings;
    onSave: (settings: Settings) => void;
    onClearHistory: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
    if (!isOpen) return null;

    const handleSettingChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        onSave({ ...settings, [key]: value });
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-surface-primary rounded-2xl p-6 max-w-md w-full shadow-2xl animate-fade-in-up border border-border-subtle max-h-[90vh] overflow-y-auto" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-text-main">Configuración</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-surface-secondary">
                        <XMarkIcon className="w-6 h-6 text-text-secondary" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {/* Theme Settings */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Apariencia</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-secondary rounded-lg">
                            <button 
                                onClick={() => handleSettingChange('theme', 'light')}
                                className={`px-3 py-1.5 text-sm rounded-md font-semibold ${settings.theme === 'light' ? 'bg-accent text-white' : 'text-text-main'}`}
                            >
                                Claro
                            </button>
                            <button
                                onClick={() => handleSettingChange('theme', 'dark')}
                                className={`px-3 py-1.5 text-sm rounded-md font-semibold ${settings.theme === 'dark' ? 'bg-accent text-white' : 'text-text-main'}`}
                            >
                                Oscuro
                            </button>
                        </div>
                    </div>

                    {/* Personality Settings */}
                    <div>
                        <label htmlFor="personality-select" className="block text-sm font-medium text-text-secondary mb-2">Personalidad de la Guía</label>
                        <select
                            id="personality-select"
                            value={settings.personality}
                            onChange={(e) => handleSettingChange('personality', e.target.value as Settings['personality'])}
                            className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-text-main focus:ring-accent focus:border-accent outline-none"
                        >
                            {PERSONALITIES.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Profession Settings */}
                    <div>
                        <label htmlFor="profession-input" className="block text-sm font-medium text-text-secondary mb-2">¿A qué te dedicas?</label>
                        <input
                            type="text"
                            id="profession-input"
                            value={settings.profession}
                            onChange={(e) => handleSettingChange('profession', e.target.value)}
                            placeholder="Ej: Desarrollador, Diseñador, Estudiante..."
                            className="w-full bg-surface-secondary border border-border-subtle rounded-lg px-3 py-2 text-text-main placeholder:text-text-secondary focus:ring-accent focus:border-accent outline-none"
                        />
                         <p className="text-xs text-text-secondary mt-1">SAM adaptará sus respuestas a tu estilo de trabajo.</p>
                    </div>

                </div>

                <button onClick={onClose} className="bg-accent text-white px-4 py-2 rounded-lg w-full hover:opacity-90 transition-opacity mt-8">
                    Hecho
                </button>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(10px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default SettingsModal;
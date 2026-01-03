import React, { useState } from 'react';

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  icon: Icon,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      <div
        className={`
          flex items-center gap-3 px-4 py-3 bg-white/5 border rounded-xl transition-all duration-300
          ${focused ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/20' : 'border-white/10 hover:border-white/20'}
          ${error ? 'border-red-500 ring-2 ring-red-500/30' : ''}
          ${success ? 'border-green-500 ring-2 ring-green-500/30' : ''}
        `}
      >
        {Icon && (
          <div className={`text-gray-400 ${focused ? 'text-primary' : ''}`}>
            <Icon fontSize="small" />
          </div>
        )}
        <div className="flex-1">
          {label && (
            <label className={`block text-xs text-gray-400 mb-0.5 ${focused ? 'text-primary' : ''}`}>
              {label}
            </label>
          )}
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full bg-transparent text-white placeholder-gray-600 outline-none text-sm font-medium"
            {...props}
          />
        </div>
      </div>
      {error && <span className="text-xs text-red-500 ml-1">{error}</span>}
      {success && <span className="text-xs text-green-500 ml-1">{success}</span>}
    </div>
  );
};

export default Input;


import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SearchableDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Search...",
  searchPlaceholder = "Search...",
  renderOption,
  getOptionLabel,
  getOptionValue,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const { colors } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(option => {
    const label = getOptionLabel(option).toLowerCase();
    return label.includes(searchTerm.toLowerCase());
  });

  // Get the selected option label
  const selectedOption = options.find(opt => getOptionValue(opt) === value);
  const displayValue = selectedOption ? getOptionLabel(selectedOption) : placeholder;

  const handleSelect = (option) => {
    onChange(getOptionValue(option));
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      {/* Dropdown trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full px-4 py-3 border rounded-lg flex items-center justify-between transition-colors disabled:opacity-50"
        style={{
          backgroundColor: '#3A4F63',
          borderColor: isOpen ? colors.primary : '#4A5F73',
          color: value ? '#FFFFFF' : '#9CA3AF'
        }}
      >
        <span className="truncate">{displayValue}</span>
        <ChevronDown
          size={20}
          className="flex-shrink-0 ml-2 transition-transform"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            color: '#9CA3AF'
          }}
        />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 rounded-lg shadow-xl border overflow-hidden"
          style={{
            backgroundColor: '#2C3E50',
            borderColor: '#4A5F73',
            maxHeight: '400px'
          }}
        >
          {/* Search input */}
          <div
            className="p-3 border-b"
            style={{
              backgroundColor: '#34495E',
              borderColor: '#4A5F73'
            }}
          >
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: '#9CA3AF' }}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-0 outline-none"
                style={{
                  backgroundColor: '#3A4F63',
                  color: '#FFFFFF'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options list */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: '320px' }}
          >
            {filteredOptions.length === 0 ? (
              <div
                className="px-4 py-8 text-center"
                style={{ color: '#9CA3AF' }}
              >
                No results found
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const optionValue = getOptionValue(option);
                const isSelected = optionValue === value;

                return (
                  <button
                    key={optionValue}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="w-full px-4 py-3 text-left transition-colors border-b hover:bg-opacity-80"
                    style={{
                      backgroundColor: isSelected ? '#34495E' : 'transparent',
                      borderColor: '#3A4F63',
                      color: '#FFFFFF'
                    }}
                  >
                    {renderOption ? renderOption(option) : getOptionLabel(option)}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;

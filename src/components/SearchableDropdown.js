import {useState, useEffect, useRef} from "react";
import { Search, ChevronDown } from 'lucide-react';

// Normalize Arabic text function
const normalizeArabicText = (text) => {
  if (!text) return '';
  
  // Comprehensive mapping of Arabic letter variations
  const arabicNormalizationMap = {
    // Alif variations
    'آ': 'ا', 'أ': 'ا', 'إ': 'ا', 'ٱ': 'ا',
    
    // Yaa variations
    'ي': 'ى', 'ئ': 'ى',
    
    // Waw variations
    'ؤ': 'و',
    
    // Taa Marbouta variations
    'ة': 'ه',
    
    // Remove diacritical marks and kashida
    'ً': '', 'ٌ': '', 'ٍ': '', 'َ': '', 'ُ': '', 'ِ': '', 
    'ّ': '', 'ْ': '', 'ٰ': '', 'ٓ': '', 'ٔ': '', 'ٕ': '',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', 
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  
  // Normalize each character
  return text.split('').map(char => 
    arabicNormalizationMap[char] || char
  ).join('').trim().toLowerCase();
};

const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  icon: Icon, 
  label, 
  placeholder,
  enableArabicNormalization = false,
  customFilterFunction = null,
  noResultsText = "No results found",
  maxHeight = "60",
  clearSearchOnSelect = true,
  renderOption = null,
  className = "",
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const dropdownListRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        if (clearSearchOnSelect) {
          setSearchTerm('');
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clearSearchOnSelect]);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        setIsOpen(false);
        if (clearSearchOnSelect) {
          setSearchTerm('');
        }
      }
      
      // Add arrow key navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        if (!dropdownListRef.current) return;
        
        const buttons = dropdownListRef.current.querySelectorAll('button');
        if (!buttons.length) return;
        
        // Find currently focused button
        const focusedElement = document.activeElement;
        const focusedIndex = Array.from(buttons).findIndex(btn => btn === focusedElement);
        
        let nextIndex;
        if (e.key === 'ArrowDown') {
          nextIndex = focusedIndex < buttons.length - 1 ? focusedIndex + 1 : 0;
        } else {
          nextIndex = focusedIndex > 0 ? focusedIndex - 1 : buttons.length - 1;
        }
        
        buttons[nextIndex].focus();
      }
      
      // Select with Enter key
      if (e.key === 'Enter' && document.activeElement !== inputRef.current) {
        const focusedElement = document.activeElement;
        if (focusedElement.tagName === 'BUTTON' && focusedElement.dataset.value) {
          e.preventDefault();
          onChange(focusedElement.dataset.value);
          setIsOpen(false);
          if (clearSearchOnSelect) {
            setSearchTerm('');
          }
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, clearSearchOnSelect, onChange]);
  
  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 0);
    }
  }, [isOpen]);
  
  // Default filter function
  const defaultFilterFunction = (option, term) => {
    if (!term) return true;
    
    const optionText = option.label.toString().toLowerCase();
    const searchText = term.toLowerCase();
    
    if (enableArabicNormalization) {
      return normalizeArabicText(optionText).includes(normalizeArabicText(searchText));
    }
    
    return optionText.includes(searchText);
  };
  
  // Use custom filter or default filter
  const filterFunction = customFilterFunction || defaultFilterFunction;
  
  // Filter options based on search term
  const filteredOptions = options.filter(option => filterFunction(option, searchTerm));
  
  // Find selected option
  const selectedOption = options.find(option => option.value === value);

  // Calculate dropdown position and width
  const [dropdownStyles, setDropdownStyles] = useState({});
  
  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      const buttonRect = dropdownRef.current.querySelector('button').getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      // Default to showing below
      let newStyles = {
        minWidth: `${buttonRect.width}px`,
        maxHeight: `${Math.min(350, spaceBelow - 10)}px`
      };
      
      // If not enough space below but enough space above, show above
      if (spaceBelow < 250 && spaceAbove > 250) {
        newStyles = {
          ...newStyles,
          bottom: '100%',
          marginBottom: '4px',
          marginTop: '0',
          maxHeight: `${Math.min(350, spaceAbove - 10)}px`
        };
      }
      
      setDropdownStyles(newStyles);
    }
  }, [isOpen]);
  
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="flex items-center mb-2 text-sm font-medium text-gray-700">
          {Icon && <Icon className="mr-1.5 text-gray-500" size={18} />}
          {label}
        </label>
      )}
      <button
        type="button"
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white flex items-center justify-between ${
          disabled ? 'cursor-not-allowed bg-gray-100 text-gray-500 opacity-70' : 'hover:border-gray-400'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={`truncate ${selectedOption ? "text-gray-900 font-medium" : "text-gray-400"}`}>
          {selectedOption ? selectedOption.label : placeholder || "Select an option"}
        </span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 text-gray-500 ml-2 flex-shrink-0 ${isOpen ? "transform rotate-180" : ""}`} 
        />
      </button>
      
      {isOpen && (
        <div 
          className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
          style={dropdownStyles}
          role="listbox"
        >
          <div className="sticky top-0 bg-white p-2 border-b border-gray-100 z-10">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Search dropdown options"
              />
              <Search size={16} className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          
          <div 
            className="overflow-y-auto"
            style={{ maxHeight: `calc(${dropdownStyles.maxHeight} - 56px)` }}
            ref={dropdownListRef}
          >
            {filteredOptions.length > 0 ? (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    data-value={option.value}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 focus:outline-none focus:bg-blue-50 ${
                      option.value === value 
                        ? "bg-blue-100 text-blue-900 font-medium" 
                        : "text-gray-800 hover:bg-blue-50"
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      if (clearSearchOnSelect) {
                        setSearchTerm('');
                      }
                    }}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    {renderOption ? renderOption(option) : option.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">{noResultsText}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;
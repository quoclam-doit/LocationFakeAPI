// client/src/hooks/useAutocomplete.js
import { useState, useCallback } from 'react';
import { geocodeApi } from '../services/api';
import { debounce } from '../utils/helpers';

/**
 * Custom hook for street autocomplete functionality
 */
export const useAutocomplete = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    /**
     * Search for street suggestions
     */
    const search = useCallback(async (query, ward, district, province) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        if (!ward || !district || !province) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoading(true);
        try {
            const results = await geocodeApi.autocompleteStreets({
                q: query,
                ward,
                district,
                province,
            });

            setSuggestions(results);
            setShowSuggestions(results.length > 0);
        } catch (error) {
            console.error('Autocomplete error:', error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Debounced search
     */
    const debouncedSearch = useCallback(
        debounce((query, ward, district, province) => {
            search(query, ward, district, province);
        }, 400),
        [search]
    );

    /**
     * Clear suggestions
     */
    const clear = useCallback(() => {
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedIndex(-1);
    }, []);

    /**
     * Navigate through suggestions
     */
    const navigate = useCallback((direction) => {
        setSelectedIndex(prev => {
            if (direction === 'down') {
                return prev < suggestions.length - 1 ? prev + 1 : prev;
            } else if (direction === 'up') {
                return prev > 0 ? prev - 1 : -1;
            }
            return prev;
        });
    }, [suggestions.length]);

    /**
     * Get selected suggestion
     */
    const getSelected = useCallback(() => {
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            return suggestions[selectedIndex];
        }
        return null;
    }, [selectedIndex, suggestions]);

    return {
        suggestions,
        isLoading,
        showSuggestions,
        selectedIndex,
        search: debouncedSearch,
        clear,
        navigate,
        getSelected,
        setShowSuggestions,
        setSelectedIndex,
    };
};

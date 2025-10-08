// client/src/store/addressStore.js
import { create } from 'zustand';
import { addressApi, geocodeApi } from '../services/api';
import { buildAddress, sortByName } from '../utils/helpers';
import { debounce } from '../utils/helpers';

export const useAddressStore = create((set, get) => ({
  // ========== STATE ==========
  provinces: [],
  districts: [],
  wards: [],
  
  selectedProvince: null,
  selectedDistrict: null,
  selectedWard: null,
  street: '',
  
  coordinates: null,
  loading: false,
  error: null,

  // ========== ACTIONS - LOAD DATA ==========
  
  /**
   * Load all provinces
   */
  loadProvinces: async () => {
    set({ loading: true, error: null });
    try {
      const data = await addressApi.getProvinces(1);
      set({ provinces: sortByName(data) });
    } catch (error) {
      set({ error: 'Không tải được danh sách tỉnh/thành' });
      console.error('Load provinces error:', error);
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Select province and load districts
   */
  selectProvince: async (provinceCode) => {
    if (!provinceCode) {
      set({
        selectedProvince: null,
        districts: [],
        selectedDistrict: null,
        wards: [],
        selectedWard: null,
        street: '',
        coordinates: null,
      });
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await addressApi.getProvinceByCode(provinceCode, 2);
      set({
        selectedProvince: data,
        districts: sortByName(data.districts || []),
        selectedDistrict: null,
        wards: [],
        selectedWard: null,
        street: '',
        coordinates: null,
      });
    } catch (error) {
      set({ error: 'Không tải được danh sách quận/huyện' });
      console.error('Select province error:', error);
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Select district and load wards
   */
  selectDistrict: async (districtCode) => {
    if (!districtCode) {
      set({
        selectedDistrict: null,
        wards: [],
        selectedWard: null,
        street: '',
        coordinates: null,
      });
      return;
    }

    set({ loading: true, error: null });
    try {
      const data = await addressApi.getDistrictByCode(districtCode, 2);
      set({
        selectedDistrict: data,
        wards: sortByName(data.wards || []),
        selectedWard: null,
        street: '',
        coordinates: null,
      });
    } catch (error) {
      set({ error: 'Không tải được danh sách phường/xã' });
      console.error('Select district error:', error);
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Select ward
   */
  selectWard: (wardCode) => {
    const ward = get().wards.find((w) => String(w.code) === String(wardCode));
    set({ 
      selectedWard: ward || null, 
      street: '', 
      coordinates: null 
    });
  },

  /**
   * Set street name
   */
  setStreet: (street) => {
    set({ street });
  },

  // ========== ACTIONS - GEOCODING ==========

  /**
   * Get full address string
   */
  getFullAddress: () => {
    const { street, selectedWard, selectedDistrict, selectedProvince } = get();
    return buildAddress(street, selectedWard, selectedDistrict, selectedProvince);
  },

  /**
   * Geocode current address
   */
  geocodeAddress: async () => {
    const address = get().getFullAddress();

    if (!address) {
      set({ error: 'Vui lòng nhập đầy đủ thông tin địa chỉ' });
      return;
    }

    set({ loading: true, error: null });
    try {
      const coordinates = await geocodeApi.geocode(address);
      set({ coordinates });
    } catch (error) {
      set({ 
        error: 'Không tìm được tọa độ cho địa chỉ đã nhập',
        coordinates: null 
      });
      console.error('Geocode error:', error);
    } finally {
      set({ loading: false });
    }
  },

  /**
   * Debounced geocode
   */
  geocode: debounce(() => {
    get().geocodeAddress();
  }, 700),

  /**
   * Reset all state
   */
  reset: () => {
    set({
      selectedProvince: null,
      selectedDistrict: null,
      selectedWard: null,
      street: '',
      coordinates: null,
      error: null,
    });
  },
}));

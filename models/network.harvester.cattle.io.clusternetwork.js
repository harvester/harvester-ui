export default {
  isOpenVlan() {
    return !!this.enable;
  },

  defaultPhysicalNic() {
    return this?.config?.defaultPhysicalNIC;
  },

  displayValue() { // Select the field you want to display
    return this?.config?.defaultPhysicalNIC || '';
  },
};

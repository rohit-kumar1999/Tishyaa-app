import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Category {
  name: string;
  count: number;
  id: string;
}

interface FilterState {
  categories: string[];
  priceRange: [number, number];
  material: string;
  occasion: string;
  ratings: number[];
  sortBy: string;
  sortOrder: string;
  search?: string;
}

interface FiltersComponentProps {
  visible: boolean;
  onHide: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories: Category[];
  materialOptions: string[];
  occasionOptions: string[];
}

export const FiltersComponent: React.FC<FiltersComponentProps> = ({
  visible,
  onHide,
  filters,
  onFiltersChange,
  categories,
  materialOptions,
  occasionOptions,
}) => {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [showAllOccasions, setShowAllOccasions] = useState(false);
  const [minPriceText, setMinPriceText] = useState(
    filters.priceRange[0].toString()
  );
  const [maxPriceText, setMaxPriceText] = useState(
    filters.priceRange[1].toString()
  );
  const sliderWidth = useRef(300);
  const isDragging = useRef(false);
  const activeThumb = useRef<"min" | "max">("min");
  const filterChangeTimeout = useRef<NodeJS.Timeout | null>(null);
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  // Sync localFilters with prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Debounce only price range changes for API calls
  useEffect(() => {
    if (filterChangeTimeout.current) {
      clearTimeout(filterChangeTimeout.current);
    }

    // Check if only price range has changed
    const priceRangeChanged =
      localFilters.priceRange[0] !== filters.priceRange[0] ||
      localFilters.priceRange[1] !== filters.priceRange[1];

    if (priceRangeChanged) {
      filterChangeTimeout.current = setTimeout(() => {
        onFiltersChange(localFilters);
      }, 1000);
    }

    return () => {
      if (filterChangeTimeout.current) {
        clearTimeout(filterChangeTimeout.current);
      }
    };
  }, [localFilters.priceRange]);

  // Apply non-price filter changes immediately
  useEffect(() => {
    // Check if non-price filters have changed
    const nonPriceFiltersChanged =
      JSON.stringify(localFilters.categories) !==
        JSON.stringify(filters.categories) ||
      localFilters.material !== filters.material ||
      localFilters.occasion !== filters.occasion ||
      JSON.stringify(localFilters.ratings) !== JSON.stringify(filters.ratings);

    if (nonPriceFiltersChanged) {
      onFiltersChange(localFilters);
    }
  }, [
    localFilters.categories,
    localFilters.material,
    localFilters.occasion,
    localFilters.ratings,
  ]);

  // Show first 5 categories by default
  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 5);
  const remainingCount = Math.max(0, categories.length - 5);

  const getValueFromPosition = (x: number) => {
    const percentage = Math.max(0, Math.min(1, x / sliderWidth.current));
    return Math.round(percentage * 100000);
  };

  const createPanResponder = (thumbType: "min" | "max") => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDragging.current = true;
        activeThumb.current = thumbType;
      },
      onPanResponderMove: (evt, gestureState) => {
        const newValue = getValueFromPosition(gestureState.moveX - 20);

        if (thumbType === "min") {
          const clampedValue = Math.max(
            0,
            Math.min(newValue, localFilters.priceRange[1] - 1000)
          );
          handlePriceRangeChange(clampedValue, true);
          setMinPriceText(clampedValue.toString());
        } else {
          const clampedValue = Math.min(
            100000,
            Math.max(newValue, localFilters.priceRange[0] + 1000)
          );
          handlePriceRangeChange(clampedValue, false);
          setMaxPriceText(clampedValue.toString());
        }
      },
      onPanResponderRelease: () => {
        isDragging.current = false;
      },
    });
  };

  const minThumbResponder = createPanResponder("min");
  const maxThumbResponder = createPanResponder("max");

  const handleCategoryToggle = (categoryId: string) => {
    const updatedCategories = localFilters.categories.includes(categoryId)
      ? localFilters.categories.filter((id) => id !== categoryId)
      : [...localFilters.categories, categoryId];

    setLocalFilters({
      ...localFilters,
      categories: updatedCategories,
    });
  };

  const handleMaterialSelect = (material: string) => {
    // Toggle: if same material is selected, clear it; otherwise set it
    const newMaterial = localFilters.material === material ? "" : material;

    setLocalFilters({
      ...localFilters,
      material: newMaterial,
    });
  };

  const handleOccasionSelect = (occasion: string) => {
    // Toggle: if same occasion is selected, clear it; otherwise set it
    const newOccasion = localFilters.occasion === occasion ? "" : occasion;

    setLocalFilters({
      ...localFilters,
      occasion: newOccasion,
    });
  };

  const handleRatingToggle = (rating: number) => {
    const updatedRatings = localFilters.ratings.includes(rating)
      ? localFilters.ratings.filter((r) => r !== rating)
      : [...localFilters.ratings, rating];

    setLocalFilters({
      ...localFilters,
      ratings: updatedRatings,
    });
  };

  // Clear filters functions
  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.categories.length > 0)
      count += localFilters.categories.length;
    if (localFilters.material) count++;
    if (localFilters.occasion) count++;
    if (localFilters.ratings.length > 0) count += localFilters.ratings.length;
    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 100000)
      count++;
    return count;
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterState = {
      categories: [],
      priceRange: [0, 100000],
      material: "",
      occasion: "",
      ratings: [],
      sortBy: localFilters.sortBy, // Keep current sort
      sortOrder: localFilters.sortOrder,
      search: localFilters.search, // Keep search
    };
    setLocalFilters(clearedFilters);
    setMinPriceText("0");
    setMaxPriceText("100000");
  };

  const removeActiveFilter = (type: string, value: string | number) => {
    switch (type) {
      case "category":
        handleCategoryToggle(value as string);
        break;
      case "material":
        setLocalFilters({ ...localFilters, material: "" });
        break;
      case "occasion":
        setLocalFilters({ ...localFilters, occasion: "" });
        break;
      case "rating":
        handleRatingToggle(value as number);
        break;
      case "priceRange":
        setLocalFilters({
          ...localFilters,
          priceRange: [0, 100000],
        });
        setMinPriceText("0");
        setMaxPriceText("100000");
        break;
    }
  };

  const getActiveFilters = () => {
    const active: Array<{
      type: string;
      value: string | number;
      label: string;
    }> = [];

    localFilters.categories.forEach((cat) => {
      const categoryName = categories.find((c) => c.id === cat)?.name || cat;
      active.push({ type: "category", value: cat, label: categoryName });
    });

    if (localFilters.material) {
      active.push({
        type: "material",
        value: localFilters.material,
        label: localFilters.material,
      });
    }

    if (localFilters.occasion) {
      active.push({
        type: "occasion",
        value: localFilters.occasion,
        label: localFilters.occasion,
      });
    }

    localFilters.ratings.forEach((rating) => {
      active.push({ type: "rating", value: rating, label: `${rating}+ Stars` });
    });

    if (localFilters.priceRange[0] > 0 || localFilters.priceRange[1] < 100000) {
      active.push({
        type: "priceRange",
        value: "priceRange",
        label: `₹${localFilters.priceRange[0]} - ₹${localFilters.priceRange[1]}`,
      });
    }

    return active;
  };

  const activeFilterCount = getActiveFilterCount();
  const activeFilters = getActiveFilters();

  const handlePriceRangeChange = (value: number, isMin: boolean) => {
    const newRange: [number, number] = isMin
      ? [value, Math.max(value, localFilters.priceRange[1])]
      : [Math.min(value, localFilters.priceRange[0]), value];

    setLocalFilters({
      ...localFilters,
      priceRange: newRange,
    });
  };

  const handleMinPriceChange = (text: string) => {
    // Only allow numeric characters
    const numericText = text.replace(/[^0-9]/g, "");
    setMinPriceText(numericText);
    const value = parseInt(numericText) || 0;
    handlePriceRangeChange(value, true);
  };

  const handleMaxPriceChange = (text: string) => {
    // Only allow numeric characters
    const numericText = text.replace(/[^0-9]/g, "");
    setMaxPriceText(numericText);
    const value = parseInt(numericText) || 100000;
    handlePriceRangeChange(value, false);
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filters Title Row */}
        {activeFilterCount > 0 ? (
          <View style={styles.filtersTitleRow}>
            <Text style={styles.activeFiltersTitle}>Active Filters</Text>
            <TouchableOpacity
              onPress={clearAllFilters}
              style={styles.clearAllButton}
            >
              <Text style={styles.clearAllText}>
                Clear All ({activeFilterCount})
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <View style={styles.activeFiltersSection}>
            <View style={styles.activeFiltersContainer}>
              {activeFilters.map((filter, index) => (
                <TouchableOpacity
                  key={`${filter.type}-${filter.value}-${index}`}
                  style={styles.activeFilterChip}
                  onPress={() => removeActiveFilter(filter.type, filter.value)}
                >
                  <Text style={styles.activeFilterText}>{filter.label}</Text>
                  <Ionicons
                    name="close"
                    size={16}
                    color="#666"
                    style={styles.activeFilterClose}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>

          {visibleCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryRow}
              onPress={() => handleCategoryToggle(category.id)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    filters.categories.includes(category.id) &&
                      styles.checkboxChecked,
                  ]}
                >
                  {filters.categories.includes(category.id) && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Text style={styles.categoryCount}>({category.count})</Text>
            </TouchableOpacity>
          ))}

          {remainingCount > 0 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAllCategories(!showAllCategories)}
            >
              <Text style={styles.showMoreText}>
                {showAllCategories
                  ? "Show Less"
                  : `Show More (${remainingCount} more)`}
              </Text>
              <Ionicons
                name={showAllCategories ? "chevron-up" : "chevron-down"}
                size={16}
                color="#DC3545"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Price Range Section */}
        <View style={styles.section}>
          <View style={styles.priceHeader}>
            <Text style={styles.sectionTitle}>Price Range</Text>
          </View>

          <View style={styles.priceInputsRow}>
            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Min Price</Text>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.priceInput}
                  value={minPriceText}
                  onChangeText={handleMinPriceChange}
                  keyboardType="numeric"
                  inputMode="numeric"
                  placeholder="0"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.priceInputContainer}>
              <Text style={styles.priceLabel}>Max Price</Text>
              <View style={styles.priceInputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.priceInput}
                  value={maxPriceText}
                  onChangeText={handleMaxPriceChange}
                  keyboardType="numeric"
                  inputMode="numeric"
                  placeholder="100000"
                  maxLength={10}
                />
              </View>
            </View>
          </View>

          <View style={styles.sliderContainer}>
            <View
              style={styles.sliderTrack}
              onLayout={(event) => {
                sliderWidth.current = event.nativeEvent.layout.width;
              }}
            >
              <View
                style={[
                  styles.sliderFill,
                  {
                    left: `${(localFilters.priceRange[0] / 100000) * 100}%`,
                    width: `${
                      ((localFilters.priceRange[1] -
                        localFilters.priceRange[0]) /
                        100000) *
                      100
                    }%`,
                  },
                ]}
              />
              <View
                {...minThumbResponder.panHandlers}
                style={[
                  styles.sliderThumb,
                  {
                    left: `${(localFilters.priceRange[0] / 100000) * 100}%`,
                  },
                ]}
              />
              <View
                {...maxThumbResponder.panHandlers}
                style={[
                  styles.sliderThumb,
                  {
                    left: `${(localFilters.priceRange[1] / 100000) * 100}%`,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Materials Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Material</Text>

          {(showAllMaterials
            ? materialOptions
            : materialOptions.slice(0, 5)
          ).map((material) => (
            <TouchableOpacity
              key={material}
              style={styles.categoryRow}
              onPress={() => handleMaterialSelect(material)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    localFilters.material === material &&
                      styles.checkboxChecked,
                  ]}
                >
                  {localFilters.material === material && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <Text style={styles.categoryName}>{material}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {materialOptions.length > 5 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAllMaterials(!showAllMaterials)}
            >
              <Text style={styles.showMoreText}>
                {showAllMaterials
                  ? "Show Less"
                  : `Show More (${materialOptions.length - 5} more)`}
              </Text>
              <Ionicons
                name={showAllMaterials ? "chevron-up" : "chevron-down"}
                size={16}
                color="#DC3545"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Occasions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Occasion</Text>

          {(showAllOccasions
            ? occasionOptions
            : occasionOptions.slice(0, 5)
          ).map((occasion) => (
            <TouchableOpacity
              key={occasion}
              style={styles.categoryRow}
              onPress={() => handleOccasionSelect(occasion)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    localFilters.occasion === occasion &&
                      styles.checkboxChecked,
                  ]}
                >
                  {localFilters.occasion === occasion && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <Text style={styles.categoryName}>{occasion}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {occasionOptions.length > 5 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAllOccasions(!showAllOccasions)}
            >
              <Text style={styles.showMoreText}>
                {showAllOccasions
                  ? "Show Less"
                  : `Show More (${occasionOptions.length - 5} more)`}
              </Text>
              <Ionicons
                name={showAllOccasions ? "chevron-up" : "chevron-down"}
                size={16}
                color="#DC3545"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Customer Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Rating</Text>

          {[4, 3, 2, 1].map((rating) => (
            <TouchableOpacity
              key={rating}
              style={styles.categoryRow}
              onPress={() => handleRatingToggle(rating)}
            >
              <View style={styles.checkboxContainer}>
                <View
                  style={[
                    styles.checkbox,
                    localFilters.ratings.includes(rating) &&
                      styles.checkboxChecked,
                  ]}
                >
                  {localFilters.ratings.includes(rating) && (
                    <Ionicons name="checkmark" size={14} color="white" />
                  )}
                </View>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={14}
                      color={star <= rating ? "#FFD700" : "#E5E7EB"}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                  <Text style={styles.ratingText}>& Up</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#DC3545",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  filtersTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#DC3545",
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#DC3545",
  },
  categoryName: {
    fontSize: 16,
    color: "#000",
    flex: 1,
  },
  categoryCount: {
    fontSize: 14,
    color: "#666",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 16,
    color: "#DC3545",
    fontWeight: "500",
    marginRight: 4,
  },
  priceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  priceInputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  priceInputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  priceInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#666",
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    padding: 0,
  },
  sliderContainer: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    position: "relative",
  },
  sliderFill: {
    height: 4,
    backgroundColor: "#DC3545",
    borderRadius: 2,
  },
  sliderThumb: {
    position: "absolute",
    top: -6,
    width: 16,
    height: 16,
    backgroundColor: "#DC3545",
    borderRadius: 8,
    marginLeft: -8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  ratingText: {
    fontSize: 16,
    color: "#000",
    marginLeft: 8,
  },
  // Filter Header Styles
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  filterHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginLeft: 8,
  },
  filterCountBadge: {
    backgroundColor: "#DC3545",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  filterCountText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  hideButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  hideButtonText: {
    color: "#DC3545",
    fontSize: 16,
    fontWeight: "500",
  },
  // Clear Filters Styles
  filtersTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  clearAllButton: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  clearAllText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  // Active Filters Styles
  activeFiltersSection: {
    marginBottom: 16,
  },
  activeFiltersTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 12,
  },
  activeFiltersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  activeFilterText: {
    fontSize: 13,
    color: "#374151",
    marginRight: 6,
  },
  activeFilterClose: {
    marginLeft: 2,
  },
});

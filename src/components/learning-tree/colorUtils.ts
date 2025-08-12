/**
 * Color utility functions for the Learning Tree components
 * Provides consistent color schemes for nodes and legend items
 */

export interface ColorScheme {
  baseColor: string;
  gradientTop: string;
  gradientBottom: string;
  textColor: string;
}

/**
 * Gets the color scheme for a given category color name
 * @param categoryColor - The category color name (e.g., "red", "blue", "violet")
 * @returns ColorScheme object with base, gradient, and text colors
 */
export const getColorScheme = (categoryColor: string): ColorScheme => {
  switch (categoryColor) {
    case "red": {
      return {
        baseColor: "#9A031E",
        gradientTop: "#650000",
        gradientBottom: "#380000",
        textColor: "#fff",
      };
    }
    case "orange": {
      return {
        baseColor: "#FB8B24",
        gradientTop: "#C85A00",
        gradientBottom: "#7A3100",
        textColor: "#fff",
      };
    }
    case "yellow": {
      return {
        baseColor: "#F7B801",
        gradientTop: "#C79500",
        gradientBottom: "#7A5A00",
        textColor: "#fff",
      };
    }
    case "limegreen": {
      return {
        baseColor: "#32CD32", // Brighter lime green
        gradientTop: "#2EB82E", // Lighter lime green for the top gradient
        gradientBottom: "#28A428", // Slightly darker lime green for the bottom gradient
        textColor: "#fff", // White text for better readability
      };
    }
    case "blue": {
      return {
        baseColor: "#005F73",
        gradientTop: "#004257",
        gradientBottom: "#002638",
        textColor: "#fff",
      };
    }
    case "indigo": {
      return {
        baseColor: "#1A365D",
        gradientTop: "#122446",
        gradientBottom: "#0A122F",
        textColor: "#fff",
      };
    }
    case "violet": {
      return {
        baseColor: "#6A0572",
        gradientTop: "#49004F",
        gradientBottom: "#2A002D",
        textColor: "#fff",
      };
    }
    case "gray": {
      return {
        baseColor: "#B5B5B5",
        gradientTop: "#636363",
        gradientBottom: "#636363",
        textColor: "#fff",
      };
    }
    case "cyan": {
      return {
        baseColor: "#00A6A6",
        gradientTop: "#007474",
        gradientBottom: "#004242",
        textColor: "#fff",
      };
    }
    case "pink": {
      return {
        baseColor: "#FFC0CB",
        gradientTop: "#FFA07A",
        gradientBottom: "#FF6347",
        textColor: "#fff",
      };
    }
    case "lime": {
      return {
        baseColor: "#00FF00",
        gradientTop: "#00FF00",
        gradientBottom: "#00FF00",
        textColor: "#fff",
      };
    }
    case "teal": {
      return {
        baseColor: "#008080",
        gradientTop: "#008080",
        gradientBottom: "#008080",
        textColor: "#fff",
      };
    }
    case "brown": {
      return {
        baseColor: "#8B4513",
        gradientTop: "#5C2E06",
        gradientBottom: "#2E1A03",
        textColor: "#fff",
      };
    }
    case "beige": {
      return {
        baseColor: "#F5F5DC",
        gradientTop: "#E1DAB6",
        gradientBottom: "#C7B899",
        textColor: "#000",
      };
    }
    case "black": {
      return {
        baseColor: "#000000",
        gradientTop: "#2C2C2C",
        gradientBottom: "#1A1A1A",
        textColor: "#fff",
      };
    }
    case "white": {
      return {
        baseColor: "#FFFFFF",
        gradientTop: "#E5E5E5",
        gradientBottom: "#CCCCCC",
        textColor: "#000",
      };
    }
    case "olive": {
      return {
        baseColor: "#808000",
        gradientTop: "#6B6B00",
        gradientBottom: "#4C4C00",
        textColor: "#fff",
      };
    }
    default: {
      return {
        baseColor: "#fff",
        gradientTop: "#fff",
        gradientBottom: "#0c0d0e",
        textColor: "#fff",
      };
    }
  }
};

/**
 * Gets just the base color for a category (useful for simple color indicators)
 * @param categoryColor - The category color name
 * @returns The base color hex string
 */
export const getBaseColor = (categoryColor: string): string => {
  return getColorScheme(categoryColor).baseColor;
};

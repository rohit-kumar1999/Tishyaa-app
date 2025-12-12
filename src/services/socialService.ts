import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Linking } from "react-native";
import Toast from "react-native-toast-message";

export interface ShareContent {
  title: string;
  message: string;
  url?: string;
  imageUri?: string;
  hashtags?: string[];
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  available: boolean;
}

export interface ReferralData {
  code: string;
  userId: string;
  referredUsers: string[];
  totalRewards: number;
  createdAt: Date;
}

class SocialService {
  private referralCode: string | null = null;

  /**
   * Get available social platforms
   */
  getSocialPlatforms(): SocialPlatform[] {
    return [
      {
        id: "whatsapp",
        name: "WhatsApp",
        icon: "logo-whatsapp",
        color: "#25D366",
        available: true,
      },
      {
        id: "instagram",
        name: "Instagram",
        icon: "logo-instagram",
        color: "#E4405F",
        available: true,
      },
      {
        id: "facebook",
        name: "Facebook",
        icon: "logo-facebook",
        color: "#1877F2",
        available: true,
      },
      {
        id: "twitter",
        name: "Twitter",
        icon: "logo-twitter",
        color: "#1DA1F2",
        available: true,
      },
      {
        id: "telegram",
        name: "Telegram",
        icon: "paper-plane",
        color: "#0088CC",
        available: true,
      },
      {
        id: "native",
        name: "More",
        icon: "share",
        color: "#666666",
        available: true,
      },
    ];
  }

  /**
   * Share content using native share sheet
   */
  async shareNative(content: ShareContent): Promise<boolean> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        Alert.alert(
          "Sharing not available",
          "Sharing is not available on this device."
        );
        return false;
      }

      let shareOptions: any = {
        mimeType: "text/plain",
        dialogTitle: content.title,
      };

      // If image is provided, share image with text
      if (content.imageUri) {
        const imageExists = await FileSystem.getInfoAsync(content.imageUri);

        if (imageExists.exists) {
          // Create a temporary file with text
          const textContent = this.formatShareText(content);
          const tempTextFile = "/tmp/temp_share.txt";

          await FileSystem.writeAsStringAsync(tempTextFile, textContent);

          // For images, we need to use the sharing API differently
          await Sharing.shareAsync(content.imageUri, {
            mimeType: "image/jpeg",
            dialogTitle: content.title,
          });

          // Clean up temp file
          await FileSystem.deleteAsync(tempTextFile, { idempotent: true });
        } else {
          // Fall back to text only
          const textContent = this.formatShareText(content);
          const tempFile = "/tmp/temp_share.txt";

          await FileSystem.writeAsStringAsync(tempFile, textContent);
          await Sharing.shareAsync(tempFile, shareOptions);
          await FileSystem.deleteAsync(tempFile, { idempotent: true });
        }
      } else {
        // Text only sharing
        const textContent = this.formatShareText(content);
        const tempFile = FileSystem.Paths.cache + "temp_share.txt";

        await FileSystem.writeAsStringAsync(tempFile, textContent);
        await Sharing.shareAsync(tempFile, shareOptions);
        await FileSystem.deleteAsync(tempFile, { idempotent: true });
      }

      return true;
    } catch (error) {
      console.error("Error sharing content:", error);
      Toast.show({
        type: "error",
        text1: "Share Failed",
        text2: "Unable to share content. Please try again.",
      });
      return false;
    }
  }

  /**
   * Share to WhatsApp
   */
  async shareToWhatsApp(content: ShareContent): Promise<boolean> {
    try {
      const text = this.formatShareText(content);
      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `whatsapp://send?text=${encodedText}`;

      const canOpen = await Linking.canOpenURL(whatsappUrl);

      if (canOpen) {
        await Linking.openURL(whatsappUrl);
        return true;
      } else {
        Alert.alert(
          "WhatsApp not found",
          "WhatsApp is not installed on this device."
        );
        return false;
      }
    } catch (error) {
      console.error("Error sharing to WhatsApp:", error);
      return false;
    }
  }

  /**
   * Share to Instagram Stories
   */
  async shareToInstagram(content: ShareContent): Promise<boolean> {
    try {
      if (!content.imageUri) {
        Toast.show({
          type: "error",
          text1: "Image required",
          text2: "Instagram sharing requires an image.",
        });
        return false;
      }

      // For Instagram Stories, we need to use a different approach
      // This is a simplified version - full implementation would require Instagram SDK
      const instagramUrl = "instagram://story-camera";
      const canOpen = await Linking.canOpenURL(instagramUrl);

      if (canOpen) {
        await Linking.openURL(instagramUrl);
        return true;
      } else {
        Alert.alert(
          "Instagram not found",
          "Instagram is not installed on this device."
        );
        return false;
      }
    } catch (error) {
      console.error("Error sharing to Instagram:", error);
      return false;
    }
  }

  /**
   * Share to Facebook
   */
  async shareToFacebook(content: ShareContent): Promise<boolean> {
    try {
      const text = this.formatShareText(content);
      const encodedText = encodeURIComponent(text);
      let facebookUrl = `facebook://share?text=${encodedText}`;

      if (content.url) {
        facebookUrl += `&link=${encodeURIComponent(content.url)}`;
      }

      const canOpen = await Linking.canOpenURL(facebookUrl);

      if (canOpen) {
        await Linking.openURL(facebookUrl);
        return true;
      } else {
        // Fallback to web
        const webUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          content.url || ""
        )}`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error("Error sharing to Facebook:", error);
      return false;
    }
  }

  /**
   * Share to Twitter
   */
  async shareToTwitter(content: ShareContent): Promise<boolean> {
    try {
      const text = this.formatShareText(content, 280); // Twitter character limit
      const encodedText = encodeURIComponent(text);
      let twitterUrl = `twitter://post?message=${encodedText}`;

      if (content.url) {
        twitterUrl += `&url=${encodeURIComponent(content.url)}`;
      }

      const canOpen = await Linking.canOpenURL(twitterUrl);

      if (canOpen) {
        await Linking.openURL(twitterUrl);
        return true;
      } else {
        // Fallback to web
        const webUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(
          content.url || ""
        )}`;
        await Linking.openURL(webUrl);
        return true;
      }
    } catch (error) {
      console.error("Error sharing to Twitter:", error);
      return false;
    }
  }

  /**
   * Share to Telegram
   */
  async shareToTelegram(content: ShareContent): Promise<boolean> {
    try {
      const text = this.formatShareText(content);
      const encodedText = encodeURIComponent(text);
      const telegramUrl = `tg://msg?text=${encodedText}`;

      const canOpen = await Linking.canOpenURL(telegramUrl);

      if (canOpen) {
        await Linking.openURL(telegramUrl);
        return true;
      } else {
        Alert.alert(
          "Telegram not found",
          "Telegram is not installed on this device."
        );
        return false;
      }
    } catch (error) {
      console.error("Error sharing to Telegram:", error);
      return false;
    }
  }

  /**
   * Share content to specific platform
   */
  async shareTo(platform: string, content: ShareContent): Promise<boolean> {
    switch (platform) {
      case "whatsapp":
        return await this.shareToWhatsApp(content);
      case "instagram":
        return await this.shareToInstagram(content);
      case "facebook":
        return await this.shareToFacebook(content);
      case "twitter":
        return await this.shareToTwitter(content);
      case "telegram":
        return await this.shareToTelegram(content);
      case "native":
      default:
        return await this.shareNative(content);
    }
  }

  /**
   * Format share text with proper formatting
   */
  private formatShareText(content: ShareContent, maxLength?: number): string {
    let text = `${content.title}\n\n${content.message}`;

    if (content.url) {
      text += `\n\n${content.url}`;
    }

    if (content.hashtags && content.hashtags.length > 0) {
      const hashtags = content.hashtags.map((tag) => `#${tag}`).join(" ");
      text += `\n\n${hashtags}`;
    }

    // Add app signature
    text += "\n\nShared via Tishyaa Jewels App";

    // Truncate if necessary
    if (maxLength && text.length > maxLength) {
      text = text.substring(0, maxLength - 3) + "...";
    }

    return text;
  }

  /**
   * Share product
   */
  async shareProduct(product: any): Promise<boolean> {
    const content: ShareContent = {
      title: product.name,
      message: `Check out this beautiful ${
        product.category
      } from Tishyaa Jewels!\n\nPrice: ₹${product.price.toLocaleString(
        "en-IN"
      )}`,
      url: `https://tishyaajewels.com/products/${product.id}`,
      imageUri: product.images?.[0],
      hashtags: ["TishyaaJewels", "Jewelry", product.category, "Fashion"],
    };

    return await this.shareNative(content);
  }

  /**
   * Share order
   */
  async shareOrder(order: any): Promise<boolean> {
    const content: ShareContent = {
      title: "My Tishyaa Jewels Order",
      message: `I just placed an order for beautiful jewelry from Tishyaa Jewels!\n\nOrder #${order.id}\nItems: ${order.items.length}`,
      url: "https://tishyaajewels.com",
      hashtags: ["TishyaaJewels", "Jewelry", "Shopping"],
    };

    return await this.shareNative(content);
  }

  /**
   * Generate referral code
   */
  async generateReferralCode(userId: string): Promise<string> {
    try {
      if (this.referralCode) {
        return this.referralCode;
      }

      // Generate a unique referral code
      const code = `TISHYAA${userId.substr(-4).toUpperCase()}${Date.now()
        .toString()
        .substr(-4)}`;
      this.referralCode = code;

      // Save referral data
      const referralData: ReferralData = {
        code,
        userId,
        referredUsers: [],
        totalRewards: 0,
        createdAt: new Date(),
      };

      await AsyncStorage.setItem("referral_data", JSON.stringify(referralData));

      return code;
    } catch (error) {
      console.error("Error generating referral code:", error);
      throw error;
    }
  }

  /**
   * Get referral data
   */
  async getReferralData(): Promise<ReferralData | null> {
    try {
      const stored = await AsyncStorage.getItem("referral_data");
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error getting referral data:", error);
      return null;
    }
  }

  /**
   * Share referral link
   */
  async shareReferral(referralCode: string): Promise<boolean> {
    const content: ShareContent = {
      title: "Join Tishyaa Jewels",
      message: `Use my referral code "${referralCode}" and get exclusive discounts on beautiful jewelry!\n\nDiscover stunning collections at Tishyaa Jewels.`,
      url: `https://tishyaajewels.com/ref/${referralCode}`,
      hashtags: ["TishyaaJewels", "Jewelry", "Discount", "Referral"],
    };

    return await this.shareNative(content);
  }

  /**
   * Track social share
   */
  async trackShare(
    platform: string,
    contentType: string,
    contentId?: string
  ): Promise<void> {
    try {
      // This would typically send analytics to your backend
      console.log("Social share tracked:", {
        platform,
        contentType,
        contentId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error tracking share:", error);
    }
  }

  /**
   * Get share statistics (mock implementation)
   */
  async getShareStats(): Promise<any> {
    try {
      // This would typically fetch from your backend
      return {
        totalShares: 0,
        platformBreakdown: {
          whatsapp: 0,
          instagram: 0,
          facebook: 0,
          twitter: 0,
          telegram: 0,
          native: 0,
        },
        recentShares: [],
      };
    } catch (error) {
      console.error("Error getting share stats:", error);
      return null;
    }
  }
}

export const socialService = new SocialService();
export default socialService;

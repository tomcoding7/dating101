import * as tf from "@tensorflow/tfjs";

interface UserPreferences {
  ageRange: [number, number];
  gender: string;
  location: {
    latitude: number;
    longitude: number;
  };
  interests: string[];
  relationshipGoals: string;
  lifestyle: {
    smoking: boolean;
    drinking: boolean;
    exercise: "never" | "sometimes" | "regularly";
  };
}

interface UserProfile {
  id: string;
  age: number;
  gender: string;
  location: {
    latitude: number;
    longitude: number;
  };
  interests: string[];
  relationshipGoals: string;
  lifestyle: {
    smoking: boolean;
    drinking: boolean;
    exercise: "never" | "sometimes" | "regularly";
  };
  bio: string;
  education: string;
  occupation: string;
}

export class MatchingSystem {
  private model: tf.LayersModel | null = null;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    try {
      // Load pre-trained model or create a new one
      this.model = await tf.loadLayersModel("/models/matching_model.json");
    } catch (error) {
      console.error("Error loading model:", error);
      // Create a simple model if loading fails
      this.model = this.createSimpleModel();
    }
  }

  private createSimpleModel() {
    const model = tf.sequential();
    model.add(
      tf.layers.dense({ units: 64, activation: "relu", inputShape: [10] })
    );
    model.add(tf.layers.dense({ units: 32, activation: "relu" }));
    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));
    model.compile({
      optimizer: "adam",
      loss: "binaryCrossentropy",
      metrics: ["accuracy"],
    });
    return model;
  }

  private preprocessUserData(
    user: UserProfile,
    preferences: UserPreferences
  ): number[] {
    // Convert user data to numerical features
    const features = [
      user.age / 100, // Normalize age
      ...this.oneHotEncodeGender(user.gender),
      ...this.oneHotEncodeInterests(user.interests),
      this.calculateLocationScore(user.location, preferences.location),
      this.calculateAgeCompatibility(user.age, preferences.ageRange),
    ];
    return features;
  }

  private oneHotEncodeGender(gender: string): number[] {
    const genders = ["male", "female", "other"];
    return genders.map((g) => (g === gender ? 1 : 0));
  }

  private oneHotEncodeInterests(interests: string[]): number[] {
    const allInterests = [
      "music",
      "sports",
      "travel",
      "food",
      "movies",
      "reading",
      "art",
      "technology",
      "fitness",
      "fashion",
    ];
    return allInterests.map((interest) =>
      interests.includes(interest) ? 1 : 0
    );
  }

  private calculateLocationScore(
    userLocation?: string,
    preferredLocation?: string
  ): number {
    if (!userLocation || !preferredLocation) return 0.5;
    return userLocation === preferredLocation ? 1 : 0;
  }

  private calculateAgeCompatibility(age: number, ageRange: number[]): number {
    const [min, max] = ageRange;
    if (age >= min && age <= max) return 1;
    const distance = Math.min(Math.abs(age - min), Math.abs(age - max));
    return Math.max(0, 1 - distance / 10); // Decrease score as age difference increases
  }

  public async calculateMatchScore(
    user1: UserProfile,
    user2: UserProfile,
    preferences: UserPreferences
  ): Promise<number> {
    if (!this.model) {
      throw new Error("Model not initialized");
    }

    // Preprocess user data
    const user1Features = this.preprocessUserData(user1, preferences);
    const user2Features = this.preprocessUserData(user2, preferences);

    // Combine features
    const combinedFeatures = [...user1Features, ...user2Features];

    // Make prediction
    const input = tf.tensor2d([combinedFeatures]);
    const prediction = this.model.predict(input) as tf.Tensor;
    const score = await prediction.data();

    // Clean up tensors
    input.dispose();
    prediction.dispose();

    return score[0];
  }

  public generateMatchReason(
    user1: UserProfile,
    user2: UserProfile,
    score: number
  ): string {
    const reasons: string[] = [];

    // Age compatibility
    const ageDiff = Math.abs(user1.age - user2.age);
    if (ageDiff <= 2) {
      reasons.push("You are close in age");
    }

    // Common interests
    const commonInterests = user1.interests.filter((interest) =>
      user2.interests.includes(interest)
    );
    if (commonInterests.length > 0) {
      reasons.push(`You both enjoy ${commonInterests.join(", ")}`);
    }

    // Location
    if (user1.location && user2.location && user1.location === user2.location) {
      reasons.push("You live in the same area");
    }

    // High match score
    if (score > 0.8) {
      reasons.push("You have a very high compatibility score");
    }

    return reasons.length > 0
      ? reasons.join(" and ") + "!"
      : "You might be a good match!";
  }
}

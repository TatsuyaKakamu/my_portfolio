export type Theme = "app" | "security" | "photography" | "training" | "about";

export interface Profile {
  name: string;
  initials: string;
  title: string;
  tagline: string;
  summary: string;
  portrait: string;
  portraitAlt: string;
  badges: Array<{ label: string; theme: Theme }>;
}

export interface ExternalLink {
  label: string;
  url: string;
  icon: "github" | "tuv" | "instagram" | "strava";
  status?: "ready" | "coming-soon";
}

export interface ActivityArea {
  id: "home" | "apps" | "security" | "photography" | "training" | "about";
  title: string;
  labelJa: string;
  theme: Theme;
  icon: "home" | "code" | "shield" | "camera" | "runner" | "user";
}

export interface Project {
  name: string;
  description: string;
  purpose: string;
  screenshot: string;
  screenshotAlt: string;
  techStack: string[];
  repositoryUrl: string;
  demoUrl?: string;
  featured: boolean;
  lastFetchedAt: string;
}

export interface Certification {
  name: string;
  issuer: string;
  standard: string;
  holderName: string;
  issueDate: string;
  certificationId: string;
  verificationUrl: string;
  markImage: string;
  markAlt: string;
  markSourceUrl: string;
  theme: "security";
  lastCheckedAt: string;
}

export interface PhotoItem {
  image: string;
  alt: string;
  caption: string;
  postUrl: string;
  lastFetchedAt: string;
}

export interface TrainingSummary {
  stravaUrl: string;
  theme: "training";
  summary: {
    period: string;
    activitiesThisMonth: number;
    distanceKmThisMonth: number;
    activityCountYear: number;
    distanceKmYear: number;
    streakDays: number;
    monthlyAverageKm: number;
    note: string;
    lastFetchedAt: string;
  };
  weeklyDistances: Array<{ label: string; distanceKm: number }>;
}

export const profile: Profile = {
  name: "Tatsuya Kakamu",
  initials: "TK",
  title: "アプリを作り、産業用サイバーセキュリティを学び、写真を撮り、日々トレーニングを続けています。",
  tagline: "Building apps, learning industrial cybersecurity, capturing moments, and training consistently.",
  summary:
    "モバイル・業務用アプリ、インフラの自動化、セキュリティ、産業用サイバーセキュリティの学習に取り組みながら、写真とトレーニングを通じて日々を記録しています。",
  portrait: "/images/generated/profile-portrait.jpg",
  portraitAlt: "山の展望台に立つ人物の写真風ポートレート",
  badges: [
    { label: "App Developer", theme: "app" },
    { label: "Industrial Cybersecurity Learner", theme: "security" },
    { label: "Photographer", theme: "photography" },
    { label: "Runner", theme: "training" }
  ]
};

export const activityAreas: ActivityArea[] = [
  { id: "home", title: "Home", labelJa: "ホーム", theme: "about", icon: "home" },
  { id: "apps", title: "App Development", labelJa: "アプリ開発", theme: "app", icon: "code" },
  { id: "security", title: "Industrial Cybersecurity", labelJa: "産業用サイバーセキュリティ", theme: "security", icon: "shield" },
  { id: "photography", title: "Photography", labelJa: "写真", theme: "photography", icon: "camera" },
  { id: "training", title: "Training", labelJa: "トレーニング", theme: "training", icon: "runner" },
  { id: "about", title: "About", labelJa: "自分について", theme: "about", icon: "user" }
];

export const externalLinks: ExternalLink[] = [
  { label: "GitHub", url: "", icon: "github", status: "coming-soon" },
  {
    label: "TÜV SÜD",
    url: "https://www.tuvsud.com/ja-jp/services/training/ac/psms/com-iec62443-foundation/certified-persons",
    icon: "tuv",
    status: "ready"
  },
  { label: "Instagram", url: "", icon: "instagram", status: "coming-soon" },
  { label: "Strava", url: "", icon: "strava", status: "coming-soon" }
];

export const projects: Project[] = [
  {
    name: "MLX Audio Transcriptor",
    description: "wav/mp3をドラッグ&ドロップで文字起こしし、*.mdで出力するMacアプリ",
    purpose: "Apple Silicon上でローカル音声文字起こしを手軽に実行するためのMacアプリ。",
    screenshot: "/images/generated/app-mlx-audio-transcriptor.png",
    screenshotAlt: "音声ファイルをAIで文字起こししてMarkdownに出力するMacアプリの画面",
    techStack: ["macOS", "Python", "mlx-whisper", "VAD"],
    repositoryUrl: "https://github.com/TatsuyaKakamu/mlx-audio-transcriptor",
    featured: true,
    lastFetchedAt: "2026-04-24T00:00:00+09:00"
  },
  {
    name: "Secure Device Monitor",
    description: "産業用機器のセキュリティ状態を確認するダッシュボード",
    purpose: "設備の状態を集約し、リスク傾向を把握しやすくする実験的な監視UI。",
    screenshot: "/images/generated/app-secure-monitor.png",
    screenshotAlt: "産業用セキュリティ監視アプリのダッシュボード画面",
    techStack: ["Security", "Flask", "PostgreSQL"],
    repositoryUrl: "",
    featured: true,
    lastFetchedAt: "2026-04-24T00:00:00+09:00"
  },
  {
    name: "Photo Map",
    description: "撮影した写真を地図上で表示・共有するアプリ",
    purpose: "生活圏を推測できる詳細位置は出さず、旅や撮影の記録を整理するための写真管理UI。",
    screenshot: "/images/generated/app-photo-map.png",
    screenshotAlt: "写真管理と地図表示を組み合わせたアプリ画面",
    techStack: ["iOS", "SwiftUI", "MapKit"],
    repositoryUrl: "",
    featured: true,
    lastFetchedAt: "2026-04-24T00:00:00+09:00"
  }
];

export const certification: Certification = {
  name: "Certified Persons Industrial Cybersecurity Foundation (Level 1)",
  issuer: "TÜV SÜD",
  standard: "According to IEC 62443",
  holderName: "Tatsuya Kakamu",
  issueDate: "2025.6.5",
  certificationId: "M10522-25M126062",
  verificationUrl: "https://www.tuvsud.com/ja-jp/services/training/ac/psms/com-iec62443-foundation/certified-persons",
  markImage: "/images/brand/tuv-sud-certification-mark.png",
  markAlt: "TÜV SÜD official logo artwork",
  markSourceUrl: "https://commons.wikimedia.org/wiki/File:TUV_SUD_logo_rebrand.png",
  theme: "security",
  lastCheckedAt: "2026-04-24T00:00:00+09:00"
};

export const photos: PhotoItem[] = [
  {
    image: "/images/generated/photo-lake.jpg",
    alt: "雪山が湖面に映る静かな山岳湖",
    caption: "Alpine lake",
    postUrl: "",
    lastFetchedAt: "2026-04-24T00:00:00+09:00"
  },
  {
    image: "/images/generated/photo-street.jpg",
    alt: "夕日の差し込む古い街並みの路地",
    caption: "Evening street",
    postUrl: "",
    lastFetchedAt: "2026-04-24T00:00:00+09:00"
  },
  {
    image: "/images/generated/photo-hydrangea.jpg",
    alt: "雨上がりの紫陽花",
    caption: "Hydrangea",
    postUrl: "",
    lastFetchedAt: "2026-04-24T00:00:00+09:00"
  },
  {
    image: "/images/generated/photo-sea.jpg",
    alt: "夕暮れの穏やかな海と雲",
    caption: "Dusk sea",
    postUrl: "",
    lastFetchedAt: "2026-04-24T00:00:00+09:00"
  },
  {
    image: "/images/generated/photo-autumn.jpg",
    alt: "紅葉に囲まれた静かな寺社の風景",
    caption: "Autumn shrine",
    postUrl: "",
    lastFetchedAt: "2026-04-24T00:00:00+09:00"
  }
];

export const training: TrainingSummary = {
  stravaUrl: "",
  theme: "training",
  summary: {
    period: "2026-04",
    activitiesThisMonth: 12,
    distanceKmThisMonth: 102.4,
    activityCountYear: 86,
    distanceKmYear: 782.6,
    streakDays: 156,
    monthlyAverageKm: 956,
    note: "継続的なトレーニング習慣を、位置情報や健康詳細を出さない集計値として表示しています。",
    lastFetchedAt: "2026-04-24T00:00:00+09:00"
  },
  weeklyDistances: [
    { label: "11/18", distanceKm: 88.2 },
    { label: "12/8", distanceKm: 65.7 },
    { label: "1/5", distanceKm: 73.1 },
    { label: "2/9", distanceKm: 111.3 },
    { label: "3/8", distanceKm: 116.8 },
    { label: "4/6", distanceKm: 102.4 }
  ]
};

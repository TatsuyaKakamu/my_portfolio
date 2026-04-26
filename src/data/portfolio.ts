import trainingData from "./training-data.json";

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

export interface TrainingMonthlyEntry {
  month: string;
  label: string;
  hours: number;
}

export interface TrainingStreak {
  weeks: number;
  startDate: string;
  label: string;
}

export interface TrainingPeriod {
  from: string;
  to: string;
  lastMonth: string;
  year: number;
}

export interface TrainingSummary {
  stravaUrl: string;
  theme: "training";
  lastFetchedAt: string;
  period: TrainingPeriod;
  lastMonthTotalHours: number;
  previousMonthTotalHours: number;
  lastMonthDeltaHours: number;
  averageMonthlyHours: number;
  yearTotalHours: number;
  monthlyHours: TrainingMonthlyEntry[];
  streak: TrainingStreak;
}

export const profile: Profile = {
  name: "Tatsuya Kakamu",
  initials: "TK",
  title: "アプリを作り、産業用サイバーセキュリティを学び、写真を撮り、日々トレーニングを続けています。",
  tagline: "Building apps, learning industrial cybersecurity, capturing moments, and training consistently.",
  summary:
    "写真とトレーニングを通じて心身を整えながら、アプリ・Webサイト開発、業務の自動化、産業用サイバーセキュリティの学習に日々取り組んでいます。",
  portrait: "/images/generated/profile-portrait.jpg",
  portraitAlt: "サイクルジャージ姿で賞状を持つ人物のモノクロ調ポートレート",
  badges: [
    { label: "App & Web Developer", theme: "app" },
    { label: "Industrial Cybersecurity Learner", theme: "security" },
    { label: "Photographer", theme: "photography" },
    { label: "Runner", theme: "training" }
  ]
};

export const activityAreas: ActivityArea[] = [
  { id: "home", title: "Home", labelJa: "ホーム", theme: "about", icon: "home" },
  { id: "apps", title: "Apps & Websites", labelJa: "アプリ・Web制作", theme: "app", icon: "code" },
  { id: "security", title: "Industrial Cybersecurity", labelJa: "産業用サイバーセキュリティ", theme: "security", icon: "shield" },
  { id: "photography", title: "Photography", labelJa: "写真", theme: "photography", icon: "camera" },
  { id: "training", title: "Training", labelJa: "トレーニング", theme: "training", icon: "runner" },
  { id: "about", title: "About", labelJa: "自分について", theme: "about", icon: "user" }
];

export const externalLinks: ExternalLink[] = [
  { label: "GitHub", url: "https://github.com/TatsuyaKakamu", icon: "github", status: "ready" },
  {
    label: "TÜV SÜD",
    url: "https://www.tuvsud.com/ja-jp/services/training/ac/psms/com-iec62443-foundation/certified-persons",
    icon: "tuv",
    status: "ready"
  },
  { label: "Instagram", url: "https://www.instagram.com/t_kakamu_/", icon: "instagram", status: "ready" },
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
    name: "Photographer Demo Site",
    description: "自動車写真家向けの高級感あるポートフォリオデモサイト。シーン別ギャラリー、見積もり、フォーム挙動シミュレーションを備える。",
    purpose: "Web サイト制作の事例として、写真家向けポートフォリオの UI / 機能をまとめた公開デモ。",
    screenshot: "/images/generated/website-photographer-demo.png",
    screenshotAlt: "自動車写真家向けポートフォリオサイト制作実績の紹介サムネイル",
    techStack: ["JavaScript", "CSS", "HTML", "Node.js"],
    repositoryUrl: "https://github.com/TatsuyaKakamu/photographer_demo_site",
    demoUrl: "https://tatsuyakakamu.github.io/photographer_demo_site/",
    featured: true,
    lastFetchedAt: "2026-04-26T00:00:00+09:00"
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
    image: "/images/photos/snowy-sunrise.jpg",
    alt: "雪の積もった山道から朝焼けと海を望む風景",
    caption: "雪山の朝焼け",
    postUrl: "",
    lastFetchedAt: "2026-04-26T00:00:00+09:00"
  },
  {
    image: "/images/photos/red-lantern-steps.jpg",
    alt: "赤い灯籠が並ぶ石段の参道を歩く人たち",
    caption: "朱灯籠の参道",
    postUrl: "",
    lastFetchedAt: "2026-04-26T00:00:00+09:00"
  },
  {
    image: "/images/photos/cherry-blossoms.jpg",
    alt: "桜の花の下で帽子をかぶった子どもが立つ春の風景",
    caption: "桜の下で",
    postUrl: "",
    lastFetchedAt: "2026-04-26T00:00:00+09:00"
  },
  {
    image: "/images/photos/city-skyline.jpg",
    alt: "高層ビルが並ぶ都市のスカイラインと広い道路",
    caption: "都市の朝",
    postUrl: "",
    lastFetchedAt: "2026-04-26T00:00:00+09:00"
  },
  {
    image: "/images/photos/mountain-bridge.jpg",
    alt: "山あいに架かる吊り橋と朝日に照らされた霧",
    caption: "山あいの吊り橋",
    postUrl: "",
    lastFetchedAt: "2026-04-26T00:00:00+09:00"
  }
];

export const training: TrainingSummary = {
  stravaUrl: "",
  theme: "training",
  ...(trainingData as Omit<TrainingSummary, "stravaUrl" | "theme">)
};

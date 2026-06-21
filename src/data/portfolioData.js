// ---------------------------------------------------------------------------
// portfolioData.js
// Single source of truth for every piece of CV-derived content rendered in
// the Main Portfolio (everything after the player steps through the gate).
// Keeping it here (instead of scattered inline in each section) means the
// content can be updated in one place without touching layout/animation code.
// ---------------------------------------------------------------------------

// Shared by ChapterRail (nav) and MainPortfolio (section order/anchors).
// Numbered as chapters of one continuous "adventure" — the visitor just
// walked through a literal gate, so the book/quest framing is earned
// rather than decorative.
export const chapters = [
  { id: "about", numeral: "I", label: "The Adventurer" },
  { id: "projects", numeral: "II", label: "Outstanding product" },
  { id: "skills", numeral: "III", label: "The Arsenal" },
  { id: "achievements", numeral: "IV", label: "Trophies" },
  { id: "creative", numeral: "V", label: "The Forge" },
  { id: "book", numeral: "VI", label: "Ancient Library" },
  { id: "contact", numeral: "VII", label: "Send a Raven" },
];

export const profile = {
  name: "Bui Binh Minh",
  role: "Game Developer",
  tagline: "Unity & C# · Interactive Tech · Gameplay Programming",
  photo: "/imgs/BinhMInh2.jpg",
  location: "Bien Hoa City, Dong Nai Province, Vietnam",
  email: "buiminh19102004@gmail.com",
  phone: "0973212834",
  github: "https://github.com/BBMDev-stark",
  cv: "CV/CV-BuiBinhMinh.pdf",
  education: {
    school: "Lac Hong University",
    major: "Information Technology",
    period: "2022 – 2026",
  },
  languages: ["Vietnamese", "English"],
  softSkills: [
    "Teamwork & Communication",
    "Problem Solving",
    "Critical Thinking",
    "Time Management",
    "Fast Learning Ability",
    "Presentation Skills",
  ],
  summary:
    "Passionate and creative Game Developer with experience in Unity game development, gameplay programming, and interactive technology projects. Skilled in developing game mechanics, player interaction systems, UI implementation, debugging, and optimization using C# and Unity Engine. Experienced in collaborative team environments through participation in robotics, AI, and international innovation competitions — with a problem-solving mindset built for quickly learning new tools and shipping engaging, user-focused experiences.",
};

// 2-page CV preview shown in the Contact chapter, click-to-enlarge.
// Swap these placeholder files with real screenshots/exports of your CV
// pages (same filenames, public/imgs/cv/) — the Download button below
// them always points at profile.cv above, independent of these images.
export const cvPreview = [
  { id: "cv-page-1", image: "public\\imgs\\cvmattrc.jpg", alt: "CV — Page 1" },
  { id: "cv-page-2", image: "public\\imgs\\cvmatsau.jpg", alt: "CV — Page 2" },
];

// Wide "key art" banner shown at the top of the Outstanding Product
// chapter. Swap the file at this path with your own (keep it long/wide -
// something like 1600x420 reads well) and nothing else needs to change.
export const projectsBanner = {
  image: "public\\imgs\\game1.png",
  alt: "Game-style banner showcasing outstanding product work",
};

// 9 placeholder design shots — drop your own images in at these same
// filenames (public/imgs/projects/design-1.svg ... design-9.svg) and
// they appear automatically. Swap the extension too if you use jpg/png,
// just update the path here to match.
// export const designGallery = Array.from({ length: 9 }, (_, i) => ({
//   id: `design-${i + 1}`,
//   image: `imgs/projects/design-${i + 1}.svg`,
//   alt: `Design showcase ${i + 1}`,
// }));

export const designGallery = [
  {
    id: "design-1",
    image: "public\\imgs\\game2.png",
    alt: "Ancient Fantasy Warrior",
    title: "Chiến Binh Cổ Đại"
  },
  {
    id: "design-2",
    image: "public\\imgs\\game3.png",
    alt: "Mystical Artifact",
    title: "Lối chơi"
  },
  {
    id: "design-3",
    image: "public\\imgs\\game4.png",
    alt: "Enchanted Ruins",
    title: "Quang Cảnh thế giới"
  },
  {
    id: "design-4",
    image: "public\\imgs\\game5.png",
    alt: "Ancient Dragon",
    title: "Rồng Cổ Đại"
  },
  {
    id: "design-5",
    image: "public\\imgs\\game6.png",
    alt: "Arcane Mage",
    title: "Pháp Sư Huyền Thuật"
  },
  {
    id: "design-6",
    image: "public\\imgs\\game8.png",
    alt: "Epic Battle",
    title: "Trận Chiến Huyền Thoại"
  },
  {
    id: "design-7",
    image: "public\\imgs\\game7.png",
    alt: "Forest Spirit",
    title: "Linh Hồn Rừng Sâu"
  },
  {
    id: "design-8",
    image: "public\\imgs\\game9.png",
    alt: "Dungeon Exploration",
    title: "Khám Phá Hầm Ngục"
  },
  {
    id: "design-9",
    image: "public\\imgs\\game10.png",
    alt: "Ancient Guardian",
    title: "Thủ Hộ Thần Cổ Xưa"
  },
];
// "Quests Completed" by CV / award. icon keys map to the hand-drawn SVG
// glyphs in ../portfolio/icons/ProjectIcons.jsx — no stock art, no external
// images.
export const projects = [
  {
    id: "stem-minigames",
    icon: "joystick",
    title: "Interactive STEM Mini-Game System",
    period: "03/2025 – 08/2025",
    tech: ["Unity", "C#", "UI System"],
    accent: "gold",
    summary:
      "A suite of Unity mini-games built for live STEM outreach events — mission/scoring loops and player-interaction systems running on-site in front of a real audience.",
    details: [
      "Designed gameplay systems for interactive mini games used at technology outreach events.",
      "Built UI systems, animations, and visual effects in Unity.",
      "Implemented mission, scoring, and player-interaction systems.",
      "Optimized runtime performance and fixed gameplay-related bugs under deadline.",
      "Collaborated with a team to deploy live, working demos on STEM event day.",
    ],
  },
  {
    id: "3d-platformer",
    icon: "sword",
    title: "Personal 3D Platformer",
    period: "09/2024 – 12/2024",
    tech: ["Unity", "C#"],
    accent: "gold",
    summary:
      "A solo-built 3D platformer used to go deep on Unity's core gameplay loop — movement, combat-adjacent collision, enemy AI, and checkpoint flow, end to end.",
    details: [
      "Developed a 3D platformer game using the Unity Engine.",
      "Built player movement, jumping, and collision systems from scratch.",
      "Designed levels, basic enemy AI, and a checkpoint/respawn system.",
      "Integrated animation and audio systems into gameplay.",
      "Iterated on feel through playtesting and performance optimization.",
    ],
  },
  {
    id: "food-connection",
    icon: "leaf",
    title: "Food Connection — Surplus Food Sharing",
    period: "09/2023 – 10/2023",
    tech: ["Flutter", "MongoDB", "Google Maps API"],
    accent: "purple",
    award: "🏆 Champion — Dong Nai Digital Transformation Competition 2023",
    summary:
      "An app connecting surplus-food donors with people in need, with transparent tracking of food inspection and preservation to cut waste community-wide.",
    details: [
      "Built the application in Flutter with MongoDB for flexible, scalable data storage.",
      "Integrated the Google Maps API for location services, route tracking, and delivery management.",
      "Designed the donor ↔ recipient matching flow end to end.",
    ],
  },
  {
    id: "your-voice",
    icon: "chip",
    title: "\u201CYour Voice\u201D — Vietnamese Hate-Speech Detector",
    period: "06/2025 – 11/2025",
    tech: ["Flutter", "CNN", "LSTM", "ML"],
    accent: "purple",
    award:
      "🏆 Champion — Expanded Student Science Conference · Encouragement Award — Ministry of Education Competition",
    summary:
      "An AI-powered app that analyzes sentiment and flags toxic or hateful content in Vietnamese comments, paired with a community platform for healthier online discussion.",
    details: [
      "Built the application interface in Flutter.",
      "Applied CNN and LSTM machine-learning models for text/image classification, trained and tuned on Vietnamese-language datasets.",
      "Designed the community layer for safer, healthier online communication.",
    ],
  },
  {
    id: "borderwave",
    icon: "shield",
    title: "Borderwave — Border Alert & Student Support",
    period: "06/2025",
    tech: ["Flutter", "Next.js", "GIS"],
    accent: "purple",
    award:
      "🥇 First Prize — Vung Tau Technical Science Competition 2025 · Encouragement Award — \u201CGeneration Z Students\u201D (VTV3)",
    summary:
      "A safety system for border-area students — risk warnings, digital maps, and real-time notifications, built to support both education and emergency response.",
    details: [
      "Built the app interface in Flutter and the companion website in Next.js.",
      "Converted raw GIS data (Excel/JSON) into an interactive map system for student support.",
      "Designed the real-time alert/notification flow for emergency response.",
    ],
  },
];

export const skills = {
  technical: [
    "Unity Engine",
    "C#",
    "Gameplay Programming",
    "UI/UX Development",
    "Game Mechanics Design",
    "Debugging & Optimization",
    "Git/GitHub",
    "Firebase",
    "REST API",
    "MongoDB",
    "Basic AI Systems",
  ],
  languages: ["C#", "JavaScript", "Python", "HTML/CSS/Tailwind", "SQL", "Flutter"],
};

// Only the 3 most notable awards, per the brief — the rest live in the CV.
// `image` points at a placeholder file under public/imgs/achievements/ —
// drop your own photo/certificate/logo in with the SAME filename and it
// shows up automatically, no code changes needed.
export const achievements = [
  {
     id: "apec-innovation-2025",
     year: "2025 – 2026",
     title: "National Champion",
     event: "APEC INNOVATION – Season II",
     image: "public/imgs/700267260_1384133167081378_8523055942961063260_n.jpg",
   },
   {
     id: "svthm-2026",
     year: "2026",
     title: "National Encouragement Award",
     event: "\u201CNew Generation Students 2026\u201D – VTV",
     image: "public/imgs/614659462_1388308156423936_892036974209737418_n.jpg",
   },
   {
     id: "dntc-2025",
     year: "2025",
     title: "Champion",
     event: "Dong Nai Province Digital Transformation Competition 2025",
     image: "public/imgs/484580153_1389359975847035_6922982835931403777_n.jpg",
   },
    {
     id: "khsv-2025",
     year: "2025",
     title: "Champion",
     event: "Expanded Student Science Conference – Dong Nai Province 2025",
     image: "public/imgs/506469544_1219336983321055_4161374967542504237_n.jpg",
   },
];

export const devlog = [
  {
    title: "Shattering the gate",
    text: "The portal you walked through isn't a static model — it's procedurally fractured into 12 pieces on load, scattered with a seeded RNG so the 'broken' layout is stable across reloads, then tweened back together on hover.",
  },
  {
    title: "One shader, three jobs",
    text: "A single custom GLSL vortex shader (below) powers the gate's core, with a signed-distance arch mask layered on top so the same material can fill a rectangle or a round-topped doorway.",
  },
  {
    title: "Fail quietly, never blank",
    text: "Every loaded asset (gate, ruins, HDRI) is wrapped in an error boundary with a procedural fallback, so a failed download degrades the visual instead of breaking the page.",
  },
];

export const techBadges = [
  "React",
  "React Three Fiber",
  "Three.js",
  "GSAP",
  "Lenis",
  "Vite",
  "GLSL",
];
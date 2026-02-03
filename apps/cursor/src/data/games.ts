import slugify from "slugify";

export const games = [
  {
    id: 1,
    name: "Flight Simulator 2025",
    link: "https://fly.pieter.com/",
    screenshot: "https://pbs.twimg.com/media/GlYV1zyXoAA6H4l?format=jpg&name=large",
    description: "A fun free-to-play MMO flight sim, 100% made with AI, without loading screens and GBs of updates every time you wanna play",
    author: {
      name: "@levelsio",
      image: "https://pbs.twimg.com/profile_images/1589756412078555136/YlXMBzhp_400x400.jpg",
    },
  },
  {
    id: 2,
    name: "Flight Simulator",
    link: "https://flyhi.netlify.app",
    screenshot: "https://pbs.twimg.com/ext_tw_video_thumb/1898013926937575427/pu/img/BUD0F3sl0F750YRb.jpg",
    description: "A flight simulator game built with ThreeJS",
    author: {
      name: "Melvin Vivas",
      image: "https://pbs.twimg.com/profile_images/1833137601207009280/gGSDe5DF_400x400.jpg",
    },
  },
  {
    id: 3,
    name: "Vibe Sail",
    link: "https://vibesail.com/",
    screenshot: "https://pbs.twimg.com/media/GlKvyNbXMAA2Hk3?format=jpg&name=medium",
    description: "A relaxing sailing game built with ThreeJS",
    author: {
      name: "Nicola",
      image: "https://pbs.twimg.com/profile_images/1821980604847534080/rMakHWe0_400x400.jpg",
    },
  },
  {
    id: 4,
    name: "Island Adventure",
    link: "https://ja.sperdeboer.nl/island",
    screenshot: "https://pbs.twimg.com/media/GlUQ07aXoAAQn36?format=jpg&name=large",
    description: "A island survival game built with ThreeJS",
    author: {
      name: "Jasper de Boer",
      image: "https://pbs.twimg.com/profile_images/1633834749251969024/0Pw_mMdn_400x400.jpg",
    },
  },
  {
    id: 5,
    name: "Cybertruck",
    link: "https://cybertrucksim.com",
    external: true,
    screenshot: "https://pbs.twimg.com/ext_tw_video_thumb/1895541881028648960/pu/img/rLtvnACL-aaQhJd1.jpg",
    description: "A cybertruck simulation game built with ThreeJS",
    author: {
      name: "Hi_Bennie",
      image: "https://pbs.twimg.com/profile_images/1886719299613609984/eP42ypti_400x400.jpg",
    },
  },
  {
    id: 6,
    name: "Builder",
    link: "http://regame.io",
    screenshot: "https://pbs.twimg.com/media/GlWm50YXMAA5nbZ?format=jpg&name=4096x4096",
    description: "A calm, Minecraft-inspired building game where you can create and explore",
    author: {
      name: "Sarp Erdag",
      image: "https://pbs.twimg.com/profile_images/686152042226806785/Ihs1m_Nb_400x400.jpg",
    },
  },
  {
    id: 7,
    name: "Battle Tank",
    link: "https://tank.cemilsevim.com",
    screenshot: "https://pbs.twimg.com/amplify_video_thumb/1896382237240631296/img/9__Tti9xabPuiwny.jpg",
    description: "A battle tank game built with ThreeJS",
    author: {
      name: "Cemil Sevim",
      image: "https://pbs.twimg.com/profile_images/1896219149233274880/VcZE8Cx6_400x400.jpg",
    },
  },
  {
    id: 8,
    name: "Car vs Monsters",
    link: "https://3d-racer.netlify.app",
    screenshot: "https://pbs.twimg.com/media/GkycsY8XkAAqXKW?format=jpg&name=medium",
    description: "A high-speed chase through a monster-infested city. Dodge or battle creatures while gathering power-ups to boost your survival chances.",
    author: {
      name: "Mark S",
      image: "https://pbs.twimg.com/profile_images/1828379256533008384/-UBiPxq-_400x400.jpg",
    },
  },
  {
    id: 9,
    name: "Flappy Bird",
    link: "https://flappi-bird.vercel.app",
    screenshot: "https://pbs.twimg.com/ext_tw_video_thumb/1897909487127695360/pu/img/_2n1bPTIhzCO1Icl.jpg",
    description: "A Flappy Bird clone built with ThreeJS",
    author: {
      name: "Joshua Johnson",
      image: "https://pbs.twimg.com/profile_images/1838725346234941440/spTLAaYk_400x400.jpg",
    },
  },
  {
    id: 10,
    name: "Space Defenders",
    link: "https://jasonleow.com/space-defenders",
    screenshot: "https://pbs.twimg.com/media/GlbOb5iaMAAMzgz?format=png&name=900x900",
    description: "A space shooter game built with ThreeJS",
    author: {
      name: "Jason Leow",
      image: "https://pbs.twimg.com/profile_images/1866447524111978496/GGeqUS5D_400x400.jpg",
    },
  },
  {
    id: 11,
    name: "Eid Racer Power Rush",
    link: "https://comel.lol/car-eid-greeting/",
    screenshot: "https://github.com/dragonjump/comel.lol/blob/gh-pages/car-eid-greeting/logo.png?raw=true",
    description: " A festive 3D car game where players race to collect power-ups in the fastest time, embracing the spirit of Eid. 🚗✨",
    author: {
      name: "Sean Lon",
      image: "https://gravatar.com/avatar/1880b3f123439c4d0709778f8b82baf2071047f6071a42b9a744313faa0d235e?r=pg&d=retro&size=200",
    },
  },
  {
    id: 12,
    name: "Rabu the Bear Love Quest",
    link: "https://rabu.lol",
    screenshot: "https://github.com/dragonjump/vibecoding-rabu-bear/blob/gh-pages/Screenshot%202025-04-09%20230341.png?raw=true",
    description: "Rabu the Bear: Love Quest - Explore strange worlds, meet dinosaurs, Pokémon, and more, spreading love and kindness along the way! 🐻💕✨",
    author: {
      name: "Sean Lon",
      image: "https://gravatar.com/avatar/1880b3f123439c4d0709778f8b82baf2071047f6071a42b9a744313faa0d235e?r=pg&d=retro&size=200",
    },
  },
];


export function getGames() {
  return games.map((game) => ({
    ...game,
    slug: slugify(game.name, { lower: true }),
  }));
}

export function getGameBySlug(slug: string) {
  return games.find((game) => slugify(game.name, { lower: true }) === slug);
}

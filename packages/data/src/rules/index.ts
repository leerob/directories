import slugify from "slugify";
import { ALRules } from "./al";
import { androidRules } from "./android";
import { angularRules } from "./angular";
import { angularIonicFirebaseFirestoreRules } from "./angular-ionic-firebase-firestore";
import { arduinoFrameworkRules } from "./arduino-framework";
import { astroRules } from "./astro";
import { autohotkeyRules } from "./autohotkey";
import { blazorRules } from "./blazor";
import { bootstrapRules } from "./bootstrap";
import { buddyOsRules } from "./buddy-os";
import { cRules } from "./c";
import { chromeExtensionRules } from "./chrome-extension";
import { convexRules } from "./convex";
import { cosmwasmRules } from "./cosmwasm";
import { cotiEthers } from "./coti-ethers";
import { cppRules } from "./cpp";
import { dataAnalystRules } from "./data-analyst";
import { deepLearningRules } from "./deep-learning";
import { devopsRules } from "./devops-backend";
import { djangoRules } from "./django";
import { dotnetRules } from "./dotnet";
import { drupalRules } from "./drupal";
import { electronRules } from "./electron";
import { elixirRules } from "./elixir";
import { expoReactNativeRules } from "./expo";
import { expressJsRules } from "./expressjs";
import { fastapiRules } from "./fastapi";
import { fastifyRules } from "./fastify";
import { fastmcpRules } from "./fastmcp";
import { flaskRules } from "./flask";
import { flutterRules } from "./flutter";
import { frontEndRules } from "./front-end";
import { frontendArchitectureRules } from "./frontend-architecture";
import { gatsbyRules } from "./gastby";
import { ghostTailwindcssRules } from "./ghost-tailwindcss";
import { gitcommitRules } from "./gitcommit";
import { globalRules } from "./global";
import { goRules } from "./go";
import { htmlAndCssRules } from "./htmlandcss";
import { htmxRules } from "./htmx";
import { ionicRules } from "./ionic";
import { javaRules } from "./java";
import { jaxRules } from "./jax";
import { juliaRules } from "./julia";
import { kotlinJetpackRules } from "./kotlin-jetpack";
import { laravelRules } from "./laravel";
import { luaRules } from "./lua";
import { manifestRules } from "./manifest";
import { metaPromptRules } from "./meta-prompt";
import { monorepoTamagui } from "./monorepo-tamagui";
import { nangoRules } from "./nango";
import { nestjsRules } from "./nestjs";
import { netlifyRules } from "./netlify";
import { nextjsRules } from "./nextjs";
import { nextjsSecurityAuditRules } from "./nextjs-security-audit";
import { nuxtJsRules } from "./nuxtjs";
import { odooRules } from "./odoo";
import { onchainkitRules } from "./onchainkit";
import { openApiUserStoryRules } from "./open-api-user-story";
import { phpRules } from "./php";
import { pixiJsRules } from "./pixijs";
import { plasmicRules } from "./plasmic";
import { playwrightRules } from "./playwright";
import { prismaRules } from "./prisma";
import { pythonRules } from "./python";
import { RRules } from "./r";
import { railsRules } from "./rails";
import { reactRules } from "./react";
import { reactNativeRules } from "./react-native";
import { reactNextjsStrictRules } from "./react-nextjs-strict";
import { reactVite2026 } from "./react-vite-2026";
import { remixRules } from "./remix";
import { remultRules } from "./remult";
import { robocorpRules } from "./robocorp";
import { rspecRules } from "./rspec";
import { rushRules } from "./rush";
import { rustRules } from "./rust";
import { salesforceRules } from "./salesforce";
import { softwareCraftsmanshipRules } from "./software-craftsmanship";
import { sanityRules } from "./sanity";
import { scoutRules } from "./scout";
import { shopifyThemeRules } from "./shopify-theme-development";
import { solanaRules } from "./solana";
import { solidityRules } from "./solidity";
import { sparkRules } from "./spark";
import { svelteRules } from "./svelte";
import { svelteKitRules } from "./sveltekit";
import { swiftuiRules } from "./swift";
import { tauriRules } from "./tauri";
import { technicalTutorialsRules } from "./technical-tutorials";
import { technicalWriterRules } from "./technical-writer";
import { terraformRules } from "./terraform";
import { typescriptRules } from "./typescript";
import { uiuxRules } from "./uiux-design";
import { unityCSharpRules } from "./unity-c-sharp";
import { viewComfyRules } from "./viewcomfy";
import { vivadoRules } from "./vivado";
import { vueTsRules } from "./vue";
import { webDevelopmentRules } from "./web-development";
import { webScrapingRules } from "./web-scraping";
import { wordpressRules } from "./wordpress";
import { wordpressWoocommerce } from "./wordpress-woocommerce";
import { zetaChainRules } from "./zetachain";
import { zettelkastenRules } from "./zettelkasten";

export const rules: Rule[] = [
  ...ALRules,
  ...androidRules,
  ...angularRules,
  ...astroRules,
  ...arduinoFrameworkRules,
  ...autohotkeyRules,
  ...blazorRules,
  ...buddyOsRules,
  ...cosmwasmRules,
  ...bootstrapRules,
  ...frontEndRules,
  ...cotiEthers,
  ...chromeExtensionRules,
  ...convexRules,
  ...cppRules,
  ...cRules,
  ...dataAnalystRules,
  ...deepLearningRules,
  ...devopsRules,
  ...djangoRules,
  ...dotnetRules,
  ...drupalRules,
  ...electronRules,
  ...elixirRules,
  ...expoReactNativeRules,
  ...fastapiRules,
  ...fastifyRules,
  ...fastmcpRules,
  ...flaskRules,
  ...flutterRules,
  ...gatsbyRules,
  ...ghostTailwindcssRules,
  ...gitcommitRules,
  ...globalRules,
  ...goRules,
  ...htmlAndCssRules,
  ...htmxRules,
  ...ionicRules,
  ...angularIonicFirebaseFirestoreRules,
  ...javaRules,
  ...jaxRules,
  ...juliaRules,
  ...laravelRules,
  ...luaRules,
  ...manifestRules,
  ...metaPromptRules,
  ...monorepoTamagui,
  ...nangoRules,
  ...nestjsRules,
  ...netlifyRules,
  ...nextjsRules,
  ...nextjsSecurityAuditRules,
  ...nuxtJsRules,
  ...odooRules,
  ...onchainkitRules,
  ...openApiUserStoryRules,
  ...pixiJsRules,
  ...playwrightRules,
  ...plasmicRules,
  ...prismaRules,
  ...pythonRules,
  ...railsRules,
  ...reactNativeRules,
  ...reactNextjsStrictRules,
  ...reactRules,
  ...reactVite2026,
  ...remultRules,
  ...remixRules,
  ...robocorpRules,
  ...rspecRules,
  ...rustRules,
  ...salesforceRules,
  ...sanityRules,
  ...scoutRules,
  ...solanaRules,
  ...solidityRules,
  ...sparkRules,
  ...svelteRules,
  ...svelteKitRules,
  ...swiftuiRules,
  ...tauriRules,
  ...technicalTutorialsRules,
  ...technicalWriterRules,
  ...terraformRules,
  ...uiuxRules,
  ...unityCSharpRules,
  ...vivadoRules,
  ...vueTsRules,
  ...webDevelopmentRules,
  ...webScrapingRules,
  ...wordpressRules,
  ...wordpressWoocommerce,
  ...typescriptRules,
  ...softwareCraftsmanshipRules,
  ...zetaChainRules,
  ...kotlinJetpackRules,
  ...viewComfyRules,
  ...rushRules,
  ...phpRules,
  ...shopifyThemeRules,
  ...RRules,
  ...zettelkastenRules,
].map(
  (rule): Rule => ({
    ...rule,
    libs: "libs" in rule ? rule.libs : [],
  }),
);

export function getSections() {
  const categories = Array.from(new Set(rules.flatMap((rule) => rule.tags)));

  return categories
    .map((tag) => ({
      tag,
      rules: rules.filter((rule) => rule.tags.includes(tag)),
      slug: slugify(tag, { lower: true }),
    }))
    .sort((a, b) => b.rules.length - a.rules.length);
}

export function getSectionBySlug(slug: string) {
  return getSections().find((section) => section.slug === slug);
}

export function getRuleBySlug(slug: string) {
  return rules.find(
    (rule) => rule.slug === slug || rule.slug === `official/${slug}`,
  );
}

export interface Rule {
  title: string;
  slug: string;
  tags: string[];
  libs: string[];
  content: string;
  author?: {
    name: string;
    url: string | null;
    avatar: string | null;
  };
}

export type Section = {
  tag: string;
  rules: Rule[];
};

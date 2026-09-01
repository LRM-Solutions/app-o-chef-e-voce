const fs = require('fs');
const path = require('path');

const filesToPatch = [
  "src/screens/ConfirmarExclusaoCodeScreen.js",
  "src/screens/LoginScreen.web.js",
  "src/components/LoadingScreen.js",
  "src/screens/NewUserEmailCodeScreen.web.js",
  "src/screens/SignUpScreen.web.js",
  "src/screens/LoginScreen.js",
  "src/screens/NewUserEmailCodeScreen.js",
  "src/screens/SignUpScreen.js",
  "src/screens/IntroScreen.web.js",
  "src/screens/PerfilScreen.js",
  "src/screens/RecuperarSenhaScreen.web.js"
];

for (const file of filesToPatch) {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Ensure useTheme is imported
  if (!content.includes("useTheme")) {
    // Inject import
    content = content.replace(/(import React.*?from 'react';)/, "$1\nimport { useTheme } from '../utils/ThemeContext';");
    changed = true;
  }

  // Ensure const { theme } = useTheme() is inside the component
  // Find the component definition (function or const () =>)
  if (!content.includes("const { theme } = useTheme()") && !content.includes("const { theme, themeMode, changeTheme } = useTheme()")) {
    content = content.replace(/(export default function \w+\(.*?\) \{|const \w+ = \(.*?\) => \{)/, "$1\n  const { theme } = useTheme();\n");
    changed = true;
  }

  // Replace require("../../assets/sanslogo.png")
  if (content.includes('require("../../assets/sanslogo.png")')) {
    content = content.replace(/require\("\.\.\/\.\.\/assets\/sanslogo\.png"\)/g, "(theme?.logos?.APP_LOGO_DEFAULT ? { uri: theme.logos.APP_LOGO_DEFAULT } : require(\"../../assets/sanslogo.png\"))");
    changed = true;
  }
  if (content.includes("require('../../assets/sanslogo.png')")) {
    content = content.replace(/require\('\.\.\/\.\.\/assets\/sanslogo\.png'\)/g, "(theme?.logos?.APP_LOGO_DEFAULT ? { uri: theme.logos.APP_LOGO_DEFAULT } : require(\"../../assets/sanslogo.png\"))");
    changed = true;
  }

  // Replace logosansnobg.png
  if (content.includes('require("../../assets/logosansnobg.png")')) {
    content = content.replace(/require\("\.\.\/\.\.\/assets\/logosansnobg\.png"\)/g, "(theme?.logos?.APP_LOGO_NOBG ? { uri: theme.logos.APP_LOGO_NOBG } : require(\"../../assets/logosansnobg.png\"))");
    changed = true;
  }

  // Replace splash-icon.png
  if (content.includes('require("../../assets/splash-icon.png")')) {
    content = content.replace(/require\("\.\.\/\.\.\/assets\/splash-icon\.png"\)/g, "(theme?.logos?.APP_LOGO_DEFAULT ? { uri: theme.logos.APP_LOGO_DEFAULT } : require(\"../../assets/splash-icon.png\"))");
    changed = true;
  }

  // lrm_logo.png is kept as is because it's not the app logo

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
}

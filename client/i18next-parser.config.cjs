module.exports = {
  locales: ["en", "vi"],
  output: "src/locales/$LOCALE.json",
  input: "src/**/*.{js,jsx,ts,tsx}",
  defaultNamespace: "translation",
  createOldCatalogs: false,
  keySeparator: false,
  namespaceSeparator: false,
};